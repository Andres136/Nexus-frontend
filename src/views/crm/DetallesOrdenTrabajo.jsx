import useDetallesOrdenTrabajo from "../../hooks/useDetallesOrdenTrabajo";
import TablaDetallesOrden from "../../components/crm/TablaDetallesOrden";
import { FiRefreshCw } from "react-icons/fi";

import { mutate } from "swr";
import { toast } from "react-toastify";
import { auditApi } from "../../services/api";



export default function DetallesOrdenTrabajo() {
  const {
    orden,
    detalles,
    entregas,
    observaciones,
    setObservaciones,
    errores,
    loading,
    carteraInfo,
    handleGuardarYGenerarPDF,
    handleChangeDetalle,
    revisados,
    handleCheckboxChange,
    refetchOrden,
  } = useDetallesOrdenTrabajo();




  if (!orden) return  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando inventarios...</p>
          </div>
        </div>;

        const documentoRevisado = Boolean(orden.documento_revisado_at);
        const tieneDocumentoCliente = Boolean(orden.orden_compra?.cliente_documento);
        const puedeGenerarPDF = !tieneDocumentoCliente || documentoRevisado;
        const tieneCarteraVencida = Boolean(carteraInfo?.tiene_vencida);
        const tieneCarteraProxima = Boolean(carteraInfo?.tiene_proxima);




  return (
    <div className="p-6 bg-white rounded-xl">

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
  {/* Título + metadata */}
<div className="flex flex-col gap-1">
  <h2 className="text-2xl font-bold text-gray-900">
    Orden de Trabajo #{orden.id}
  </h2>

  <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
    <span>
      Generada por{" "}
      <span className="font-medium text-gray-700">
        {orden.user?.name || "Desconocido"}
      </span>
    </span>

    <span className="text-gray-300">•</span>

    {orden.orden_compra?.documento_revisado_at ? (
      <span className="flex items-center gap-1 text-green-600 font-medium">
        Reviso OC{" "}
        {new Date(
          orden.orden_compra.documento_revisado_at
        ).toLocaleDateString()}
      </span>
    ) : (
      <span className="italic text-gray-400">
        Sin revisión
      </span>
    )}
  </div>
</div>


  {/* Acción */}

<div className="flex flex-col gap-2">

  {/* Acción principal */}
  {tieneDocumentoCliente && (
    <button
      onClick={async () => {
        window.open(
          `${import.meta.env.VITE_API_URL}/api/orden-compras/${orden.orden_compra_id}/preview-documento`,
          "_blank",
          "noopener,noreferrer"
        );

        await auditApi.postRevisadaOc(orden.id);
        toast.success("Documento revisado");
        await refetchOrden();
      }}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium w-fit"
    >
      Revisar orden de compra del cliente
    </button>
  )}

  {/* Estado de revisión */}
  {orden?.usuario_revisor ? (
    <div className="flex flex-col">
   

      <span className="text-xs text-gray-500 leading-tight">
        Revisado por <span className="font-medium">{orden.usuario_revisor.name}</span>
        {" · "}
        {new Date(orden.documento_revisado_at).toLocaleDateString()}
      </span>
    </div>
  ) : (
    <span className="text-xs text-gray-400 italic">
      Documento sin revisión
    </span>
  )}

</div>


</div>


  {/* Grid de datos principales */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

    {/* Cliente */}
    <div className="bg-white p-3 rounded-md border shadow-sm flex items-start gap-2">
      <div
        className={`w-8 h-8 rounded flex items-center justify-center ${
          tieneCarteraVencida ? "bg-red-100" : "bg-blue-100"
        }`}
      >
        <svg
          className={`w-5 h-5 ${tieneCarteraVencida ? "text-red-600" : "text-blue-600"}`}
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
          {orden.orden_compra?.cliente?.nombre || "No asignado"}
        </p>
        {tieneCarteraVencida && (
          <p className="mt-1 text-xs font-medium text-red-600">
            ⚠️ Cartera vencida — se recomienda revisarla antes de continuar
          </p>
        )}
        {!tieneCarteraVencida && tieneCarteraProxima && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Cartera próxima a vencer
          </p>
        )}
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

{!tieneDocumentoCliente && !documentoRevisado && (
  <p className="text-sm text-orange-600 mb-2">
    ⚠️ Debes revisar la orden de compra antes de continuar.
  </p>
)}

   <button
  className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
  
  onClick={handleGuardarYGenerarPDF}
  disabled={loading || !puedeGenerarPDF}
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
