import React from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserDataContext";

export function  HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { datasets, activeDataset } = useUserData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="text-6xl">💰</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Expense Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Analiza tus transacciones bancarias y visualiza tus patrones
            financieros
          </p>

          {/* Welcome message for authenticated users */}
          {isAuthenticated && user && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-700">
                ¡Bienvenido de vuelta,{" "}
                <span className="font-semibold">{user.name || "Usuario"}</span>!
              </p>
              {datasets.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Tienes {datasets.length} dataset
                  {datasets.length !== 1 ? "s" : ""} guardado
                  {datasets.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent datasets section */}
        {datasets.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tus Datasets Recientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datasets.slice(0, 4).map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    dataset.isActive
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {dataset.name}
                    </h4>
                    {dataset.isActive && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {dataset.fileName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{dataset.transactions.length} transacciones</span>
                    <span>
                      {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {datasets.length > 4 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Y {datasets.length - 4} dataset
                {datasets.length - 4 !== 1 ? "s" : ""} más...
              </p>
            )}
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/import"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                📁
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Importar CSV
              </h3>
              <p className="text-gray-600">
                Carga tu archivo CSV de transacciones bancarias
              </p>
              {datasets.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  O carga un nuevo dataset
                </p>
              )}
            </div>
          </Link>

          <Link
            to="/validate"
            className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 transform hover:scale-105 group ${
              !activeDataset ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Validar Datos
              </h3>
              <p className="text-gray-600">
                Revisa y normaliza tus transacciones
              </p>
              {!activeDataset && (
                <p className="text-xs text-red-600 mt-2">
                  Necesitas importar datos primero
                </p>
              )}
            </div>
          </Link>

          <Link
            to="/visualize"
            className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 transform hover:scale-105 group ${
              !activeDataset ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Visualizar
              </h3>
              <p className="text-gray-600">
                Explora gráficos y análisis detallados
              </p>
              {!activeDataset && (
                <p className="text-xs text-red-600 mt-2">
                  Necesitas importar datos primero
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Características
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
              <span className="text-gray-700">
                Procesamiento de CSV robusto
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 text-xl">✅</span>
              <span className="text-gray-700">Análisis financiero mensual</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
              <span className="text-gray-700">
                Visualizaciones interactivas
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-600 text-xl">✅</span>
              <span className="text-gray-700">Resúmenes narrativos</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-600 text-xl">✅</span>
              <span className="text-gray-700">Múltiples datasets</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
              <span className="text-indigo-600 text-xl">✅</span>
              <span className="text-gray-700">Datos seguros y privados</span>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {datasets.length > 0
              ? "¿Listo para analizar?"
              : "¿Listo para comenzar?"}
          </h3>
          <p className="text-gray-600 mb-6">
            {datasets.length > 0
              ? "Continúa analizando tus datos o carga un nuevo archivo"
              : "Comienza importando tu archivo CSV de transacciones bancarias"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/import"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              {datasets.length > 0 ? "Nuevo Dataset" : "Comenzar"} →
            </Link>
            {activeDataset && (
              <Link
                to="/visualize"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Ver Análisis →
              </Link>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>Columnas requeridas:</strong> Date, Description, Type,
            Amount, Current balance, Status
          </p>
          <p>
            <strong>Tamaño máximo:</strong> 20 MB • <strong>Privacidad:</strong>{" "}
            Todos los datos se procesan localmente
          </p>
        </div>
      </div>
    </div>
  );
}
