import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ProfileCard from './ProfileCard';
import PostModal from './PostModal';
import Modal from 'react-modal';
import FollowButton from './FollowButton'; // Importe o componente FollowButton aqui

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
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalIsOpen, setPostModalIsOpen] = useState(false);
  const [previousProfileUrl, setPreviousProfileUrl] = useState('');

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

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
        const userPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleProfileUpload = async () => {
    if (profileImage) {
      try {
        if (previousProfileUrl) {
          const previousImageRef = ref(storage, previousProfileUrl);
          await deleteObject(previousImageRef);
          console.log('Imagem anterior excluída com sucesso.');
        }
  
        const resizedImage = await resizeImage(profileImage);
        const storageRef = ref(storage, `profileImages/${user.uid}/${profileImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, resizedImage);
  
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
            saveProfileData(newProfileUrl, username); 
            setPreviousProfileUrl(newProfileUrl);
            setModalIsOpen(false);
          }
        );
      } catch (error) {
        console.error('Erro ao redimensionar imagem:', error);
      }
    }
  };

  const saveProfileData = async (imageUrl, username) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { imageUrl, username }, { merge: true });
      setIsProfileSet(true);
      console.log('Perfil atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar dados do perfil:', error);
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

  const handlePostUpload = async () => {
    if (postImage) {
      try {
        const resizedImage = await resizeImage(postImage);
        const storageRef = ref(storage, `postImages/${user.uid}/${postImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, resizedImage);
  
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
          async () => {
            const postImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            savePostData(postImageUrl); 
          }
        );
      } catch (error) {
        console.error('Erro ao redimensionar imagem:', error);
      }
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

  const handleLikePost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    const post = postDoc.data();
    const userLiked = post.likedBy.includes(user.uid);

    try {
      if (userLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likeCount: post.likeCount - 1
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likeCount: post.likeCount + 1
        });
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, likedBy: userLiked ? p.likedBy.filter((id) => id !== user.uid) : [...p.likedBy, user.uid], likeCount: userLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          likedBy: userLiked ? prevSelectedPost.likedBy.filter((id) => id !== user.uid) : [...prevSelectedPost.likedBy, user.uid],
          likeCount: userLiked ? prevSelectedPost.likeCount - 1 : prevSelectedPost.likeCount + 1
        }));
      }

    } catch (error) {
      console.error('Erro ao atualizar like:', error);
    }
  };

  const handleDeletePost = async (postId, postImageUrl) => {
    const postRef = doc(db, 'posts', postId);
    const imageRef = ref(storage, postImageUrl);

    try {
      await deleteDoc(postRef);
      await deleteObject(imageRef);
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      closePostModal();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
    }
  };

  const resizeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            0.7 
          );
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setPostModalIsOpen(true);
  };

  const closePostModal = () => {
    setPostModalIsOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile h-full w-full flex flex-col justify-center items-center bg-black text-white pt-32">
      {isProfileSet ? (
        <>
          <div className="profile-info flex flex-col justify-center items-center gap-2">
            <FollowButton userId={user.uid} isProfileOwner={true} />
            <img src={profileUrl} alt="Profile" className="w-[10%] h-auto rounded-full" />
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
                <div key={index} className="post-item" onClick={() => openPostModal(post)}>
                  <img src={post.postImageUrl} alt="User Post" className="w-full h-auto" />
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
      <PostModal
        isOpen={postModalIsOpen}
        onRequestClose={closePostModal}
        post={selectedPost}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        userLiked={selectedPost && selectedPost.likedBy.includes(user.uid)}
      />
    </div>
  );
};

export default Profile;