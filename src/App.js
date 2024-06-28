import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Feed from './components/Feed';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import { AuthProvider } from './AuthContext';

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div>
      {loading && <Loader />}
      {!loading && !hideNavbar && <Navbar />}
      {!loading && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/profile/:uid" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="/feed" 
            element={<ProtectedRoute><Feed /></ProtectedRoute>} 
          />
        </Routes>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;