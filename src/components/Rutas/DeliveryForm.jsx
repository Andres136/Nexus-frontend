import { useEffect, useState } from "react";
import { deliveryEventsApi, usersApi } from "../../services/api";
import { useListarVehiculos } from "../../hooks/useListarVehiculos";

import { toast } from "react-toastify";
import { 
  Truck, 
  Calendar, 
  Clock, 
  Package, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Save
} from "lucide-react";
import Select from "react-select";


export default function DeliveryForm({ selectedDate, onSuccess, eventToEdit }) {

  const { vehiculos } = useListarVehiculos();
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searhOt, setSearchOt] = useState("");


  // ✅ Inicializar estado correctamente
  const [form, setForm] = useState({
    orden_id:null,
    fecha_entrega: selectedDate || "",
    hora: "08:00",
    cantidad: "",
    vehiculo_id: "",
    observaciones: "",
    usuario_id: "",
    estado: "pendiente",
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);


  

  // ✅ useEffect arreglado - debe ir DESPUÉS del useState
  useEffect(() => {
    if (eventToEdit) {
 
      setForm({
     orden_id: eventToEdit?.orden_id ? Number(eventToEdit.orden_id) : null,

        fecha_entrega: eventToEdit.fecha_entrega || selectedDate || "",
        hora: eventToEdit.hora || "08:00",
        cantidad: eventToEdit.cantidad || "",
        vehiculo_id: eventToEdit.vehiculo_id || "",
        observaciones: eventToEdit.observaciones || "",
        usuario_id: eventToEdit.usuario_id || "",
        estado: eventToEdit.estado || "pendiente"
      });
    } else {
      // Si no está editando, usar selectedDate
      setForm(prev => ({
        ...prev,
        fecha_entrega: selectedDate || ""
      }));
    }
  }, [eventToEdit, selectedDate]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setLoading(true);

    try {
      let response;

      if (eventToEdit) {
  
        response = await deliveryEventsApi.update(eventToEdit.id, form);
        toast.success(" Entrega actualizada correctamente");
      } else {
     
        response = await deliveryEventsApi.create(form);
     toast.success(response.data.message || " Entrega creada correctamente");
      }

      onSuccess();
    } catch (err) {
      console.log("❌ Error al guardar la entrega:", err);
      if (err.response?.status === 422) {
        setErrores(err.response.data.errors);
        toast.error("❌ Por favor corrige los errores del formulario");
      } else {
        toast.error("❌ Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
    }
  }

  //Obterner usuarios para el select de la ruta api/
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await usersApi.getUsers();
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  //Cargar ordenes de trabajo para el select
  useEffect(() => {
    const fetchOrdenesTrabajo = async () => {
      try {
        const response = await deliveryEventsApi.getOrdenesTrabajoParaEntregas({
          search: searhOt,
       
        });
     console.log("🚀 ~ file: DeliveryForm.jsx:202 ~ fetchOrdenesTrabajo ~ response:", response);
      
        setOrdenesTrabajo(response.data);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      }
    };

    fetchOrdenesTrabajo();
  }, [searhOt]);

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {eventToEdit ? "Editar Entrega" : "Nueva Entrega"}
            </h2>
            <p className="text-sm text-gray-600">
              {eventToEdit ? "Modifica los datos de la entrega" : `Programar para ${selectedDate}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ORDEN */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="w-4 h-4" />
              Orden de Compra *
            </label>
 <Select
  name="orden_id"
  className={`w-full p-3 transition-all duration-200 ${
    errores.orden_id ? "border-red-300 bg-red-50" : "border-gray-300"
  }`}
value={
  ordenesTrabajo
    ?.map(ot => ({
      value: Number(ot.orden_compra_id),
      label: `OT#${ot.id}`
    }))
    .find(opt => opt.value === Number(form.orden_id)) || null
}

onChange={(selected) =>
  setForm(prev => ({
    ...prev,
    orden_id: selected ? Number(selected.value) : null
  }))
}onInputChange={(value, actionMeta) => {
  if (actionMeta.action === "input-change") {
    setSearchOt(value);
  }
}}

  options={
    ordenesTrabajo?.map(ot => ({
      value: ot.orden_compra_id,
      label: `OT#${ot.id} `
    })) || []
  }
  placeholder="Seleccione una orden de trabajo..."
  isClearable
