import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
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
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, [db]);

  const handleLike = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();
    const likedBy = postData.likedBy || [];

    if (!likedBy.includes(user.uid)) {
      await updateDoc(postRef, {
        likedBy: arrayUnion(user.uid)
      });
      setPosts(posts.map(post => post.id === postId ? { ...post, likedBy: [...likedBy, user.uid] } : post));
    }
  };

  const handleDelete = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      setPosts(posts.filter(post => post.id !== postId));
      console.log('Post deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="feed">
      <h2>Feed</h2>
      {posts.map((post, index) => (
        <div key={index} className="post">
          {post.user && (
            <div className="post-header">
              <img src={post.user.imageUrl} alt="User Profile" className="profile-image" />
              <h3>{post.user.username}</h3>
            </div>
          )}
          {post.postImageUrl && <img src={post.postImageUrl} alt="User Post" className="post-image" />}
          <div className="post-footer">
            <button onClick={() => handleLike(post.id)}>
              {post.likedBy && post.likedBy.includes(user.uid) ? <FaHeart className="liked" /> : <FaRegHeart />}
            </button>
            {post.user && post.userId === user.uid && (
              <button onClick={() => handleDelete(post.id)}>
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