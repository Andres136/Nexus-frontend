import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  ClipboardList, FileQuestion, LayoutDashboard, Settings,
  ChevronRight, Wrench, Recycle, Menu, X, BarChart3, Boxes
} from "lucide-react";
import { useState } from "react";
import HseqDashboard from "../../components/hseq/HseqDashboard";

export default function ViewHseq() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Organización lógica de los ítems
  const menuGroups = [
    {
      title: "Análisis",
      items: [
        { name: "Dashboard Servicios", to: "/auth/crm/hseq/dashboard-consumo-servicios", icon: BarChart3 },
        { name: "Dashboard Residuos", to: "/auth/crm/hseq/dashboard-generacion-residuos", icon: BarChart3 },
      ]
    },
    {
      title: "Operación",
      items: [
        { name: "Inspecciones", to: "/auth/crm/hseq/registro-inspeccion", icon: ClipboardList },
        { name: "Consumo Servicios", to: "/auth/crm/hseq/consumo-servicios", icon: Wrench },
        { name: "Generación Residuos", to: "/auth/crm/hseq/generacion-residuos", icon: Recycle },
      ]
    },
    {
      title: "Configuración",
      items: [
        { name: "Tipos de Inspección", to: "/auth/crm/hseq/tipos-inspeccion", icon: Settings },
        { name: "Preguntas", to: "/auth/crm/hseq/preguntas", icon: FileQuestion },
        { name: "Tipos de Servicios", to: "/auth/crm/hseq/tipo-servicios", icon: Boxes },
        { name: "Tipos de Residuos", to: "/auth/crm/hseq/tipo-residuos", icon: Recycle },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo / Header Sidebar */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight">HSEQ </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">Gestión Ambiental y Calidad</p>
              </div>
            </div>
          </div>

          {/* Navegación por Grupos */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[1.5px] mb-3">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                          ${active 
                            ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                        `}
                      >
                        <item.icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Barra (Mobile & Desktop Info) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb integrado en el header */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900 font-black">HSEQ</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-700">Módulo Operativo</p>
              <p className="text-[10px] text-emerald-600 font-medium tracking-tighter italic">Sincronizado con CRM</p>
            </div>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="container mx-auto space-y-6">
            <HseqDashboard />
              <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}