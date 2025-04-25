
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function DetallesOrdenCompraProveedores({ onChange, errores = {} }) {
  const [detalles, setDetalles] = useState([
    { item: 1, descripcion: "", cantidad_solicitada: 0, cantidad_entregada: 0 }
  ])

  // Enviar al padre
  useEffect(() => {
    onChange(detalles)
  }, [detalles, onChange])

  const handleInputChange = (index, field, value) => {
    const nuevos = [...detalles]
    nuevos[index][field] = field === "cantidad_solicitada" ? parseFloat(value) : value
    setDetalles(nuevos)
  }

  const agregarItem = () => {
    setDetalles((prev) => [
      ...prev,
      {
        item: prev.length + 1,
        descripcion: "",
        cantidad_solicitada: 0,
        cantidad_entregada: 0
      }
    ])
  }

  const eliminarItem = (index) => {
    const nuevos = detalles.filter((_, i) => i !== index)
    // Recalcular los ítems
    const conReorden = nuevos.map((d, i) => ({ ...d, item: i + 1 }))
    setDetalles(conReorden)
  }

  return (
    <div className="mt-8">

      
      <h3 className="text-xl font-semibold mb-4">Detalles de Productos</h3>

      <table className="min-w-full text-sm border border-gray-300 bg-white rounded shadow overflow-x-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Acciones</th>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Cantidad Solicitada</th>
            
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border text-center">
                <button
                  onClick={() => eliminarItem(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </td>
              <td className="p-2 border text-center">{detalle.item}</td>
              <td className="p-2 border">
                <input
                  type="text"
                  value={detalle.descripcion}
                  onChange={(e) => handleInputChange(index, "descripcion", e.target.value)}
                  className="w-full border rounded p-1"
                />
                {errores?.[index]?.descripcion && (
                  <p className="text-red-500 text-xs">{errores[index].descripcion[0]}</p>
                )}
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={detalle.cantidad_solicitada}
                  onChange={(e) => handleInputChange(index, "cantidad_solicitada", e.target.value)}
                  className="w-full border rounded p-1"
                />
                {errores?.[index]?.cantidad_solicitada && (
                  <p className="text-red-500 text-xs">{errores[index].cantidad_solicitada[0]}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={agregarItem}
          className="bg-gray-700 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Agregar Ítem
        </button>
      </div>
    </div>
  )
}
