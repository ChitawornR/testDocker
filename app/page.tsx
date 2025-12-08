"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { redirect: "manual" });

        // ถ้าโดน redirect → ไม่ใช่ JSON → setUser(null)
        if (res.type === "opaqueredirect" || res.status === 302) {
          setUser(null);
          return;
        }

        // ถ้าไม่ใช่ JSON ก็ไม่ต้อง parse
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setUser(null);
          return;
        }

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Failed to logout.");
      }
    } catch (err) {
      console.error("An error occurred during logout.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col max-w-md items-center justify-center bg-white p-6 rounded-lg shadow-md">
            {user ? (
              <div>
                <p className="text-lg font-bold">Welcome, {user.name}!</p>
                <p className="text-sm text-gray-500">Email: {user.email}</p>
                <p className="text-sm text-gray-500">Role: {user.role}</p>
                <p className="text-sm text-gray-500">
                  Created At: {user.createdAt}
                </p>
                <p className="text-sm text-gray-500">
                  Updated At: {user.updatedAt}
                </p>
                <button
                  className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded mt-4 mr-2"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Go to Dashboard
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 cursor-pointer text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold">You are not logged in.</p>
                <button
                  className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded mt-4 mr-2"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={() => router.push("/register")}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
