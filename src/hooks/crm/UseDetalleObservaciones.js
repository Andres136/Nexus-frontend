import { useState } from "react";
import { ordenesCompraProveedoresApi } from "../../services/api";
import { useEntregasProveedores } from "../useEntregasProveedores";
import {showToast} from "../../helpers/utils/showToast";


 export const  useDetalleObservaciones = () => {
   const [formData, setFormData] = useState({
    orden_detalle_id:null,
    observacion: '',
    proceso_bolsas_id: null,
    proveedor_id: null,
    estado: null
   });
   const {proveedoresAll, procesos}=useEntregasProveedores();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ordenesCompraProveedoresApi.createObservacion(formData);

       showToast('success', response.data.message);
       //Limpiar formulario
       setFormData({
         orden_detalle_id: null,
         observacion: '',
         proceso_bolsas_id: null,
         proveedor_id: null,
         estado: null
       });
    } catch (error) {
        console.error("Error al crear la observación:", error);
     if(error.response?.status === 422){
      setError(error.response.data.errors || {});
     }else{
      console.error("Error inesperado:", error);
     }
   
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, loading, error, handleSubmit, proveedoresAll, procesos };
};
