import { useState } from "react";
import { GeneracionResiduosService } from "../../services/hseqService";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export const useRegisterGeneracionResiduos = () => {

    const [formData, setFormData] = useState({
        tipo_residuo_id: '',
        sede_id: '',
        cantidad: '',
        fecha: '',
        unidad_medida: '',
        observaciones: '',
    });
const [error , setError] = useState(null);
const [loading, setLoading] = useState(false);
const queryClient = useQueryClient();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await GeneracionResiduosService.createGeneracionResiduo(formData);
         showToast('success', response.data.message || 'Generación de residuo registrada exitosamente');
             queryClient.invalidateQueries("generacion_residuos");
         setFormData({
            tipo_residuo_id: '',
            sede_id: '',
            cantidad: '',
            fecha: '',
            unidad_medida: '',
            observaciones: '',
        });
    
    } catch (error) {
            if (error.response?.status === 422) {
                setError(error.response.data.errors);
            } else {
                showToast("error", error.response?.data?.message || "Hubo un problema al crear el tipo de residuo");
            }
    } finally {
        setLoading(false);
    }
  };


   //ACTUALIZAR

   const handleUpdate = async (e,id) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await GeneracionResiduosService.updateGeneracionResiduo(id, formData);
         showToast('success', response.data.message || 'Generación de residuo actualizada exitosamente');
         setFormData({
            tipo_residuo_id: '',
            sede_id: '',
            cantidad: '',
            fecha: '',
            unidad_medida: '',
            observaciones: '',
        });
                queryClient.invalidateQueries("generacion_residuos");
    } catch (error) {
            if (error.response?.status === 422) {
                setError(error.response.data.errors);
            } else {
                showToast("error", error.response?.data?.message || "Hubo un problema al actualizar el tipo de residuo");
            }
    } finally {
        setLoading(false);
    }
  };

  // Eliminar

  const handleDelete = async (id) => {
    setLoading(true);
    try {
       if(Swal){
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!'
          });
      
          if (result.isConfirmed) {
            const response = await GeneracionResiduosService.deleteGeneracionResiduo(id);
             showToast('success', response.data.message );
          }
       }
    } catch (error) {
                showToast("error", error.response?.data?.message || "Hubo un problema al eliminar el tipo de residuo");
    } finally {
        setLoading(false);
    }
  };



    return {
      setFormData,  
     formData,
     handleChange,
     handleSubmit,
     handleUpdate,
     handleDelete,
     error,
     loading


    }
}