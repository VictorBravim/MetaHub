import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [uid, setUid] = useState('');

  useEffect(() => {
    const fetchUid = async () => {
      if (currentUser) {
        setUid(currentUser.uid);
      }
    };
    fetchUid();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };

  return (
    <nav className="fixed h-full bg-black text-white w-16 flex flex-col items-center justify-start pt-6">
      <ul className="flex flex-col gap-3 w-full">
        {currentUser ? (
          <>
            <li><Link to="/feed" className='text-white hover:bg-white hover:text-black p-2 rounded-lg flex'><FaHome size={20} /></Link></li>
            <li><Link to={`/profile/${uid}`} className='text-white hover:bg-white hover:text-black p-2 rounded-lg flex'><FaUser size={20} /></Link></li>
            <li><button onClick={handleLogout} className='text-white hover:bg-white hover:text-black p-2 rounded-lg'><FaSignOutAlt size={20} /></button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className='text-white hover:bg-white hover:text-black p-2 rounded-lg'><FaSignInAlt size={20} /></Link></li>
            <li><Link to="/signup" className='text-white hover:bg-white hover:text-black p-2 rounded-lg'><FaUserPlus size={20} /></Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;