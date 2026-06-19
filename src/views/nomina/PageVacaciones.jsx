import { useState } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, Pencil, Plus } from "lucide-react";
import { useGetVacaciones } from "../../hooks/nomina/useGetVacaciones";
import { vacacionService, portalEmpleadoService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";
import ModalCrearSolicitud from "../../components/nomina/ModalCrearSolicitud";
import { SolicitudesFiltros, SolicitudesPaginacion } from "../../components/nomina/SolicitudesFiltros";
import { useFiltrosSolicitudes } from "../../hooks/nomina/useFiltrosSolicitudes";

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada:  "bg-green-100  text-green-700",
  rechazada: "bg-red-100    text-red-700",
};

function ModalGestion({ item, accion, onClose, onConfirm, loading }) {
  const [observacion, setObservacion] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {accion === "aprobar" ? "Aprobar vacaciones" : "Rechazar vacaciones"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Empleado: <span className="font-medium text-gray-700">{item?.empleado?.name ?? "—"}</span>
        </p>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Observación <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          rows={3}
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Escribe una observación..."
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(observacion)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md disabled:opacity-60 ${
              accion === "aprobar" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {accion === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalGestion.propTypes = {
  item: PropTypes.shape({ empleado: PropTypes.shape({ name: PropTypes.string }) }),
  accion: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default function PageVacaciones({ portalMode = false }) {
  const queryClient = useQueryClient();
  const filtros = useFiltrosSolicitudes();
  const [gestion, setGestion] = useState(null);
  const [crear, setCrear] = useState(false);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [loadingUuid, setLoadingUuid] = useState(null);

  // En portal: endpoint seguro del backend (siempre Auth::id())
  const portalQuery = useQuery({
    queryKey: ["vacaciones-portal"],
    queryFn: () => portalEmpleadoService.getVacaciones().then((r) => r.data),
    enabled: portalMode,
    staleTime: 1000 * 60 * 2,
  });

  const { vacaciones, isLoading: isLoadingAdmin } = useGetVacaciones(
    portalMode ? { enabled: false } : filtros.params
  );

  const isLoading = portalMode ? portalQuery.isLoading : isLoadingAdmin;
  const rawData   = portalMode ? portalQuery.data : vacaciones;
  const lista     = rawData?.data?.data ?? rawData?.data ?? [];
  const meta      = rawData?.data?.data ? rawData.data : null;

  const handleGestion = async (observacion) => {
    const { item, accion } = gestion;
    setLoadingUuid(item.uuid);
    try {
      const fn = accion === "aprobar" ? vacacionService.aprobar : vacacionService.rechazar;
      const res = await fn(item.uuid, { observacion });
      showToast("success", res.data.message || `Vacación ${accion === "aprobar" ? "aprobada" : "rechazada"}`);
      queryClient.invalidateQueries(["vacaciones"]);
    } catch {
      showToast("error", "Error al procesar la solicitud");
    } finally {
      setLoadingUuid(null);
      setGestion(null);
    }
  };

  const handleGuardar = async (form) => {
    setCreando(true);
    try {
      const payload = { ...form, dias_habiles: Number(form.dias_habiles) };
      const res = editando
        ? await vacacionService.updateVacacion(editando.uuid, payload)
        : await vacacionService.createVacacion(payload);
      showToast("success", res.data.message || (editando ? "Vacación actualizada" : "Vacación registrada"));
      queryClient.invalidateQueries({ queryKey: ["vacaciones"] });
      setCrear(false);
      setEditando(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || (editando
        ? "Error al actualizar las vacaciones"
        : "Error al registrar vacaciones"));
      throw error;
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Vacaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona las solicitudes de vacaciones del personal.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditando(null);
              setCrear(true);
            }}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Nueva
          </button>
        </div>
      </div>

      {!portalMode && (
        <SolicitudesFiltros
          filtros={filtros}
          empleados={filtros.empleados}
          sedes={filtros.sedes}
          estados={[
            { value: "pendiente", label: "Pendiente" },
            { value: "aprobada", label: "Aprobada" },
            { value: "rechazada", label: "Rechazada" },
          ]}
          total={meta?.total}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <Loader2 className="h-5 w-5 mr-2 animate-spin text-indigo-500" /> Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">No hay vacaciones registradas.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[...["Empleado","Sede","Tipo","Fecha inicio","Fecha fin","Días háb.","Motivo","Estado","Gestionado por"], ...(!portalMode ? ["Acciones"] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{item.empleado?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{item.empleado?.sede?.nombre ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-600 capitalize">{item.tipo ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{item.fecha_inicio?.slice(0, 10) ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{item.fecha_fin?.slice(0, 10) ?? "—"}</td>
                  <td className="px-4 py-3.5 text-center text-gray-700 font-medium">{item.dias_habiles ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{item.motivo ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {item.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                    {item.supervisor?.name ?? <span className="text-amber-500">Pendiente</span>}
                  </td>
                  {!portalMode && (
                    <td className="px-4 py-3.5">
                      {item.status !== "aprobada" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setCrear(false);
                              setEditando(item);
                            }}
                            disabled={!!loadingUuid}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </button>
                          {item.status === "pendiente" && (
                            <>
                              <button
                                onClick={() => setGestion({ item, accion: "aprobar" })}
                                disabled={!!loadingUuid}
                                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-40"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Aprobar
                              </button>
                              <button
                                onClick={() => setGestion({ item, accion: "rechazar" })}
                                disabled={!!loadingUuid}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!portalMode && <SolicitudesPaginacion meta={meta} page={filtros.values.page} onPage={filtros.actions.setPage} />}
      </div>

      {gestion && (
        <ModalGestion
          item={gestion.item}
          accion={gestion.accion}
          onClose={() => setGestion(null)}
          onConfirm={handleGestion}
          loading={!!loadingUuid}
        />
      )}
      {(crear || editando) && (
        <ModalCrearSolicitud
          tipo="vacaciones"
          onClose={() => {
            setCrear(false);
            setEditando(null);
          }}
          onSubmit={handleGuardar}
          loading={creando}
          defaultUserId={portalMode}
          initialData={editando ? {
            user_id: editando.user_id ?? editando.empleado?.id ?? "",
            fecha_inicio: editando.fecha_inicio?.slice(0, 10) ?? "",
            fecha_fin: editando.fecha_fin?.slice(0, 10) ?? "",
            dias_habiles: editando.dias_habiles ?? "",
            tipo: editando.tipo ?? "ordinarias",
            motivo: editando.motivo ?? "",
          } : null}
        />
      )}
    </div>
  );
}

PageVacaciones.propTypes = {
  portalMode: PropTypes.bool,
};
