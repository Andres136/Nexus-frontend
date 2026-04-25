import { useState } from "react";
import { gestionOperativaService } from "../../services/calidaService";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";

export const useRegisterOcComprasHistorial = () => {

    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        orden_compra_id: null,
        fecha_nueva: "",
        observacion: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🔹 setear datos cuando seleccionas orden
    const setOrden = (orden) => {
        setFormData({
            orden_compra_id: orden.orden_id,
            fecha_nueva: orden.fecha_entrega || "",
            observacion: "",
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // SUBMIT PRINCIPAL
    const handleSubmit = async (e) => {
        console.log("FormData a enviar:", formData);
        e?.preventDefault();
        setLoading(true);
        setError(null);

        try {
          const response =  await gestionOperativaService.createHistorialOrdenes(formData);
  console.log("Respuesta del servidor:", response);
            showToast("success", response.data.message );

            //  refresca tu dashboard/calendario
            queryClient.invalidateQueries(["dashboardOperativo"]);

            // limpiar
            setFormData({
                orden_compra_id: null,
                fecha_nueva: "",
                observacion: "",
            });

        } catch (err) {
            console.log("Error al actualizar la orden:", err);
            if (err.response?.status === 422) {
                setError(err.response.data.message || "Error de validación");
            } else {
                setError("Error al actualizar la orden");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        setOrden,
        handleChange,
        handleSubmit,
    };
};