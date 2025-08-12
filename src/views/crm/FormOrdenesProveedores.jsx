import { useCallback, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useProveedores } from "../../hooks/useProveedores";
import DetallesOrdenCompraProveedores from "../../components/crm/DetallesOrdenCompraProveedores";
import { Link } from "react-router-dom";


export default function FormOrdenesProveedores() {
  
  const { proveedores } = useProveedores();
   
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});
  const [formData, setFormData] = useState({
    proveedor_id: "",
    fecha: "",
    numero_orden: "",
    observaciones: "",

    detalles: [],
  });

  // Función para actualizar los datos del formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
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

    console.log("Enviando orden:", formData);
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.post(
        "/api/ordenes-compra-proveedor",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message);
      console.log(response.data);
      //limpiar el formulario
      setFormData({
        proveedor_id: "",
        fecha: "",
        numero_orden: "",
        observaciones: "",
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
          <select
            name="proveedor_id"
            value={formData.proveedor_id}
            onChange={handleInputChange}
            className={`border ${
              errores.proveedor_id ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 w-full`}
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.data?.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
          {errores.proveedor_id && (
            <p className="text-red-500 text-sm">{errores.proveedor_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Fecha 
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className={`border ${
              errores.fecha ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 w-full`}
          />
          {errores.fecha && (
            <p className="text-red-500 text-sm">{errores.fecha[0]}</p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Número de Orden
          </label>
          <input
            type="text"
            name="numero_orden"
            value={formData.numero_orden}
            onChange={handleInputChange}
            className={`border ${
              errores.numero_orden ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 w-full`}
          />
          {errores.numero_orden && (
            <p className="text-red-500 text-sm">{errores.numero_orden[0]}</p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Seleciona una empresa
          </label>
        
  <select
    name="observaciones"
    value={formData.observaciones ?? ""}
    onChange={handleInputChange}
    className={`border ${
      errores.observaciones ? "border-red-500" : "border-gray-300"
    } rounded-md p-2 w-full bg-white`}
  >
    <option value="">Seleccione…</option>
    <option value="SETASPLAST">Setasplast</option>
    <option value="GLOBAL">Global</option>
  </select>

  {errores.observaciones && (
    <p className="text-red-500 text-sm">{errores.observaciones[0]}</p>
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
