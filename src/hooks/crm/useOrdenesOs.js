
import {useState } from "react";
import { ordenesServicioApi } from "../../services/api";
import  { showToast } from "../../helpers/utils/showToast"

export const useOrdenesOs = () => {

    const [formData, setFormData] = useState({
      id: null,
     empresa_id: null,
     fecha: '',
     estado: '',
     proveedor_id: null,
     observaciones: '',
     detalles: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const[obtenerOrdenes, setObtenerOrdenes] = useState([]);
    const [productosbyId, setProductosbyId] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);

const limpiarDetalles = (detalles) => {
  return detalles.map(det => ({
    id: det.id || null,
    orden_compra_detalle_id: det.orden_compra_detalle_id,
    cantidad: det.cantidad,
    // agrega aquí solo lo que tu backend necesita
  }));
};
const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError({});

  try {
    const payload = {
      empresa_id: formData.empresa_id,
      proveedor_id: formData.proveedor_id,
      fecha: formData.fecha,
      estado: formData.estado,
      observaciones: formData.observaciones,

      detalles: limpiarDetalles(formData.detalles)
    };

    const response = await ordenesServicioApi.create(payload);

    showToast("success", response.data.message || "Orden creada");

    setPdfUrl(response.data.pdf_url || null);
    setObtenerOrdenes(prev => [...prev, response.data.data]);

    return response.data;

  } catch (error) {
    if (error.response?.status === 422) {
      const erroresBackend = error.response.data.errors || {};
      setError(erroresBackend);
      showToast("error", error.response.data.message || "Revisa los campos del formulario");
    } else {
      showToast("error", "Error al crear la orden");
    }
    return null;

  } finally {
    setLoading(false);
  }
};

const obtenerProductosPorId = async (id) => {
    try {
        const response = await ordenesServicioApi.getById(id);
        console.log("Respuesta de obtener productos por ID:", response.data);
     setProductosbyId(response.data.data || []);
    } catch (error) {
        console.error("Error al obtener productos por ID:", error);
        return [];
    }
}


    return{
        formData,
        setFormData,
        loading,
        setLoading,
        handleSubmit,
        error,
        setError,
        obtenerOrdenes,
        setObtenerOrdenes,
        productosbyId,
        obtenerProductosPorId,
        pdfUrl,
        setPdfUrl,
   
   
    }
}
