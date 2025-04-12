import { useEffect, useState } from "react"
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useVehiculos } from "../../hooks/useVehiculos";
import { Link } from "react-router-dom";

export default function MantenimientosVehiculos() {
const {  vehiculos,obtenerVehiculos} = useVehiculos();





    const [form, setForm] = useState({
        vehiculo_id: "",
        fecha_programada: "",
        fecha_realizado: "",
        taller: "",
        descripcion_trabajo: "",
        costo: "",
        kilometro_programado: "",
        tipo_mantenimiento: "",
        archivo: "",

    })
    const [error, setErrors] = useState({})


    const handleChange = (e) => {
      const { name, value, type, files } = e.target;
    

      if (type === "file") {
        setForm({ ...form, [name]: files[0] });
      } else {
        setForm({ ...form, [name]: value });
      }
      setErrors({ ...error, [name]: null }); // Limpiar el error del campo correspondiente  
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("vehiculo_id", form.vehiculo_id);
            formData.append("fecha_programada", form.fecha_programada);
            formData.append("fecha_realizado", form.fecha_realizado);
            formData.append("taller", form.taller);
            formData.append("descripcion_trabajo", form.descripcion_trabajo);
            formData.append("costo", form.costo);
            formData.append("kilometro_programado", form.kilometro_programado);
            formData.append("tipo_mantenimiento", form.tipo_mantenimiento);
            if (form.archivo) {
                formData.append("archivo", form.archivo);
            }

            const token = localStorage.getItem("token");
            const response = await clienteAxios.post(
                "/api/mantenimientos",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Mantenimiento registrado:", response.data);
            toast.success(response.data.message);
            // Limpiar el formulario después de enviar
            setForm({
                vehiculo_id: "",
                fecha_programada: "",
                fecha_realizado: "",
                taller: "",
                descripcion_trabajo: "",
                costo: "",
                kilometro_programado: "",
                tipo_mantenimiento: "",
                archivo: "",
            });
        } catch (error) {
            console.error("Error al registrar el mantenimiento:", error);
                 // Manejo de errores por campo
     if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al registrar vehículo:", error);
      }
        }
    }
useEffect(() => {
    obtenerVehiculos();
},[])

  return (
    <div>
        <form className="bg-white p-6 mx-auto space-y-4" >
<h2 className="text-2xl font-bold mb-6 text-center">Mantenimiento de Vehiculos</h2>
<Link
          to="/auth/crm/vehiculos"
          className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
        >
          ← Volver
        </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="vehiculo_id" className="block mb-2 text-sm font-medium text-gray-700"> Vehículo</label>
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
                   
                    {error.vehiculo_id && <p className="text-red-500 text-sm">{error.vehiculo_id}</p>}
                </div>
                <div>
                    <label htmlFor="fecha_programada" className="block mb-2 text-sm font-medium text-gray-700">Fecha Programada</label>
                    <input
                        type="date"
                        name="fecha_programada"
                        id="fecha_programada"
                        value={form.fecha_programada}
                        onChange={handleChange}
                        className={`border ${error.fecha_programada ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.fecha_programada && <p className="text-red-500 text-sm">{error.fecha_programada}</p>}
                </div>
                <div>
                    <label htmlFor="fecha_realizado" className="block mb-2 text-sm font-medium text-gray-700">Fecha Realizado</label>
                    <input
                        type="date"
                        name="fecha_realizado"
                        id="fecha_realizado"
                        value={form.fecha_realizado}
                        onChange={handleChange}
                        className={`border ${error.fecha_realizado ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.fecha_realizado && <p className="text-red-500 text-sm">{error.fecha_realizado}</p>}
                </div>
                <div>
                    <label htmlFor="taller" className="block mb-2 text-sm font-medium text-gray-700">Taller</label>
                    <input
                        type="text"
                        name="taller"
                        id="taller"
                        value={form.taller}
                        onChange={handleChange}
                        className={`border ${error.taller ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.taller && <p className="text-red-500 text-sm">{error.taller}</p>}
                </div>

                <div>
                    <label htmlFor="descripcion_trabajo" className="block mb-2 text-sm font-medium text-gray-700">Descripción del Trabajo</label>
                    <textarea
                        name="descripcion_trabajo"
                        id="descripcion_trabajo"
                        value={form.descripcion_trabajo}
                        onChange={handleChange}
                        className={`border ${error.descripcion_trabajo ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.descripcion_trabajo && <p className="text-red-500 text-sm">{error.descripcion_trabajo}</p>}
                </div>
                <div>
                    <label htmlFor="costo" className="block mb-2 text-sm font-medium text-gray-700">Costo</label>
                    <input
                        type="number"
                        name="costo"
                        id="costo"
                        value={form.costo}
                        onChange={handleChange}
                        className={`border ${error.costo ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.costo && <p className="text-red-500 text-sm">{error.costo}</p>}
                </div>
                <div>
                    <label htmlFor="kilometro_programado" className="block mb-2 text-sm font-medium text-gray-700">Kilometraje Programado</label>
                    <input
                        type="number"
                        name="kilometro_programado"
                        id="kilometro_programado"
                        value={form.kilometro_programado}
                        onChange={handleChange}
                        className={`border ${error.kilometro_programado ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.kilometro_programado && <p className="text-red-500 text-sm">{error.kilometro_programado}</p>}
                </div>
                <div>
                    <label htmlFor="tipo_mantenimiento" className="block mb-2 text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
                    <select
                        name="tipo_mantenimiento"
                        id="tipo_mantenimiento"
                        value={form.tipo_mantenimiento}
                        onChange={handleChange}
                        className={`border ${error.tipo_mantenimiento ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    >
                        <option value="">Seleccione un tipo de mantenimiento</option>
                        <option value="Preventivo">Preventivo</option>
                        <option value="Correctivo">Correctivo</option>
                        </select>
                    {error.tipo_mantenimiento && <p className="text-red-500 text-sm">{error.tipo_mantenimiento}</p>}
                </div>
                <div>
                    <label htmlFor="archivo" className="block mb-2 text-sm font-medium text-gray-700">Archivo</label>
                    <input
                        type="file"
                        name="archivo"
                        id="archivo"
                        onChange={handleChange}
                        className={`border ${error.archivo ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                    />
                    {error.archivo && <p className="text-red-500 text-sm">{error.archivo}</p>}
                </div>
            </div>
            <div className="flex justify-left mt-6">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-gray-800 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                >
                    Registrar Mantenimiento
                </button>
            </div>
        </form>
    </div>
  )
}
