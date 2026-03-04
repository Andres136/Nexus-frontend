import { useCallback, useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import DetallesOrdenCompraProveedores from "../../components/crm/DetallesOrdenCompraProveedores";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useEmpresas } from "../../hooks/useEmpresas";




export default function FormOrdenesProveedores() {

  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();
  const { empresas } = useEmpresas();
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});

  const [formData, setFormData] = useState({
    proveedor_id: "",
    empresa_id: "",
    observaciones: "",
    bodega_id: "",
    detalles: [],
  });

  /*Función para actualizar los datos del formulario PARA OBSERVACIONES
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };*/
  // Función para actualizar los detalles desde `OrdenCompraMultiItem`
  const handleDetallesChange = useCallback((detallesActualizados) => {
    setFormData((prevData) => ({
      ...prevData,
      detalles: detallesActualizados,
    }));
  }, []);



  // Función para enviar la orden al backend
  const enviarOrden = async () => {
    setErrores({});
    setErroresDetalles({});

   
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.post(
        "/api/ordenes-compra-proveedor",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  const orden = response.data; // 👈 aquí obtienes la orden
      toast.success(response.data.message);
      
      console.log(response.data);
      // Asegúrate de que el backend devuelva el ID correcto
      navigate(`/auth/crm/ordenes-proveedor-preview/${orden.id}`);

      //limpiar el formulario
      setFormData({
        proveedor_id: "",
        fecha: "",
        numero_orden: "",
        observaciones: "",
        bodega_id: "",
        detalles: [],
      });
      setErrores({});
      setErroresDetalles({});
  
    } catch (error) {
      console.error("Error al crear la orden de compra:", error);
      if (error.response && error.response.status === 422) {
        setErrores(error.response.data.errors);
       // 🔧 Parsear errores de detalles
  const detallesErr = {};
  Object.entries(error.response.data.errors).forEach(([key, value]) => {
    if (key.startsWith("detalles.")) {
      const [, index, campo] = key.split(".");
      if (!detallesErr[index]) detallesErr[index] = {};
      detallesErr[index][campo] = value;
    }
  });

  setErroresDetalles(detallesErr);
      }
    }
  };


  // Cargar proveedores con cancelación
    useEffect(() => {
      const ac = new AbortController();
      const fetchProveedores = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await clienteAxios.get("/api/proveedores-all", {
            
            headers: { Authorization: `Bearer ${token}` },
            signal: ac.signal,
          });
    
          const opciones = res.data.proveedores.map((p) => ({
            value: p.id,
            label: p.nombre,
          }));
     
          setProveedores(opciones);
        } catch (err) {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            toast.error("Error al cargar proveedores");
          }
        }
      };
      fetchProveedores();
      return () => ac.abort();
    }, []);





    

  return (
    <div className="grid grid-cols-1 bg-white rounded-xl">
 <div className="text-left">
  <Link
    to="/auth/crm/proveedores"
    className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm w-fit"
  >
    ← Volver
  </Link>
</div>

      <div className="col-span-1">
      <h2 className="text-2xl font-bold mb-4">Registrar orden de Compra</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Proveedor
          </label>
        <Select
  name="proveedor_id"
  options={proveedores}
  value={proveedores.find((p) => p.value === formData.proveedor_id)}
  onChange={(selected) =>
    setFormData({ ...formData, proveedor_id: selected.value })
  }
  classNamePrefix="react-select"
  styles={{
    control: (base, state) => ({
      ...base,
      borderColor: errores.proveedor_id ? "rgb(239 68 68)" : "rgb(209 213 219)", // rojo o gris
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : base.boxShadow,
      "&:hover": {
        borderColor: state.isFocused
          ? "#2563eb"
          : errores.proveedor_id
          ? "rgb(239 68 68)"
          : "rgb(156 163 175)",
      },
    }),
  }}
/>
{errores.proveedor_id && (
  <p className="text-red-500 text-sm">{errores.proveedor_id[0]}</p>
)}

       
        </div>

     
    
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Seleciona una empresa
          </label>
        
        <Select
  name="empresa_id"
  options={empresas.map((e) => ({
    value: e.id,
    label: e.nombre,
  }))}
  value={empresas
    .map((e) => ({ value: e.id, label: e.nombre }))
    .find((e) => e.value === formData.empresa_id)}
  onChange={(selected) =>
    setFormData({ ...formData, empresa_id: selected.value })
  }
  classNamePrefix="react-select"
  styles={{
    control: (base, state) => ({
      ...base,
      borderColor: errores.empresa_id ? "rgb(239 68 68)" : "rgb(209 213 219)", // rojo o gris
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : base.boxShadow,
      "&:hover": {
        borderColor: state.isFocused
          ? "#2563eb"
          : errores.empresa_id
          ? "rgb(239 68 68)"
          : "rgb(156 163 175)",
      },
    }),
  }}
/>
{errores.empresa_id && (
  <p className="text-red-500 text-sm">{errores.empresa_id[0]}</p>
)}
   </div>


        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={(e) =>
              setFormData({ ...formData, observaciones: e.target.value })
            }
            className={`w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${
              errores && errores.observaciones ? "border-red-500" : ""
            }`}
            rows={3}
          ></textarea>
          {errores?.observaciones && (
            <p className="text-red-500 text-sm mt-1">{errores.observaciones[0]}</p>
          )}
        </div>
      </div>
      
      <DetallesOrdenCompraProveedores
        onChange={handleDetallesChange}
        errores={erroresDetalles}
      />
      <div className="mt-6">
        <button
          onClick={enviarOrden}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
        >
          Guardar Orden
        </button>
      </div>
      </div>
    </div>
  );
}
