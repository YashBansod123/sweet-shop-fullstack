'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSweetById, updateSweet } from '../../../../lib/api';

export default function EditSweetPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [sweetName, setSweetName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchSweet = async () => {
        try {
          const data = await getSweetById(id);
          setSweetName(data.name);
          setPrice(data.price);
          setQuantity(data.quantity);
        } catch (err) {
          setError('Failed to fetch sweet details.');
        }
      };
      fetchSweet();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSweet(id, { price: parseFloat(price), quantity: parseInt(quantity) });
      setSuccess('Sweet updated successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError('Failed to update sweet.');
    }
  };

  if (!sweetName) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Edit {sweetName}</h2>
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <label className="block text-gray-700 font-bold mb-2">Price</label>
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" required className="mb-4 w-full p-2 border rounded text-gray-800" />

        <label className="block text-gray-700 font-bold mb-2">Quantity</label>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" required className="mb-4 w-full p-2 border rounded text-gray-800" />

        <button type="submit" className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
          Update Sweet
        </button>
      </form>
    </div>
  );
}