'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCartWithItems } from '../../lib/api'; // Use the new function name

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const data = await getCartWithItems();
        setCart(data);
      } catch (err) {
        setError('Failed to load cart items.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartItems();
  }, [router]);

  const calculateTotal = () => {
    if (!cart || !cart.items) return '0.00';
    return cart.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading cart...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="bg-white rounded-lg shadow-md p-6">
          {cart && cart.items && cart.items.length > 0 ? (
            cart.items.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Your cart is empty.</p>
          )}

          <div className="mt-6 text-right">
            <p className="text-2xl font-bold text-gray-800">Total: ${calculateTotal()}</p>
          </div>

          <div className="mt-6 flex justify-end items-center">
            <Link href="/" className="text-blue-500 hover:underline">
              Continue Shopping
            </Link>
            <button className="ml-4 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50" disabled={!cart || !cart.items || cart.items.length === 0}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}