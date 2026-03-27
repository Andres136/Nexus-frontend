

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  ClipboardList, 
  FileQuestion, 
  LayoutDashboard, 
  Settings,
  ChevronRight 
} from "lucide-react";
import HseqDashboard from "../../components/hseq/HseqDashboard";

export default function ViewHseq() {
  const location = useLocation();
  
  const navItems = [
    { 
      name: "Dashboard", 
      to: "/auth/hseq", 
      icon: LayoutDashboard,
      end: true 
    },
    { 
      name: "Inspecciones", 
      to: "/auth/crm/hseq/registro-inspeccion", 
      icon: ClipboardList 
    },
    { 
      name: "Tipos de Inspección", 
      to: "/auth/crm/hseq/tipos-inspeccion", 
      icon: Settings 
    },
    { 
      name: "Preguntas", 
      to: "/auth/crm/hseq/preguntas", 
      icon: FileQuestion 
    },
  ];

  const isActive = (path, end = false) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header de navegación */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          {/* Título del módulo */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HSEQ</h1>
                <p className="text-sm text-gray-500">Salud, Seguridad, Ambiente y Calidad</p>
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <nav className="flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const active = isActive(item.to, item.end);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-emerald-600">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">HSEQ</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 pb-8">
        <HseqDashboard />
        <Outlet />
      </div>
    </div>
  );
}