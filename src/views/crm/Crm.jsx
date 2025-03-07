import  { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Briefcase, Users, BarChart, ShoppingCart, FileText, Bell, MessageCircle, MapPin, Clipboard } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function Crm() {
  const [isExpanded, setIsExpanded] = useState(false);

return (

    <>
    <Navbar/>
    <div className="flex h-screen bg-gray-100  ">
        {/* Barra Lateral Izquierda */}
        <aside
          className={`fixed top-18 left-0 h-screen bg-gray-900 text-white p-4 shadow-lg transition-all duration-300 ${
            isExpanded ? "w-64" : "w-16"
          }`}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
            <h2 className={`text-lg font-semibold mb-4 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Menú</h2>
            <nav className="flex flex-col space-y-4">
                <Link to="/auth/crm/reuniones" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
                    <Briefcase className="w-5 h-5" />
                    <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Reuniones</span>
                </Link>
                <Link to="/auth/crm/gestion-clientes" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
                    <Users className="w-5 h-5" />
                    <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Gestión de Clientes</span>
                </Link>
                <Link to="/auth/crm/kpis" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
                    <BarChart className="w-5 h-5" />
                    <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>KPIs</span>
                </Link>
                <Link to="/auth/crm/ordenes-compras" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
                    <ShoppingCart className="w-5 h-5" />
                    <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Crear Orden de Compra</span>
                </Link>
                <Link to="/auth/crm/reporte-inventarios" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
                    <Clipboard className="w-5 h-5" />
                    <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Ordenes de Trabajo</span>
                </Link>
                <Link to="/auth/crm/notifyficaciones" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
            <Bell className="w-5 h-5" />
            <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Notificaciones</span>
          </Link>
          <Link to="/auth/crm/cotizaciones" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
            <FileText className="w-5 h-5" />
            <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Hacer Cotización</span>
          </Link>
          <Link to="/auth/crm/pqrs" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
            <MessageCircle className="w-5 h-5" />
            <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>PQRS</span>
          </Link>
          <Link to="/auth/crm/visita-cliente" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md">
            <MapPin className="w-5 h-5" />
            <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Visita al Cliente</span>
          </Link>

            </nav>
        </aside>

        {/* Contenido Principal */}
        <div className={`flex-1 ml-16 ${isExpanded ? "ml-64" : "ml-16"} transition-all duration-300`}>
          <header className=" bg-white shadow-md px-7 py-4 z-50 transition-all duration-300">
                   <h1 className="text-3xl font-bold text text-gray-800">CRM SETASPLAST</h1>
            <p className="mt-2 text-gray-600">Bienvenido al sistema de gestión CRM</p>
          </header>
     <div
     className="mt-20 mx-6 p-6 bg-white shadow-md">

            <Outlet/>

     </div>

        </div>
    </div></>
);
}

