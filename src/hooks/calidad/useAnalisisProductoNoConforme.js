import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { analisisProductoNoConformeService } from "../../services/calidaService";

const initialForm = {
    producto_no_conforme_id: "",
    fecha_analisis: "",
    causa_raiz: "",
    acciones_correctivas: "",
    acciones_preventivas: "",
    observaciones: "",
    estado_id: "",
    fecha_cierre: "",
    responsable_cierre_id: "",
    archivo_evidencia: null,
};

export const useAnalisisProductoNoConforme = () => {
    const [formData, setFormData] = useState(initialForm);
    const [analisis, setAnalisis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const cargarPorProducto = async (productoNoConformeId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await analisisProductoNoConformeService.getByProductoNoConformeId(productoNoConformeId);
            const data = response.data.data;
            setAnalisis(data);
            setFormData({
                producto_no_conforme_id: productoNoConformeId,
                fecha_analisis: data.fecha_analisis || "",
                causa_raiz: data.causa_raiz || "",
                acciones_correctivas: data.acciones_correctivas || "",
                acciones_preventivas: data.acciones_preventivas || "",
                observaciones: data.observaciones || "",
                estado_id: data.estado_id || "",
                fecha_cierre: data.fecha_cierre || "",
                responsable_cierre_id: data.responsable_cierre_id || "",
                archivo_evidencia: null,
            });
            return data;
        } catch (err) {
            if (err.response?.status === 404) {
                setAnalisis(null);
                setFormData({ ...initialForm, producto_no_conforme_id: productoNoConformeId });
            } else {
                setError(err.response?.data?.message || "No se pudo cargar el análisis.");
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const construirFormData = (data) => {
        const fd = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                fd.append(key, value);
            }
        });
        return fd;
    };

    const guardar = async (productoNoConformeId) => {
        setLoading(true);
        setError(null);
        try {
            const payload = { ...formData, producto_no_conforme_id: productoNoConformeId };
            let response;

            if (analisis?.id) {
                response = await analisisProductoNoConformeService.update(analisis.id, payload);
            } else {
                response = await analisisProductoNoConformeService.create(construirFormData(payload));
            }

            showToast("success", response.data.message || "Análisis guardado correctamente.");
            queryClient.invalidateQueries({ queryKey: ["producto-no-conforme"] });
            setAnalisis(response.data.data);
            return response.data;
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response.data.errors);
            } else {
                showToast("error", err.response?.data?.message || "Error al guardar el análisis.");
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (estadoId) => {
        if (!analisis?.id) return null;
        setLoading(true);
        try {
            const response = await analisisProductoNoConformeService.cambiarEstado(analisis.id, estadoId);
            showToast("success", response.data.message || "Estado del análisis actualizado.");
            setAnalisis(response.data.data);
            queryClient.invalidateQueries({ queryKey: ["producto-no-conforme"] });
            return response.data;
        } catch (err) {
            showToast("error", err.response?.data?.message || "Error al cambiar el estado del análisis.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        analisis,
        loading,
        error,
        handleChange,
        cargarPorProducto,
        guardar,
        cambiarEstado,
    };
};
