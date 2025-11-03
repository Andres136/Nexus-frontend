import useDetallesOrdenTrabajo from "../../hooks/useDetallesOrdenTrabajo";
import TablaDetallesOrden from "../../components/crm/TablaDetallesOrden";
import { FiRefreshCw } from "react-icons/fi";


export default function DetallesOrdenTrabajo() {
  const {
    orden,
    detalles,
    entregas,
    observaciones,
    setObservaciones,
    errores,
    loading,
    handleGuardarYGenerarPDF,
    handleChangeDetalle,
    revisados,
    handleCheckboxChange,
  
  } = useDetallesOrdenTrabajo();


  if (!orden) return  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando inventarios...</p>
          </div>
        </div>;

  return (
    <div className="p-6 bg-white rounded-xl">

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Orden de Trabajo #{orden.id}
        </h2>

  {/* Grid de datos principales */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

    {/* Cliente */}
    <div className="bg-white p-3 rounded-md border shadow-sm flex items-start gap-2">
      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">Cliente</p>
        <p className="text-sm font-semibold text-gray-900">
          {orden.cliente?.nombre || "No asignado"}
        </p>
      </div>
    </div>

    {/* Fecha de entrega */}
    <div className="bg-white p-3 rounded-md border shadow-sm flex items-start gap-2">
      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">Fecha de Entrega</p>
        <p className="text-sm font-semibold text-gray-900">
          {orden.fecha_entrega || "No disponible"}
        </p>
      </div>
    </div>

    {/* Asesor */}
    <div className="bg-white p-3 rounded-md border shadow-sm flex items-start gap-2">
      <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
        <svg
          className="w-5 h-5 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">Asesor</p>
        <p className="text-sm font-semibold text-gray-900">
          {orden.user?.name || "No asignado"}
        </p>
      </div>
    </div>

    {/* Observaciones de la OC */}
    <div className="bg-white p-3 rounded-md border shadow-sm flex items-start gap-2 md:col-span-2 lg:col-span-3">
      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
        <svg
          className="w-5 h-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m-6-8h6M5 6h14v12H5z"
          />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">Observaciones OC</p>
        <p className="text-sm font-semibold text-gray-900">
          {orden.orden_compra?.observaciones || "Sin observaciones"}
        </p>
      </div>
    </div>
  </div>
</div>

 
<div className="grid grid-cols-1 gap-4">
  <div className="col-span-1">


     <TablaDetallesOrden
        detalles={detalles}
        errores={errores}
        revisados={revisados}
        handleChangeDetalle={handleChangeDetalle}
        handleCheckboxChange={handleCheckboxChange}
        valorTotal={orden.orden_compra?.valor_total}
        entregas={entregas}
        orden={orden}
      />

      <div className="mt-4">
        <textarea
          className="w-full border px-2 py-1 rounded"
          rows={3}
          placeholder="Observaciones generales"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
        {errores.observaciones && (
          <p className="text-red-500 text-sm">{errores.observaciones}</p>
        )}
      </div>

   <button
  className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
  onClick={handleGuardarYGenerarPDF}
  disabled={loading}
>
  {loading ? "Guardando..." : " Guardar y Generar PDF"}
</button>

{/* Botón para ver/descargar PDF generado */}
{orden?.pdf_url && (
  <a
    href={orden.pdf_url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 mt-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition ml-2"
  >
    Ver PDF Generado
  </a>
)}



  </div>
  
</div>
   
    </div>
  );
}
