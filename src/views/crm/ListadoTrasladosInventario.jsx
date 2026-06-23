import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useEmpresas } from "../../hooks/useEmpresas";
import { inventariosApi } from "../../services/api";

const filtrosIniciales = {
  search: "",
  fecha_inicio: "",
  fecha_fin: "",
  sede_origen_id: "",
  sede_destino_id: "",
  empresa_id: "",
  page: 1,
  per_page: 15,
};

const fechaInput = (fecha) => (fecha ? String(fecha).slice(0, 10) : "");

export default function ListadoTrasladosInventario() {
  const [traslados, setTraslados] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [paginacion, setPaginacion] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const { empresas } = useEmpresas();

  const cargarTraslados = useCallback(async () => {
    setLoading(true);

    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, value]) => value !== "")
      );
      const response = await inventariosApi.listarTraslados(params);
      const data = response.data;

      setTraslados(data.data || []);
      setPaginacion({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
        from: data.from || 0,
        to: data.to || 0,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "No se pudieron cargar los traslados."
      );
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    inventariosApi
      .sedesTraslados()
      .then((response) => setSedes(response.data || []))
      .catch(() => toast.error("No se pudieron cargar las sedes."));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(cargarTraslados, 300);
    return () => clearTimeout(timeout);
  }, [cargarTraslados]);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((actuales) => ({
      ...actuales,
      [campo]: valor,
      page: campo === "page" ? valor : 1,
    }));
  };

  const limpiarFiltros = () => setFiltros(filtrosIniciales);

  const abrirEdicion = (traslado) => {
    setErrores({});
    setEditando({
      ...traslado,
      fecha_envio: fechaInput(traslado.fecha_envio),
      sede_destino_id: String(traslado.sede_destino_id || ""),
      empresa_id: String(traslado.empresa_id || ""),
      notas: traslado.notas || "",
    });
  };

  const guardarEdicion = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setErrores({});

    try {
      await inventariosApi.actualizarTraslado(editando.id, {
        fecha_envio: editando.fecha_envio,
        sede_destino_id: editando.sede_destino_id,
        empresa_id: editando.empresa_id,
        notas: editando.notas,
      });

      toast.success("Traslado actualizado correctamente.");
      setEditando(null);
      cargarTraslados();
    } catch (error) {
      setErrores(error.response?.data?.errors || {});
      toast.error(
        error.response?.data?.message || "No se pudo actualizar el traslado."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Traslados internos
            </h1>
            <p className="text-sm text-gray-600">
              Consulta y edita los traslados realizados entre sedes.
            </p>
          </div>
        </div>

        <Link
          to="/auth/crm/traslado-inventario"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Crear traslado
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filtros
          </h2>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Buscar</span>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                value={filtros.search}
                onChange={(event) => cambiarFiltro("search", event.target.value)}
                placeholder="ID, orden, producto..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Desde</span>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(event) =>
                cambiarFiltro("fecha_inicio", event.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Hasta</span>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(event) =>
                cambiarFiltro("fecha_fin", event.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Sede origen
            </span>
            <select
              value={filtros.sede_origen_id}
              onChange={(event) =>
                cambiarFiltro("sede_origen_id", event.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="">Todas</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Sede destino
            </span>
            <select
              value={filtros.sede_destino_id}
              onChange={(event) =>
                cambiarFiltro("sede_destino_id", event.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="">Todas</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Empresa</span>
            <select
              value={filtros.empresa_id}
              onChange={(event) =>
                cambiarFiltro("empresa_id", event.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="">Todas</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {paginacion.total} traslado(s)
          </span>
          <button
            type="button"
            onClick={cargarTraslados}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Traslado",
                  "Fecha",
                  "Origen",
                  "Destino",
                  "Empresa",
                  "Productos",
                  "Cantidad",
                  "Acciones",
                ].map((titulo) => (
                  <th
                    key={titulo}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    Cargando traslados...
                  </td>
                </tr>
              ) : traslados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    No hay traslados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                traslados.map((traslado) => (
                  <tr key={traslado.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        #{traslado.id}
                      </p>
                      <p
                        className="text-xs text-gray-500 max-w-48 truncate"
                        title={traslado.notas || ""}
                      >
                        {traslado.notas || "Sin observaciones"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {fechaInput(traslado.fecha_envio)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {traslado.sede_origen?.nombre || "Sin sede"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {traslado.sede_destino?.nombre || "Sin sede"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {traslado.empresa?.nombre || "Sin empresa"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {traslado.detalles_count}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {Number(traslado.cantidad_total || 0).toLocaleString(
                        "es-CO",
                        { maximumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => abrirEdicion(traslado)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-600">
            Mostrando {paginacion.from || 0}–{paginacion.to || 0} de{" "}
            {paginacion.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={paginacion.current_page <= 1 || loading}
              onClick={() =>
                cambiarFiltro("page", paginacion.current_page - 1)
              }
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Página {paginacion.current_page} de {paginacion.last_page}
            </span>
            <button
              type="button"
              disabled={
                paginacion.current_page >= paginacion.last_page || loading
              }
              onClick={() =>
                cambiarFiltro("page", paginacion.current_page + 1)
              }
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={guardarEdicion}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Editar traslado #{editando.id}
                </h2>
                <p className="text-sm text-gray-500">
                  Los productos y cantidades se conservan por trazabilidad.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Fecha
                </span>
                <input
                  type="date"
                  required
                  value={editando.fecha_envio}
                  onChange={(event) =>
                    setEditando({
                      ...editando,
                      fecha_envio: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
                {errores.fecha_envio && (
                  <p className="text-xs text-red-600">
                    {errores.fecha_envio[0]}
                  </p>
                )}
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  Sede destino
                </span>
                <select
                  required
                  value={editando.sede_destino_id}
                  onChange={(event) =>
                    setEditando({
                      ...editando,
                      sede_destino_id: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  {sedes
                    .filter(
                      (sede) =>
                        String(sede.id) !== String(editando.sede_origen_id)
                    )
                    .map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                </select>
                {errores.sede_destino_id && (
                  <p className="text-xs text-red-600">
                    {errores.sede_destino_id[0]}
                  </p>
                )}
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Empresa
                </span>
                <select
                  required
                  value={editando.empresa_id}
                  onChange={(event) =>
                    setEditando({
                      ...editando,
                      empresa_id: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
                {errores.empresa_id && (
                  <p className="text-xs text-red-600">{errores.empresa_id[0]}</p>
                )}
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Observaciones
                </span>
                <textarea
                  rows="3"
                  maxLength="500"
                  value={editando.notas}
                  onChange={(event) =>
                    setEditando({ ...editando, notas: event.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg resize-none"
                />
                {errores.notas && (
                  <p className="text-xs text-red-600">{errores.notas[0]}</p>
                )}
              </label>

              <div className="sm:col-span-2 bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Detalles registrados
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {(editando.detalles || []).map((detalle) => (
                    <div
                      key={detalle.id}
                      className="flex justify-between gap-3 text-sm border-b border-gray-200 pb-2"
                    >
                      <span className="text-gray-700">
                        {detalle.product?.code || detalle.code_id} —{" "}
                        {detalle.product?.name || detalle.descripcion}
                      </span>
                      <span className="font-medium text-gray-900">
                        {detalle.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
