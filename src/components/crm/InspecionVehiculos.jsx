import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useVehiculos } from "../../hooks/useVehiculos";
import { Link } from "react-router-dom";







export default function InspecionVehiculos() {


const {vehiculos,obtenerVehiculos}=useVehiculos();

    console.log('vehiculos', vehiculos);





  const [form, setForm] = useState({
 
    vehiculo_id: "",
    fecha: "",
    responsable: "",
    observaciones: "",
    estado_general: "",
  });
const [error, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...error, [name]: null }); // Limpiar el error del campo correspondiente
  };
    const handleSubmit = async (e) => {
        e.preventDefault();

        

        try {
            const formData = new FormData();
            formData.append("vehiculo_id", form.vehiculo_id);
            formData.append("fecha", form.fecha);
            formData.append("responsable", form.responsable);
            formData.append("observaciones", form.observaciones);
            formData.append("estado_general", form.estado_general);
            

        const token = localStorage.getItem("token");
        const response = await clienteAxios.post(
            "/api/inspecciones",
            form,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        console.log("Inspección registrada:", response.data);
        toast.success(response.data.message);
        // Limpiar el formulario después de enviar
        setForm({
            id: "",
            vehiculo_id: "",
            fecha: "",
            responsable: "",
            observaciones: "",
            estado_general: "",
        });
        } catch (error) {
        console.log("Error al registrar la inspección:", error);
                      // Manejo de errores por campo
     if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al registrar vehículo:", error);
      }
        }
    };

    useEffect(() => {
        obtenerVehiculos();
    }
    , []);

  return (<div><form 
onSubmit={handleSubmit}
  className="bg-white p-6 mx-auto space-y-4">
    <h2 className="text-2xl font-bold mb-6 text-center"> Registrar Inspeccion</h2>
    <Link
          to="/auth/crm/vehiculos"
          className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
        >
          ← Volver
        </Link>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="vehiculo_id" className="block mb-2 font-medium">
            Vehiculo
            </label>
            <select
                        name="vehiculo_id"
                        id="vehiculo_id"
                        value={form.vehiculo_id}
                        onChange={handleChange}
                        className={`border ${error.vehiculo_id ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    >  <option value="">Seleccione un vehículo</option>
                      {vehiculos.map((vehiculo)=>(
                      <option key={vehiculo.id} value={vehiculo.id}>{`${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`}</option>
                      ))}
                    </select>
            {error.vehiculo_id && (
            <p className="text-red-500 text-sm">{error.vehiculo_id}</p>
            )}
        </div>
    
        {/* <div>
            <label htmlFor="fecha" className="block mb-2 font-medium">
            Fecha
            </label>
            <input
            type="date"
            id="fecha"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className={`w-full border rounded-md p-2 ${
                error.fecha ? "border-red-500" : "border-gray-300"
            }`}
            />
            {error.fecha && <p className="text-red-500 text-sm">{error.fecha}</p>}
        </div> */}
    
        <div>
            <label htmlFor="responsable" className="block mb-2 font-medium">
            Responsable
            </label>
            <input
            type="text"
            id="responsable"
            name="responsable"
            value={form.responsable}
            onChange={handleChange}
            className={`w-full border rounded-md p-2 ${
                error.responsable ? "border-red-500" : "border-gray-300"
            }`}
            />
            {error.responsable && (
            <p className="text-red-500 text-sm">{error.responsable}</p>
            )}
        </div>
    
        <div>
            <label htmlFor="observaciones" className="block mb-2 font-medium">
            Observaciones
            </label>
            <textarea
            id="observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            className={`w-full border rounded-md p-2 ${
                error.observaciones ? "border-red-500" : "border-gray-300"
            }`}
            />
            {error.observaciones && (
            <p className="text-red-500 text-sm">{error.observaciones}</p>
            )}  

    </div>
</div>
        <div>
            <label htmlFor="estado_general" className="block mb-2 font-medium">
            Estado General
            </label>
            <select
            name="estado_general"
            id="estado_general"
            value={form.estado_general}
            onChange={handleChange}
            className={`w-full border rounded-md p-2 ${
                error.estado_general ? "border-red-500" : "border-gray-300"
            }`}
            >
            <option value="">Seleccione el estado general</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Requiere mantenimiento">Requiere Mantenimiento</option>
            <option value="No apto">No Apto</option>
            </select>
            {error.estado_general && (
            <p className="text-red-500 text-sm">{error.estado_general}</p>
            )}
        </div>
        <div className="flex justify-left">
            <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
            Registrar Inspección
            </button>
        </div>
    </form>
    </div>)
}
