import { useState } from "react";
import {
  QrCode,
  Mail,
  FileText,
  Files,
  Sparkles,
  Zap,
  Target,
  Users,
  BarChart3,
  CalendarDays
} from "lucide-react";

import CreateQr from "./CreateQr";
import EnviarCorreo from "./EnviarCorreo";
import PlantillaEditor from "./PlantillaEditor";
import PageCorporateDocuments from "../corporate/PageCorporateDocuments";
import CalendarioPublicaciones from "../../components/marketing/CalendarioPublicaciones";

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("plantillas");

  const tabs = [
    {
      id: "cronograma",
      label: "Cronograma",
      icon: CalendarDays,
      description: "Calendario de publicaciones en redes",
      color: "amber",
      component: <CalendarioPublicaciones />
    },
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
    },
    {
      id: "documentos",
      label: "Documentos",
      icon: Files,
      description: "Administra recursos corporativos",
      color: "slate",
      component: <PageCorporateDocuments embedded />
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
      },
      slate: {
        bg: isActive ? "bg-slate-100" : "hover:bg-slate-50",
        text: isActive ? "text-slate-800" : "text-gray-600 hover:text-slate-700",
        border: isActive ? "border-slate-300" : "border-transparent",
        accent: "text-slate-700",
        icon: isActive ? "text-slate-700" : "text-gray-400"
      },
      amber: {
        bg: isActive ? "bg-amber-100" : "hover:bg-amber-50",
        text: isActive ? "text-amber-700" : "text-gray-600 hover:text-amber-600",
        border: isActive ? "border-amber-300" : "border-transparent",
        accent: "text-amber-600",
        icon: isActive ? "text-amber-600" : "text-gray-400"
      }
    };
    return colors[color];
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const contentWidthClass = activeTab === "documentos" ? "max-w-[1520px]" : "max-w-7xl";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HEADER COMPACTO */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Hero Section */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Marketing Digital
                </h1>
                <p className="text-sm text-gray-500 leading-tight truncate">
                  Suite de herramientas de marketing digital y comunicaciones corporativas
                </p>
              </div>

              {/* Stats compactos */}
              <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                  <FileText className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">12+ plantillas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">500+ campañas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">10K+ alcance</span>
                </div>
              </div>
            </div>

            {/* ✅ NAVIGATION TABS COMPACTAS */}
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colorClasses = getColorClasses(tab.color, isActive);
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                      transition-all duration-150 border
                      ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}
                      ${isActive ? 'shadow-sm' : ''}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${colorClasses.icon}`} />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CONTENT AREA */}
      <div className={`${contentWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-5`}>
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
