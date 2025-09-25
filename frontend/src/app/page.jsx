"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { getSweets, purchaseSweet, deleteSweet } from "../lib/api";

export default function DashboardPage() {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const decodedUser = jwtDecode(token);
    setUser(decodedUser.user);

    const fetchSweets = async () => {
      try {
        const data = await getSweets();
        setSweets(data);
        setFilteredSweets(data);
      } catch (err) {
        setError("Failed to load sweets.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSweets();
  }, [router]);

  useEffect(() => {
    const results = sweets.filter((sweet) =>
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSweets(results);
  }, [searchTerm, sweets]);

  const handlePurchase = async (sweetId) => {
    try {
      const updatedSweet = await purchaseSweet(sweetId);
      setSweets(sweets.map((s) => (s.id === sweetId ? updatedSweet : s)));
    } catch (err) {
      alert("Failed to purchase sweet. It might be out of stock!");
    }
  };

  const handleDelete = async (sweetId) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await deleteSweet(sweetId);
        setSweets(sweets.filter((s) => s.id !== sweetId));
      } catch (err) {
        alert("Failed to delete sweet.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Sweets Dashboard</h1>
        <Link
          href="/admin/add-sweet"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          + Add a Sweet
        </Link>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a sweet..."
          className="w-full max-w-md p-3 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* ------------------------------------------- */}

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSweets.length > 0 ? (
          filteredSweets.map((sweet) => (
            <div
              key={sweet.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-pink-500 mb-2">
                  {sweet.name}
                </h2>
                <p className="text-gray-700 mb-1">Category: {sweet.category}</p>
                <p className="text-gray-800 font-semibold mb-2">
                  Price: ${parseFloat(sweet.price).toFixed(2)}
                </p>
                <p className="text-gray-800 font-semibold mb-4">
                  In Stock: {sweet.quantity}
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => handlePurchase(sweet.id)}
                  disabled={sweet.quantity === 0}
                  className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                >
                  Purchase
                </button>
                
                {user?.role === "admin" && (
                  <Link
                    href={`/admin/edit-sweet/${sweet.id}`}
                    className="block w-full text-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                )}
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(sweet.id)}
                    className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No sweets found.</p>
        )}
      </div>
    </div>
  );
}