/>


            {errores.orden_id && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.orden_id[0]}
              </p>
            )}
          </div>

          {/* FECHA */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Fecha de Entrega *
            </label>
            <input
              type="date"
              name="fecha_entrega"
              className={`w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errores.fecha_entrega ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              value={form.fecha_entrega}
              onChange={handleChange}
              required
            />
            {errores.fecha_entrega && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.fecha_entrega[0]}
              </p>
            )}
          </div>

          {/* HORA */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Hora de Entrega *
            </label>
            <input
              type="time"
              name="hora"
              className={`w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errores.hora ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              value={form.hora}
              onChange={handleChange}
              required
            />
            {errores.hora && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.hora[0]}
              </p>
            )}
          </div>

          {/* CANTIDAD */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="w-4 h-4" />
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              placeholder="Ej: 100"
              className={`w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errores.cantidad ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              value={form.cantidad}
              onChange={handleChange}
              min="0"
            />
            {errores.cantidad && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.cantidad[0]}
              </p>
            )}
          </div>

          {/* VEHÍCULO */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Truck className="w-4 h-4" />
              Vehículo *
            </label>
            <select
              name="vehiculo_id"
              className={`w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errores.vehiculo_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              value={form.vehiculo_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un vehículo...</option>
              {vehiculos?.data?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.nombre} — {v.tipo || 'Vehículo'}
                </option>
              ))}
            </select>
            {errores.vehiculo_id && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.vehiculo_id[0]}
              </p>
            )}
          </div>

          {/* USUARIO */}
       <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Usuario Responsable
            </label>
            <Select
              name="usuario_id"
              className={`w-full ${
                errores.usuario_id ? "border-red-300" : ""
              }`}
              classNamePrefix="select"
              value={
                usuarios
                  ?.map(usuario => ({
                    value: usuario.id,
                    label: `${usuario.name} `
                  }))
                  .find(opt => opt.value === form.usuario_id) || null
              }
              onChange={(selected) =>
                setForm(prev => ({ ...prev, usuario_id: selected ? selected.value : "" }))
              }
              options={
                usuarios?.map(usuario => ({
                  value: usuario.id,
                  label: `${usuario.name}`
                })) || []
              }
              placeholder="Seleccione un usuario..."
              isClearable
              isSearchable
              noOptionsMessage={() => "No se encontraron usuarios"}
              loadingMessage={() => "Cargando usuarios..."}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  padding: '8px',
                  borderRadius: '12px',
                  borderColor: errores.usuario_id ? '#fca5a5' : '#d1d5db',
                  backgroundColor: errores.usuario_id ? '#fef2f2' : 'white',
                  boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : provided.boxShadow,
                  '&:hover': {
                    borderColor: errores.usuario_id ? '#fca5a5' : '#9ca3af',
                  },
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected 
                    ? '#3b82f6' 
                    : state.isFocused 
                    ? '#eff6ff' 
                    : 'white',
                  color: state.isSelected ? 'white' : '#374151',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                }),
              }}
            />
            {errores.usuario_id && (
              <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errores.usuario_id[0]}
              </p>
            )}
          </div>

          {/* ESTADO */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Estado
            </label>
            <select
              name="estado"
              className="w-full p-3 border border-gray-300 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="pendiente">🟠 Pendiente</option>
              <option value="en_proceso">🔵 En Proceso</option>
              <option value="completada">🟢 Completada</option>
            </select>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Observaciones
          </label>
          <textarea
            name="observaciones"
            placeholder="Ingrese observaciones adicionales sobre la entrega..."
            className={`w-full p-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              errores.observaciones ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            value={form.observaciones}
            onChange={handleChange}
            rows={3}
          />
          {errores.observaciones && (
            <p className="flex items-center gap-1 text-red-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              {errores.observaciones[0]}
            </p>
          )}
        </div>

        {/* Botón de envío */}
        <div className="pt-6 border-t border-gray-200">
    <button
  type="submit"
  disabled={loading}
  className="
    w-full
    flex items-center justify-center gap-2
    px-4 py-2
    text-sm font-semibold
    text-white
    bg-blue-600
    rounded-lg
    hover:bg-blue-700
    transition-colors
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Guardando…
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      {eventToEdit ? "Actualizar" : "Guardar"}
    </>
  )}
</button>

        </div>
      </form>
    </div>
  );
}