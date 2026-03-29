import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { TipoServiciosService } from "../../services/hseqService";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export const useRegisterTipoServicios = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        unidad_medida: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        setError(null);

        try {
            const  response = await TipoServiciosService.createTipoServicio(formData);
            console.log("Datos enviados:", formData);
            showToast("success", response.data.message || "Tipo de servicio creado exitosamente");
            setFormData({
                nombre: "",
                descripcion: "",
                unidad_medida: "",
            });
            queryClient.invalidateQueries(["tipoServicios"]);
        } catch (error) {
            console.error("Error al crear el tipo de servicio:", error);
            if (error.response?.status === 422) {
                setError(error.response.data.errors);
            } else {
                showToast("error", "Hubo un problema al crear el tipo de servicio");
            }
        } finally {
            setLoading(false);
        }
    }

//fUNCION PARA EL ACTUALIZAR LOS TIPOS DE SERVICIOS

const handleUpdate = async (e, id) => {
   
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await TipoServiciosService.updateTipoServicio(id, formData);
        showToast("success", response.data.message || "Tipo de servicio actualizado exitosamente");

        setFormData({
            nombre: "",
            descripcion: "",
            unidad_medida: "",
        });

        queryClient.invalidateQueries(["tipoServicios"]);
    } catch (error) {
        if (error.response?.status === 422) {
            setError(error.response.data.errors);
        } else {
            showToast("error", "Hubo un problema al actualizar el tipo de servicio");
        }
    } finally {
        setLoading(false);
    }
};


//ELIMINAR TIPO DE SERVICIO
const handleDelete = async (id) => {
       if (Swal) {
          const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
          });
    
          if (!result.isConfirmed) {
            return;
          }
        
        }

    try {
        await TipoServiciosService.deleteTipoServicio(id);
        Swal.fire("Eliminado", "El tipo de servicio ha sido eliminado.", "success");
        queryClient.invalidateQueries(["tipoServicios"]);
    } catch (error) {
        console.error("Error al eliminar el tipo de servicio:", error);
        showToast("error", "Hubo un problema al eliminar el tipo de servicio");
}
}
    return {
        setFormData,
        formData,
        loading,
        error,
        handleChange,
        handleSubmit,
        handleUpdate,
        handleDelete,
    }
}