import { useState } from "react"
import clienteAxios from "../../config/axios"
import { toast } from "react-toastify"
import { useVehiculos } from "../../hooks/useVehiculos"
import { useEffect } from "react"
import { Link } from "react-router-dom"

export default function DocumentosVehiculos() {
    const {vehiculos,obtenerVehiculos}=useVehiculos();
    console.log('vehiculos', vehiculos);
    const [form, setForm] = useState({
        vehiculo_id: "",
        tipo_documento: "",
        fecha_vencimiento: "",
        fecha_renovacion: "",
        documento_pdf: "",
        estado: "",
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
        formData.append("tipo_documento", form.tipo_documento);
        formData.append("fecha_vencimiento", form.fecha_vencimiento);
        formData.append("fecha_renovacion", form.fecha_renovacion);
        formData.append("documento_pdf", form.documento_pdf);
        formData.append("estado", form.estado);

        const token = localStorage.getItem("token");
        const response = await clienteAxios.post(
            "/api/documentos-vehiculos",
            form,
            {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
            }
        );
        console.log("Documento registrado:", response.data);
        toast.success(response.data.message);
        // Limpiar el formulario después de enviar
        setForm({
            vehiculo_id: "",
            tipo_documento: "",
            fecha_vencimiento: "",
            fecha_renovacion: "",
            documento_pdf: "",
            estado: "",
          });
    } catch (error) {
        console.error("Error al registrar el documento:", error);
        if (error.response && error.response.status === 422) {
            setErrors(error.response.data.errors);
          } else {
            console.error("Error al registrar vehículo:", error);
          }
    }

}
useEffect(() => {
    obtenerVehiculos();
}
, []);

  return (
    <div>
        <form className="bg-white p-6 mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Registrar Documentacion</h2>
            <Link
          to="/auth/crm/vehiculos"
          className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
        >
          ← Volver
        </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
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
        <div>
            <label htmlFor="tipo_documento" className="block mb-2 font-medium">
            Tipo de Documento
            </label>
            <input
                id="tipo_documento"
                type="text"
                value={form.tipo_documento}
                onChange={handleChange}
                name="tipo_documento"
                className={`border ${error.tipo_documento ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
                placeholder="Ingrese el tipo de documento"
            />
            {error.tipo_documento && (
            <p className="text-red-500 text-sm">{error.tipo_documento}</p>
            )}
        </div>
           <div>
            <label htmlFor="fecha_vencimiento" className="block mb-2 font-medium">
            Fecha de Vencimiento
            </label>
            <input
                type="date"
                id="fecha_vencimiento"
                name="fecha_vencimiento"
                value={form.fecha_vencimiento}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 ${error.fecha_vencimiento ? "border-red-500" : "border-gray-300"}`}
            />
            {error.fecha_vencimiento && <p className="text-red-500 text-sm">{error.fecha_vencimiento}</p>}
           </div>
         <div>
            <label htmlFor="fecha_renovacion" className="block mb-2 font-medium">
            Fecha de Renovacion
            </label>
            <input
                type="date"
                id="fecha_renovacion"
                name="fecha_renovacion"
                value={form.fecha_renovacion}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 ${error.fecha_renovacion ? "border-red-500" : "border-gray-300"}`}
            />
            {error.fecha_renovacion && <p className="text-red-500 text-sm">{error.fecha_renovacion}</p>}
         </div>   
         <div>
            <label htmlFor="documento_pdf" className="block mb-2 font-medium">
            Documento PDF
            </label>
            <input
                type="file"
                id="documento_pdf"
                name="documento_pdf"
                onChange={(e) => setForm({ ...form, documento_pdf: e.target.files[0] })}
                className={`w-full border rounded-md p-2 ${error.documento_pdf ? "border-red-500" : "border-gray-300"}`}
            />
            {error.documento_pdf && <p className="text-red-500 text-sm">{error.documento_pdf}</p>}
         </div>

         <div>
            <label htmlFor="estado" className="block mb-2 font-medium">
            Estado
            </label>
            <select
                name="estado"
                id="estado"
                value={form.estado}
                onChange={handleChange}
                className={`border ${error.estado ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
            >
            <option value="">Seleccione un estado</option>
            <option value="Vigente">Vigente</option>
            <option value="Por vencer">Proximo a Vencer</option>
            <option value="Vencido">Vencido</option>
            </select>
            {error.estado && (
            <p className="text-red-500 text-sm">{error.estado}</p>
            )}
         </div>
            </div>

            <div className="flex justify-start mt-4">
            <button
                type="submit"
                onClick={handleSubmit}
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
            >
                Registrar Documento
            </button>
            </div>
        </form>
        </div>
  )
}
