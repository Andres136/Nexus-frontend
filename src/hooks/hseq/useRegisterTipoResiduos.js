import { useState } from "react";
import { TipoResiduosService } from "../../services/hseqService";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";


export const useRegisterTipoResiduos = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",

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
            // Aquí iría la lógica para enviar los datos al backend
            const response = await TipoResiduosService.createTipoResiduo(formData);
         //   console.log("Datos enviados:", formData);
            showToast("success", response.data.message || "Tipo de residuo creado exitosamente");
            queryClient.invalidateQueries(["tipoResiduos"]);
            setFormData({
                nombre: "",
                descripcion: "",
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
    }


    const handleUpdate = async (e, id) => {
     //   console.log("ID para actualización:", id);
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await TipoResiduosService.updateTipoResiduo(id, formData);
            console.log("Datos enviados para actualización:", formData);
            showToast("success", response.data.message);
            queryClient.invalidateQueries(["tipoResiduos"]);
        } catch (error) {
            console.log("Error al actualizar el tipo de residuo:", error);
            if (error.response?.status === 422) {
                setError(error.response.data.errors);
            } else {
                showToast("error", error.response?.data?.message || "Hubo un problema al actualizar el tipo de residuo");
            }
        } finally {
            setLoading(false);
        }
    }


    // Función para eliminar un tipo de residuo
    const handleDelete = async (id) => {
       // console.log("ID para eliminación:", id);
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

            try {
                await TipoResiduosService.deleteTipoResiduo(id);
                Swal.fire("Eliminado", "El tipo de residuo ha sido eliminado.", "success");
                queryClient.invalidateQueries(["tipoResiduos"]);
            } catch (error) {
                console.error("Error al eliminar el tipo de residuo:", error);
                showToast("error", error.response?.data?.message || "Hubo un problema al eliminar el tipo de residuo");
            }


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