import React, { useState } from "react";
import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserDataContext";

export function AppLayout() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { datasets, activeDataset } = useUserData();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHomePage = location.pathname === "/";

  // Don't show navigation on home page
  if (isHomePage) {
    return <Outlet />;
  }

  const navItems = [
    {
      to: "/import",
      icon: "📁",
      label: "Importar",
      description: "Subir CSV",
    },
    {
      to: "/validate",
      icon: "✅",
      label: "Validar",
      description: "Revisar datos",
    },
    {
      to: "/analyze",
      icon: "📊",
      label: "Analizar",
      description: "Insights",
    },
    {
      to: "/visualize",
      icon: "📈",
      label: "Visualizar",
      description: "Gráficos",
    },
  ];

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with horizontal navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span className="text-3xl">💰</span>
              <span className="hidden sm:block">Expense Tracker</span>
              <span className="sm:hidden">ET</span>
            </Link>

            {/* Horizontal Navigation */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-w-[60px] sm:min-w-[80px] ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className="text-lg sm:text-xl mb-1"
                      role="img"
                      aria-label={item.label}
                    >
                      {item.icon}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-xs text-gray-500 hidden sm:block">
                      {item.description}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User area */}
            <div className="flex items-center space-x-3">
              {/* Dataset indicator */}
              {activeDataset && (
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="font-medium">{activeDataset.name}</span>
                  </div>
                  {datasets.length > 1 && (
                    <span className="text-gray-500">
                      ({datasets.length} datasets)
                    </span>
                  )}
                </div>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {getUserInitials(user?.name, user?.email)}
                </button>

                {/* User dropdown menu (future auth features) */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "Usuario Demo"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || "usuario@ejemplo.com"}
                      </p>
                    </div>

                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Datasets activos
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {datasets.length} archivo
                        {datasets.length !== 1 ? "s" : ""} cargado
                        {datasets.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        ⚙️ Configuración
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        📊 Mis Datasets
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              © 2025 Expense Tracker. Analiza tus finanzas de forma privada y
              segura.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Datos procesados localmente</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>
                {isAuthenticated ? "Sesión activa" : "Sin registro requerido"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
