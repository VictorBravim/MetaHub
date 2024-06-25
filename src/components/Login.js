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
    <div className="h-screen w-full bg-black text-white flex flex-col justify-center items-center">
      <h2 className='mb-4 text-2xl'>Login</h2>
      <form className='flex flex-col gap-6' onSubmit={handleLogin}>
        <input
          className='rounded-lg p-2 text-black'
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className='rounded-lg p-2 text-black'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className='bg-white p-2 text-black rounded-lg'>Entrar</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;