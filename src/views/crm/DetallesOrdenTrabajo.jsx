import useDetallesOrdenTrabajo from "../../hooks/useDetallesOrdenTrabajo";
import TablaDetallesOrden from "../../components/crm/TablaDetallesOrden";
import ApiInventario from "./ApiInventario";

export default function DetallesOrdenTrabajo() {
  const {
    orden,
    detalles,
    observaciones,
    setObservaciones,
    errores,
    loading,
    handleGuardarYGenerarPDF,
    handleChangeDetalle,
    revisados,
    handleCheckboxChange,
  } = useDetallesOrdenTrabajo();

  if (!orden) return <p>Cargando orden o no se encontró la orden.</p>;

  return (
    <div className="p-6 bg-white rounded-xl">
      <ApiInventario />
      <h2 className="text-2xl font-bold mb-4">
        Orden de Trabajo #{orden.id} - {orden.cliente?.nombre}
      </h2>
      <p className="text-gray-600 mb-2">
     Observaciones de la Orden de Compra: {orden.observaciones}
      </p>
 
<div className="grid grid-cols-1 gap-4">
  <div className="col-span-1">
     <TablaDetallesOrden
        detalles={detalles}
        errores={errores}
        revisados={revisados}
        handleChangeDetalle={handleChangeDetalle}
        handleCheckboxChange={handleCheckboxChange}
        valorTotal={orden.orden_compra?.valor_total}
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
        {loading ? "Guardando..." : "💾 Guardar y Descargar PDF"}
      </button>
  </div>
  
</div>
   
    </div>
  );
}
