import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ProfileCard from './ProfileCard';
import Modal from 'react-modal';

const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [username, setUsername] = useState('');
  const [isProfileSet, setIsProfileSet] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [postProgress, setPostProgress] = useState(0);
  const [postUrl, setPostUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;
  const [previousProfileUrl, setPreviousProfileUrl] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileUrl(data.imageUrl);
          setPreviousProfileUrl(data.imageUrl);
          setUsername(data.username);
          setIsProfileSet(!!data.imageUrl && !!data.username);
          if (!data.imageUrl || !data.username) {
            setModalIsOpen(true);
          }
        } else {
          setModalIsOpen(true);
        }
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user, db]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user) {
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', user.uid));
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = postsSnapshot.docs.map(doc => doc.data());
        setPosts(userPosts);
      }
    };
    fetchUserPosts();
  }, [user, db]);

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleProfileUpload = () => {
    if (profileImage) {
      const storageRef = ref(storage, `profileImages/${user.uid}/${profileImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, profileImage);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        async () => {
          const newProfileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setProfileUrl(newProfileUrl);
          await updateProfileData({ imageUrl: newProfileUrl });
  
          // Excluir imagem anterior do Firebase Storage
          if (previousProfileUrl) {
            const previousImageRef = ref(storage, previousProfileUrl);
            try {
              await deleteObject(previousImageRef);
              console.log('Imagem anterior excluída com sucesso.');
            } catch (error) {
              console.error('Erro ao excluir a imagem anterior:', error);
            }
          }
  
          // Atualizar a URL da imagem anterior
          setPreviousProfileUrl(newProfileUrl);
        }
      );
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleUsernameUpdate = async () => {
    if (username) {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usernames = querySnapshot.docs.map(doc => doc.data().username);
      if (usernames.includes(username)) {
        alert('O nome de usuário já está em uso. Por favor escolha outro.');
        return;
      }
      await updateProfileData({ username });
    }
  };

  const updateProfileData = async (data) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      setIsProfileSet(true);
      setModalIsOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil: ", error);
    }
  };

  const handleProfileSave = async () => {
    if (profileImage) {
      handleProfileUpload();
    } else {
      handleUsernameUpdate();
    }
  };

  const handlePostImageChange = (e) => {
    if (e.target.files[0]) {
      setPostImage(e.target.files[0]);
    }
  };

  const handlePostUpload = () => {
    if (postImage) {
      const storageRef = ref(storage, `postImages/${user.uid}/${postImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, postImage);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setPostProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setPostUrl(url);
            savePostData(url);
          });
        }
      );
    }
  };

  const savePostData = async (postImageUrl) => {
    try {
      const postsCollection = collection(db, 'posts');
      await setDoc(doc(postsCollection, `${user.uid}_${Date.now()}`), {
        userId: user.uid,
        postImageUrl,
        timestamp: Date.now(),
        likedBy: [],
        likeCount: 0
      });
      alert('Postagem enviada com sucesso');
      setPosts((prevPosts) => [...prevPosts, { postImageUrl, userId: user.uid, likedBy: [], likeCount: 0 }]);
    } catch (error) {
      console.error("Erro ao escrever documento: ", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile h-full w-full flex flex-col justify-center items-center bg-black text-white pt-32">
      {isProfileSet ? (
        <>
          <div className="profile-info flex flex-col justify-center items-center gap-2">
            <img src={profileUrl} alt="Profile" className="w-[10%] rounded-full" />
            <h3>{username}</h3>
            <button onClick={() => setModalIsOpen(true)}>Edit Profile</button>
          </div>
          <div className="post-upload mt-4">
            <input className='p-1 rounded-lg' type="file" onChange={handlePostImageChange} />
            <button className='bg-white text-black p-1 rounded-md ml-4' onClick={handlePostUpload}>Publicar</button>
            {postProgress > 0 && <progress value={postProgress} max="100" />}
          </div>
          <div className="post-grid">
            <div className="mx-32 grid grid-cols-4 gap-4">
              {posts.map((post, index) => (
                <div key={index} className="post-item">
                  <img src={post.postImageUrl} alt="User Post" className="post-image" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-black rounded-lg p-6 max-w-lg mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-90"
      >
        <ProfileCard
          handleImageChange={handleProfileImageChange}
          handleUsernameChange={handleUsernameChange}
          handleProfileSave={handleProfileSave}
          progress={progress}
          imageUrl={profileUrl}
          username={username}
        />
      </Modal>
    </div>
  );
};

export default Profile;