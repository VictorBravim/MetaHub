import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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
    <div className="h-screen w-full bg-gray-100 flex flex-col justify-center items-center">
      <h2 className="mb-8 text-3xl font-bold text-gray-900">Login</h2>
      <form className="flex flex-col gap-6" onSubmit={handleLogin}>
        <input
          className="p-4 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-neomorph-inner"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="p-4 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-neomorph-inner"
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
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <button
        onClick={() => navigate('/signup')}
        className="mt-8 text-blue-500 hover:underline"
      >
        Não tem uma conta? Signup
      </button>
    </div>
  );
}

export default Login;
