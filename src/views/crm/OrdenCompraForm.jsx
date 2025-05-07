import { useCallback,  useState } from "react";
import OrdenCompraMultiItem from "../../components/crm/OrdenCompraMultiItem";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useClientes } from "../../hooks/useClientes";




export default function OrdenCompraForm() {

 const [errores, setErrores] = useState({});


 const [erroresDetalles, setErroresDetalles] = useState({

 });
 const { clientesTodos,setBusqueda,busqueda, } = useClientes();  







  const [formData, setFormData] = useState({
    fecha_entrega: "",
    cliente_id: "",
    ubicacion_entrega: "",
    observaciones: "",
    detalles: [],
 
  });

  // Función para actualizar los datos del formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 
  // Función para actualizar los detalles desde `OrdenCompraMultiItem`


const handleDetallesChange = useCallback((detallesActualizados) => {
  setFormData((prevData) => ({
    ...prevData,
    detalles: detallesActualizados,
  }));
}, []);

 
  
  // Función para enviar la orden al backend
  const enviarOrden = async () => {
    setErrores({});
    setErroresDetalles({});


    console.log("Enviando orden:", formData);
    try {
        const token = localStorage.getItem("token");

        const response = await clienteAxios.post("/api/orden-compras", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Respuesta del servidor:", response.data.message);
        toast.success(response.data.message);

 const ordenId = response.data.orden_compra_id;
 // Asegúrate de que Laravel retorne el ID
const link = document.createElement('a');
link.href = `${import.meta.env.VITE_API_URL}/api/orden-compras/${ordenId}/pdf`;
link.setAttribute('download', `orden_compra_${ordenId}.pdf`);
document.body.appendChild(link);
link.click();
link.remove();


        // Limpiar el formulario después de un envío exitoso
        setFormData({
            fecha_entrega: "",
            cliente_id: "",
            ubicacion_entrega: "",
            observaciones: "",
            detalles: [],
      
        });

        setErrores({});
        setErroresDetalles({});
      

    } catch (error) {
        console.log("Error al enviar la orden:", error);

        if (error.response && error.response.data.errors) {
            const backendErrors = error.response.data.errors;
            const erroresDetalles = {};
            const erroresGenerales = {};

            Object.keys(backendErrors).forEach((key) => {
                const mensajeError = backendErrors[key][0]; // Extraer el primer mensaje de error

                if (key.startsWith("detalles.")) {
                    // Extraer el índice del array y el nombre del campo
                    const [, index, field] = key.split(".");
                    if (!erroresDetalles[index]) {
                        erroresDetalles[index] = {};
                    }
                    erroresDetalles[index][field] = mensajeError;
                } else {
                    erroresGenerales[key] = mensajeError; // Errores generales
                }
            });

            // ✅ Actualizar los estados con los errores correctos
            setErrores(erroresGenerales);
            setErroresDetalles(erroresDetalles);
          

            console.log("Errores generales:", erroresGenerales);
            console.log("Errores en detalles:", erroresDetalles);
        
        } else {
            toast.error("Ocurrió un error al enviar la orden. Inténtalo de nuevo.");
        }
    }
};
//filtar los clientes en tiempo real



  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Crear Orden de Compra</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha de Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-2 py-1 rounded"
            />
            {errores.fecha_entrega && (
              <span className="text-sm text-red-500">{errores.fecha_entrega}</span>
            )}
          </div>

          <div className="p-5">
            {/* Input para búsqueda */}
            <input
                type="text"
                placeholder="Buscar Clientes"
                value={busqueda}
                onChange={(e) => {setBusqueda(e.target.value)
                console.log('busqueda',busqueda);
                }}
                className="border p-2 w-full mb-2 rounded"
            />

            {/* Select con clientes obtenidos de la API */}
            <select
                className="w-full border border-gray-300 px-3 py-1 rounded"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleInputChange}
            >
                <option value="">Seleccionar Cliente</option>
                {clientesTodos.length > 0 ? (
                    clientesTodos.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>No se encontraron clientes</option>
                )}
            </select>
        {errores.cliente_id && (
            <span className="text-sm text-red-500">{errores.cliente_id}</span>
        )}
        </div>

           

          

          {/* Ubicación de Entrega */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Ubicación de Entrega
          </label>
          <input
            type="text"
            name="ubicacion_entrega"
            placeholder="Dirección de entrega y un numero de contacto"
            value={formData.ubicacion_entrega}
            onChange={handleInputChange}
            className="w-full border border-gray-300 px-2 py-1 rounded"
          />
          {errores.ubicacion_entrega && (
            <span className="text-sm text-red-500">{errores.ubicacion_entrega}</span>
          )}
        </div>

        {/* Observaciones */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            placeholder="Información adicional sobre la orden"
            onChange={handleInputChange}
            className="w-full border border-gray-300 px-2 py-1 rounded"
          />
          {errores.observaciones && (
            <span className="text-sm text-red-500">{errores.observaciones}</span>
          )}
        </div>
         <div className="col-span-2">
               <OrdenCompraMultiItem onDetallesChange={handleDetallesChange}
        errores={erroresDetalles} />
         </div>
   
      </div>   
      
      <div>  

 
     

</div>

   
      {/* Botón para enviar la orden */}
      <div className="flex justify-end mt-4">
        <button
          onClick={enviarOrden}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Guardar Orden
        </button>
      </div>
    </div>
  );
}
