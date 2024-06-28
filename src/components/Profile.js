import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ProfileCard from './ProfileCard';
import PostModal from './PostModal';
import Modal from 'react-modal';
import FollowButton from './FollowButton';
import { IoAddCircleOutline } from 'react-icons/io5';
import { IoMdCreate } from 'react-icons/io';

const Profile = () => {
  const { uid } = useParams();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProfileSet, setIsProfileSet] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [postProgress, setPostProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalIsOpen, setPostModalIsOpen] = useState(false);
  const [previousProfileUrl, setPreviousProfileUrl] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (uid) {
        const docRef = doc(db, 'users', uid);
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
  }, [uid, db]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (uid) {
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', uid));
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(userPosts);
      }
    };
    fetchUserPosts();
  }, [uid, db]);

  useEffect(() => {
    if (user && user.uid === uid) {
      setIsCurrentUser(true);
    } else {
      setIsCurrentUser(false);
    }
  }, [user, uid]);

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
        const storageRef = ref(storage, `profileImages/${uid}/${profileImage.name}`);
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
      const userRef = doc(db, 'users', uid);
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
      const userRef = doc(db, 'users', uid);
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

  const handlePostImageChange = async (e) => {
    if (e.target.files[0]) {
      setPostImage(e.target.files[0]);
      await handlePostUpload(e.target.files[0]);
    }
  };

  const handlePostUpload = async (postImage) => {
    if (postImage) {
      try {
        const resizedImage = await resizeImage(postImage);
        const storageRef = ref(storage, `postImages/${uid}/${postImage.name}`);
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
      await setDoc(doc(postsCollection, `${uid}_${Date.now()}`), {
        userId: uid,
        postImageUrl,
        timestamp: Date.now(),
        likedBy: [],
        likeCount: 0
      });
      alert('Postagem enviada com sucesso');
      setPosts((prevPosts) => [...prevPosts, { postImageUrl, userId: uid, likedBy: [], likeCount: 0 }]);
    } catch (error) {
      console.error("Erro ao escrever documento: ", error);
    }
  };

  const handleLikePost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    const post = postDoc.data();
    const userLiked = post.likedBy.includes(uid);
    try {
      if (userLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(uid),
          likeCount: post.likeCount - 1
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(uid),
          likeCount: post.likeCount + 1
        });
      }
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, likedBy: userLiked ? p.likedBy.filter((id) => id !== uid) : [...p.likedBy, uid], likeCount: userLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          likedBy: userLiked ? prevSelectedPost.likedBy.filter((id) => id !== uid) : [...prevSelectedPost.likedBy, uid],
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
    console.log("Abrindo modal:", post);
    setSelectedPost(post);
    setPostModalIsOpen(true);
  };

  const closePostModal = () => {
    console.log("Fechando modal");
    setPostModalIsOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile h-full w-full flex flex-col justify-center items-center bg-white text-black pt-12 ml-16">
      {isProfileSet ? (
        <>
          <div className="profile-info flex items-center justify-between gap-8 mx-8 my-4">
            <img src={profileUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <div className="flex gap-4 mt-2">
                <h3 className="text-xl">@{username}</h3>
                {isCurrentUser && <button className=" text-black p-1 flex items-center" onClick={() => setModalIsOpen(true)}>
                  <IoMdCreate />
                </button>}
              </div>
              {isCurrentUser ? (
                <FollowButton userId={uid} isProfileOwner={true} />
              ) : (
                <FollowButton userId={uid} isProfileOwner={false} />
              )}
            </div>
          </div>
          {isCurrentUser && (
            <div className="fixed flex bottom-8 left-1/2 transform -translate-x-1/2">
              <label htmlFor="file-upload" className="rounded-full bg-blue-500 p-2 cursor-pointer">
                <IoAddCircleOutline className="text-white text-3xl" />
                <input id="file-upload" className="hidden" type="file" onChange={handlePostImageChange} />
              </label>
            </div>
          )}
          <div className="post-grid mx-12 mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post, index) => (
                <div key={index} className="post-item cursor-pointer" onClick={() => openPostModal(post)}>
                  <img src={post.postImageUrl} alt="User Post" className="w-full h-auto rounded-lg" />
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
        userLiked={selectedPost && selectedPost.likedBy.includes(uid)}
        currentUserId={user.uid}
      />
    </div>
  );
};

export default Profile;