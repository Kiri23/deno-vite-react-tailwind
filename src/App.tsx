import { useState } from 'react'
import reactLogo from './assets/react.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <img src="/vite-deno.svg" alt="Vite with Deno" className="h-16 w-16" />
            <div className="flex space-x-2">
              <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
                <img src="/vite.svg" className="h-12 w-12" alt="Vite logo" />
              </a>
              <a href="https://reactjs.org" target="_blank" className="hover:scale-110 transition-transform">
                <img src={reactLogo} className="h-12 w-12 animate-spin-slow" alt="React logo" />
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
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR
            </p>
          </div>
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
  )
}

export default App
