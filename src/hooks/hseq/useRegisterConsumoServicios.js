import { useState } from "react";
import { ConsumoServiciosService } from "../../services/hseqService";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export const useRegisterConsumoServicios = () => {
const [formData, setFormData] = useState({
    sede_id: "",
    tipo_servicio_id: "",
    valor_factura: "",
    consumo: "",
    fecha_consumo: "",
    fecha_pago: "",
    estado: "pendiente",



});


const [errors, setErrors] = useState({});
const[isloading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setErrors({});

    try {
     const response = await ConsumoServiciosService.createConsumoServicio(formData);
     showToast('success',response.data.message || "Consumo de servicio registrado exitosamente");
     setFormData({
        sede_id: "",
        tipo_servicio_id: "",
        valor_factura: "",
        fecha_consumo: "",
        fecha_pago: "",
        estado: "pendiente",

     });
        queryClient.invalidateQueries("consumo_servicios");
     // Aquí puedes agregar lógica adicional, como redirigir al usuario o limpiar el formulario
    } catch (error) {
        console.error("Error al registrar consumo de servicio:", error);
        setErrors({ submit: "Hubo un error al registrar el consumo del servicio. Por favor, intenta nuevamente." });
    } finally {
        setIsLoading(false);
    }
}


//Editar

const handleEdit = async (id) => {
    setIsLoading(true);
    setErrors({});

    try {
     const response = await ConsumoServiciosService.updateConsumoServicio(id, formData);
     showToast('success',response.data.message || "Consumo de servicio actualizado exitosamente");
     // Aquí puedes agregar lógica adicional, como redirigir al usuario o limpiar el formulario
        queryClient.invalidateQueries("consumo_servicios");
    } catch (error) {
        console.error("Error al actualizar consumo de servicio:", error);
        setErrors({ submit: "Hubo un error al actualizar el consumo del servicio. Por favor, intenta nuevamente." });
    } finally {
        setIsLoading(false);
    }
}

const handleDelete = async (id) => {
    setIsLoading(true);
    setErrors({});

    try {
     if(Swal){
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await ConsumoServiciosService.deleteConsumoServicio(id);
            Swal.fire('Eliminado', response.data.message || 'El consumo de servicio ha sido eliminado.', 'success');
            queryClient.invalidateQueries("consumo_servicios");
        }
     }
    } catch (error) {
        console.error("Error al eliminar consumo de servicio:", error);
        setErrors({ submit: "Hubo un error al eliminar el consumo del servicio. Por favor, intenta nuevamente." });
    } finally {
        setIsLoading(false);
    }
}

    return {
        setFormData,
        formData,
        errors,
        isloading,
        handleChange,
        handleSubmit,
        handleEdit,
        handleDelete

    }
}