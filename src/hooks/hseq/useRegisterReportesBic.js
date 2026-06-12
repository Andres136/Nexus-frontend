import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { reportesBicApi } from "../../services/api";
import { showToast } from "../../helpers/utils/showToast";

const initialForm = {
    empresa_id: '',
    nombre: '',
    fecha_reporte: '',
    archivo: null,
};

export const useRegisterReportesBic = () => {
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'archivo') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const buildFormData = (data) => {
        const fd = new FormData();
        fd.append('empresa_id', data.empresa_id);
        fd.append('nombre', data.nombre);
        fd.append('fecha_reporte', data.fecha_reporte);
        if (data.archivo) fd.append('archivo', data.archivo);
        return fd;
    };

    const resetForm = () => setFormData(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError({});
        try {
            const response = await reportesBicApi.create(buildFormData(formData));
            showToast("success", response.data.message || "Reporte BIC registrado exitosamente");
            resetForm();
            queryClient.invalidateQueries(["reportesBic"]);
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response.data.errors);
            } else {
                showToast("error", err.response?.data?.message || "Hubo un problema al registrar el reporte BIC");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (uuid) => {
        setLoading(true);
        setError({});
        try {
            const fd = buildFormData(formData);
            fd.append('_method', 'PUT');
            const response = await reportesBicApi.update(uuid, fd);
            showToast("success", response.data.message || "Reporte BIC actualizado exitosamente");
            resetForm();
            queryClient.invalidateQueries(["reportesBic"]);
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response.data.errors);
            } else {
                showToast("error", err.response?.data?.message || "Hubo un problema al actualizar el reporte BIC");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uuid) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;
        try {
            const response = await reportesBicApi.delete(uuid);
            showToast("success", response.data.message || "Reporte BIC eliminado");
            queryClient.invalidateQueries(["reportesBic"]);
        } catch (err) {
            showToast("error", err.response?.data?.message || "Error al eliminar el reporte BIC");
        }
    };

    return {
        formData,
        setFormData,
        resetForm,
        handleChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        error,
        loading,
    };
};
