import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; // Certifique-se de estar importando db corretamente
import { doc, setDoc } from 'firebase/firestore';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Após criar o usuário com sucesso, salva os dados no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        username: '', // Defina um valor inicial para o username se necessário
        imageUrl: '', // Defina um valor inicial para a imageUrl se necessário
      });

      // Redireciona para a página de perfil após o cadastro
      navigate(`/profile/${userCredential.user.uid}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col justify-center items-center">
      <h2 className='mb-4 text-2xl'>Signup</h2>
      <form className='flex flex-col gap-6' onSubmit={handleSignup}>
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
        <button type="submit" className='bg-white p-2 text-black rounded-lg'>Signup</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Signup;