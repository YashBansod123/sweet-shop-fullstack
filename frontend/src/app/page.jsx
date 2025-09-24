// frontend/src/app/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSweets } from '../lib/api';

export default function DashboardPage() {
  const [sweets, setSweets] = useState([]); // Holds the original full list
  const [filteredSweets, setFilteredSweets] = useState([]); // Holds the list to display
  const [searchTerm, setSearchTerm] = useState(''); // Holds the search input
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Effect to fetch initial data
  useEffect(() => {
    const fetchSweets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const data = await getSweets();
        setSweets(data);
        setFilteredSweets(data); // Initially, filtered list is the full list
      } catch (err) {
        setError('Failed to load sweets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSweets();
  }, [router]);

  // Effect to handle filtering when search term changes
  useEffect(() => {
    const results = sweets.filter(sweet =>
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSweets(results);
  }, [searchTerm, sweets]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Sweets Dashboard</h1>
        <Link href="/admin/add-sweet" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          + Add a Sweet
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a sweet..."
          className="w-full max-w-md p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSweets.length > 0 ? (
          filteredSweets.map((sweet) => ( // Map over the filtered list
            <div key={sweet.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-pink-500 mb-2">{sweet.name}</h2>
              <p className="text-gray-600 mb-1">Category: {sweet.category}</p>
              <p className="text-gray-800 font-semibold mb-2">Price: ${sweet.price.toFixed(2)}</p>
              <p className="text-gray-800 font-semibold mb-4">In Stock: {sweet.quantity}</p>
              <button
                disabled={sweet.quantity === 0}
                className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                Purchase
              </button>
            </div>
          ))
        ) : (
          <p>No sweets found.</p>
        )}
      </div>
    </div>
  );
}