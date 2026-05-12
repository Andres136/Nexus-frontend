import { useEffect, useState } from "react";
import { calidadService } from "../../services/calidaService";
import { showToast } from "../../helpers/utils/showToast";
import Swal from "sweetalert2";



export const useNovedades = () => {
 

  const [formData, setFormData] = useState({
    registro_diario_id: null,
    descripcion: "",
    estado: "ABIERTA",
    fecha_revision: null,
    fecha_terminado: null,
    tipo_accion: "",
    soporte: null,
    responsable_id: null,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [novedades, setNovedades] = useState([]);
  const [novedadSeleccionada, setNovedadSeleccionada] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
  });

  // ===============================
  // 🔹 LISTAR
  // ===============================
  const obtenerNovedades = async (customFilters = filters) => {
    //console.log("Obteniendo novedades con filtros:", customFilters);
    setLoading(true);
    setError(null);

    try {
      const response = await calidadService.getNovedades(customFilters);
   // console.log("Respuesta de novedades:", response.data);
      setNovedades(response.data.data);

      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });

    } catch (err) {
      setError("No se pudieron cargar las novedades.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔹 OBTENER POR ID
  // ===============================
  const obtenerNovedadById = async (id) => {
    setLoading(true);
    try {
      const response = await calidadService.getNovedadesById(id);
  //    console.log("Respuesta de novedad por ID:", response.data);
      setNovedadSeleccionada(response.data);
      return response.data;
    } catch (err) {
      setError("No se pudo cargar la novedad.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔹 ACTUALIZAR
  // ===============================
const actualizarNovedad = async (id, data) => {
  const formData = new FormData();

  formData.append('_method', 'PUT');
  formData.append('descripcion', data.descripcion);
  formData.append('estado', data.estado);
  formData.append('fecha_revision', data.fecha_revision || '');
  formData.append('fecha_terminado', data.fecha_terminado || '');
  formData.append('responsable_id', data.responsable_id || '');
  formData.append('fuentes', data.fuentes || '');
  formData.append('tipo_accion', data.tipo_accion || '');
  formData.append('causa', data.causa || '');

  if (data.soporte instanceof File) {
    formData.append('soporte', data.soporte);
  }

  setLoading(true);
  setError(null);

  try {
    const response = await calidadService.updateNovedad(id, formData);

    showToast('success', response.data.message);

    await obtenerNovedades();

    return response.data;

  } catch (err) {
    const mensaje = err.response?.data?.message || "No se pudo actualizar la novedad.";
    setError(mensaje);
    showToast("error", mensaje);
    return null;
  } finally {
    setLoading(false);
  }
};

// ===============================
  // 🔹 ELIMINAR


const eliminarNovedad = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar novedad?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  setLoading(true);

  try {
    const response = await calidadService.deleteNovedad(id);

    await Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      text: response.data.message || 'Novedad eliminada correctamente',
      timer: 2000,
      showConfirmButton: false
    });

    await obtenerNovedades();
    return response.data;

  } catch (err) {
console.log(err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.error || 'No se pudo eliminar la novedad.'
    });

    return null;

  } finally {
    setLoading(false);
  }
};
  // ===============================
  // 🔹 EFECTO INICIAL
  // ===============================
useEffect(() => {
  const delay = setTimeout(() => {
    obtenerNovedades(filters);
  }, 500);

  return () => clearTimeout(delay);
}, [filters]);

  return {
    formData,
    setFormData,
    error,
    loading,
    novedades,
    pagination,
    filters,
    setFilters,
    obtenerNovedades,
    obtenerNovedadById,
    actualizarNovedad,
    novedadSeleccionada,
    eliminarNovedad,
  };
};
