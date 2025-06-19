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
           nombre: "",
        tipo_servicio: "",
        color: "",
        tipo_carroceria: "",
        tipo_combustible: "",
        numero_motor: "",
        numero_chasis: "",
        propietario: "",
        identificacion: "",
        organismo_transito: "",
        fecha_matricula: "",


        
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
        formData.append("nombre", vehiculo.nombre);
        formData.append("tipo_servicio", vehiculo.tipo_servicio);
        formData.append("color", vehiculo.color);
        formData.append("tipo_carroceria", vehiculo.tipo_carroceria);
        formData.append("tipo_combustible", vehiculo.tipo_combustible);
        formData.append("numero_motor", vehiculo.numero_motor);
        formData.append("numero_chasis", vehiculo.numero_chasis);
        formData.append("propietario", vehiculo.propietario);
        formData.append("identificacion", vehiculo.identificacion);
        formData.append("organismo_transito", vehiculo.organismo_transito);
        formData.append("fecha_matricula", vehiculo.fecha_matricula);

        
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
            // Reset form
            setVehiculo({
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
                nombre: "",
                tipo_servicio: "",
                color: "",
                tipo_carroceria: "",
                tipo_combustible: "",
                numero_motor: "",
                numero_chasis: "",
                propietario: "",
                identificacion: "",
                organismo_transito: "",
                fecha_matricula: "",    
            });
            setErrorMessage({});
            setError('');

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
<div className="mb-4">
    <label className="block font-medium" htmlFor="nombre">Nombre</label>
    <input
        type="text"
        id="nombre"
        name="nombre"
        value={vehiculo.nombre}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.nombre ? 'border-red-500' : ''}`}
    />
    {errorMessage.nombre && <span className="text-red-500 text-sm">{errorMessage.nombre}</span>}
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
    <label className="block font-medium" htmlFor="tipo_servicio">Tipo de Servicio</label>
    <input
        type="text"
        id="tipo_servicio"
        name="tipo_servicio"
        value={vehiculo.tipo_servicio}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.tipo_servicio ? 'border-red-500' : ''}`}
    />
    {errorMessage.tipo_servicio && <span className="text-red-500 text-sm">{errorMessage.tipo_servicio}</span>}
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
    <label className="block font-medium" htmlFor="modelo">Linea Vehiculo</label>
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
    <label className="block font-medium" htmlFor="color">Color</label>
    <input
        type="text"
        id="color"
        name="color"
        value={vehiculo.color}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.color ? 'border-red-500' : ''}`}
    />
    {errorMessage.color && <span className="text-red-500 text-sm">{errorMessage.color}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="tipo_carroceria">Tipo de Carrocería</label>
    <input
        type="text"
        id="tipo_carroceria"    
        name="tipo_carroceria"
        value={vehiculo.tipo_carroceria}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.tipo_carroceria ? 'border-red-500' : ''}`}
    />
    {errorMessage.tipo_carroceria && <span className="text-red-500 text-sm">{errorMessage.tipo_carroceria}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="tipo_combustible">Tipo de Combustible</label>
    <input
        type="text"
        id="tipo_combustible"       
        name="tipo_combustible"
        value={vehiculo.tipo_combustible}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.tipo_combustible ? 'border-red-500' : ''}`}
    />
    {errorMessage.tipo_combustible && <span className="text-red-500 text-sm">{errorMessage.tipo_combustible}</span>}
</div>  

<div className="mb-4">
    <label className="block font-medium" htmlFor="numero_motor">Número de Motor</label>
    <input
        type="text"
        id="numero_motor"
        name="numero_motor"
        value={vehiculo.numero_motor}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.numero_motor ? 'border-red-500' : ''}`}
    />
    {errorMessage.numero_motor && <span className="text-red-500 text-sm">{errorMessage.numero_motor}</span>}
</div>


<div className="mb-4">
 <label className="block font-medium" htmlFor="numero_chasis">Número de Chasis</label>
    <input
        type="text"
        id="numero_chasis"
        name="numero_chasis"
        value={vehiculo.numero_chasis}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.numero_chasis ? 'border-red-500' : ''}`}
    />
    {errorMessage.numero_chasis && <span className="text-red-500 text-sm">{errorMessage.numero_chasis}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="propietario">Propietario</label>
    <input
        type="text"
        id="propietario"
        name="propietario"
        value={vehiculo.propietario}
        onChange={handleChange}     
        className={`border rounded-lg p-2 w-full ${errorMessage.propietario ? 'border-red-500' : ''}`}
    />
    {errorMessage.propietario && <span className="text-red-500 text-sm">{errorMessage.propietario}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="identificacion">Identificación</label>
    <input
        type="text"
        id="identificacion"
        name="identificacion"
        value={vehiculo.identificacion}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.identificacion ? 'border-red-500' : ''}`}
    />
    {errorMessage.identificacion && <span className="text-red-500 text-sm">{errorMessage.identificacion}</span>}
</div>

<div className="mb-4">
    <label className="block font-medium" htmlFor="organismo_transito">Organismo de Tránsito</label>
    <input
        type="text"     
        id="organismo_transito"
        name="organismo_transito"
        value={vehiculo.organismo_transito}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.organismo_transito ? 'border-red-500' : ''}`}
    />
    {errorMessage.organismo_transito && <span className="text-red-500 text-sm">{errorMessage.organismo_transito}</span>}
</div>

    <div className="mb-4">
    <label className="block font-medium" htmlFor="fecha_matricula">Fecha de Matrícula</label>
    <input
        type="date"
        id="fecha_matricula"
        name="fecha_matricula"
        value={vehiculo.fecha_matricula}
        onChange={handleChange}
        className={`border rounded-lg p-2 w-full ${errorMessage.fecha_matricula ? 'border-red-500' : ''}`}
    />
    {errorMessage.fecha_matricula && <span className="text-red-500 text-sm">{errorMessage.fecha_matricula}</span>}
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
