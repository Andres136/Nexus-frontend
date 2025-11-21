import { useEffect, useState } from "react";
import { useVehiculos } from "../hooks/useVehiculos";
import { toast } from "react-toastify";
import clienteAxios from "../config/axios";
import Select from "react-select";
import {  useNavigate } from "react-router-dom";

export default function Conductores() {
  const { conductores, obtenerConductores } = useVehiculos();
  const [errores, setErrores] = useState({});
  const usenavigate = useNavigate();


  const [formData, setFormData] = useState({
    user_id: '',
    cedula: '',
    licencia_conduccion: '',
    tipo_licencia: '',
    fecha_expedicion: '',
    fecha_vencimiento: '',
    categoria: '',
    grupo_sanguineo: '',
    rut_archivo: null,
    licencia_archivo: null,
    comparendo_archivo: null,
  });

  

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        payload.append(key, formData[key]);
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.post('/api/datos-conductores', payload, {
      
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success(response.data.message || 'Conductor registrado exitosamente');
      usenavigate('/auth/crm/conductores');
      setFormData({
        user_id: '',
        cedula: '',
        licencia_conduccion: '',
        tipo_licencia: '',
        fecha_expedicion: '',
        fecha_vencimiento: '',
        categoria: '',
        grupo_sanguineo: '',
        rut_archivo: null,
        licencia_archivo: null,
        comparendo_archivo: null,
      });
    } catch (error) {

    if (error.response?.data?.errors) {

      console.log('Errores de validación:', error);
  setErrores(error.response.data.errors); // ← Guarda los errores en el estado
} else {
  toast.error(error.response?.data?.message || 'Error al registrar el conductor');
}

    }
  };

  useEffect(()=>{
    obtenerConductores();
  }, []);

  return (
   <>
<div className="">

  
<form
  onSubmit={handleSubmit}
  className="p-6 max-w-5xl mx-auto bg-white rounded shadow space-y-6"
>
  <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Registre Datos del Conductor</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Usuario */}
    <div>
      <label className="font-semibold text-sm">Usuario</label>
      <Select
        options={conductores.map((conductor) => ({
          value: conductor.id,
          label: `${conductor.name}`,
        }))}
        value={formData.user_id ? { value: formData.user_id, label: `${conductores.find(c => c.id === formData.user_id)?.name} ${conductores.find(c => c.id === formData.user_id)?.last_name}` } : null}
        onChange={(selected) => setFormData((prev) => ({ ...prev, user_id: selected?.value || '' }))}
        className="w-full"
      />
      {errores.user_id && <p className="text-red-500 text-sm">{errores.user_id[0]}</p>}
    </div>

    {/* Cedula */}
    <div>
      <label className="font-semibold text-sm">Cédula</label>
      <input
        type="text"
        name="cedula"
        value={formData.cedula}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Ej: 123456789"
      />
      {errores.cedula && <p className="text-red-500 text-sm">{errores.cedula[0]}</p>}
    </div>

    {/* Licencia */}
    <div>
      <label className="font-semibold text-sm">Licencia de Conducción</label>
      <input
        type="text"
        name="licencia_conduccion"
        value={formData.licencia_conduccion}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Número de licencia"
      />
      {errores.licencia_conduccion && <p className="text-red-500 text-sm">{errores.licencia_conduccion[0]}</p>}
    </div>

    {/* Tipo de licencia */}
    <div>
      <label className="font-semibold text-sm">Categoría</label>
      <input
        type="text"
        name="tipo_licencia"
        value={formData.tipo_licencia}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Ej: B1, C1"
      />
      {errores.tipo_licencia && <p className="text-red-500 text-sm">{errores.tipo_licencia[0]}</p>}
    </div>

    {/* Fecha expedición */}
    <div>
      <label className="font-semibold text-sm">Fecha de Expedición</label>
      <input
        type="date"
        name="fecha_expedicion"
        value={formData.fecha_expedicion}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      {errores.fecha_expedicion && <p className="text-red-500 text-sm">{errores.fecha_expedicion[0]}</p>}
    </div>

    {/* Fecha vencimiento */}
    <div>
      <label className="font-semibold text-sm">Fecha de Vencimiento</label>
      <input
        type="date"
        name="fecha_vencimiento"
        value={formData.fecha_vencimiento}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      {errores.fecha_vencimiento && <p className="text-red-500 text-sm">{errores.fecha_vencimiento[0]}</p>}
    </div>

    {/* Categoría */}
    <div>
      <label className="font-semibold text-sm">Tipo</label>
      <input
        type="text"
        name="categoria"
        value={formData.categoria}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Ej: Particular, Público, Especializado"
      />
      {errores.categoria && <p className="text-red-500 text-sm">{errores.categoria[0]}</p>}
    </div>

    {/* Grupo sanguíneo */}
    <div>
      <label className="font-semibold text-sm">Grupo Sanguíneo</label>
      <input
        type="text"
        name="grupo_sanguineo"
        value={formData.grupo_sanguineo}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Ej: O+"
      />
      {errores.grupo_sanguineo && <p className="text-red-500 text-sm">{errores.grupo_sanguineo[0]}</p>}
    </div>
  </div>

  <fieldset className="border border-gray-300 p-4 rounded mt-6">
    <legend className="text-sm font-semibold text-gray-600 px-2">Archivos del Conductor</legend>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* RUT */}
      <div>
        <label className="font-semibold text-sm">RUNT</label>
        <input
          type="file"
          name="rut_archivo"
          onChange={handleChange}
          className="w-full border p-2 rounded"

        />
        {errores.rut_archivo && <p className="text-red-500 text-sm">{errores.rut_archivo[0]}</p>}
      </div>

      {/* Licencia */}
      <div>
        <label className="font-semibold text-sm">Licencia en PDF o Imagen</label>
        <input
          type="file"
          name="licencia_archivo"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errores.licencia_archivo && <p className="text-red-500 text-sm">{errores.licencia_archivo[0]}</p>}
      </div>

      {/* Comparendo */}
      <div>
        <label className="font-semibold text-sm">Archivo de Comparendo</label>
        <input
          type="file"
          name="comparendo_archivo"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {errores.comparendo_archivo && <p className="text-red-500 text-sm">{errores.comparendo_archivo[0]}</p>}
      </div>
    </div>
  </fieldset>

  <div className="text-center pt-6">
    <button
      type="submit"
      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-semibold"
    >
      Guardar
    </button>
  </div>
</form>


</div>


   </>
  );
}
