import { useState } from "react";
import { 
  QrCode, 
  Mail, 
  FileText, 
  Sparkles, 
  Zap,
  Target,
  Users,
  BarChart3
} from "lucide-react";

import CreateQr from "./CreateQr";
import EnviarCorreo from "./EnviarCorreo";
import PlantillaEditor from "./PlantillaEditor";

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("plantillas");

  const tabs = [
    {
      id: "plantillas",
      label: "Editor de Plantillas",
      icon: FileText,
      description: "Crea y gestiona plantillas de email",
      color: "green",
      component: <PlantillaEditor />
    },
    {
      id: "correos",
      label: "Envío de Correos",
      icon: Mail,
      description: "Envía campañas de marketing",
      color: "blue",
      component: <EnviarCorreo />
    },
    {
      id: "qr",
      label: "Códigos QR",
      icon: QrCode,
      description: "Genera códigos QR personalizados",
      color: "purple",
      component: <CreateQr />
    }
  ];

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      green: {
        bg: isActive ? "bg-green-100" : "hover:bg-green-50",
        text: isActive ? "text-green-700" : "text-gray-600 hover:text-green-600",
        border: isActive ? "border-green-300" : "border-transparent",
        accent: "text-green-600",
        icon: isActive ? "text-green-600" : "text-gray-400"
      },
      blue: {
        bg: isActive ? "bg-blue-100" : "hover:bg-blue-50",
        text: isActive ? "text-blue-700" : "text-gray-600 hover:text-blue-600",
        border: isActive ? "border-blue-300" : "border-transparent",
        accent: "text-blue-600",
        icon: isActive ? "text-blue-600" : "text-gray-400"
      },
      purple: {
        bg: isActive ? "bg-purple-100" : "hover:bg-purple-50",
        text: isActive ? "text-purple-700" : "text-gray-600 hover:text-purple-600",
        border: isActive ? "border-purple-300" : "border-transparent",
        accent: "text-purple-600",
        icon: isActive ? "text-purple-600" : "text-gray-400"
      }
    };
    return colors[color];
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ✅ HEADER MEJORADO */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Marketing Digital
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Suite completa de herramientas para potenciar tu estrategia de marketing digital y comunicaciones corporativas
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Plantillas</p>
                    <p className="text-2xl font-bold">12+</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Campañas</p>
                    <p className="text-2xl font-bold">500+</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Alcance</p>
                    <p className="text-2xl font-bold">10K+</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* ✅ NAVIGATION TABS MEJORADAS */}
            <div className="flex flex-wrap gap-2 justify-center">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colorClasses = getColorClasses(tab.color, isActive);
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center gap-3 px-6 py-4 rounded-xl font-medium
                      transition-all duration-200 border-2
                      ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}
                      ${isActive ? 'shadow-lg transform -translate-y-1' : 'hover:shadow-md hover:-translate-y-0.5'}
                      min-w-[200px]
                    `}
                  >
                    {/* Icono */}
                    <Icon className={`w-5 h-5 ${colorClasses.icon} group-hover:scale-110 transition-transform`} />
                    
                    {/* Contenido */}
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">
                        {tab.label}
                      </span>
                      <span className="text-xs opacity-75 leading-tight">
                        {tab.description}
                      </span>
                    </div>

                    {/* Indicator activo */}
                    {isActive && (
                      <div className={`
                        absolute -top-1 -right-1 w-3 h-3 rounded-full
                        ${tab.color === 'green' ? 'bg-green-500' : ''}
                        ${tab.color === 'blue' ? 'bg-blue-500' : ''}
                        ${tab.color === 'purple' ? 'bg-purple-500' : ''}
                        shadow-md animate-pulse
                      `} />
                    )}

                    {/* Efecto hover */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 bg-gradient-to-r from-gray-900 to-transparent transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CONTENT AREA MEJORADA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb y título de sección */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Marketing Digital</span>
            <span>/</span>
            <span className={getColorClasses(currentTab.color, true).accent}>
              {currentTab.label}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${currentTab.color === 'green' ? 'bg-green-100' : ''}
              ${currentTab.color === 'blue' ? 'bg-blue-100' : ''}
              ${currentTab.color === 'purple' ? 'bg-purple-100' : ''}
            `}>
              <currentTab.icon className={`
                w-6 h-6
                ${getColorClasses(currentTab.color, true).accent}
              `} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentTab.label}
              </h2>
              <p className="text-gray-600">
                {currentTab.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="animate-in fade-in duration-300">
            {currentTab.component}
          </div>
        </div>
      </div>

      {/* ✅ FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <BarChart3 className="w-6 h-6" />
        </button>
        <button className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <Zap className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}