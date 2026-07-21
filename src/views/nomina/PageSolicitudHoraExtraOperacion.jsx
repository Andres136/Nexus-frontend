import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import FormHoraExtraOperacion from "../../components/nomina/horasExtras/FormHoraExtraOperacion";
import { useSolicitudHorasExtrasOperacion } from "../../hooks/nomina/useSolicitudHorasExtrasOperacion";

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  aprobada: "bg-green-100 text-green-700 border-green-200",
  rechazada: "bg-red-100 text-red-700 border-red-200",
};

export default function PageSolicitudHoraExtraOperacion() {
  const {
    sedeId,
    setSedeId,
    guardando,
    crearSolicitud,
    solicitudes,
    isLoading,
    empleados,
    sedes,
    kioscos,
    loadingCatalogos,
  } = useSolicitudHorasExtrasOperacion();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Horas extras operación</p>
            <h1 className="text-2xl font-bold text-gray-900">Solicitar hora extra</h1>
            <p className="text-sm text-gray-500">Crea la solicitud y consulta el estado de tus registros recientes.</p>
          </div>
          <Link
            to="/auth/crm/ordenes-trabajo"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>

        <FormHoraExtraOperacion
          mode="page"
          open
          onClose={() => {}}
          onSubmit={crearSolicitud}
          loading={guardando}
          empleados={empleados}
          sedes={sedes}
          kioscos={kioscos}
          loadingCatalogos={loadingCatalogos}
          sedeId={sedeId}
          onSedeChange={setSedeId}
        />

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Estado de mis solicitudes</h2>
            <p className="text-sm text-gray-500">Solo se muestran tus solicitudes recientes del mes actual.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-500" /> Cargando estados...
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Todavía no tienes solicitudes registradas.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {solicitudes.map((item) => (
                <div key={item.uuid} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">{item.empleado?.name ?? "Empleado"}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[item.status] ?? "border-gray-200 bg-gray-100 text-gray-500"}`}>
                        {item.status ?? "pendiente"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.fecha?.slice(0, 10) ?? "-"} · {item.horas ?? 0}h
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {item.supervisor?.name ? `Gestionado por ${item.supervisor.name}` : "Pendiente de gestión"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
