import { useState } from "react";
import { hallazgosNovedadesService } from "../../services/calidaService";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";


export const useRegisterHallazgoNovedad = () => {
    const [formData, setFormData] = useState({
        novedad_id: null,
        causa: "",
        plan_accion: "",
        responsable_id: null,
        fecha_cierre: "",
        fecha_revision: "",
        estado: "ABIERTA",
        tipo_accion: "",
        observaciones: "",

    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (data) => {

        setLoading(true);
        setError(null);

        try {
            const response = await hallazgosNovedadesService.createHallazgo(data);
          //  console.log("Respuesta al crear hallazgo:", response.data);
            showToast('success', response.data.message || "Hallazgo registrado exitosamente.");
            setFormData({
                novedad_id: null,
                causa: "",
                plan_accion: "",
                responsable_id: null,
                fecha_cierre: "",
                fecha_revision: "",
                estado: "ABIERTA",
                observaciones: "",
            });
          //  console.log("Datos a enviar:", formData);
            queryClient.invalidateQueries(["hallazgos", data.novedad_id]);

        return response.data; // 🔥 ESTA LÍNEA ES LA CLAVE
        } catch (err) {
            console.log("Error al registrar hallazgo:", err);

            if (err.response?.status === 422) {
                setError(err.response.data.errors); // 👈 AQUÍ ESTÁ TODO
            } else {
                showToast(
                    "error",
                    err.response?.data?.message || "Error al registrar hallazgo"
                );
            }

         
        } finally {
            setLoading(false);
        }
    };
const handleUpdate = async (id, data) => {
    console.log("ID para actualización:", id);

    setLoading(true);
    setError(null);

    try {
        const response = await hallazgosNovedadesService.updateHallazgo(id, data);

        showToast(
            "success",
            response.data.message || "Actualizado correctamente"
        );

        return response.data;

    } catch (err) {

        // =====================================================
        // 🔹 VALIDACIÓN 422
        // =====================================================
        if (err.response?.status === 422) {

            const errores = err.response.data.errors;
            setError(errores);

            const primerError = Object.values(errores)
                .flat()
                .join(" | ");

            showToast(
                "error",
                primerError || "Errores de validación"
            );

        }

        // =====================================================
        // 🔹 ERROR GENERAL / EXCEPCIÓN BACKEND
        // =====================================================
        else {

            const mensaje =
                err.response?.data?.message ||
                err.message ||
                "Error al actualizar";

            setError({ general: [mensaje] });
            showToast("error", mensaje);
        }

        return null;

    } finally {
        setLoading(false);
    }
};



    return {
        formData,
        error,
        loading,
        handleChange,
        handleSubmit,
        handleUpdate,
    }
}