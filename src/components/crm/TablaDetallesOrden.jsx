// components/TablaDetallesOrden.jsx
import { formatCurrency } from "../../helpers";

export default function TablaDetallesOrden({
  detalles,
  errores,
  revisados,
  handleChangeDetalle,
  handleCheckboxChange,
  valorTotal = 0,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg mt-2 min-w-full">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            {["Item", "Ancho cm", "Largo cm", "Calibre", "Cliente Clb", "Peso Bolsa", "# Bolsas",
              "Cant. Req. (Kg)", "Descripción", "Cantidad", "Cant. Enviada", "Faltantes",
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
