


import { useCallback, useState, useEffect } from "react";
import OrdenCompraMultiItem from "../../components/crm/OrdenCompraMultiItem";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useClientes } from "../../hooks/useClientes";
import { Link, useParams } from "react-router-dom";
import Select from 'react-select';

export default function OrdenCompraForm({ modo }) {
  const { id } = useParams();
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});
  const { clientesTodos, setBusqueda, busqueda } = useClientes();

  const [formData, setFormData] = useState({
    fecha_entrega: "",
    cliente_id: "",
    ubicacion_entrega: "",
    observaciones: "",
    detalles: [],
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDetallesChange = useCallback((detallesActualizados) => {
    setFormData((prevData) => ({
      ...prevData,
      detalles: detallesActualizados,
    }));
  }, []);

  useEffect(() => {
    if (modo === "edicion" && id) {
      const obtenerOrden = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await clienteAxios.get(  `/api/orden-compras/${id}/edit`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const datos = response.data;
  
          // ✅ Aquí va tu setFormData completo
          setFormData({
            fecha_entrega: datos.fecha_entrega,
            cliente_id: datos.cliente_id,
            ubicacion_entrega: datos.ubicacion_entrega,
            observaciones: datos.observaciones,
            detalles: datos.detalles.map(detalle => ({
              id: detalle.id,
              largo_cm: detalle.largo_cm,
              ancho_cm: detalle.ancho_cm,
              calibre: detalle.calibre,
              cantidad: detalle.cantidad,
              cantidad_enviada: detalle.cantidad_enviada,
              faltantes: detalle.faltantes,
              valor_unitario: detalle.valor_unitario,
              peso_bolsa: detalle.peso_bolsa,
              numero_bolsas: detalle.numero_bolsas,
              cliente_clb: detalle.cliente_clb,
              cantidad_requerida_kg: detalle.cantidad_requerida_kg,
              descripcion: detalle.descripcion,
              observaciones: detalle.observaciones,
              valor_total: detalle.valor_total,
            })),
          });
          
  
        } catch (error) {
          console.error("Error al obtener la orden:", error);
          toast.error("Error al cargar la orden para editar.");
        }
      };
  
      obtenerOrden();
    }
  }, [modo, id]);
  

  const enviarOrden = async () => {
    setErrores({});
    setErroresDetalles({});
    try {
      const token = localStorage.getItem("token");
   
      const response = modo === "edicion"
        ? await clienteAxios.put(`/api/orden-compras/${id}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
            
          })
          
        : await clienteAxios.post("/api/orden-compras", formData, {
            headers: { Authorization: `Bearer ${token}` },
          });

      toast.success(response.data.message);
      const ordenId = response.data.orden_compra_id || id;

      // Descargar PDF
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL}/api/orden-compras/${encodeURIComponent(ordenId)}/pdf`;

      link.setAttribute('download', `orden_compra_${ordenId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (modo !== "edicion") {
        setFormData({
          fecha_entrega: "",
          cliente_id: "",
          ubicacion_entrega: "",
          observaciones: "",
          detalles: [],
        });
      }
    } catch (error) {
      console.error("Error al enviar la orden:", error);
      if (error.response && error.response.data.errors) {
        console.log("Error de backend:", error.response.message);
        const backendErrors = error.response.data.errors;
        const erroresDetalles = {};
        const erroresGenerales = {};

        Object.keys(backendErrors).forEach((key) => {
          const mensajeError = backendErrors[key][0];

          if (key.startsWith("detalles.")) {
            const [, index, field] = key.split(".");
            if (!erroresDetalles[index]) {
              erroresDetalles[index] = {};
            }
            erroresDetalles[index][field] = mensajeError;
          } else {
            erroresGenerales[key] = mensajeError;
          }
        });

        setErrores(erroresGenerales);
        setErroresDetalles(erroresDetalles);
      } else {
        toast.error("Ocurrió un error al enviar la orden.");
      }
    }
  };
  // dentro del componente…
const opcionesClientes = clientesTodos.map(c => ({
  value: c.id,
  label: c.nombre
}));


  return (
    <div className="p-6 bg-white rounded-xl">
   <h2 className="text-2xl font-bold mb-4">
  {modo === "edicion" ? "Editar Orden de Compra" : "Crear Orden de Compra"}
</h2>

<div className="flex gap-2 mb-4">
  <Link
    to="/auth/crm/mis-ordenes"
    className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded transition"
  >
    ← Mis Órdenes
  </Link>

  <Link
    to="/auth/crm/cotizaciones"
    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition"
  >
    📄 Crear Cotizaciones
  </Link>
</div>



      <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
        Fecha de Entrega
        </label>
        <input
        type="date"
        name="fecha_entrega"
        value={formData.fecha_entrega}
        onChange={handleInputChange}
        className="w-full border border-gray-300 px-2 py-1 rounded"
        />
        {errores.fecha_entrega && (
        <span className="text-sm text-red-500">{errores.fecha_entrega}</span>
        )}
      </div>

      <div>
    <label className="block font-semibold">Cliente:</label>
    <Select
      options={opcionesClientes}
      // marca la opción actual según formData.cliente_id
      value={opcionesClientes.find(o => o.value === formData.cliente_id) || null}
      // onChange actualiza formData.cliente_id
      onChange={opt => {
        setFormData(f => ({ ...f, cliente_id: opt ? opt.value : '' }));
      }}
      isClearable
      placeholder="Busca o selecciona un cliente…"
      className="mt-1"
    />
    {errores.cliente_id && (
      <p className="text-red-600 text-sm">{errores.cliente_id}</p>
    )}
  </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
        Ubicación de Entrega
        </label>
        <input
        type="text"
        name="ubicacion_entrega"
        placeholder="Dirección de entrega y número de contacto"
        value={formData.ubicacion_entrega}
        onChange={handleInputChange}
        className="w-full border border-gray-300 px-2 py-1 rounded"
        />
        {errores.ubicacion_entrega && (
        <span className="text-sm text-red-500">{errores.ubicacion_entrega}</span>
        )}
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
        Observaciones
        </label>
        <textarea
        name="observaciones"
        value={formData.observaciones}
        placeholder="Información adicional sobre la orden"
        onChange={handleInputChange}
        className="w-full border border-gray-300 px-2 py-1 rounded"
        />
        {errores.observaciones && (
        <span className="text-sm text-red-500">{errores.observaciones}</span>
        )}
      </div>

      <div className="col-span-2">
        <OrdenCompraMultiItem
        onDetallesChange={handleDetallesChange}
        errores={erroresDetalles}
        value={formData.detalles}
        />
      </div>
      </div>

      <div className="flex justify-end mt-4">
      <div className="flex justify-end mt-4">
  {modo !== "edicion" && (
    <button
      onClick={enviarOrden}
      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-gray-600"
    >
      Guardar Orden de Compra
    </button>
  )}
</div>

      </div>
    </div>
    );
}

