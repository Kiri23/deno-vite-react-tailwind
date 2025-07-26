import React, { useState } from "react";
import { useKV, setKV, getKVValue } from "../lib/kv.ts";

// Ejemplo 1: Lista de tareas con real-time updates
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const todos = useKV<Todo[]>(["todos"]) || [];

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    await setKV(["todos"], [...todos, todo]);
    setNewTodo("");
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await setKV(["todos"], updatedTodos);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Todo List (Real-time)
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>
      
      <div className="space-y-2">
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              todo.completed ? "bg-gray-50" : "bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span className={todo.completed ? "line-through text-gray-500" : ""}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ejemplo 2: Chat en tiempo real
interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export function ChatRoom() {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const messages = useKV<Message[]>(["chat:messages"]) || [];

  const sendMessage = async () => {
    if (!message.trim() || !username.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      author: username,
      timestamp: new Date().toISOString()
    };
    
    await setKV(["chat:messages"], [...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Chat Room (Real-time)
      </h3>
      
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your username..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">{msg.author}</span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700">{msg.text}</p>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Ejemplo 3: Configuración de aplicación
interface AppConfig {
  theme: "light" | "dark";
  language: "en" | "es" | "fr";
  notifications: boolean;
  autoSave: boolean;
}

export function AppSettings() {
  const config = useKV<AppConfig>(["app:config"]) || {
    theme: "light",
    language: "en",
    notifications: true,
    autoSave: false
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    await setKV(["app:config"], { ...config, ...updates });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        App Settings (Real-time)
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={config.theme}
            onChange={(e) => updateConfig({ theme: e.target.value as "light" | "dark" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={config.language}
            onChange={(e) => updateConfig({ language: e.target.value as "en" | "es" | "fr" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="notifications"
            checked={config.notifications}
            onChange={(e) => updateConfig({ notifications: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
            Enable notifications
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoSave"
            checked={config.autoSave}
            onChange={(e) => updateConfig({ autoSave: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
            Auto-save
          </label>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Current Config:</h4>
        <pre className="text-sm text-gray-600">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Ejemplo 4: Uso directo del cliente KV
export function DirectKVExample() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string>("");

  const handleGet = async () => {
    try {
      const kvValue = await getKVValue([key]);
      setResult(JSON.stringify(kvValue, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSet = async () => {
    try {
      await setKV([key], value);
      setResult("Value set successfully!");
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Direct KV Operations
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter key..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value (JSON)
          </label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='{"example": "value"}'
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleGet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Get Value
          </button>
          <button
            onClick={handleSet}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Set Value
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Result:</h4>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 