import { useEffect, useState } from "react";
import { mantenimientoEquiposTicService, ticService } from "../../services/ticService";
import { showToast } from "../../helpers/utils/showToast";

export const  useMantenimientoEquiposTic = () =>{
    const [formData, setFormData] = useState({
        sede_id: "",
        producto_id: "",
        empresa_id: "",
        fecha_mantenimiento: "",

        tipo: "",
        fecha_programada: "",
        fecha_ejecucion: "",
        observaciones: "",
        estado: "",
        costo: "",
      });
    
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const [mantenimientos, setMantenimientos] = useState([]);
      const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null);
    
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
const obtenerMantenimientos = async (customFilters = filters) => {
  setLoading(true);
  setError(null);

  try {
    const response = await mantenimientoEquiposTicService.getAll(customFilters);
 console.log("Respuesta del servicio:", response.data);
    setMantenimientos(response.data);

    setPagination({
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total,
    });

  } catch (err) {
    setError("No se pudieron cargar los mantenimientos.");
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
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
          if (mantenimientoSeleccionado) {
            // Editar mantenimiento existente
            await mantenimientoEquiposTicService.update(mantenimientoSeleccionado.id, formData);
          } else {
            // Crear nuevo mantenimiento
           const response = await mantenimientoEquiposTicService.create(formData);
           showToast('success', response.data.message );
          }
    
          // Refrescar lista de mantenimientos
          obtenerMantenimientos();
    
          // Limpiar formulario
          setFormData({
            sede_id: "",
            producto_id: "",
            empresa_id: "",
            fecha_mantenimiento: "",
            usuario_id: "",
            tipo: "",
            fecha_programada: "",
            fecha_ejecucion: "",
            observaciones: "",
            estado: "pendiente",
            costo: "",
          });
          setMantenimientoSeleccionado(null);
        } catch (err) {
     console.error("Error al guardar mantenimiento:", err);
            //Mostraer errores por campo
            if (err.response && err.response.data && err.response.data.errors) {
                setError(err.response.data.errors);
            } else {
                setError("Ocurrió un error inesperado.");
            }
          
        } finally {
          setLoading(false);
        }
      }  


   
    return {
        formData,
        setFormData,
        error,
        loading,
        mantenimientos,
        mantenimientoSeleccionado,
        setMantenimientoSeleccionado,
        pagination,
        filters,
        setFilters,
        handleChange,
        handleSubmit,
        obtenerMantenimientos
    }
}