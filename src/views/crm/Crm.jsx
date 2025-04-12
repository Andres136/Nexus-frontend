import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Briefcase, Users, BarChart, ShoppingCart,  Bell, 
  MessageCircle,  Clipboard, Menu, ClipboardList,
  FolderPlus,
  Car,
  CarrotIcon,
 
  VenetianMaskIcon,
  
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import Dashboard from "../Dashboard";
import clienteAxios from "../../config/axios";
import { DocumentTextIcon, UserGroupIcon } from "@heroicons/react/16/solid";


export default function Crm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth({ middleware: "auth" });
  const location = useLocation();
const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  // Alternar manualmente en móviles
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Definir rutas con los roles permitidos
  const menuLinks = [
    { name: "Ordenes Trabajo", to: "/auth/crm/ordenes-trabajo", icon: Briefcase, roles: [1,4,5,6] },
    { name: "Gestión de Clientes", to: "/auth/crm/gestion-clientes", icon: Users, roles: [1, 9, 7] },
    { name: "KPIs", to: "/auth/crm/kpis", icon: BarChart, roles: [1, 7] },
    { name: "Crear Orden de Compra", to: "/auth/crm/crear-ordenes-compras", icon: ShoppingCart, roles: [1, 9,7,4] },
    { name: "Inventarios", to: "/auth/crm/reporte-inventarios", icon: Clipboard, roles: [1, 6,4,7,9,5] },
    { name: "Notificaciones", to: "/auth/crm/notificaciones", icon: Bell, roles: [1,  5, 4],badge: totalNotificaciones },
    { name: "Vehiculos", to: "/auth/crm/vehiculos", icon: Car, roles: [1,4,8] },
    { name: "PQRS", to: "/auth/crm/pqrs", icon: MessageCircle, roles: [1,5] },
    { name: "Ordenes a Facturar", to: "/auth/crm/ordenes-facturar", icon: DocumentTextIcon, roles: [1,4,5,6,9 ,7] },
    { name: "Órdenes de Compra", to: "/auth/crm/obtener-ordenes-compras", icon: ClipboardList, roles: [1, 5,4,7] },
    { name: "Registrar Documentacion ", to: "/auth/crm/registrar-documentacion", icon: FolderPlus, roles: [1,4,5] },
    {name: "Proveedores", to: "/auth/crm/proveedores", icon: UserGroupIcon, roles: [1,4,5,6] },
    {name: "proveedores-ordenes-compra", to: "/auth/crm/proveedores-ordenes-compra", icon: VenetianMaskIcon, roles: [1,4,5,6] },
    {name: "ordenes-compra-proveedor", to: "/auth/crm/ordenes-compra-proveedor", icon: CarrotIcon, roles: [1,4,5,6] },

    

    

  ]; // Obtener cantidad de notificaciones no leídas
  const obtenerNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get("/api/notificaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalNotificaciones(response.data.notificaciones.total_no_leidas);

   
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  };

  // const obtenerNotificacionesPqrs = async () => {
  //   const token = localStorage.getItem("token");
  //   try {
  //     const response = await clienteAxios.get("/api/notifications-pqrs/pqr", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  
  //     console.log("Pqr", response);
  //     setTotalNotificaciones(response.data.total); // <- Este es el valor correcto según tu controlador
  
  //   } catch (error) {
  //     console.error("Error al obtener notificaciones pqr:", error);
  //   }
  // };
  

  useEffect(() => {
    obtenerNotificaciones();
    const interval = setInterval(obtenerNotificaciones, 20000); // Refrescar cada 20s
    return () => clearInterval(interval);
  }, []);

  // Filtrar rutas por rol
  const filteredMenuLinks = menuLinks.filter(link =>
    link.roles.includes(user?.role_id)
  );

  // useEffect(() => {
  //   console.log("⏳ Consultando notificaciones PQR...");
  //   obtenerNotificacionesPqrs();
  //   const interval = setInterval(obtenerNotificacionesPqrs, 20000); // Refrescar cada 20s
  //   return () => clearInterval(interval);
  // },[])
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
  className={`fixed top-[5rem] left-0 h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 z-50
    ${isExpanded ? "translate-x-0 w-64" : "-translate-x-full w-16"}
    md:translate-x-0 md:${isExpanded ? "w-64" : "w-16"}
    overflow-y-auto pt-6`}
  onMouseEnter={() => setIsExpanded(true)}
  onMouseLeave={() => setIsExpanded(false)}
>
  <div className="flex items-center justify-between px-4 mb-6">
    <h2 className={`text-lg font-semibold transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
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
    {filteredMenuLinks.map((link) => (
      <Link
        key={link.name}
        to={link.to}
        className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 group
          ${location.pathname === link.to ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"}`}
        onClick={() => setIsExpanded(false)} // Cierra el sidebar al hacer clic
      >
        <div className="flex items-center space-x-2">
          <link.icon className="w-5 h-5" />
          <span className={`transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
            {link.name}
          </span>
        </div>

        {isExpanded && link.badge > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
            {link.badge}
          </span>
        )}
      </Link>
    ))}
  </nav>
</aside>


        <main className={`flex-1 pt-6 pb-10 transition-all duration-300 ${isExpanded ? "md:ml-64" : "md:ml-16"}`}>
        
          <div className="overflow-x-auto mt-4 mx-4 md:mx-6 p-4 md:p-6 bg-white shadow-md">
             {/* SOLO MUESTRA ESTE CONTENIDO EN /auth/crm, NO EN SUBRUTAS */}
             {location.pathname === "/auth/crm" && (
                  <Dashboard/>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
