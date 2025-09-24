// frontend/src/app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the router
import { loginUser } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await loginUser({ email, password });
      alert('Login successful!');
      router.push('/'); // Redirect to the homepage on success
    } catch (err) {
      setError(err.error || 'Failed to login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none"
        >
          Login
        </button>
      </form>
    </div>
  );
}