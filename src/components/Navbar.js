import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };

  return (
    <nav className="fixed w-full py-6 bg-black text-white flex flex-row items-center justify-center">
      <ul className="flex gap-3">
        {currentUser ? (
          <>
            <li><Link to="/feed"><button className='bg-white text-black p-2 rounded-lg'>Feed</button></Link></li>
            <li><Link to="/profile"><button className='bg-white text-black p-2 rounded-lg'>Profile</button></Link></li>
            <li><button onClick={handleLogout} className='bg-white text-black p-2 rounded-lg'>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login"><button className='bg-white text-black p-2 rounded-lg'>Login</button></Link></li>
            <li><Link to="/signup"><button className='bg-white text-black p-2 rounded-lg'>Signup</button></Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;