import Swal from "sweetalert2";
import { showToast } from "../../helpers/utils/showToast";
import { cuentasContablesService } from "../../services/contabilidadService";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useRegisterPuck = () => {
    const[puck, setPuck] = useState({
        nombre: "",
        numero: "",
        naturaleza: "",
        descripcion: "",
        dinamica: "",
        permite_movimiento: true,
        activo: true,
    });
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(null);
    const queryClient = useQueryClient();

   const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPuck({
      ...puck,
      [name]: type === "checkbox" ? checked : value,
    });

    if (error?.[name]) {
      const newErrors = { ...error };
      delete newErrors[name]; // 👈 elimina el error del campo
      setError(newErrors);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

       const response = await cuentasContablesService.createCuentaContable(puck);
       showToast("success", response.data.message || "Puck creado exitosamente");
        queryClient.invalidateQueries(["pucks"]);
       setPuck({
         nombre: "",
         numero: "",
         naturaleza: "",
         descripcion: "",
         dinamica: "",
         permite_movimiento: true,
         activo: true,
       });
       return true;

    } catch (err) {
    
 if (err.response?.status === 422) {
  setError(err.response.data.errors); // 👈 AQUÍ está la magia
  showToast("error", "Errores de validación");
} else {
  setError({ general: ["Ocurrió un error al crear el puck"] });
  showToast("error", "Ocurrió un error al crear el puck");
}
      return false;
    } finally {

      setLoading(false);
    }
  }

   //ACTUALIZAR PUCK
  const handleUpdate = async (id) => {
  try {
    setLoading(true);
    setError(null); 
    const response = await cuentasContablesService.updateCuentaContable(id, puck);
    
    showToast("success", response.data.message || "Puck actualizado exitosamente");
    queryClient.invalidateQueries(["pucks"]);
    return true;
    } catch (err) {
        console.error("Error al actualizar el puck:", err);
        if (err.response && err.response.data && err.response.data.message) {
            setError({ general: [err.response.data.message] });
            showToast("error", err.response.data.message);
        } else {
            setError({ general: ["Ocurrió un error al actualizar el puck"] });
            showToast("error", "Ocurrió un error al actualizar el puck");
        }
        return false;
    } finally {
        setLoading(false);
    }
  }

   //ELIMINAR PUCK  con Swal
    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: "¿Estás seguro?",
                text: "¡Esta acción no se puede deshacer!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            });

            if (result.isConfirmed) {
                 const response = await cuentasContablesService.deleteCuentaContable(id);
 
                 showToast("success", response.data.message || "Puck eliminado exitosamente");
                 queryClient.invalidateQueries(["pucks"]);
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError({ general: [err.response.data.message] });
                showToast("error", err.response.data.message);
            } else {
                setError({ general: ["Ocurrió un error al eliminar el puck"] });
                showToast("error", "Ocurrió un error al eliminar el puck");
            }
        }
    }

    return{

        puck,
        setPuck,
        loading,
        error,
        handleChange,
        handleSubmit,
        handleUpdate,
        handleDelete,
    }
}
