import React from 'react';
import { useRealtimeCounter } from '../hooks/useSSE.ts';

export function TanStackDemo() {
  const { counter, isLoading, error } = useRealtimeCounter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          TanStack Query + SSE Demo
        </h3>
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          TanStack Query + SSE Demo
        </h3>
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        TanStack Query + SSE Demo
      </h3>
      
      <div className="text-center">
        <div className="mb-4">
          <p className="text-3xl font-bold text-blue-600">
            {counter}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Real-time counter using TanStack Query + SSE
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            ✅ This counter updates automatically every 2 seconds via SSE
          </p>
          <p className="text-xs text-green-600 mt-1">
            TanStack Query cache is updated in real-time
          </p>
        </div>
      </div>
    </div>
  );
} 