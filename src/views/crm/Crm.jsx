import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  Briefcase, Users, BarChart, ShoppingCart, FileText, Bell, 
  MessageCircle, MapPin, Clipboard, Menu, ClipboardList
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";

export default function Crm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth({ middleware: "auth" });

  // Alternar manualmente en móviles
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Definir rutas con los roles permitidos
  const menuLinks = [
    { name: "Reuniones", to: "/auth/crm/reuniones", icon: Briefcase, roles: [1, 2, 3] },
    { name: "Gestión de Clientes", to: "/auth/crm/gestion-clientes", icon: Users, roles: [1, 4, 7] },
    { name: "KPIs", to: "/auth/crm/kpis", icon: BarChart, roles: [1, 7] },
    { name: "Crear Orden de Compra", to: "/auth/crm/ordenes-compras", icon: ShoppingCart, roles: [1, 5,4,6] },
    { name: "Órdenes de Trabajo", to: "/auth/crm/reporte-inventarios", icon: Clipboard, roles: [1, 6,4,7] },
    { name: "Notificaciones", to: "/auth/crm/notificaciones", icon: Bell, roles: [1, 3, 4, 5, 6] },
    { name: "Hacer Cotización", to: "/auth/crm/cotizaciones", icon: FileText, roles: [1, 7] },
    { name: "PQRS", to: "/auth/crm/pqrs", icon: MessageCircle, roles: [1, 3, 4, 7] },
    { name: "Visita al Cliente", to: "/auth/crm/visita-cliente", icon: MapPin, roles: [1, 7] },
    { name: "Órdenes de Compra", to: "/auth/crm/obtener-ordenes-compras", icon: ClipboardList, roles: [1, 5,4,7,6] },
  ];

  // Filtrar rutas por rol
  const filteredMenuLinks = menuLinks.filter(link =>
    link.roles.includes(user?.role_id)
  );

  return (
    <>
      <Navbar />
      <header className="bg-white shadow-md px-4 py-3 md:px-7 md:py-4 z-50 flex items-center justify-between">
        <button
          className="block md:hidden p-2 text-gray-700 hover:text-gray-900"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex bg-gray-100 min-h-screen">
        {/* Barra lateral con hover en pantallas grandes */}
        <aside 
          className={`fixed top-[4rem] left-0 h-screen bg-gray-900 text-white shadow-lg transition-all duration-300
            ${isExpanded ? "translate-x-0 w-64" : "-translate-x-full w-16"}
            md:translate-x-0 md:${isExpanded ? "w-64" : "w-16"}
            overflow-y-auto`}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <h2 className={`text-lg font-semibold mb-4 mt-4 px-2 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
            Menú
          </h2>

          <nav className="flex flex-col space-y-4">
            {filteredMenuLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md"
                onClick={() => setIsExpanded(false)} // Cierra el sidebar al hacer clic
              >
                <link.icon className="w-5 h-5" />
                <span className={`transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className={`flex-1 pt-6 pb-10 transition-all duration-300 ${isExpanded ? "md:ml-64" : "md:ml-16"}`}>
          <div className="overflow-x-auto mt-4 mx-4 md:mx-6 p-4 md:p-6 bg-white shadow-md">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
