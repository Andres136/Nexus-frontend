import React, { useState } from 'react';
import useSystem from '../hooks/useSystem';


export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useSystem();

  return (
    <nav className={darkMode ? " sticky top-0 left-0 w-full bg-gray-800 text-white p-4" : "bg-white text-gray-900 shadow-md p-4 "}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Menú hamburguesa */}
        <button
          className="md:hidden text-gray-600 dark:text-white"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
        <h1 className="text-xl font-bold">Sistema de Gestión</h1>
        <div className="flex items-center space-x-4">
          {/* Botón Modo Oscuro */}
          <button
            onClick={toggleDarkMode}
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
          <span>Elver</span>
          <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
