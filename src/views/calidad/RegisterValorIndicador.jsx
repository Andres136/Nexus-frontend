import { toast } from "react-toastify";
import { valoresIndicadoresApi, indicadoresApi } from "../../services/api"
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import ValoresIndicadores from "../../components/calidad/ValoresIndicadores";

export default function RegisterValorIndicador() {


  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual (1-12)
  const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual

  const [valores, setValores] = useState([]);
 const [formData, setFormData] = useState({
    indicador_id: "",
    valor: "",
    fecha: "",
    observaciones: "",
    documento: null
 });
 const [errors, setErrors] = useState({});
 const [indicadores, setIndicadores] = useState([]);
 


 useEffect(() => {
    const fetchIndicadores = async () => {
      try {
        const res = await indicadoresApi.getAll();
        setIndicadores(res.data.data || []);
      } catch (error) {
        console.error("Error fetching indicadores:", error);
      }
    };
    fetchIndicadores();
 }, []);
   // Usa useCallback para evitar recrear la función en cada render
  const fetchValores = useCallback(async () => {
    try {
      const res = await valoresIndicadoresApi.getAll({ mes, anio });
      console.log("Valores:", res.data.data);
      setValores(res.data.data || []);
    } catch (error) {
      setValores([]);
      console.error("Error fetching valores:", error);
    }
  }, [mes, anio]);

  useEffect(() => {
    fetchValores();
  }, [fetchValores]);

 const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
 };

 const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(s => ({ ...s, documento: file }));
 };

    const handleSubmit = async (e) => {
       e.preventDefault();
       const formDataToSubmit = new FormData();
      for (const key in formData) {
  if (key === "documento" && !formData.documento) continue; // No agregues si es null
  formDataToSubmit.append(key, formData[key]);
}
       try {
           const response = await valoresIndicadoresApi.create(formDataToSubmit);

           fetchValores();
            // Agrega el nuevo valor al inicio del array
            setValores(prev => [response.data.data, ...prev]);
        toast.success(response?.data?.message ?? "Valor registrado", {
            className: "bg-green-200 text-white font-bold",
            progressClassName: "bg-green-300"
        });
        setFormData({
            indicador_id: "",
            valor: "",
            fecha: "",
            observaciones: "",
            documento: null
        });
        setErrors({});
       } catch (error) {
            console.log("Error registrando valor:", error);
        if (error.response && error.response.status === 422) {
            setErrors(error.response.data.errors || {});
        } else {
            toast.error("Error registrando valor", {
                className: "bg-red-400 text-white font-bold",
                progressClassName: "bg-red-300"
            });
        }
       }
   };

  return (


<>
<div>
  <div className="bg-green-700 text-white p-4 shadow">
    <h1 className="text-2xl font-bold text-center">Registro de Valores de Indicadores</h1>
    <p className="text-center">Completa el siguiente formulario para registrar un nuevo valor.</p>
  </div>

<div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto my-6">
  
  <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md ">

 <form onSubmit={handleSubmit} className="space-y-6">
      {/* Indicador */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Indicador</label>
        <Select
          options={indicadores.map(ind => ({ value: ind.id, label: ind.nombre }))}
          value={
            indicadores.find(ind => ind.id === formData.indicador_id)
              ? {
                  value: formData.indicador_id,
                  label: indicadores.find(ind => ind.id === formData.indicador_id).nombre,
                }
              : null
          }
          onChange={selected =>
            setFormData(s => ({ ...s, indicador_id: selected ? selected.value : "" }))
          }
          placeholder="Selecciona un indicador"
        />
        {errors.indicador_id && (
          <p className="text-red-500 text-sm mt-1">{errors.indicador_id}</p>
        )}
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
        <input
        placeholder="Ejemplo: 75.5"
          type="number"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          step="any"
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.valor ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.valor && <p className="text-red-500 text-sm mt-1">{errors.valor}</p>}
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.fecha ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows="3"
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.observaciones ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.observaciones && (
          <p className="text-red-500 text-sm mt-1">{errors.observaciones}</p>
        )}
      </div>

      {/* Documento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sube un documento como analisis</label>
        <input
 
          type="file"
          name="documento"
          onChange={handleFileChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.documento ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {formData.documento && (
          <p className="text-sm text-gray-600 mt-1">Archivo: {formData.documento.name}</p>
        )}
        {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
      </div>

      {/* Botón */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
        >
          Registrar Valor
        </button>
      </div>
    </form>
    </div>

    <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md ">

      <ValoresIndicadores
      valores={valores}
      setValores={setValores}
      mes={mes}
      setMes={setMes}
      anio={anio}
      setAnio={setAnio}
       />
    
     
    </div>

</div>


</div>




</>
  )
}
