import { useAbonoCartera } from "../../hooks/crm/useAbonoCartera"

export default function ModalAbonoCartera({ cartera, onClose }) {

  const { formData, handleChange, handleSubmit, errors } =
    useAbonoCartera(cartera?.id)
console.log("Cartera en Modal:", cartera)
  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-[400px]">

        <h2 className="text-xl font-semibold mb-4">
          Abonar a factura #{cartera.numero_factura}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Valor del Abono</label>
            <input
              type="number"
              name="valor_pago"
              value={formData.valor_pago}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.valor_pago && (
              <p className="text-red-500 text-sm mt-1">{errors.valor_pago[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Fecha del Abono</label>
            <input
              type="date"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.fecha_pago && (
              <p className="text-red-500 text-sm mt-1">{errors.fecha_pago[0]}</p>
            )}
          </div>

         

          <div className="flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Registrar Abono
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}