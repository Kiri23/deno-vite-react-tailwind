import React, { useState } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanStackDemo } from "./components/TanStackDemo.tsx";
import { ExpenseTracker } from "./expense-tracker";
import { AppContextProvider } from "./app/context";
import { routeTree } from "./router/routes";

// Create router instance
const router = createRouter({ routeTree });

// Register router for TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [showExpenseTracker, setShowExpenseTracker] = useState(false);

  if (showExpenseTracker) {
    return (
      <AppContextProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
              <button
                onClick={() => setShowExpenseTracker(false)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ← Back to Demo
              </button>
            </div>
          </div>
          <RouterProvider router={router} />
        </div>
      </AppContextProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <img
              src="/vite-deno.svg"
              alt="Vite with Deno"
              className="h-16 w-16"
            />
            <div className="flex space-x-2">
              <a
                href="https://vite.dev"
                target="_blank"
                className="hover:scale-110 transition-transform"
              >
                <img src="/vite.svg" className="h-12 w-12" alt="Vite logo" />
              </a>
              <a
                href="https://reactjs.org"
                target="_blank"
                className="hover:scale-110 transition-transform"
              >
                <img
                  src="/vite.svg"
                  className="h-12 w-12 hover:animate-spin"
                  alt="React logo"
                />
              </a>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vite + React + Deno + Tailwind CSS v4
          </h1>
          <p className="text-lg text-gray-600">
            Modern React app with the latest technologies
          </p>
        </div>

        {/* Counter Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Interactive Counter
            </h2>
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Count: {count}
            </button>
            <p className="mt-4 text-gray-600">
              Edit{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                src/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
          </div>
        </div>

        {/* TanStack Query + SSE Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            TanStack Query + SSE Demo
          </h3>
          <TanStackDemo />
        </div>

        {/* Expense Tracker Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">
              Expense Tracker Demo
            </h3>
            <button
              onClick={() => setShowExpenseTracker(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Open New Architecture →
            </button>
          </div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>New:</strong> Try the modular architecture with routing!
              Click "Open New Architecture" to experience the new router-based
              expense tracker with improved separation of concerns.
            </p>
          </div>
          <AppContextProvider>
            <ExpenseTracker />
          </AppContextProvider>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
              <span className="text-gray-700">React 19 with hooks</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 text-xl">✅</span>
              <span className="text-gray-700">TypeScript support</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
              <span className="text-gray-700">Deno runtime</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-600 text-xl">✅</span>
              <span className="text-gray-700">Vite bundling</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-600 text-xl">✅</span>
              <span className="text-gray-700">Hot Module Replacement</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
              <span className="text-indigo-600 text-xl">✅</span>
              <span className="text-gray-700">Tailwind CSS v4</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <span className="text-emerald-600 text-xl">✅</span>
              <span className="text-gray-700">
                Deno KV with real-time updates
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600 text-xl">🆕</span>
              <span className="text-gray-700">
                Modular Architecture with TanStack Router
              </span>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Click on the Vite and React logos to learn more
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://vite.dev"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Vite Docs
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              React Docs
            </a>
            <a
              href="https://deno.land"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Deno Docs
            </a>
            <a
              href="https://tailwindcss.com"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Tailwind CSS Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
