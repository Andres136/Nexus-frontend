import { useState } from "react"
import { toast } from "react-toastify"
import clienteAxios from "../../config/axios"


export default function ModalRegistroProcesoBolsa() {
  const [isOpen, setIsOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [errores, setErrores] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    try {
      const response = await clienteAxios.post(
        "/api/registrar-proceso-bolsa",
        { nombre },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success(response.data.message)
      setNombre("")
      setIsOpen(false)
    } catch (error) {
         if (error.response?.status === 422) {
      setErrores(error.response.data.errors || {})
    } else {
      toast.error("Error al registrar el proceso")
    }

    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Registrar Proceso
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Registrar Proceso de Bolsas</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del proceso"
                className="border p-2 rounded w-full col-span-1 md:col-span-1"
           
              />
            <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full md:w-auto"
              >
                Guardar
              </button>            {errores.nombre && (
  <p className="text-red-500 text-sm col-span-2">{errores.nombre[0]}</p>
)}
    
            </form>
          </div>
        </div>
      )}
    </>
  )
}
