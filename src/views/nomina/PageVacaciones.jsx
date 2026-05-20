import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useGetVacaciones } from "../../hooks/nomina/useGetVacaciones";
import { vacacionService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado:  "bg-green-100  text-green-700",
  rechazado: "bg-red-100    text-red-700",
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

export default function PageVacaciones() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [gestion, setGestion] = useState(null);
  const [loadingUuid, setLoadingUuid] = useState(null);

  const { vacaciones, isLoading } = useGetVacaciones({ search: search || undefined });
  const lista = vacaciones?.data?.data ?? vacaciones?.data ?? [];

  const handleGestion = async (observacion) => {
    const { item, accion } = gestion;
    setLoadingUuid(item.uuid);
    try {
      const fn = accion === "aprobar" ? vacacionService.aprobar : vacacionService.rechazar;
      const res = await fn(item.uuid, { observacion_gestion: observacion });
      showToast("success", res.data.message || `Vacación ${accion === "aprobar" ? "aprobada" : "rechazada"}`);
      queryClient.invalidateQueries(["vacaciones"]);
    } catch {
      showToast("error", "Error al procesar la solicitud");
    } finally {
      setLoadingUuid(null);
      setGestion(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Vacaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona las solicitudes de vacaciones del personal.</p>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empleado..."
            className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
          />
        </div>
      </div>

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
                {["Empleado","Tipo","Fecha inicio","Fecha fin","Días háb.","Motivo","Estado","Gestionado por","Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{item.empleado?.name ?? "—"}</td>
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
                  <td className="px-4 py-3.5">
                    {item.status === "pendiente" && (
                      <div className="flex items-center gap-2">
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
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    </div>
  );
}
