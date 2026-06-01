import { useState, useMemo } from "react";
import { Search, Users, CheckSquare, Square, Info, ShoppingCart, Mail } from "lucide-react";

function RazonBadge({ razon }) {
  if (!razon) return null;
  const esOrdenes = razon.includes("órdenes");
  const esEmail   = razon.includes("correo");
  const Icono     = esOrdenes && !esEmail ? ShoppingCart : esEmail && !esOrdenes ? Mail : Info;
  return (
    <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium shrink-0 whitespace-nowrap">
      <Icono className="w-3 h-3" />
      {razon}
    </span>
  );
}

export default function ListaClientes({ clientes = [], seleccionados = [], onToggle }) {
  const [busqueda, setBusqueda] = useState("");

  const { habilitados, inhabilitados, filtradosHabilitados } = useMemo(() => {
    const hab  = clientes.filter((c) => c.habilitado !== false);
    const inhab = clientes.filter((c) => c.habilitado === false);
    const filtrados = hab.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase())
    );
    return { habilitados: hab, inhabilitados: inhab, filtradosHabilitados: filtrados };
  }, [clientes, busqueda]);

  const inhabilitadosFiltrados = useMemo(
    () =>
      inhabilitados.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.email?.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [inhabilitados, busqueda]
  );

  const todosSeleccionados =
    filtradosHabilitados.length > 0 &&
    filtradosHabilitados.every((c) => seleccionados.includes(c.id));

  const toggleTodos = () => {
    if (todosSeleccionados) {
      filtradosHabilitados.forEach((c) => {
        if (seleccionados.includes(c.id)) onToggle(c.id);
      });
    } else {
      filtradosHabilitados.forEach((c) => {
        if (!seleccionados.includes(c.id)) onToggle(c.id);
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Cabecera búsqueda */}
      <div className="p-3 border-b border-gray-100 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Seleccionar todos (solo habilitados) */}
        {filtradosHabilitados.length > 0 && (
          <button
            type="button"
            onClick={toggleTodos}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-700 font-medium transition-colors"
          >
            {todosSeleccionados
              ? <CheckSquare className="w-4 h-4 text-emerald-600" />
              : <Square className="w-4 h-4" />
            }
            {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
            <span className="text-gray-400">({filtradosHabilitados.length})</span>
          </button>
        )}
      </div>

      {/* Lista */}
      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {/* Sin resultados en búsqueda */}
        {filtradosHabilitados.length === 0 && inhabilitadosFiltrados.length === 0 && (
          <li className="py-8 flex flex-col items-center gap-2 text-gray-400">
            <Users className="w-6 h-6" />
            <span className="text-sm">Sin clientes</span>
          </li>
        )}

        {/* Clientes habilitados */}
        {filtradosHabilitados.map((cliente) => {
          const activo = seleccionados.includes(cliente.id);
          return (
            <li key={cliente.id}>
              <button
                type="button"
                onClick={() => onToggle(cliente.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${activo ? "bg-emerald-50" : "hover:bg-gray-50"}`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                    ${activo ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}
                >
                  {activo && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{cliente.nombre}</p>
                  {cliente.email && (
                    <p className="text-xs text-gray-400 truncate">{cliente.email}</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}

        {/* Separador + clientes inhabilitados */}
        {inhabilitadosFiltrados.length > 0 && (
          <>
            <li className="px-4 py-2 bg-gray-50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                No disponibles para envío
              </p>
            </li>
            {inhabilitadosFiltrados.map((cliente) => (
              <li key={cliente.id} title={cliente.razon}>
                <div className="w-full flex items-center gap-3 px-4 py-2.5 opacity-50 cursor-not-allowed">
                  <div className="w-4 h-4 rounded border-2 border-gray-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">{cliente.nombre}</p>
                    {cliente.email && (
                      <p className="text-xs text-gray-400 truncate">{cliente.email}</p>
                    )}
                    {!cliente.email && (
                      <p className="text-xs text-gray-400">Sin correo registrado</p>
                    )}
                  </div>
                  <RazonBadge razon={cliente.razon} />
                </div>
              </li>
            ))}
          </>
        )}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
        {seleccionados.length > 0 ? (
          <p className="text-xs text-emerald-700 font-medium">
            {seleccionados.length} cliente{seleccionados.length !== 1 ? "s" : ""} seleccionado{seleccionados.length !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Selecciona clientes para enviar</p>
        )}
        {inhabilitados.length > 0 && (
          <p className="text-[10px] text-red-400 font-medium">
            {inhabilitados.length} sin acceso
          </p>
        )}
      </div>
    </div>
  );
}
