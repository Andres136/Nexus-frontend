import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import clienteAxios from "../../config/axios"
import { toast } from "react-toastify";

export default function EditarVehiculo() {
    const {id}=useParams();
    const navigate=useNavigate();
    const [vehiculo, setVehiculo] = useState({
        id: "",
        placa: "",
        marca: "",
        modelo: "",
        tipo: "",
        anio: "",
        kilometraje_actual: "",
        estado: "",
        observaciones: "",
        foto: "",
        licencia_transito: "",
        conductor: "",
        
    });
    const [Cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [errorMessage, setErrorMessage] = useState({});

    useEffect(()=>{
        const obtenerVehiculo=async()=>{
            try {
                const token = localStorage.getItem("token");
                const response = await clienteAxios.get(`/api/vehiculos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('response', response.data);
                setVehiculo(response.data.vehiculo);
            } catch (error) {
                console.error("Error al obtener el vehiculo:", error);
                setError(error.response.data.message);
            } finally {
                setCargando(false);
            }
        }
        obtenerVehiculo();
    },[id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehiculo({ ...vehiculo, [name]: value });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        //Form data
        const formData = new FormData();
        formData.append("placa", vehiculo.placa);
        formData.append("marca", vehiculo.marca);
        formData.append("modelo", vehiculo.modelo);
        formData.append("anio", vehiculo.anio);
        formData.append("kilometraje_actual", vehiculo.kilometraje_actual);
        formData.append("estado", vehiculo.estado);
        formData.append("tipo", vehiculo.tipo);
        formData.append("observaciones", vehiculo.observaciones);
        formData.append("licencia_transito", vehiculo.licencia_transito);
        formData.append("conductor", vehiculo.conductor);
        if(vehiculo.foto instanceof File){
            formData.append("foto", vehiculo.foto);
        }
        try {
            const token = localStorage.getItem("token");
           const  response = await clienteAxios.post (`/api/vehiculos/${id}?_method=PUT`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response.data);
            toast.success(response.data.message);
            setTimeout(() => navigate('/auth/crm/vehiculos-all'), 2000);

        } catch (error) {
            console.error("Error al editar el vehiculo:", error);
            if (error.response && error.response.status === 422) {
                setErrorMessage(error.response.data.errors);
            } else {
                setError("Error al editar el vehiculo");
            }
            
        }
    }
    if (Cargando) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;


  return (
    <div>

<Link
          to="/auth/crm/vehiculos"
          className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
        >
          ← Volver
        </Link>

        <form
        onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-4">Editar Vehiculo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="mb-4">
    <label className="block font-medium" htmlFor="placa">Placa</label>
    <input
        type="text"
        id="placa"
        name="placa"
        value={vehiculo.placa}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.placa ? 'border-red-500' : ''}`}
    />
    {errorMessage.placa && <span className="text-red-500 text-sm">{errorMessage.placa}</span>}
</div>


<div className="mb-4"> <label className="block font-medium" htmlFor="licencia_transito">Licencia de Transito</label>
    <input
        type="text"
        id="licencia_transito"
        name="licencia_transito"
        value={vehiculo.licencia_transito}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.licencia_transito ? 'border-red-500' : ''}`}
    />
    {errorMessage.licencia_transito && <span className="text-red-500 text-sm">{errorMessage.licencia_transito}</span>}
</div>


<div className="mb-4">
    <label className="block font-medium" htmlFor="marca">Marca</label>
    <input
        type="text"
        id="marca"
        name="marca"
        value={vehiculo.marca}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.marca ? 'border-red-500' : ''}`}
    />
    {errorMessage.marca && <span className="text-red-500 text-sm">{errorMessage.marca}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="modelo">Modelo</label>
    <input
        type="text"
        id="modelo"
        name="modelo"
        value={vehiculo.modelo}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.modelo ? 'border-red-500' : ''}`}
    />
    {errorMessage.modelo && <span className="text-red-500 text-sm">{errorMessage.modelo}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="anio">Año</label>
    <input
        type="text"
        id="anio"
        name="anio"
        value={vehiculo.anio}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.anio ? 'border-red-500' : ''}`}
    />
    {errorMessage.anio && <span className="text-red-500 text-sm">{errorMessage.anio}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="kilometraje_actual">Kilometraje Actual</label>
    <input
        type="text"
        id="kilometraje_actual"
        name="kilometraje_actual"
        value={vehiculo.kilometraje_actual}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.kilometraje_actual ? 'border-red-500' : ''}`}
    />
    {errorMessage.kilometraje_actual && <span className="text-red-500 text-sm">{errorMessage.kilometraje_actual}</span>}
</div>


<div className="mb-4">
    <label className="block font-medium" htmlFor="conductor">Conductor</label>
    <input
        type="text"
        id="conductor"
        name="conductor"
        value={vehiculo.conductor}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.conductor ? 'border-red-500' : ''}`}
    />
    {errorMessage.conductor && <span className="text-red-500 text-sm">{errorMessage.conductor}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="estado">Estado</label>
    <select
  id="estado"
  name="estado"
  value={vehiculo.estado || ""}
  onChange={handleChange}
  className={`border rounded-lg p-2 w-full ${errorMessage.estado ? 'border-red-500' : ''}`}
>
  <option value="">Seleccione el estado</option>
  <option value="Activo">Activo</option>
  <option value="En mantenimiento">En mantenimiento</option>
  <option value="Retirado">Retirado</option>
</select>

    {errorMessage.estado && <span className="text-red-500 text-sm">{errorMessage.estado}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="tipo">Tipo</label>
    <select
        id="tipo"
        name="tipo"
        value={vehiculo.tipo}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.tipo ? 'border-red-500' : ''}`}
    >
        <option value="">Seleccione el tipo</option>
        <option value="auto">Auto</option>
        <option value="motocicleta">Motocicleta</option>
    </select>
    {errorMessage.tipo && <span className="text-red-500 text-sm">{errorMessage.tipo}</span>}
</div>
<div className="mb-4">
    <label className="block font-medium" htmlFor="observaciones">Observaciones</label>
    <textarea
        id="observaciones"
        name="observaciones"
        value={vehiculo.observaciones}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.observaciones ? 'border-red-500' : ''}`}
    ></textarea>
    {errorMessage.observaciones && <span className="text-red-500 text-sm">{errorMessage.observaciones}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="foto">Foto</label>
    <input
        type="file"
        id="foto"
        name="foto"
        onChange={(e) => setVehiculo({ ...vehiculo, foto: e.target.files[0] })}
        className={`border rounded-lg p-2 w-full ${errorMessage.foto ? 'border-red-500' : ''}`}
    />
    {errorMessage.foto && <span className="text-red-500 text-sm">{errorMessage.foto}</span>}
</div>
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                Guardar Cambios
            </button>
        
        </form>
    </div>

  )
}
