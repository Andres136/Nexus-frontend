import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { nominaService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function formatFecha(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

export default function PageAprobarLoteNomina() {
  const { uuid } = useParams();
  const [lote, setLote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aprobando, setAprobando] = useState(false);

  const cargarLote = () => {
    setLoading(true);
    setError("");
    nominaService.getLoteAprobacion(uuid)
      .then((response) => setLote(response.data.data))
      .catch((err) => setError(err.response?.data?.message || "No se pudo cargar el lote."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarLote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleAprobar = async () => {
    const result = await Swal.fire({
      title: "¿Aprobar y liquidar este lote?",
      html: `Se liquidará la nómina de <strong>${lote.empleados.length} empleado(s)</strong> del período ${formatFecha(lote.periodo_inicio)} a ${formatFecha(lote.periodo_fin)}. Esta acción no se puede deshacer desde aquí.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar y liquidar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4338ca",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setAprobando(true);
    try {
      const response = await nominaService.aprobarLoteAprobacion(uuid);
      showToast("success", response.data.message || "Lote aprobado.");
      cargarLote();
    } catch (err) {
      showToast("error", err.response?.data?.message || "No se pudo aprobar el lote.");
    } finally {
      setAprobando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        Cargando lote...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-600 px-4">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-3" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const yaProcesado = lote.estado !== "pendiente";

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-800">Aprobación de nómina</h1>
        <p className="text-sm text-gray-500 mt-1">
          Período {formatFecha(lote.periodo_inicio)} a {formatFecha(lote.periodo_fin)} · Generado por{" "}
          {lote.generado_por?.name ?? "—"} · Responsable: {lote.responsable?.name ?? "—"}
        </p>
      </div>

      {lote.estado === "aprobado" && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Este lote ya fue aprobado y liquidado ({lote.resultado?.liquidados?.length ?? 0} nóminas).
        </div>
      )}

      {lote.estado === "error_parcial" && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-semibold">Este lote ya se procesó, con algunos errores:</p>
          {(lote.resultado?.errores ?? []).map((e) => (
            <p key={e.empleado} className="mt-1 text-xs">{e.empleado}: {e.message}</p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Empleados ({lote.empleados.length})</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[480px] divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deducciones</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lote.empleados.map((e) => (
                <tr key={e.preliquidacion_uuid}>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{e.empleado}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{formatCOP(e.total_devengado)}</td>
                  <td className="px-4 py-2.5 text-right text-orange-600">{formatCOP(e.total_deducciones)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-green-700">{formatCOP(e.salario_neto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!yaProcesado && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAprobar}
            disabled={aprobando}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {aprobando ? "Aprobando y liquidando..." : "Aprobar y liquidar"}
          </button>
        </div>
      )}
    </div>
  );
}
