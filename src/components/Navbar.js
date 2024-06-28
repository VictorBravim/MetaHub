import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
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
    <nav className="fixed top-0 md:left-0 pt-4 md:pl-4 md:h-screen bg-transparent text-white w-full md:w-16 flex md:flex-col items-center justify-center">
      <ul className="bg-blue-500 py-4 md:py-12 rounded-full flex md:flex-col gap-3 w-full justify-around md:justify-center items-center">
        {currentUser ? (
          <>
            <li><Link to={`/profile/${uid}`} className='text-white hover:bg-white hover:text-blue-500 p-2 rounded-full flex'><FaUser size={20} /></Link></li>
            <li><Link to="/feed" className='text-white hover:bg-white hover:text-blue-500 p-2 rounded-full flex'><FaHome size={20} /></Link></li>
            <li><button onClick={handleLogout} className='text-white hover:bg-white hover:text-blue-500 p-2 rounded-full'><FaSignOutAlt size={20} /></button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className='text-white hover:bg-white hover:text-black p-2 rounded-full'><FaSignInAlt size={20} /></Link></li>
            <li><Link to="/signup" className='text-white hover:bg-white hover:text-black p-2 rounded-full'><FaUserPlus size={20} /></Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;