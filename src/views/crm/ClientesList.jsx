import { FaEdit, FaTasks, FaSearch, FaHistory, FaSpinner, FaUserSlash, FaUser } from "react-icons/fa";
import { useClientes } from "../../hooks/useClientes";
import { useDebounce } from "../../hooks/useDebounce";
import Modal from "../../components/calidad/Modal";
import UpdateClientes from "../../components/crm/UpdateClientes";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useFormatoFecha } from "../../hooks/useFormatoFecha";
import ModalClienteHistorial from "../../components/crm/ModalClienteHistorial";
import Swal from "sweetalert2";
import GestionarClientes from "../../components/crm/GestionarClientes";
import { useQuery } from "@tanstack/react-query";
import { encuestaService } from "../../services/encuestaService";
import {
  ClipboardList, X, CheckCircle2, Copy, Check, Loader2, Send,
  Download, ShoppingCart, Clock, AlertTriangle,
} from "lucide-react";

function ModalSeleccionarEncuesta({ clienteIds, onClose }) {
  const [encuestaId, setEncuestaId] = useState(null);
  const [links, setLinks]           = useState([]);
  const [excluidos, setExcluidos]   = useState([]);
  const [copiados, setCopiados]     = useState({});
  const [todoCopiado, setTodoCop]   = useState(false);
  const [enviando, setEnviando]     = useState(false);
  const [error, setError]           = useState(null);
  const enviado = links.length > 0 || excluidos.length > 0;

  const { data: encuestas = [], isLoading } = useQuery({
    queryKey: ["encuestas"],
    queryFn: async () => {
      const res = await encuestaService.getAll();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleEnviar = async () => {
    if (!encuestaId) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await encuestaService.enviar(encuestaId, clienteIds);
      setLinks(res.data.links     ?? []);
      setExcluidos(res.data.excluidos ?? []);
    } catch {
      setError("Ocurrió un error al enviar la encuesta.");
    } finally {
      setEnviando(false);
    }
  };

  const copiarLink = async (link, idx) => {
    await navigator.clipboard.writeText(link);
    setCopiados((prev) => ({ ...prev, [idx]: true }));
    setTimeout(() => setCopiados((prev) => ({ ...prev, [idx]: false })), 2000);
  };

  const copiarTodos = async () => {
    const encuesta = encuestas.find((e) => e.id === encuestaId);
    const texto = links
      .map((l) => `${l.cliente_nombre} <${l.cliente_email}>\n${l.link}`)
      .join("\n\n");
    await navigator.clipboard.writeText(texto);
    setTodoCop(true);
    setTimeout(() => setTodoCop(false), 2500);
  };

  const descargarTxt = () => {
    const enc   = encuestas.find((e) => e.id === encuestaId);
    const lineas = [
      `Encuesta: ${enc?.titulo ?? ""}`,
      `Fecha: ${new Date().toLocaleString("es-CO")}`,
      `Enviados: ${links.length}  |  No enviados: ${excluidos.length}`,
      "",
      "── ENVIADOS ──",
      ...links.map((l, i) => `${i + 1}. ${l.cliente_nombre} <${l.cliente_email}>\n   ${l.link}`),
    ];
    if (excluidos.length > 0) {
      lineas.push("", "── NO ENVIADOS ──");
      excluidos.forEach((e, i) => lineas.push(`${i + 1}. ${e.cliente_nombre} — ${e.razon}`));
    }
    const blob = new Blob([lineas.join("\n")], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `links-encuesta-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Enviar encuesta</h2>
              <p className="text-xs text-gray-400">
                {clienteIds.length} cliente{clienteIds.length !== 1 ? "s" : ""} seleccionado{clienteIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ── Resultado del envío ── */}
          {enviado ? (
            <div className="space-y-4">

              {/* Resumen */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {links.length} correo{links.length !== 1 ? "s" : ""} enviado{links.length !== 1 ? "s" : ""}
                  {excluidos.length > 0 && (
                    <span className="text-red-500 font-semibold ml-1">
                      · {excluidos.length} excluido{excluidos.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                {links.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copiarTodos}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors
                        ${todoCopiado ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"}`}
                    >
                      {todoCopiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {todoCopiado ? "¡Copiado!" : "Copiar todos"}
                    </button>
                    <button
                      onClick={descargarTxt}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> TXT
                    </button>
                  </div>
                )}
              </div>

              {/* Aviso cola */}
              {links.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Los correos se envían en segundo plano. Usa los links como respaldo.
                  </p>
                </div>
              )}

              {/* Links enviados */}
              {links.length > 0 && (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {links.map((l, i) => (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{l.cliente_nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{l.cliente_email}</p>
                        <p className="text-[11px] text-blue-500 truncate font-mono">{l.link}</p>
                      </div>
                      <button
                        onClick={() => copiarLink(l.link, i)}
                        className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                          copiados[i] ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {copiados[i] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Excluidos con nombre específico */}
              {excluidos.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs font-semibold text-red-600">
                      No recibieron la encuesta
                    </p>
                  </div>
                  <ul className="divide-y divide-red-50 max-h-44 overflow-y-auto">
                    {excluidos.map((e, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{e.cliente_nombre}</p>
                          <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3 shrink-0" />
                            {e.razon}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium">
                Cerrar
              </button>
            </div>

          ) : (
            /* ── Selección de encuesta ── */
            <>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
              ) : encuestas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No hay encuestas disponibles</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Selecciona una encuesta</p>
                  {encuestas.map((enc) => (
                    <button
                      key={enc.id}
                      onClick={() => setEncuestaId(enc.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        encuestaId === enc.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{enc.titulo}</p>
                      {enc.descripcion && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{enc.descripcion}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{enc.preguntas?.length ?? 0} preguntas</p>
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  disabled={!encuestaId || enviando}
                  onClick={handleEnviar}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600
                    hover:bg-emerald-700 disabled:bg-gray-200 text-white text-sm font-medium"
                >
                  {enviando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    : <><Send className="w-4 h-4" /> Enviar</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientesList({ onClose }) {
  useAuth({ middleware: "auth" });
  const {
    clientes,
    paginaActual,
    totalPaginas,
    busqueda,
    setBusqueda,
    obtenerClientes,
    cambiarEstadoCliente,
  } = useClientes();

  const debouncedBusqueda = useDebounce(busqueda, 400);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGestionarModalOpen, setGestionarModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { formatearFecha } = useFormatoFecha();
  const { consultarHistorialCliente } = useClientes();
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalEncuesta, setModalEncuesta] = useState(false);

  const toggleSeleccion = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleTodos = () =>
    setSeleccionados((prev) =>
      prev.length === clientes.length ? [] : clientes.map((c) => c.id)
    );

  useEffect(() => {
    setLoading(true);
    obtenerClientes(1, debouncedBusqueda).finally(() => setLoading(false));
  }, [debouncedBusqueda]);

  const handleToggleEstado = (cliente) => {
    const isActivo = cliente.estado_id === 3;
    Swal.fire({
      title: isActivo ? "¿Desactivar cliente?" : "¿Activar cliente?",
      text: isActivo
        ? "El cliente dejará de estar disponible para procesos activos."
        : "El cliente volverá a estar disponible en el sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActivo ? "#d33" : "#16a34a",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isActivo ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        cambiarEstadoCliente(cliente.id);
        Swal.fire({
          title: isActivo ? "Cliente desactivado" : "Cliente activado",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const renderAcciones = (cliente) => (
    <div className="flex justify-center gap-1.5">
      <button
        title="Editar"
        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        onClick={() => { setSelectedUser(cliente.id); setUserModalOpen(true); }}
      >
        <FaEdit size={13} />
      </button>
      <button
        title={cliente.estado_id === 3 ? "Desactivar" : "Activar"}
        className={`p-2 rounded-lg text-white transition-colors shadow-sm ${
          cliente.estado_id === 3
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-green-600 hover:bg-green-700"
        }`}
        onClick={() => handleToggleEstado(cliente)}
      >
        {cliente.estado_id === 3 ? <FaUserSlash size={13} /> : <FaUser size={13} />}
      </button>
      <button
        title="Gestionar"
        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
        onClick={() => { setSelectedUser(cliente.id); setGestionarModalOpen(true); }}
      >
        <FaTasks size={13} />
      </button>
      <button
        title="Historial"
        className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors shadow-sm"
        onClick={async () => {
          const historial = await consultarHistorialCliente(cliente.id);
          setClienteHistorial(historial);
        }}
      >
        <FaHistory size={13} />
      </button>
    </div>
  );

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1">
        {/* Buscador */}
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o NIT..."
            className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {loading && (
            <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={14} />
          )}
        </div>

        {/* ── VISTA ESCRITORIO: tabla ── */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={clientes.length > 0 && seleccionados.length === clientes.length}
                      onChange={toggleTodos}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  {["#", "Nombre", "Email", "Teléfono", "Nit / Cédula", "Última gestión", "Fecha creación"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap w-[140px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className={`transition-colors hover:bg-gray-50/80 group ${seleccionados.includes(cliente.id) ? "bg-emerald-50/40" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(cliente.id)}
                          onChange={() => toggleSeleccion(cliente.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium text-gray-500">#{cliente.id}</span>
                          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                            cliente.estado_id === 3 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {cliente.estado?.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                      <td className="px-6 py-4 text-gray-500">{cliente.email}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{cliente.telefono}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cliente.nit}</td>
                      <td className="px-6 py-4">
                        {cliente.ultima_gestion ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900 text-xs">{cliente.ultima_gestion.tipo_contacto}</span>
                            <span className="text-gray-400 text-[11px]">{formatearFecha(cliente.ultima_gestion.created_at)}</span>
                            <span className="text-gray-500 text-[11px]">{cliente.ultima_gestion.usuario?.name}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-400 text-xs">Sin gestión</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{formatearFecha(cliente.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Editar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => { setSelectedUser(cliente.id); setUserModalOpen(true); }}
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            title={cliente.estado_id === 3 ? "Desactivar" : "Activar"}
                            className={`p-1.5 rounded-md transition-colors ${
                              cliente.estado_id === 3
                                ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                            onClick={() => handleToggleEstado(cliente)}
                          >
                            {cliente.estado_id === 3 ? <FaUserSlash size={15} /> : <FaUser size={15} />}
                          </button>
                          <button
                            title="Gestionar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            onClick={() => { setSelectedUser(cliente.id); setGestionarModalOpen(true); }}
                          >
                            <FaTasks size={15} />
                          </button>
                          <button
                            title="Historial"
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            onClick={async () => {
                              const historial = await consultarHistorialCliente(cliente.id);
                              setClienteHistorial(historial);
                            }}
                          >
                            <FaHistory size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <div className="p-3 bg-gray-50 rounded-full">
                           <FaSearch size={20} className="text-gray-400" />
                        </div>
                        <span className="text-sm">No se encontraron clientes</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── VISTA MÓVIL/TABLET (Omitida por brevedad, aplica las mismas clases de colores/botones aquí) ── */}
          {/* ── VISTA MÓVIL/TABLET: tarjetas ── */}

        <div className="lg:hidden space-y-3">

          {clientes.length > 0 ? (

            clientes.map((cliente) => (

              <div key={cliente.id} className={`bg-white rounded-xl shadow border p-4 space-y-3 ${seleccionados.includes(cliente.id) ? "border-emerald-400 bg-emerald-50/30" : "border-gray-200"}`}>

                {/* Encabezado tarjeta */}

                <div className="flex items-start justify-between gap-2">

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(cliente.id)}
                      onChange={() => toggleSeleccion(cliente.id)}
                      className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>

                    <p className="font-semibold text-gray-800">{cliente.nombre}</p>

                    <p className="text-xs text-gray-500">{cliente.email}</p>

                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-semibold shrink-0 ${

                    cliente.estado_id === 3 ? "bg-green-500" : "bg-red-500"

                  }`}>

                    {cliente.estado?.nombre}

                  </span>

                </div>



                {/* Datos secundarios */}

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">

                  <div><span className="font-medium text-gray-500">Teléfono: </span>{cliente.telefono}</div>

                  <div><span className="font-medium text-gray-500">NIT: </span>{cliente.nit}</div>

                  <div className="col-span-2"><span className="font-medium text-gray-500">Creado: </span>{formatearFecha(cliente.created_at)}</div>

                </div>



                {/* Última gestión */}

                {cliente.ultima_gestion ? (

                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs space-y-0.5">

                    <p className="font-semibold text-blue-700">{cliente.ultima_gestion.tipo_contacto}</p>

                    <p className="text-gray-500">{formatearFecha(cliente.ultima_gestion.created_at)} · {cliente.ultima_gestion.usuario?.name}</p>

                    {cliente.ultima_gestion.comentario && (

                      <p className="text-gray-600 line-clamp-2">{cliente.ultima_gestion.comentario}</p>

                    )}

                  </div>

                ) : (

                  <p className="text-xs text-red-400 italic">Sin gestión registrada</p>

                )}



                {/* Acciones */}

                {renderAcciones(cliente)}

              </div>

            ))

          ) : (

            <div className="flex flex-col items-center gap-2 text-gray-400 py-12">

              <FaSearch size={24} className="opacity-30" />

              <span className="text-sm font-medium">No se encontraron clientes</span>

            </div>

          )}

        </div>
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
            <span className="text-sm text-gray-500">
              Página <span className="font-medium text-gray-900">{paginaActual}</span> de <span className="font-medium text-gray-900">{totalPaginas}</span>
            </span>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                onClick={() => { setSelectedUser(null); obtenerClientes(paginaActual - 1); }}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                onClick={() => obtenerClientes(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}</div>
      </div>

      {/* Barra de selección */}
      {seleccionados.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4
          bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700">
          <span className="text-sm font-medium">
            {seleccionados.length} cliente{seleccionados.length !== 1 ? "s" : ""} seleccionado{seleccionados.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setModalEncuesta(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" /> Enviar encuesta
          </button>
          <button
            onClick={() => setSeleccionados([])}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal seleccionar encuesta */}
      {modalEncuesta && (
        <ModalSeleccionarEncuesta
          clienteIds={seleccionados}
          onClose={() => { setModalEncuesta(false); setSeleccionados([]); }}
        />
      )}

      {/* Modales (Sin cambios) */}
      <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
        <UpdateClientes clienteId={selectedUser} onClose={() => setUserModalOpen(false)} />
      </Modal>

      <Modal isOpen={isGestionarModalOpen} onClose={() => setGestionarModalOpen(false)}>
        <GestionarClientes clienteId={selectedUser} onClose={() => setGestionarModalOpen(false)} />
      </Modal>

      <ModalClienteHistorial
        isOpen={clienteHistorial !== null}
        onClose={() => setClienteHistorial(null)}
        cliente={clienteHistorial}
        formatearFecha={formatearFecha}
      />
    </>
  );
}
