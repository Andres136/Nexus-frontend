import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { indicadoresApi } from "../../services/api";
import { toast } from "react-toastify";
import ObtenerIndicadores from "../../components/calidad/ObtenerIndicadores";
import { Link } from "react-router-dom";

export default function Indicadores() {
 // const { user } = useAuth({middleware:"auth"}); // no pases options si tu hook no las usa

  const [errors, setErrors] = useState({}); // 👈 por-campo
  const [editId, setEditId] = useState(null);
  const [indicadores, setIndicadores] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    formula: "",
    meta: "",
    frecuencia: "",
    descripcion: "",
    tipo_meta: "",
  });

  const handleEdit = (indicador) => {
    setEditId(indicador.id);
    setFormData({
      nombre: indicador.nombre,
      formula: indicador.formula,
      meta: indicador.meta,
      frecuencia: indicador.frecuencia,
      descripcion: indicador.descripcion,
      tipo_meta: indicador.tipo_meta
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
    // limpia error del campo al escribir
    if (errors[name]) {
      setErrors(s => ({ ...s, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors({});
      let response;
      if (editId) {
        // Editando
        response = await indicadoresApi.update(editId, formData);
           // Actualiza el indicador en el array
      setIndicadores(prev =>
        prev.map(ind => ind.id === editId ? { ...ind, ...formData } : ind)
      );
        toast.success(response?.data?.message ?? "Indicador actualizado", {
          className: "bg-blue-400 text-white font-bold",
          progressClassName: "bg-blue-300"
        });
        setEditId(null);
      } else {
        // Creando
        response = await indicadoresApi.create(formData);
        toast.success(response?.data?.message ?? "Indicador creado", {
          className: "bg-blue-400 text-white font-bold",
          progressClassName: "bg-blue-300"
        });
      }
      // Limpia formulario
      setFormData({
        nombre: "",
        formula: "",
        meta: "",
        frecuencia: "",
        descripcion: "",
        tipo_meta: ""
      });
      // Aquí podrías actualizar la lista de indicadores si la tienes en este componente
    } catch (err) {
      const { response } = err || {};
      if (response?.status === 422 && response.data?.errors) {
        setErrors(response.data.errors);               // 👈 guarda errores por campo
        toast.error("Revisa los campos del formulario");
      } else if (response?.status === 403) {
        toast.error(response.data?.message ?? "No autorizado");
      } else {
        toast.error("Error al crear el indicador");
      }
    }
  };
//Boton para cancelar edicion
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      nombre: "",
      formula: "",
      meta: "",
      frecuencia: "",
      descripcion: "",
      tipo_meta: "",
    });
    setErrors({});
  };
// helper para primer mensaje
  const err = (k) => errors?.[k]?.[0]; // helper para primer mensaje

  return (
<>
<div>
<div className="bg-green-700 text-white p-4 rounded-b-lg shadow-md mb-6">
  <h1 className="text-2xl font-bold mb-4 text-center text-white">Gestión de Indicadores</h1>
  <p className="text-gray-200 text-center">Aquí puedes crear, editar y eliminar indicadores para el seguimiento de calidad.</p>

  
</div>
{/**Agregar un boton para crear un nuevo indicador */}
  <div className="flex justify-right mt-4">
    <Link
      to="/auth/crm/registrar-valor-indicador"
      className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
    >
      Registrar un valor para  cada indicador
      </Link>
    </div>
<div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-4">


<div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md ">
  <form onSubmit={handleSubmit} className="space-y-4">
  <div className="mb-4">
    <label
      htmlFor="nombre"
      className="block text-sm font-medium text-gray-700">
      Nombre
    </label>
    <input
      id="nombre"
      type="text"
      name="nombre"
      value={formData.nombre}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("nombre") ? "border-red-500" : ""}`}
    />
    {err("nombre") && <p className="text-red-500 text-sm mt-1">{err("nombre")}</p>}
  </div>

  <div className="mb-4">
    <label
      htmlFor="formula"
      className="block text-sm font-medium text-gray-700">
      Fórmula
    </label>
    <input
      id="formula"
      type="text"
      name="formula"
      value={formData.formula}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("formula") ? "border-red-500" : ""}`}
    />
    {err("formula") && <p className="text-red-500 text-sm mt-1">{err("formula")}</p>}
  </div>



  <div className="mb-4">
    <label
      htmlFor="meta"
      className="block text-sm font-medium text-gray-700">
      Meta
    </label>
    <input
      id="meta"
      type="text"
      name="meta"
      value={formData.meta}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("meta") ? "border-red-500" : ""}`}
    />
    {err("meta") && <p className="text-red-500 text-sm mt-1">{err("meta")}</p>}

  </div>


<div className="mb-4">
    <label
      htmlFor="frecuencia"
      className="block text-sm font-medium text-gray-700">
      Frecuencia
    </label>
    <select
      id="frecuencia"
      name="frecuencia"
      value={formData.frecuencia}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("frecuencia") ? "border-red-500" : ""}`}
    >
      <option value="">Selecciona una frecuencia</option>
      <option value="Mensual">Mensual</option>
      <option value="Bimestral">Bimestral</option>
      <option value="Trimestral">Trimestral</option>
      <option value="Cuatrimestral">Cuatrimestral</option>
      <option value="Semestral">Semestral</option>
      <option value="Anual">Anual</option>
    </select>
    {err("frecuencia") && <p className="text-red-500 text-sm mt-1">{err("frecuencia")}</p>}
  </div>  

  <div className="mb-4">
    <label
      htmlFor="tipo_meta"
      className="block text-sm font-medium text-gray-700">
      Tipo de Meta
    </label>
    <select
      id="tipo_meta"
      name="tipo_meta"
      value={formData.tipo_meta}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("tipo_meta") ? "border-red-500" : ""}`}
    >
      <option value="">Selecciona un tipo de meta</option>
      <option value="mayor">Mayor</option>
      <option value="menor">Menor</option>
    </select>
    {err("tipo_meta") && <p className="text-red-500 text-sm mt-1">{err("tipo_meta")}</p>}
  </div>

  <div className="mb-4">

    <label
      htmlFor="descripcion"
      className="block text-sm font-medium text-gray-700">
      Descripción
    </label>
    <textarea
      id="descripcion"
      name="descripcion"
      value={formData.descripcion}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${err("descripcion") ? "border-red-500" : ""}`}
    />
    {err("descripcion") && <p className="text-red-500 text-sm mt-1">{err("descripcion")}</p>}
  </div>

  <div className="flex space-x-2">
    <button
      type="submit"
      className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      {editId ? "Actualizar" : "Crear"}
    </button>
    {editId && (
      <button
        type="button"
        onClick={handleCancelEdit}
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
      >
        Cancelar
      </button>
    )}
  </div>
</form>
</div>
<div className="md:col-span-3 bg-white p-4 rounded-lg shadow-md">
<ObtenerIndicadores
    indicadores={indicadores}
    setIndicadores={setIndicadores}
    onSelect={handleEdit}
    puedeEditar={true} // Cambia esto según los permisos del usuario
  />
</div>
</div>
</div>
</>

  
  );
}
