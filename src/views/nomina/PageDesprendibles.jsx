import { useState } from "react";
import { FileText, Download, Search, Calendar, ChevronDown } from "lucide-react";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const MOCK_EMPLEADOS = [
  { id: 1, nombre: "Andres Tique", cargo: "Desarrollador" },
];

export default function PageDesprendibles() {
  const hoy = new Date();
  const [empleado, setEmpleado] = useState("");
  const [mes, setMes]           = useState(hoy.getMonth());
  const [anio, setAnio]         = useState(hoy.getFullYear());

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Desprendibles de Pago</h1>
        <p className="text-sm text-gray-500 mt-0.5">Consulta y descarga los desprendibles de nómina por período.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-4">Selecciona el período</p>
        <div className="flex flex-wrap gap-3">
          {/* Empleado */}
          <div className="relative flex-1 min-w-48">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={empleado}
              onChange={(e) => setEmpleado(e.target.value)}
              className="w-full pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Mes */}
          <div className="relative">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
            >
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Año */}
          <div className="relative">
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
            >
              {[2024, 2025, 2026].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="h-9 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {/* Lista resultado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {MESES[mes]} {anio}
          </p>
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>

        {MOCK_EMPLEADOS.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-700 text-sm font-semibold">
                  {emp.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{emp.nombre}</p>
                <p className="text-xs text-gray-500">{emp.cargo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Desprendible {MESES[mes]} {anio}
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                <Download className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
