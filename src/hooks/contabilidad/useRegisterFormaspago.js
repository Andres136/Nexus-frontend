import { useState } from "react";
import { formasPagoService } from "../../services/contabilidadService";
import { showToast } from "../../helpers/utils/showToast";
import {  useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
export const useRegisterFormaspago = (id) => {
  const [formaPago, setFormaPago] = useState({
    "nombre": "",
    
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();


const handleChange = (e) => {
    setFormaPago({
      ...formaPago,
      [e.target.name]: e.target.value,
    });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

       const response = await formasPagoService.createFormaPago(formaPago);
       showToast("success", response.data.message || "Forma de pago creada exitosamente");
         queryClient.invalidateQueries(["formasPago"]);
       setFormaPago({
         nombre: "",
       });

    } catch (err) {
     if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        showToast("error", err.response.data.message);
      } else {
        setError("Ocurrió un error al crear la forma de pago");
        showToast("error", "Ocurrió un error al crear la forma de pago");
      }
    } finally {

      setLoading(false);
    }
  }

  //Actualizar forma de pago
  const handleUpdate = async (id) => {
  try {
    setLoading(true);
    setError(null);

    const response = await formasPagoService.updateFormaPago(id, formaPago);

    showToast("success", response.data.message || "Forma de pago actualizada exitosamente");

    queryClient.invalidateQueries({ queryKey: ["formasPago"] });

    setFormaPago({
      nombre: "",
    });

  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
      showToast("error", err.response.data.message);
    } else {
      setError("Ocurrió un error al actualizar la forma de pago");
      showToast("error", "Ocurrió un error al actualizar la forma de pago");
    }
  } finally {
    setLoading(false);
  }
};

    //Eliminar forma de pago Swal y lógica para eliminar forma de pago aquí
const handleDelete = async (id) => {
  try {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo!",
    });

    if (result.isConfirmed) {
      await formasPagoService.deleteFormaPago(id);

      await Swal.fire("Eliminado!", "La forma de pago ha sido eliminada.", "success");

      // 🔥 refrescar tabla
      queryClient.invalidateQueries({ queryKey: ["formasPago"] });
    }

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo eliminar", "error");
  }
};

  return{
    formaPago,
    loading,
    error,
    handleSubmit,
    handleChange,
    handleUpdate,
    handleDelete,
  }
}