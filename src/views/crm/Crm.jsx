import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Briefcase,
  Users,
  BarChart,
  ShoppingCart,

  MessageCircle,
  Clipboard,
  Menu,
  ClipboardList,
  FolderPlus,
  Car,
  ChevronDown,

} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import Dashboard from "../Dashboard";
import clienteAxios from "../../config/axios";
import { DocumentTextIcon, UserGroupIcon } from "@heroicons/react/16/solid";

export default function Crm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  useAuth({ middleware: "auth" });

  const location = useLocation();
  const [, setTotalNotificaciones] = useState(0);


  // Alternar manualmente en móviles
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Definir rutas con los roles permitidos
  const menuLinks = [
    {
      name: "Ordenes Trabajo",
      to: "/auth/crm/ordenes-trabajo",
      icon: Briefcase,
      roles: [1, 4, 5, 6,],
      departamento:[1, 4, 5, 6],

    },
    {
      name: "Gestión de Clientes",
      to: "/auth/crm/gestion-clientes",
      icon: Users,
      roles: [1, 9, 7, 4,11,10],
    },
    { name: "Gestion Comercial", to: "/auth/crm/kpis", icon: BarChart, roles: [1, 7] },
    {
      name: "Crear Orden de Compra",
      to: "/auth/crm/crear-ordenes-compras",
      icon: ShoppingCart,
      roles: [1, 9, 7, 4,10,10],
    },
    {
      name: "Inventarios",
      to: "/auth/crm/reporte-inventarios",
      icon: Clipboard,
      roles: [1, 6, 4, 7, 9, 5,10,11],
    },
  
    {
      name: "Vehiculos",
      to: "/auth/crm/vehiculos",
      icon: Car,
      roles: [1, 4, 8,10,11],
    },
    { name: "PQRS", to: "/auth/crm/pqrs", icon: MessageCircle, roles: [1,10] },
    {
      name: "Ordenes a Facturar",
      to: "/auth/crm/ordenes-facturar",
      icon: DocumentTextIcon,
      roles: [1, 4, 5, 6, 9, 7,10,11],
    },
    {
      name: "Órdenes de Compra",
      to: "/auth/crm/obtener-ordenes-compras",
      icon: ClipboardList,
      roles: [1, 4, 5, 6, 7, 9,10,11],
    },
    {
      name: "Registrar Documentacion ",
      to: "/auth/crm/registrar-documentacion",
      icon: FolderPlus,
      roles: [1, 4, 5,10,11],
    },
    {
      name: "Compras",
      to: "/auth/crm/proveedores",
      icon: UserGroupIcon,
   
    },

    // {
    //   name: "ordenes-compra-proveedor",
    //   to: "/auth/crm/ordenes-compra-proveedor",
    //   icon: Package,
    //   roles: [1, 4, 5, 6],
    // },
  ];





  // Obtener cantidad de notificaciones no leídas
  const obtenerNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get("/api/notificaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 AQUÍ LA CORRECCIÓN
      const { total_no_leidas = 0 } = response.data;
      setTotalNotificaciones(total_no_leidas);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  };

  useEffect(() => {
    obtenerNotificaciones();
    const interval = setInterval(obtenerNotificaciones, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar rutas por rol
const filteredMenuLinks = menuLinks;


  return (
    <>
      <Navbar />
      <header className="bg-white shadow-md px-4 py-3 md:px-7 md:py-4 z-50 flex items-center justify-between">
        <button
          className="block md:hidden p-2 text-gray-8700 hover:text-gray-900"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex bg-gray-100 min-h-screen">
        {/* Barra lateral con hover en pantallas grandes */}
        <aside
          className={`fixed top-[4rem] left-0 h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 z-50
    ${isExpanded ? "translate-x-0 w-64" : "-translate-x-full w-16"}
    md:translate-x-0 md:${isExpanded ? "w-64" : "w-16"}
    overflow-y-auto pt-6`}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="flex items-center justify-between px-4 mb-6">
            <h2
              className={`text-lg font-semibold transition-opacity ${
                isExpanded ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              Menú
            </h2>

            {/* Botón para cerrar en pantallas pequeñas */}
            <button
              className="block md:hidden text-white hover:text-white"
              onClick={() => setIsExpanded(false)}
            >
              ✖
            </button>
          </div>

          <nav className="flex flex-col space-y-2 px-2">
            {filteredMenuLinks.map((link) => {
              const hasChildren = Array.isArray(link.children) && link.children.length > 0;
              const isChildActive =
                hasChildren &&
                link.children.some((child) => location.pathname.startsWith(child.to));
              const isOpen = hasChildren && (openMenu === link.name || isChildActive);
              const isActive = location.pathname === link.to || isChildActive;

              return (
                <div key={link.name}>
                  <div
                    className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 group
                ${isActive ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"}`}
                  >
                    <Link
                      to={link.to}
                      className="relative flex items-center space-x-2 flex-1"
                      onClick={() => setIsExpanded(false)} // Cierra el sidebar al hacer clic
                    >
                      {/* Ícono */}
                      <link.icon className="w-5 h-5" />

                      {/* 🔴 Punto rojo si el menú está cerrado y hay notificaciones */}
                      {!isExpanded && link.badge > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                      )}

                      {/* Texto del menú */}
                      <span
                        className={`transition-opacity ${
                          isExpanded ? "opacity-100" : "opacity-0 hidden"
                        }`}
                      >
                        {link.name}
                      </span>
                    </Link>

                    {isExpanded && link.badge > 0 && (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                        {link.badge}
                      </span>
                    )}

                    {hasChildren && isExpanded && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((prev) => (prev === link.name ? null : link.name))
                        }
                        className="p-1 text-gray-300 hover:text-white"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && isOpen && (
                    <div className="ml-6 mt-1 flex flex-col space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.to}
                          onClick={() => setIsExpanded(false)}
                          className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-all duration-200
                      ${
                        location.pathname === child.to
                          ? "bg-gray-700 font-semibold"
                          : "hover:bg-gray-700"
                      }`}
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main
          className={`flex-1 pt-6 pb-10 transition-all duration-300 ${
            isExpanded ? "md:ml-64" : "md:ml-16"
          }`}
        >
          <div className="overflow-x-auto mt-4 mx-4 md:mx-6 p-4 md:p-6 bg-white shadow-md">
            {/* SOLO MUESTRA ESTE CONTENIDO EN /auth/crm, NO EN SUBRUTAS */}
            {location.pathname === "/auth/crm" && <Dashboard />}

            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
