import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { impuestosService } from "../../services/contabilidadService";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

export const useRegisterImpuesto = ()=>{
const [impuesto, setImpuesto] = useState({
    "nombre": "",
    "porcentaje": "",
    "operacion": "suma",

});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const queryClient = useQueryClient();

const handleChange = (e) => {
  const { name, value } = e.target;

  setImpuesto({
    ...impuesto,
    [name]: value,
  });

  if (error?.[name]) {
    const newErrors = { ...error };
    delete newErrors[name]; // 👈 elimina el error del campo
    setError(newErrors);
  }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

       const response = await  impuestosService.createImpuesto(impuesto);
       showToast("success", response.data.message || "Impuesto creado exitosamente");
        queryClient.invalidateQueries(["impuestos"]);
       setImpuesto({
         nombre: "",
         porcentaje: "",
         operacion: "suma",
       });

    } catch (err) {
    
 if (err.response?.status === 422) {
  setError(err.response.data.errors); // 👈 AQUÍ está la magia
  showToast("error", "Errores de validación");
} else {
  setError({ general: ["Ocurrió un error al crear el impuesto"] });
  showToast("error", "Ocurrió un error al crear el impuesto");
}
    } finally {

      setLoading(false);
    }
  }
     //ACTUALIZAR IMPUESTO
  const handleUpdate = async (id) => {
  try {
    setLoading(true);
    setError(null);

    const response = await impuestosService.updateImpuesto(id, impuesto);

    showToast("success", response.data.message || "Impuesto actualizado exitosamente");
    queryClient.invalidateQueries(["impuestos"]);

  } catch (err) {
     if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        showToast("error", err.response.data.message);
      } else {
        setError("Ocurrió un error al actualizar el impuesto");
        showToast("error", "Ocurrió un error al actualizar el impuesto");
      }
  } finally {
    setLoading(false);
  }
};

//Eliminar impuesto
const handleDelete = async (id) => {
  try {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      setLoading(true);
      setError(null);

      const response = await impuestosService.deleteImpuesto(id);

      showToast("success", response.data.message || "Impuesto eliminado exitosamente");
      queryClient.invalidateQueries(["impuestos"]);
    }
  } catch (err) {
     if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        showToast("error", err.response.data.message);
      } else {
        setError("Ocurrió un error al eliminar el impuesto");
        showToast("error", "Ocurrió un error al eliminar el impuesto");
      }
  } finally {
    setLoading(false);
  }
};
    return{
      setImpuesto,
        impuesto,
        loading,
        error,
        handleChange,
        handleSubmit,
        handleUpdate,
        handleDelete
    }
}
