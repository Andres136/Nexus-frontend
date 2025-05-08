import { useState } from "react";
import useCotizacionItems from "../../hooks/useCotizacionItems";
import { useClientes } from "../../hooks/useClientes";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function CotizacionForm() {
    const {clientesTodos }= useClientes();
  const [formData, setFormData] = useState({
    cliente_id: "",
    empresa: "setasplast",
    observaciones: "",
    user_id: 1 // Solo para pruebas
  });

  const [errores, setErrores] = useState({});
  const { rows, handleInputChange, addRow, removeRow } = useCotizacionItems({
    errores,
    onChange: (detalles) => setFormData({ ...formData, detalles })
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await clienteAxios.post("/api/cotizaciones", formData);
      toast.success("Cotización registrada correctamente");
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL}/api/cotizaciones/${data.cotizacion.id}/pdf`;
      link.setAttribute('download', `cotizacion_${formData.empresa}_${data.cotizacion.id}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrores(error.response.data.errors);
        toast.error("Revisa los errores del formulario");
      } else {
        toast.error("Error al registrar la cotización");
      }
    }
  };

return (
    <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Crear Cotización</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block font-semibold">Cliente:</label>
                <select
                    name="cliente_id"
                    onChange={handleChange}
                    className="border rounded w-full p-2"
                    value={formData.cliente_id}
                >
                    <option value="">Seleccione un cliente</option>
                    {clientesTodos.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                        </option>
                    ))}
                </select>
                {errores.cliente_id && <p className="text-red-600 text-sm">{errores.cliente_id}</p>}
            </div>

            <div>
                <label className="block font-semibold">Empresa:</label>
                <select
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="border rounded w-full p-2"
                >
                    <option value="setasplast">Setasplast</option>
                    <option value="global">Global</option>
                </select>
            </div>

            <div className="mt-6">
                <h3 className="font-bold mb-2">Detalles</h3>
                <table className="w-full border text-sm">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-2 py-1">Acciones</th>
                            <th className="px-2 py-1">Item</th>
                            <th className="px-2 py-1">Ancho cm</th>
                            <th className="px-2 py-1">Largo cm</th>
                            <th className="px-2 py-1">Calibre</th>
                            <th className="px-2 py-1">Peso Bolsa</th>
                            <th className="px-2 py-1">Número de Bolsas</th>
                            <th className="px-2 py-1">Cliente</th>
                            <th className="px-2 py-1">Cantidad Requerida (Kg)</th>
                            <th className="px-2 py-1">Descripcion</th>
                            <th className="px-2 py-1">Cantidad</th>
                            <th className="px-2 py-1">Precio Total</th>
                            <th className="px-2 py-1">Valor Unitario</th>
                            <th className="px-2 py-1">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row._uuid}>
                                <td className="px-2 py-1">
                                    <button type="button" onClick={() => removeRow(row._uuid)} className="bg-red-600 text-white px-2 py-1 rounded">🗑</button>
                                </td>
                                <td className="text-center">{row.item}</td>
                                <td><input className="border w-full" value={row.ancho_cm} onChange={(e) => handleInputChange(row._uuid, "ancho_cm", e.target.value)} /></td>
                                <td><input className="border w-full" value={row.largo_cm} onChange={(e) => handleInputChange(row._uuid, "largo_cm", e.target.value)} /></td>
                                <td><input className="border w-full" value={row.calibre} onChange={(e) => handleInputChange(row._uuid, "calibre", e.target.value)} /></td>
                                <td className="text-center">{row.peso_bolsa.toFixed(2)}</td>
                                <td className="text-center">{row.numero_bolsas}</td>
                                <td><input className="border w-full" value={row.cliente_clb} onChange={(e) => handleInputChange(row._uuid, "cliente_clb", e.target.value)} /></td>
                                <td className="text-center">{row.cantidad_requerida_kg.toFixed(2)}</td>
                                <td><input className="border w-full" value={row.descripcion} onChange={(e) => handleInputChange(row._uuid, "descripcion", e.target.value)} /></td>
                                <td><input className="border w-full" value={row.cantidad} onChange={(e) => handleInputChange(row._uuid, "cantidad", e.target.value)} /></td>
                                <td className="text-right">
                                    <input
                                        type="number"
                                        className="border w-full"
                                        value={row.precio_total}
                                        onChange={(e) => handleInputChange(row._uuid, "precio_total", e.target.value)}
                                    />
                                </td>
                                <td className="text-right text-blue-800 font-semibold">{row.valor_unitario.toFixed(2)}</td>
                                <td className="text-right font-bold">${row.valor_total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={addRow} className="mt-2 bg-blue-700 text-white px-3 py-1 rounded">+ Agregar Ítem</button>
            </div>

            <div className="mt-4">
                <label className="block font-semibold">Observaciones Generales:</label>
                <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    className="border rounded w-full p-2"
                    rows={3}
                    placeholder="Información adicional sobre la cotización"
                />
            </div>

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Guardar y Descargar PDF</button>
        </form>
    </div>
);
}
