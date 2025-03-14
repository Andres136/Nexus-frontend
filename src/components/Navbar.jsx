import { useState } from "react";
import { Link } from "react-router-dom";
import useSystem from "../hooks/useSystem";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useSystem();
  const { logout, user } = useAuth({ middleware: "auth" });


  // Definir enlaces de navegación según los roles.
  const navLinks = [
    { name: "Inicio", to: "/",allowedRoles: [1] },
    { name: "Procesos", to: "/auth/procesos", alwaysVisible: true }, // Siempre visible
    { name: "Tareas", to: "/admin/tareas", allowedRoles: [1, 2, ] },
    { name: "Errores", to: "/admin/errores", allowedRoles: [1, 2] },
    { name: "Crm", to: "/auth/crm", allowedRoles: [1,4,5,6,7] },
  ];

  // Filtrar enlaces según el rol del usuario, pero dejando "Procesos" siempre visible.
  const filteredNavLinks = navLinks.filter(
    (link) => link.alwaysVisible || !link.allowedRoles || link.allowedRoles.includes(user?.role_id)
  );

  return (
    <nav
      className={
        darkMode
          ? "sticky top-0 left-0 w-full bg-gray-800 text-white p-4 "
          : "  sticky top-0 bg-gray-800 text-white shadow-md p-4"
      }
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Botón de menú hamburguesa (visible en dispositivos móviles) */}
        <button
          className="md:hidden text-gray-300 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle navigation"
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

        {/* Título o logo */}
        <h1 className="text-xl font-bold">
          <Link to="/">Sistema de Gestión</Link>
        </h1>

        {/* Menú de navegación para pantallas medianas y grandes */}
        <div className="hidden md:flex items-center space-x-4">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="hover:text-gray-300 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {/* <button
            onClick={toggleDarkMode}
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition duration-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button> */}
          <span>Hola: {user?.name}</span>
          <button
            onClick={logout}
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Menú de navegación para dispositivos móviles */}
      {isSidebarOpen && (
        <div className="md:hidden mt-4">
          <ul className="flex flex-col space-y-2">
            {filteredNavLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={toggleDarkMode}
                className="w-full text-left block px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
              </button>
            </li>
            <li>
              <span className="block px-4 py-2">Hola: {user?.name}</span>
            </li>
            <li>
              <button
                onClick={logout}
                className="w-full text-left block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
