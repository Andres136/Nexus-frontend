import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { seguimentoHallazgosService } from "../../services/calidaService";
import { useQueryClient } from "@tanstack/react-query";


export const useRegisterSeguimientoHallazgo = (hallazgoId) => {

    const [formData, setFormData] = useState({
        hallazgo_id: hallazgoId || null,
        observacion: "",
   
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();
    // 🔹 Manejar cambios
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🔹 Reset formulario
    const resetForm = () => {
        setFormData({
            hallazgo_id: hallazgoId || null,
            observacion: "",
       
        });
    };

    // 🔹 Registrar seguimiento
    const handleSubmit = async (e) => {
        console.log("Enviando seguimiento con datos:", formData);
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const payload = {
                ...formData,
                hallazgo_id: hallazgoId,
            };

            const response = await  seguimentoHallazgosService.createSeguimiento(payload);

            showToast(
                "success",
                response.data.message 
            );
            queryClient.invalidateQueries(["seguimientoHallazgo", hallazgoId]);

            resetForm();

        } catch (err) {
            console.error("Error al registrar seguimiento:", err);

            if (err.response?.status === 422) {
                setError(err.response.data.errors);
                showToast("error", "Errores de validación");
            } else {
                setError({
                    general: ["Ocurrió un error al registrar el seguimiento"],
                });

                showToast(
                    "error",
                    "Ocurrió un error al registrar el seguimiento"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        handleSubmit,
        resetForm,
        loading,
        error,
    };
};