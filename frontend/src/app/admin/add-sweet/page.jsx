// frontend/src/app/admin/add-sweet/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. Import the router
import { addSweet } from '../../../lib/api';

export default function AddSweetPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter(); // 2. Initialize the router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await addSweet({ name, category: category, price: parseFloat(price), quantity: parseInt(quantity) });
      setSuccess(`Successfully added ${name}! Redirecting...`);

      // 3. Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push('/'); 
      }, 1500); // Wait 1.5 seconds before redirecting

    } catch (err) {
      setError(err.error || 'Failed to add sweet.');
    }
  };

  // ... keep the rest of your return (...) JSX the same ...
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Sweet</h2>
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="mb-4 w-full p-2 border rounded text-gray-800" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required className="mb-4 w-full p-2 border rounded text-gray-800" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Price" required className="mb-4 w-full p-2 border rounded text-gray-800" />
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" placeholder="Quantity" required className="mb-4 w-full p-2 border rounded text-gray-800" />

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Add Sweet
        </button>
      </form>
    </div>
  );
}