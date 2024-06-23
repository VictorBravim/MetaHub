import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = await Promise.all(postsSnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const userDocRef = doc(db, 'users', postData.userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          return {
            id: postDoc.id,
            ...postData,
            user: userData,
          };
        }));
        setPosts(postsList);
      } catch (error) {
        console.error("Erro ao buscar postagens:", error);
      }
    };

    fetchPosts();
  }, [db]);

  const handleLike = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();
    const likedBy = postData.likedBy || [];
    const likeCount = postData.likeCount || 0;

    if (likedBy.includes(user.uid)) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(user.uid),
        likeCount: likeCount - 1
      });
      setPosts(posts.map(post => post.id === postId ? { ...post, likedBy: likedBy.filter(uid => uid !== user.uid), likeCount: likeCount - 1 } : post));
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(user.uid),
        likeCount: likeCount + 1
      });
      setPosts(posts.map(post => post.id === postId ? { ...post, likedBy: [...likedBy, user.uid], likeCount: likeCount + 1 } : post));
    }
  };

  const handleDelete = async (postId, postImageUrl) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      const imageRef = ref(storage, postImageUrl);
      await deleteObject(imageRef);
      setPosts(posts.filter(post => post.id !== postId));
      console.log('Postagem excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir postagem:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white pt-32">
      {posts.map((post, index) => (
        <div key={index} className="w-full max-w-md flex flex-col items-center mb-6">
          {post.user && (
            <div className="w-full flex items-center mb-4 px-2">
              <img src={post.user.imageUrl} alt="User Profile" className="w-12 h-12 rounded-full mr-4" />
              <h3>@{post.user.username}</h3>
            </div>
          )}
          {post.postImageUrl && <img src={post.postImageUrl} alt="User Post" className="w-full rounded-lg mb-4" />}
          <div className="w-full flex items-center px-4">
            <button onClick={() => handleLike(post.id)}>
              {post.likedBy && post.likedBy.includes(user.uid) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </button>
            <span className="ml-2">{post.likeCount || 0}</span>
            {post.user && post.userId === user.uid && (
              <button onClick={() => handleDelete(post.id, post.postImageUrl)} className="ml-4">
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;