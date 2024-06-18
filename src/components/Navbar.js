import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar bg-blue-500 text-white flex flex-row items-center justify-center">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/feed">Feed</Link></li>
        {currentUser ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;