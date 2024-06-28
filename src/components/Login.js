import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FaUser } from 'react-icons/fa';
import backgroundImage from '../assets/bg.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate(`/profile/${userCredential.user.uid}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, backgroundAttachment: 'fixed' }}>
      <div className="bg-white p-8 rounded-lg shadow-neomorph w-96">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-full shadow-neomorph-inner">
            <FaUser className="text-blue-500 text-6xl" />
          </div>
        </div>
        <h2 className="mb-8 text-3xl font-bold text-blue-500 text-center">Login</h2>
        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          <input
            className="p-4 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-neomorph-inner"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="p-4 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-neomorph-inner"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="p-4 bg-blue-500 text-white rounded-lg shadow-neomorph focus:outline-none focus:ring-2 focus:ring-blue-700 hover:bg-blue-600 transition-all"
          >
            Entrar
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <button
          onClick={() => navigate('/signup')}
          className="mt-8 text-blue-500 hover:underline text-center w-full"
        >
          Não tem uma conta? Signup
        </button>
      </div>
    </div>
  );
}

export default Login;