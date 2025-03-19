"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Cookies.set("isAuthenticated", "true", { expires: 1, sameSite: 'Strict', secure: true });
          router.push("/admin");
        } 
      } else if (response.status === 404) {
        alert("API endpoint not found. Please contact support.");
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 text-zinc-950">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input 
          type="text" 
          placeholder="Username" 
          className="w-full p-2 border rounded mb-2" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded mb-4" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Login</button>
      </div>
    </div>
  );
}
