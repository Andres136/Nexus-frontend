import { useState } from "react";
import { Shield,  UserCheck, Route, Settings, ChevronRight, ClipboardList, Monitor } from "lucide-react";
import AsignarPermisos from "./AsignarPermisos";
import AsignarPermisosUsuario from "./AsignarPermisosUsuario";
import RegistrarRutas from "./RegistrarRutas";
import Roles from "./Roles";
import PageTipoRegistros from "../nomina/PageTipoRegistros";
import PageKioscos from "../nomina/PageKioscos";

export default function SettingPermissions() {
  const [activeTab, setActiveTab] = useState("rutas");

  const tabs = [
    {
      id: "rutas",
      label: "Registrar Rutas",
      description: "Configura las rutas del sistema",
      icon: Route,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      component: RegistrarRutas,
      badge: "Setup"
    },
    {
      id: "roles",
      label: "Permisos por Rol",
      description: "Asigna permisos a roles de usuario",
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      component: AsignarPermisos,
      badge: "Masivo"
    },
    {
      id: "usuarios",
      label: "Permisos por Usuario",
      description: "Gestiona permisos individuales",
      icon: UserCheck,
      color: "from-purple-500 to-indigo-600",
      hoverColor: "hover:from-purple-600 hover:to-indigo-700",
      component: AsignarPermisosUsuario,
      badge: "Individual"
    },
    {
        id:"Roles",
        label:"Roles y Permisos",
        description:"Gestiona roles y permisos del sistema",
        icon:Settings,
        color:"from-yellow-500 to-yellow-600",
        hoverColor:"hover:from-yellow-600 hover:to-yellow-700",
        component:Roles,
        badge:"Admin"
    },
  {
  id: "tipo-registros",
  label: "Tipos de Registro",
  description: "Administra los tipos de registros",
  icon: ClipboardList,
  color: "from-cyan-500 to-blue-600",
  hoverColor: "hover:from-cyan-600 hover:to-blue-700",
  component: PageTipoRegistros,
  badge: "Nómina",
},
{
  id: "kioscos",
  label: "Kioscos",
  description: "Configura kioscos del sistema",
  icon: Monitor,
  color: "from-slate-500 to-slate-700",
  hoverColor: "hover:from-slate-600 hover:to-slate-800",
  component: PageKioscos,
  badge: "Control",
},
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      
      {/* ✅ Header principal */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          
          {/* Título principal */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-xl">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Centro de Permisos</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Administra rutas, roles y permisos de usuario del sistema
              </p>
            </div>
          </div>

          {/* ✅ Navegación con tabs mejorada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative p-4 sm:p-5 rounded-xl border transition-all duration-300 transform hover:scale-105 text-left
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-xl border-transparent` 
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }
                  `}
                >
                  {/* Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.badge}
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className={`p-2 sm:p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-semibold mb-1 ${
                        isActive ? 'text-white' : 'text-gray-900'
                      }`}>
                        {tab.label}
                      </h3>
                      <p className={`text-xs sm:text-sm ${
                        isActive ? 'text-white text-opacity-90' : 'text-gray-600'
                      }`}>
                        {tab.description}
                      </p>
                    </div>

                    {/* Indicador activo */}
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      isActive 
                        ? 'text-white rotate-90' 
                        : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Breadcrumb mejorado */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500">Centro de Permisos</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              {activeTabData && (
                <>
                  <activeTabData.icon className="w-4 h-4 text-gray-700" />
                  <span className="font-medium text-gray-700">{activeTabData.label}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Indicador de progreso visual */}
      <div className="relative">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeTabData?.color} transition-all duration-500`}></div>
        
        {/* ✅ Componente dinámico con transición */}
        <div className="relative">
          {ActiveComponent && (
            <div 
              key={activeTab}
              className="animate-fadeIn"
              style={{
                animation: "fadeIn 0.3s ease-in-out"
              }}
            >
              <ActiveComponent />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Footer informativo */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            {/* Flujo de trabajo */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">1. Registrar Rutas</h4>
              <p className="text-sm text-gray-600">
                Primero configura todas las rutas disponibles en el sistema
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">2. Asignar por Rol</h4>
              <p className="text-sm text-gray-600">
                Luego asigna permisos masivamente por roles de usuario
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">3. Excepciones</h4>
              <p className="text-sm text-gray-600">
                Finalmente configura permisos específicos por usuario
              </p>
            </div>
          </div>

          {/* Nota importante */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="text-sm text-yellow-800">
                <strong>Nota:</strong> Los permisos individuales de usuario tienen prioridad sobre los permisos del rol. 
                Sigue el orden sugerido para una configuración óptima.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Estilos de animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}