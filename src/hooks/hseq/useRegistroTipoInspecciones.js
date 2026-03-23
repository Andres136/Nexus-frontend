
import { TipoInspeccionesService } from "../../services/hseqService";
import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export  const  useRegistroTipoInspecciones = () => {
    const [form, setForm] = useState({
        nombre: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

     const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setErrors({
            ...errors,
            [e.target.name]: null,
        });
    };

        const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if(form.id){
            const response = await TipoInspeccionesService.updateTipoInspeccion(form.id, form);
            showToast("success", response.data.message || "Tipo de inspección actualizado exitosamente");
            queryClient.invalidateQueries(["tipoInspecciones"]);
            setForm({ nombre: "" });
            setErrors({});
          } else {
            const response = await TipoInspeccionesService.createTipoInspeccion(form);
            showToast("success", response.data.message || "Tipo de inspección creado exitosamente");
            queryClient.invalidateQueries(["tipoInspecciones"]);
            setForm({ nombre: "" });
            setErrors({});
          }
        } catch (error) {
            console.error("Error al crear tipo de inspección:", error);
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                showToast("error", "Hubo un problema al crear el tipo de inspección");
            }
        } finally {
            setLoading(false);

        }
    };

    //Eliminar tipo de inspección
    const eliminarTipoInspeccion = async (id) => {
        if(Swal) {
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
        setLoading(true);
        try {
            const response = await TipoInspeccionesService.deleteTipoInspeccion(id);
            showToast("success", response.data.message || "Tipo de inspección eliminado exitosamente");
            queryClient.invalidateQueries(["tipoInspecciones"]);
        } catch (error) {
            console.error("Error al eliminar tipo de inspección:", error);
            showToast("error", "Hubo un problema al eliminar el tipo de inspección");
        } finally {
            setLoading(false);
        }
    }

    return{
        form,
        setForm,
        errors,
        loading,
        handleChange,
        handleSubmit,
        eliminarTipoInspeccion

    }
}