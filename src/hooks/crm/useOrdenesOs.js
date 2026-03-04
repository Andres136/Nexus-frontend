
import {useState } from "react";
import { ordenesServicioApi } from "../../services/api";
import  { showToast } from "../../helpers/utils/showToast"

export const useOrdenesOs = () => {

    const [formData, setFormData] = useState({
     empresa: '',
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


  const handleSubmit = async (e) => {
    console.log("Datos del formulario al enviar:", formData);
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Aquí iría la lógica para enviar el formulario, por ejemplo:
       const response = await ordenesServicioApi.create(formData);
       showToast("success", response.data.message || "Orden de servicio creada exitosamente");
     setPdfUrl(response.data.pdf_url || null);
      // Si quieres actualizar la lista de órdenes después de crear una nueva:
      setObtenerOrdenes(prev => [...prev, response.data.data]);
    } catch (error) {
        console.error("Error al enviar el formulario:", error);
      console.error("Error al crear la orden:", error);
      if(error.response?.status === 422){
        setError(error.response.data.errors || {});
      }else{
        console.error("Error inesperado:", error);
      }
    } finally {
      setLoading(false);
    } 
  }
//Obtener  productos por id en detalles cantidades

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
        setPdfUrl
   
    }
}
