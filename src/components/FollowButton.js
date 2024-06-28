import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FollowButton = ({ userId, isProfileOwner }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.followers) {
            setFollowersCount(userData.followers.length);
            setIsFollowing(userData.followers.includes(currentUser.uid));
          } else {
            setFollowersCount(0);
            setIsFollowing(false);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status de seguir:', error);
      }
    };
    fetchFollowStatus();
  }, [db, userId, currentUser]);

  const handleFollowToggle = async () => {
    try {
      const userDocRef = doc(db, 'users', userId);
      if (isFollowing) {
        await updateDoc(userDocRef, {
          followers: arrayRemove(currentUser.uid)
        });
        setFollowersCount(prevCount => prevCount - 1);
      } else {
        await updateDoc(userDocRef, {
          followers: arrayUnion(currentUser.uid)
        });
        setFollowersCount(prevCount => prevCount + 1);
      }
      setIsFollowing(prevIsFollowing => !prevIsFollowing);
    } catch (error) {
      console.error('Erro ao atualizar status de seguir:', error);
    }
  };

  return (
    <div className="follow-button">
      {isProfileOwner ? (
        <div className="followers-count">
          {followersCount} Seguidores
        </div>
      ) : (
        <>
          <div className="followers-count">
            {followersCount} Seguidores
          </div>
          <button onClick={handleFollowToggle}>
            {isFollowing ? 'Deixar de seguir' : 'Seguir'}
          </button>
        </>
      )}
    </div>
  );
};

export default FollowButton;