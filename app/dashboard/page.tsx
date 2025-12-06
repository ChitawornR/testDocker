'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setError('Failed to fetch user data.');
          router.push('/login'); // Redirect to login if not authorized
        }
      } catch (err) {
        setError('An error occurred while fetching user data.');
        console.error(err);
        router.push('/login'); // Redirect to login on network error
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' }); // Need to create a logout API
      if (res.ok) {
        router.push('/login');
      } else {
        setError('Failed to logout.');
      }
    } catch (err) {
      setError('An error occurred during logout.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">Loading user data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">No user data found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">User Dashboard</h1>
        <div className="border-t border-gray-200 pt-4">
          <dl className="divide-y divide-gray-200">
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-gray-500">Name</dt>
              <dd className="text-gray-900">{user.name}</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-gray-500">Role</dt>
              <dd className="text-gray-900">{user.role}</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-gray-500">Member Since</dt>
              <dd className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
        <div className="flex justify-between items-center mt-6">
          {user.role === 'admin' && (
            <Link href="/admin/dashboard" className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Go to Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
