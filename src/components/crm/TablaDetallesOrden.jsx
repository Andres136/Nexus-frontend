// components/TablaDetallesOrden.jsx
import { useMemo } from "react";
import { formatCurrency } from "../../helpers";

export default function TablaDetallesOrden({
  detalles,
  entregas,
  errores,
  revisados,
  handleChangeDetalle,
  handleCheckboxChange,
  valorTotal = 0,
}) 


{
//Normalizar Entregas

  return (                                          
    <div className="overflow-x-auto">
 <table className="min-w-max w-full border border-gray-300 rounded-lg mt-2">

        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            {["Item", "Ancho cm", "Largo cm", "Calibre", "Cliente Clb", "Peso Bolsa", "# Bolsas",
              "Cant. Req. (Kg)", "Descripción", "Cantidad", "Cant. Enviada", "Faltantes", "Entregas",
              "Valor Unit.", "Valor Total", "Revisado"].map((head) => (
                <th key={head} className="px-4 py-2 text-left whitespace-nowrap">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(detalles || []).map((detalle, index) => (
            <tr key={detalle.id ?? `new-${index}`} className="border-t border-gray-300">
              <td className="px-4 py-2">{detalle.observaciones}</td>
              <td className="px-4 py-2">
                <input type="number" className="border rounded px-1 w-20"
                  value={parseInt(detalle.ancho_cm) || ""}
                  onChange={(e) => handleChangeDetalle(index, "ancho_cm", e.target.value)} />
              </td>
              <td className="px-4 py-2">
                <input type="number" className="border rounded px-1 w-20"
                  value={parseInt(detalle.largo_cm) || ""}
                  onChange={(e) => handleChangeDetalle(index, "largo_cm", e.target.value)} />
              </td>
              <td className="px-4 py-2">
                <input type="number" className="border rounded px-1 w-20"
                  value={detalle.calibre}
                  onChange={(e) => handleChangeDetalle(index, "calibre", e.target.value)} />
              </td>
              <td className="px-4 py-2">{detalle.cliente_clb}</td>
              <td className="px-4 py-2 text-center">{detalle.peso_bolsa || 0}</td>
              <td className="px-4 py-2 text-center">{detalle.numero_bolsas || 0}</td>
              <td className="px-4 py-2 text-center">{detalle.cantidad_requerida_kg?.toFixed(2) || 0}</td>
              <td className="px-4 py-2">{detalle.descripcion}</td>
              <td className="px-4 py-2">
                <input type="number" className="border rounded px-1 w-20"
                  value={detalle.cantidad}
                  onChange={(e) => handleChangeDetalle(index, "cantidad", e.target.value)} />
              </td>
              <td className="px-4 py-2">
                <input type="number" className="border rounded px-1 w-20"
                  value={detalle.cantidadEnviada}
                  onChange={(e) => handleChangeDetalle(index, "cantidadEnviada", e.target.value)} />
              </td>
              <td className="px-4 py-2 text-center">
                {detalle.faltantesTemporal !== undefined
                  ? detalle.faltantesTemporal
                  : detalle.faltantes}
              </td>
       <td className="px-4 py-2 align-top text-xs text-gray-700">
  {(() => {
    const entregasDetalle = entregas.filter(e => e.detalle_id === detalle.id);

    if (entregasDetalle.length === 0) {
      return (
        <div className="text-gray-400 italic text-center py-2">
          No hay entregas
        </div>
      );
    }

    return entregasDetalle.map((e) => (
      <div
        key={e.id}
        className="flex items-center justify-between gap-2 border-b border-gray-200 py-1"
      >
        <span>{e.cantidad} u.</span>
        <span className="text-gray-500">{e.usuario?.name}</span>
        <span className="text-[10px] text-gray-400">
          {new Date(e.fecha_entrega).toLocaleDateString("es-CO")}
        </span>
      </div>
    ));
  })()}
</td>



              <td className="px-4 py-2 text-right">{formatCurrency(detalle.valor_unitario)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(detalle.valor_total)}</td>
              <td className="px-4 py-2 text-center">
                <input type="checkbox"
                  checked={revisados[detalle.id] || false}
                  onChange={() => handleCheckboxChange(detalle.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <div className="flex items-center">
          <span className="font-semibold">Valor Total:</span>
          <div className="ml-2 text-lg font-bold">{formatCurrency(valorTotal)}</div>
        </div>
      </div>
    </div>
  );
}
