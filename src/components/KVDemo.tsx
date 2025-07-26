import React, { useState } from "react";
import { useKV, setKV } from "../lib/kv.ts";

interface User {
  id: string;
  name: string;
  email: string;
  lastSeen: string;
}

export function KVDemo() {
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  
  // Usar el hook para suscribirse a cambios en tiempo real
  const user = useKV<User>(["user", "123"]);
  const counter = useKV<number>(["counter"]);
  const settings = useKV<{ theme: string; language: string }>(["settings"]);

  const handleUpdateUser = async () => {
    if (!inputName || !inputEmail) return;
    
    const updatedUser: User = {
      id: "123",
      name: inputName,
      email: inputEmail,
      lastSeen: new Date().toISOString()
    };
    
    await setKV(["user", "123"], updatedUser);
    setInputName("");
    setInputEmail("");
  };

  const handleIncrementCounter = async () => {
    const currentValue = counter || 0;
    await setKV(["counter"], currentValue + 1);
  };

  const handleUpdateSettings = async () => {
    const newSettings = {
      theme: settings?.theme === "dark" ? "light" : "dark",
      language: settings?.language === "en" ? "es" : "en"
    };
    await setKV(["settings"], newSettings);
  };

  return (
    <div className="space-y-8">
      {/* User Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          User Data (Real-time)
        </h3>
        
        {user ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Last Seen:</strong> {new Date(user.lastSeen).toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p>No user data found. Create a user below.</p>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleUpdateUser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Update User
          </button>
        </div>
      </div>

      {/* Counter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Counter (Real-time)
        </h3>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600 mb-4">
            {counter ?? 0}
          </p>
          <button
            onClick={handleIncrementCounter}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Increment
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Settings (Real-time)
        </h3>
        
        {settings ? (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p><strong>Theme:</strong> {settings.theme}</p>
            <p><strong>Language:</strong> {settings.language}</p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p>No settings found. Initialize settings below.</p>
          </div>
        )}

        <button
          onClick={handleUpdateSettings}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Toggle Settings
        </button>
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 This demo shows real-time updates using Deno KV with React hooks.
          Open multiple browser tabs to see the changes sync across them!
        </p>
      </div>
    </div>
  );
} 