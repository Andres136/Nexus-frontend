import { useState, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import { showToast } from "../helpers/utils/showToast";

export const useTrasladoInventario = () => {
  const { envioInternoOc, errors, setErrors, urlPDF } = useContext(ProductContext);

  const [formData, setFormData] = useState({
    empresa_id: "",
    sede_destino_id: "",
    ordenes_compra: [],
    notas: "",
    detalles: [
      {
        item: 0,
        orden_compra_id: "",
        product_id: "",
        descripcion: "",
        code_id: "",
        bodegas: [{ bodega_id: "", cantidad: "" }],
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ Manejar cambios en campos de detalle
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedDetalles = [...formData.detalles];
    updatedDetalles[index][name] = value;
    setFormData({ ...formData, detalles: updatedDetalles });
  };

  // ✅ Manejar cambios en bodegas
  const handleBodegaChange = (detalleIndex, bodegaIndex, field, value) => {
    const updatedDetalles = [...formData.detalles];
    updatedDetalles[detalleIndex].bodegas[bodegaIndex][field] = value;
    setFormData({ ...formData, detalles: updatedDetalles });
  };

  // ✅ Agregar bodega a un detalle
  const addBodega = (detalleIndex) => {
    const updatedDetalles = [...formData.detalles];
    updatedDetalles[detalleIndex].bodegas.push({ bodega_id: "", cantidad: "" });
    setFormData({ ...formData, detalles: updatedDetalles });
  };

  // ✅ Agregar nuevo detalle/producto
  const addDetalle = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          item: formData.detalles.length + 1,
          orden_compra_id: "",
          product_id: "",
          code_id: "",
          descripcion: "",
          bodegas: [{ bodega_id: "", cantidad: "" }],
        },
      ],
    });
  };

  // ✅ Eliminar detalle/producto
  const removeDetalle = (index) => {
    if (formData.detalles.length > 1) {
      const updatedDetalles = formData.detalles.filter((_, i) => i !== index);
      setFormData({ ...formData, detalles: updatedDetalles });
    }
  };

  // ✅ Eliminar bodega de un detalle
  const removeBodega = (detalleIndex, bodegaIndex) => {
    const updatedDetalles = [...formData.detalles];
    if (updatedDetalles[detalleIndex].bodegas.length > 1) {
      updatedDetalles[detalleIndex].bodegas = updatedDetalles[detalleIndex].bodegas.filter(
        (_, i) => i !== bodegaIndex
      );
      setFormData({ ...formData, detalles: updatedDetalles });
    }
  };

  // ✅ Actualizar campo principal del formulario
  const updateFormField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ✅ Resetear formulario
  const resetForm = () => {
    setFormData({
      empresa_id: "",
      sede_destino_id: "",
      ordenes_compra: [],
      notas: "",
      detalles: [
        {
          item: 1,
          orden_compra_id: "",
          product_id: "",
          descripcion: "",
          code_id: "",
          bodegas: [{ bodega_id: "", cantidad: "" }],
        },
      ],
    });
    setErrors({});
  };

  

  // ✅ Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    setIsLoading(true);
    
    try {
  const payload ={
      ...formData,
      detalles: formData.detalles.map((d, i)=>({
        ...d, item: i + 1
      }))
      
  }
     
      const result = await envioInternoOc(payload);

      showToast("success", "Traslado de inventario enviado con éxito.");
    //  console.log("✅ Envío exitoso:", result);
      
      // Resetear formulario después del éxito
      resetForm();
      
      return { success: true, data: result };
    } catch (error) {
 
      return { success: false, error };
      
    } finally {
      setIsLoading(false);
    }
  };

 

  return {
    // Estado
    formData,
    errors,
    isLoading,
    urlPDF,
    
    // Funciones de manejo
    handleChange,
    handleBodegaChange,
    addBodega,
    addDetalle,
    removeDetalle,
    removeBodega,
    updateFormField,
    resetForm,
    handleSubmit,
    
  
 
  };
};