import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Welcome to the Sweet Shop
      </h1>
      <div className="space-x-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
        >
          Register
        </Link>
      </div>
    </div>
  );
}