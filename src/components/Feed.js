import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const postsCollection = collection(db, 'users');
          const postsSnapshot = await getDocs(postsCollection);
          const postsList = postsSnapshot.docs.map(doc => doc.data());
          setPosts(postsList);
        }
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, [db, auth]);

  return (
    <div className="feed">
      <h2>Feed</h2>
      {posts.map((post, index) => (
        <div key={index}>
          {post.imageUrl && <img src={post.imageUrl} alt="User Post" />}
        </div>
      ))}
    </div>
  );
};

export default Feed;