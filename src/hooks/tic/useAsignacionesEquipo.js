import { useEffect, useState } from "react";
import { ticService } from "../../services/ticService";
import { showToast } from "../../helpers/utils/showToast";
import Swal from "sweetalert2";


export const useAsignacionesEquipo = () => {

  const [formData, setFormData] = useState({
    sede_id: "",
    producto_id: "",
    empresa_id: "",
    fecha_asignacion: "",
    usuario_asignacion_id: "",
    observaciones: "",

  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [sedesFiltro, setSedesFiltro] = useState([]);
const [usuariosFiltro, setUsuariosFiltro] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
const [filters, setFilters] = useState({
  page: 1,
  usuario_id: "",
  empresa_id: "",
  activo: "",
  search: "",
  per_page: "",
  sede_id: ""
});
const obtenerAsignaciones = async (page = 1) => {
  setLoading(true);
  try {
    const response = await ticService.getAll({
      ...filters,
      page
    });
// console.log("Asignaciones obtenidas:", response.data);
    setAsignaciones(response.data.data);
    setPagination(response.data);

    setSedesFiltro(response.data.sedes_filtro || []);
setUsuariosFiltro(response.data.usuarios_filtro || []);

  } finally {
    setLoading(false);
  }
};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmit = async (e) => {
    console.log("Enviando datos:", formData);
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Aquí puedes llamar a tu servicio para crear la asignación
      const response = await ticService.create(formData);
      setPdfUrl(response.data.pdf_url);
      showToast('success', response.data.message);
      console.log("Datos enviados:", formData);
    } catch (err) {
      console.error("Error al crear la asignación:", err);
      if (err.response.status === 422) {
        setError(err.response.data.errors);

      }

    } finally {
      setLoading(false);
    }
  };


 const desactivarAsignacion = async (id) => {

  const result = await Swal.fire({
    title: "Desactivar asignación",
    text: "Escribe la observación de devolución",
    input: "textarea",
    inputPlaceholder: "Motivo de devolución...",
    inputAttributes: {
      "aria-label": "Observación"
    },
    inputValidator: (value) => {
      if (!value) {
        return "La observación es obligatoria";
      }
    },
    showCancelButton: true,
    confirmButtonText: "Desactivar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33"
  });

  if (!result.isConfirmed) return;

  setLoading(true);

  try {
    const response = await ticService.delete(id, {
      observaciones: result.value
    });

    window.open(response.data.pdf_url, "_blank");

    showToast("success", response.data.message);

    await obtenerAsignaciones();

  } catch (err) {
    showToast("error", "Error al desactivar la asignación");
  } finally {
    setLoading(false);
  }
};
const handleFiltrar = (campo, valor) => {
  setFilters(prev => ({
    ...prev,
    [campo]: valor,
    page: 1
  }));
};
useEffect(() => {
  obtenerAsignaciones(filters.page);
}, [
  filters.page,
  filters.usuario_id,
  filters.empresa_id,
  filters.activo,
  filters.search,
  filters.per_page
]);

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
    setFormData,
    obtenerAsignaciones,
    asignaciones,
    pagination,
    filters,
    setFilters,
    pdfUrl,
    desactivarAsignacion,
    handleFiltrar,
    sedesFiltro,
    usuariosFiltro
  };
}