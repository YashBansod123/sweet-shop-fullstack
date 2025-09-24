// frontend/src/app/admin/add-sweet/page.jsx
'use client';

import { useState } from 'react';
import { addSweet } from '../../../lib/api';

export default function AddSweetPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await addSweet({ name, category, price: parseFloat(price), quantity: parseInt(quantity) });
      setSuccess(`Successfully added ${name}!`);
      // Clear form
      setName(''); setCategory(''); setPrice(''); setQuantity('');
    } catch (err) {
      setError(err.error || 'Failed to add sweet.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Sweet</h2>
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Form Inputs for name, category, price, quantity */}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="mb-4 w-full p-2 border rounded" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required className="mb-4 w-full p-2 border rounded" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Price" required className="mb-4 w-full p-2 border rounded" />
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" placeholder="Quantity" required className="mb-4 w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Add Sweet
        </button>
      </form>
    </div>
  );
}