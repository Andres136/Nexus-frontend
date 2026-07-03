import { Calendar, Plus, Search } from "lucide-react";
import { useHorasExtrasOperacion } from "../../../hooks/nomina/useHorasExtrasOperacion";
import FormHoraExtraOperacion from "./FormHoraExtraOperacion";
import ModalGestionHoraExtra from "./ModalGestionHoraExtra";
import TablaHorasExtrasOperacion from "./TablaHorasExtrasOperacion";

export default function HorasExtrasOperacionView() {
  const {
    lista,
    meta,
    filtros,
    empleados,
    sedes,
    kioscos,
    isLoading,
    loadingCatalogos,
    crear,
    setCrear,
    creando,
    handleCrear,
    gestion,
    setGestion,
    loadingUuid,
    handleGestion,
  } = useHorasExtrasOperacion();

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Horas Extras Operación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registra, filtra y autoriza horas extra por sede, kiosko y empleado.</p>
        </div>
        <button onClick={() => setCrear(true)} className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Nueva
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtros.search}
            onChange={(event) => filtros.setSearch(event.target.value)}
            placeholder="Buscar empleado, solicitante o kiosko..."
            className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-72"
          />
        </div>

        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 h-9 bg-white">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(event) => filtros.setFechaDesde(event.target.value)}
            className="text-sm text-gray-700 bg-transparent border-none outline-none"
          />
        </div>

        <span className="text-gray-400 text-sm">→</span>

        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 h-9 bg-white">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(event) => filtros.setFechaHasta(event.target.value)}
            className="text-sm text-gray-700 bg-transparent border-none outline-none"
          />
        </div>

        <select
          value={filtros.userId}
          onChange={(event) => filtros.setUserId(event.target.value)}
          className="h-9 max-w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los empleados</option>
          {empleados.map((empleado) => (
            <option key={empleado.value} value={empleado.value}>{empleado.label}</option>
          ))}
        </select>

        <select
          value={filtros.sedeId}
          onChange={(event) => filtros.setSedeId(event.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todas las sedes</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>{sede.nombre ?? sede.name}</option>
          ))}
        </select>

        <select
          value={filtros.kioskoDeviceId}
          onChange={(event) => filtros.setKioskoDeviceId(event.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los kioskos</option>
          {kioscos.map((kiosko) => (
            <option key={kiosko.id} value={kiosko.id}>{kiosko.name ?? kiosko.code}</option>
          ))}
        </select>

        <select
          value={filtros.status}
          onChange={(event) => filtros.setStatus(event.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>

        {meta?.total != null && (
          <span className="text-xs text-gray-400 ml-1">{meta.total} registros</span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <TablaHorasExtrasOperacion
          lista={lista}
          isLoading={isLoading}
          loadingUuid={loadingUuid}
          onGestion={setGestion}
        />
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={() => filtros.setPage(Math.max(1, filtros.page - 1))}
            disabled={filtros.page <= 1}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500">Página {meta.current_page} de {meta.last_page}</span>
          <button
            onClick={() => filtros.setPage(Math.min(meta.last_page, filtros.page + 1))}
            disabled={filtros.page >= meta.last_page}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      <FormHoraExtraOperacion
        open={crear}
        onClose={() => setCrear(false)}
        onSubmit={handleCrear}
        loading={creando}
        empleados={empleados}
        sedes={sedes}
        kioscos={kioscos}
        loadingCatalogos={loadingCatalogos}
        sedeId={filtros.sedeId}
        onSedeChange={filtros.setSedeId}
      />

      {gestion && (
        <ModalGestionHoraExtra
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
