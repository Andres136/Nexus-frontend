import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useVehiculos } from "../../hooks/useVehiculos";

export default function FormVehiculos() {
  const [error, setErrors] = useState({});
  const { obtenerConductores, conductores } = useVehiculos();
  const [form, setForm] = useState({
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...error, [name]: null }); // Limpiar el error del campo correspondiente
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("placa", form.placa);
      formData.append("marca", form.marca);
      formData.append("modelo", form.modelo);
      formData.append("tipo", form.tipo);
      formData.append("anio", form.anio);
      formData.append("kilometraje_actual", form.kilometraje_actual);
      formData.append("estado", form.estado);
      formData.append("observaciones", form.observaciones);
      formData.append("licencia_transito", form.licencia_transito);
      formData.append("conductor", form.conductor);
      // Agregar otros campos según sea necesario
      formData.append("nombre", form.nombre);
      formData.append("tipo_servicio", form.tipo_servicio);
      formData.append("color", form.color);
      formData.append("tipo_carroceria", form.tipo_carroceria);
      formData.append("tipo_combustible", form.tipo_combustible);
      formData.append("numero_motor", form.numero_motor);
      formData.append("numero_chasis", form.numero_chasis);
      formData.append("propietario", form.propietario);
      formData.append("identificacion", form.identificacion);
      formData.append("organismo_transito", form.organismo_transito);
      formData.append("fecha_matricula", form.fecha_matricula);
      // Agregar la foto al FormData solo si existe
      if (form.foto) {
        formData.append("foto", form.foto);
      }
      const token = localStorage.getItem("token");
      const response = await clienteAxios.post("/api/vehiculos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
     console.log('Vehículo registrado:', response.data);

      toast.success(response.data.message);
      // Redirigir a la lista de vehículos o a otra página con el hook useNavigate
      navigate(`/auth/crm/vehiculos/${response.data.id}/fotos`);

      // Limpiar el formulario después de enviar
      setForm({
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
      setErrors({}); // Limpiar errores
    } catch (error) {
      console.log(error.response.data);
      // Manejo de errores por campo
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al registrar vehículo:", error);
      }
    }
  };

  // Cargar conductores al montar el componente
useEffect(() => {
  obtenerConductores(); // ✅ llamada correcta
}, []);
  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg  p-6 mx-auto space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Registrar Nuevo Vehiculo
        </h2>
      <div className="flex justify-start mb-2">
  <Link
    to="/auth/crm/vehiculos"
    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm inline-block"
  >
    ← Volver
  </Link>
</div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block font-medium" htmlFor="placa">
              Placa
            </label>
            <input
              id="placa"
              type="text"
              value={form.placa}
              onChange={handleChange}
              name="placa"
              className="border border-gray-300 rounded-md p-2 w-full uppercase"
              placeholder="Ingrese la placa del vehiculo"
            />
            {error.placa && (
              <p className="text-red-500 text-sm">{error.placa[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              name="nombre"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el nombre del vehiculo"
            />
            {error.nombre && (
              <p className="text-red-500 text-sm">{error.nombre[0]}</p>
            )}
          </div>
   <div className="mb-4"> 
            <label className="block font-medium" htmlFor="licencia_transito">
              Licencia de Transito
            </label>
            <input
              id="licencia_transito"
              type="text"
              value={form.licencia_transito}
              onChange={handleChange}
              name="licencia_transito"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la licencia de transito del vehiculo"
            />
            {error.licencia_transito && (
              <p className="text-red-500 text-sm">
                {error.licencia_transito[0]}
              </p>
            )}
          </div>


              <div className="mb-4">
            <label className="block font-medium" htmlFor="tipo">
              Tipo
            </label>
            <select
              name="tipo"
              id="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Seleccione el tipo de vehiculo</option>
              <option value="Camioneta">Camioneta</option>
              <option value="Camión">Camión</option>

              <option value="Motocicleta">Motocicleta</option>
              <option value="Auto">Auto</option>
            </select>
            {error.tipo && (
              <p className="text-red-500 text-sm">{error.tipo[0]}</p>
            )}
          </div>


           <div className="mb-4">
            <label className="block font-medium" htmlFor="tipo_servicio">
              Tipo de Servicio
            </label>
            <input
              id="tipo_servicio"
              type="text"
              value={form.tipo_servicio}
              onChange={handleChange}
              name="tipo_servicio"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el tipo de servicio del vehiculo"
            />
            {error.tipo_servicio && (
              <p className="text-red-500 text-sm">{error.tipo_servicio[0]}</p>
            )}
          </div>


          <div className="mb-4">
            <label className="block font-medium" htmlFor="marca">
              Marca
            </label>
            <input
              id="marca"
              type="text"
              value={form.marca}
              onChange={handleChange}
              name="marca"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la marca del vehiculo"
            />
            {error.marca && (
              <p className="text-red-500 text-sm">{error.marca[0]}</p>
            )}
          </div>

 <div className="mb-4">
            <label className="block font-medium" htmlFor="modelo">
            Linea
            </label>
            <input
              type="text"
              id="modelo"
              value={form.modelo}
              onChange={handleChange}
              name="modelo"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la linea del vehiculo"
            />
            {error.modelo && (
              <p className="text-red-500 text-sm">{error.modelo[0]}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium" htmlFor="anio">
              Año o Modelo del Vehiculo
            </label>
            <input
              id="anio"
              type="number"
              value={form.anio}
              onChange={handleChange}
              name="anio"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el año o Modelo del vehiculo"
            />
            {error.anio && (
              <p className="text-red-500 text-sm">{error.anio[0]}</p>
            )}
          </div>


           <div className="mb-4">
            <label className="block font-medium" htmlFor="color">
              Color
            </label>
            <input
              id="color"
              type="text"
              value={form.color}
              onChange={handleChange}
              name="color"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el color del vehiculo"
            />
            {error.color && (
              <p className="text-red-500 text-sm">{error.color[0]}</p>
            )}
          </div>


          <div className="mb-4">
            <label className="block font-medium" htmlFor="tipo_carroceria">
              Tipo de Carrocería
            </label>
            <input
              id="tipo_carroceria"
              type="text"
              value={form.tipo_carroceria}
              onChange={handleChange}
              name="tipo_carroceria"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el tipo de carrocería del vehiculo"
            />
            {error.tipo_carroceria && (
              <p className="text-red-500 text-sm">{error.tipo_carroceria[0]}</p>
            )}
          </div>
             <div className="mb-4">
            <label className="block font-medium" htmlFor="tipo_combustible">
              Tipo de Combustible
            </label>
            <input
              id="tipo_combustible"
              type="text"
              value={form.tipo_combustible}
              onChange={handleChange}
              name="tipo_combustible"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el tipo de combustible del vehiculo"
            />
            {error.tipo_combustible && (
              <p className="text-red-500 text-sm">{error.tipo_combustible[0]}</p>
            )}
          </div>
      



          
          <div className="mb-4">
            <label className="block font-medium" htmlFor="numero_motor">
              Número de Motor
            </label>
            <input
              id="numero_motor"
              type="text"
              value={form.numero_motor}
              onChange={handleChange}
              name="numero_motor"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el número de motor del vehiculo"
            />
            {error.numero_motor && (
              <p className="text-red-500 text-sm">{error.numero_motor[0]}</p>
            )}
          </div>


             <div className="mb-4">
            <label className="block font-medium" htmlFor="numero_chasis">
              Número de Chasis
            </label>
            <input
              id="numero_chasis"
              type="text"
              value={form.numero_chasis}
              onChange={handleChange}
              name="numero_chasis"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el número de chasis del vehiculo"
            />
            {error.numero_chasis && (
              <p className="text-red-500 text-sm">{error.numero_chasis[0]}</p>
            )}
          </div>
           

   

     
         

      

       

           <div className="mb-4">
            <label className="block font-medium" htmlFor="propietario">
              Propietario
            </label>
            <input
              id="propietario"
              type="text"
              value={form.propietario}
              onChange={handleChange}
              name="propietario"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el nombre del propietario"
            />
            {error.propietario && (
              <p className="text-red-500 text-sm">{error.propietario[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="identificacion">
              Identificación del Propietario
            </label>
            <input
              id="identificacion"
              type="text"
              value={form.identificacion}
              onChange={handleChange}
              name="identificacion"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la identificación del propietario"
            />
            {error.identificacion && (
              <p className="text-red-500 text-sm">{error.identificacion[0]}</p>
            )}
          </div>


          <div className="mb-4">
            <label className="block font-medium" htmlFor="organismo_transito">
              Organismo de Tránsito
            </label>
            <input
              id="organismo_transito"
              type="text"
              value={form.organismo_transito}
              onChange={handleChange}
              name="organismo_transito"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el organismo de tránsito"
            />
            {error.organismo_transito && (
              <p className="text-red-500 text-sm">{error.organismo_transito[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="fecha_matricula">
              Fecha de Matrícula
            </label>
            <input
              id="fecha_matricula"
              type="date"
              value={form.fecha_matricula}
              onChange={handleChange}
              name="fecha_matricula"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            {error.fecha_matricula && (
              <p className="text-red-500 text-sm">{error.fecha_matricula[0]}</p>
            )}
          </div>
      


           <div className="mb-4">
            <label className="block font-medium" htmlFor="conductor">
              Conductor
            </label>
           <select
  name="conductor"
  value={form.conductor}
  onChange={handleChange}
  id="conductor"
  className="border border-gray-300 rounded-md p-2 w-full"
>
  <option value="">Seleccione un conductor</option>
  {conductores.map((c) => (
    <option key={c.id} value={c.name}>
      {c.name}
    </option>
  ))}
</select>

            {error.conductor && (
              <p className="text-red-500 text-sm">{error.conductor[0]}</p>
            )}
          </div>



          <div className="mb-4">
            <label className="block font-medium" htmlFor="kilometraje_actual">
              Kilometraje Actual
            </label>
            <input
              id="kilometraje_actual"
              type="number"
              value={form.kilometraje_actual}
              onChange={handleChange}
              name="kilometraje_actual"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el kilometraje actual del vehiculo"
            />
            {error.kilometraje_actual && (
              <p className="text-red-500 text-sm">
                {error.kilometraje_actual[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="estado">
              Estado
            </label>
            <select
              name="estado"
              id="estado"
              value={form.estado}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Seleccione el estado del vehiculo</option>
              <option value="Activo">Activo</option>
              <option value="En mantenimiento">En mantenimiento</option>

              <option value="Retirado">Retirado</option>
            </select>
            {error.estado && (
              <p className="text-red-500 text-sm">{error.estado[0]}</p>
            )}
          </div>

         <div className="mb-4">
            <label className="block font-medium" htmlFor="observaciones">
              Observaciones
            </label>
            <input
              type="text"
              id="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              name="observaciones"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese observaciones adicionales"
            />
            {error.observaciones && (
              <p className="text-red-500 text-sm">{error.observaciones[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="foto">
              Foto
            </label>
            <input
              id="foto"
              type="file"
              onChange={handleChange}
              name="foto"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            {error.foto && (
              <p className="text-red-500 text-sm">{error.foto[0]}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          >
            Registrar Vehiculo
          </button>
        </div>
      </form>
    </div>
  );
}
