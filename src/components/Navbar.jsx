import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { Home, FolderKanban, ListChecks, Bell, Building2 } from "lucide-react";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { logout, user } = useAuth({ middleware: "auth" });

  const navLinks = [
    { name: "Inicio", to: "/", icon: Home, allowedRoles: [1,10,11] },
    { name: "Procesos", to: "/auth/procesos", icon: FolderKanban, alwaysVisible: true },
    { name: "Tareas", to: "tareas", icon: ListChecks, allowedRoles: [1,2, 10,11] },
    { name: "Novedades", to: "errores", icon: Bell, allowedRoles: [1,2, 10,11] },
    { name: "CRM", to: "/auth/crm", icon: Building2, allowedRoles: [1,2, 4, 5, 6, 7, 9,10,11] },
    {name: "KPI", to: "rendimiento", icon: Building2, allowedRoles: [1, 2,10,11] },
  ];

  const filteredNavLinks = navLinks.filter(
    (link) => link.alwaysVisible || !link.allowedRoles || link.allowedRoles.includes(user?.role_id)
  );

  return (
    <nav
      className="sticky top-0 z-50 bg-gray-800 text-white shadow-md p-4"
      role="navigation"
      aria-label="Menú principal"
    >
      <div className="container mx-auto flex justify-between items-center">
        <button
          className="md:hidden text-gray-300 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Abrir menú"
          aria-expanded={isSidebarOpen}
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

        <h1 className="text-left leading-tight">
          <Link to="/" className="block group">
            <span className="text-2xl font-extrabold text-white tracking-wide group-hover:text-green-400 transition">
              SETAS ETS
            </span>
            <span className="block text-sm text-green-400 font-medium group-hover:text-white transition">
              Entorno de Tecnología y Sostenibilidad
            </span>
          </Link>
        </h1>

        <div className="hidden md:flex items-center space-x-6">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="flex items-center space-x-1 hover:text-green-400 transition-colors"
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              <span>{link.name}</span>
            </Link>
          ))}
          <span className="font-medium text-green-400 hidden md:inline">👤 {user?.name}</span>
          <button
            onClick={logout}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isSidebarOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col space-y-3 mt-4 bg-gray-900 rounded p-4 shadow-lg animate-slide-down">
          {filteredNavLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-white"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>
            </li>
          ))}
          <li className="px-4 py-2 text-green-300 font-medium">👤 {user?.name}</li>
          <li>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
