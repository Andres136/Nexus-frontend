import { useState } from "react";
import ObtenerFormasPago from "./ObtenerFormasPago";
import ObtenerImpuestos from "./ObtenerImpuestos";
import ObtenerPuck from "./ObtenerPuck";

const TABS = [
  { id: "formas-pago", label: "Formas de Pago" },
  { id: "impuestos", label: "Impuestos" },
  { id: "puc", label: "Plan Único de Cuentas" },
];

export default function CatalogoContable() {
  const [activeTab, setActiveTab] = useState("formas-pago");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TAB BAR */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1 max-w-6xl mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENIDO */}
      <div>
        {activeTab === "formas-pago" && <ObtenerFormasPago />}
        {activeTab === "impuestos" && <ObtenerImpuestos />}
        {activeTab === "puc" && <ObtenerPuck />}
      </div>
    </div>
  );
}
