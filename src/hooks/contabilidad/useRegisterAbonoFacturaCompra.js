import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { abonosFacturaCompraService } from "../../services/contabilidadService";
import { useQueryClient } from "@tanstack/react-query";

export const useRegisterAbonoFacturaCompra = (facturaId, abonoData) => {
    const[formData, setFormData] = useState({
      factura_compras_id: facturaId,
      forma_pago_id: "",
      monto: "",
      fecha_pago: "",
      observaciones: "",
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      try {
   // ===============================
// HOOK CORREGIDO
// ===============================

const response = await abonosFacturaCompraService.createAbono(
    facturaId,
    formData
);
        showToast("success", response.data.message || "Abono registrado exitosamente");
        queryClient.invalidateQueries(["registro-pago-factura", facturaId]);

        //limpiar formulario
        setFormData({
          factura_compras_id: facturaId,
          forma_pago_id: "",
          monto: "",
          fecha_pago: "",
          observaciones: "",
        });
      } catch (err) {
    console.error("Error al registrar el abono:", err);

    if (err.response?.status === 422) {
        setError(err.response.data.errors);
        showToast("error", "Errores de validación");

    } else if (err.response?.data?.message) {
        
        // 🔹 Error controlado backend (ej: saldo excedido)
        setError({
            general: [err.response.data.message]
        });

        showToast("error", err.response.data.message);

    } else {
        
        // 🔹 Error inesperado
        setError({
            general: ["Ocurrió un error al registrar el abono"]
        });

        showToast("error", "Ocurrió un error al registrar el abono");
    }

} finally {
    setIsLoading(false);
}
    }

    //Actualizar  registro de abono
    const updateAbono = async (id, data) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await abonosFacturaCompraService.updateAbono(id, data);
        showToast("success", response.data.message || "Abono actualizado exitosamente");
        queryClient.invalidateQueries(["registro-pago-factura", facturaId]);
      } catch (err) {
        console.error("Error al actualizar el abono:", err);
        if (err.response?.status === 422) {
         
          setError(err.response.data.errors);
          showToast("error", "Errores de validación");
        } else {
          setError({ general: ["Ocurrió un error al actualizar el abono"] });
          showToast("error", "Ocurrió un error al actualizar el abono");
        }
      } finally {
        setIsLoading(false);
      }
    }

    return{
        formData,
        error,
        isLoading,
        handleChange,
        handleSubmit,
        setFormData,
        updateAbono,  
    }
}