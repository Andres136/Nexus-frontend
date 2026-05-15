import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { productoNoConformeService } from "../../services/calidaService";

const initialForm = {
    cliente_id: '',
    producto_id: '',
    orden_compra_id: '',
    cantidad_afectada: '',
    descripcion_inicial: '',
    tipo_falla: '',
    estado_id: 1,
    fecha_reporte: '',
};

export const useRegisterProductoNoConforme = () => {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productoNoConformeService.createProductoNoConforme(data);
            showToast('success', response.data.message || "Producto no conforme registrado exitosamente.");
            setFormData(initialForm);
            queryClient.invalidateQueries({ queryKey: ["producto-no-conforme"] });
            return response.data;
        } catch (err) {
            console.error("Error al registrar producto no conforme:", err);
            if (err.response?.status === 422) {
                setError(err.response.data.errors);
            } else {
                showToast("error", err.response?.data?.message || "Error al registrar producto no conforme");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productoNoConformeService.updateProductoNoConforme(id, data);
            showToast("success", response.data.message || "Actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["producto-no-conforme"] });
            return response.data;
        } catch (err) {
            if (err.response?.status === 422) {
                const errores = err.response.data.errors;
                setError(errores);
                showToast("error", Object.values(errores).flat().join(" | ") || "Errores de validación");
            } else {
                const mensaje = err.response?.data?.message || err.message || "Error al actualizar";
                setError({ general: [mensaje] });
                showToast("error", mensaje);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async (id, estado) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productoNoConformeService.cambiarEstado(id, estado);
            showToast("success", response.data.message || "Estado actualizado");
            queryClient.invalidateQueries({ queryKey: ["producto-no-conforme"] });
            return response.data;
        } catch (err) {
            showToast("error", err.response?.data?.message || "Error al cambiar estado");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit,
        handleUpdate,
        handleCambiarEstado,
    };
};
