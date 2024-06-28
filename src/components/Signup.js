import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FaUserPlus } from 'react-icons/fa';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        username: '',
        imageUrl: '',
      });
      navigate(`/profile/${userCredential.user.uid}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-neomorph w-96">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-full shadow-neomorph-inner">
            <FaUserPlus className="text-blue-500 text-6xl" />
          </div>
        </div>
        <h2 className="mb-8 text-3xl font-bold text-blue-500 text-center">SIGNUP</h2>
        <form className="flex flex-col gap-6" onSubmit={handleSignup}>
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
            REGISTRAR
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <button
          onClick={() => navigate('/login')}
          className="mt-8 text-blue-500 hover:underline text-center w-full"
        >
          Já tem uma conta? Login
        </button>
      </div>
    </div>
  );
}

export default Signup;