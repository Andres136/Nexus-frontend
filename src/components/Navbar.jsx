import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { departamentosApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  Home,
  FolderKanban,
  ListChecks,
  Bell,
  Building2,
  BarChart2,

  ChevronDown,
  Menu,

  Megaphone,
  TruckIcon,
  LogOutIcon,
  User2Icon,

} from "lucide-react";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departamento, setDepartamento] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false); // ✅ Solo agregué este estado
  const { logout, user } = useAuth({ middleware: "auth" });
  const menuRef = useRef(null);
  const userMenuRef = useRef(null); // ✅ Solo agregué esta ref

  useEffect(() => {
    const fetchDepartamento = async () => {
      try {
        const res = await departamentosApi.getById(user.departamento_id);
        setDepartamento(res.data);
      } catch (error) {
        console.error("Error fetching departamento:", error);
      }
    };
    if (user?.departamento_id) fetchDepartamento();
  }, [user?.departamento_id]);

  const isResponsable = departamento?.responsable_id === user?.id;

  const navLinks = [
    { name: "Inicio", to: "/", icon: Home, allowedRoles: [1,10,11] },
    { name: "Procesos", to: "/auth/procesos", icon: FolderKanban, alwaysVisible: true },
    { name: "Entregas ", to: "/auth/entregas", icon: TruckIcon, alwaysVisible: true },
    { name: "CRM", to: "/auth/crm", icon: Building2, alwaysVisible: true },
    {name: "KPIS", to: "dashboard/indicadores", icon: Building2, alwaysVisible: true },
    { name: "Indicadores", to: "indicadores", icon: BarChart2, allowedRoles: [1,2], onlyIfResponsable: true },
    {
      name: "",
      icon: Menu,
      allowedRoles: [1, 2, 4, 5, 6, 7, 9, 10, 11],
      hasSubmenu: true,
      submenu: [
       { name: "Marketing", to: "/auth/marketing", icon: Megaphone, allowedRoles: [1, 2, 10, 11] },
        { name: "Novedades", to: "/auth/control-calidad", icon: Bell, allowedRoles: [1, 2, 10, 11] },
        { name: "Tareas", to: "tareas", icon: ListChecks, allowedRoles: [1,2, 10,11] },
        {name: "Settings", to: "/admin/settings-permisos", icon: BarChart2, allowedRoles: [1] },
        {name: "Responsabilidades", to: "/auth/responsabilidades", icon: User2Icon, allowedRoles: [1] },
      ],
    },
  ];

  const filteredNavLinks = navLinks.filter((link) => {
    if (link.alwaysVisible) return true;
    if (link.onlyIfResponsable) return isResponsable;
    return !link.allowedRoles || link.allowedRoles.includes(user?.role_id);
  });

  // ✅ Solo modifiqué este useEffect para incluir userMenuRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Menú móvil */}
        <button
          className="lg:hidden text-gray-300 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Logo */}
        <h1 className="text-left leading-tight">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-wide hover:text-green-400 transition">
            Nexus
          </Link>
        </h1>

        

        {/* Menú escritorio */}
        <div ref={menuRef} className="hidden lg:flex items-center space-x-6">
          {filteredNavLinks.map((link) =>
            link.hasSubmenu ? (
              <div key={link.name} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                  className="flex items-center space-x-1 hover:text-green-400 transition-colors"
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {openMenu === link.name && (
                  <div
                    className="absolute right-0 top-full mt-2 flex flex-col bg-gray-800 border border-gray-700
                               rounded-lg shadow-lg w-56 transition-all duration-200 ease-in-out z-50"
                  >
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.to}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-green-400"
                        onClick={() => setOpenMenu(null)}
                      >
                        {sub.icon && <sub.icon className="w-4 h-4" />}
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.to}
                className="flex items-center space-x-1 hover:text-green-400 transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.name}</span>
              </Link>
            )
          )}
          
          {/* ✅ Solo reemplacé esta sección del usuario y botón */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
            >
              <span className="font-medium">👤 {user?.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-48 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300">Conectado como:</p>
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setOpenUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-gray-700 hover:text-red-200 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar móvil - SIN CAMBIOS */}
      <div className={`lg:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <ul className="flex flex-col space-y-2 mt-4 bg-gray-900 rounded p-4 shadow-lg">
          {filteredNavLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.to || "#"}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-white"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>

              {link.hasSubmenu && (
                <ul className="ml-6 mt-1 space-y-1">
                  {link.submenu.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        to={sub.to}
                        onClick={() => setIsSidebarOpen(false)}
                        className="block text-sm text-gray-300 hover:text-green-400"
                      >
                        • {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="px-4 py-2 text-green-300 font-medium">👤 {user?.name}</li>
          <li>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}