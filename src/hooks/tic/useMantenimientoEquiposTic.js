import {  useState } from "react";
import { mantenimientoEquiposTicService, } from "../../services/ticService";
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
      const [listarMantenimientos, setListarMantenimientos] = useState([]);
      const [errorUpdate, setErrorUpdate] = useState([]);
      
    
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
const obtenerMantenimientos = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await mantenimientoEquiposTicService.getAll();
 //nsole.log("Respuesta del servicio:", response.data);
    setMantenimientos(response.data);



  } catch (err) {
    setError("No se pudieron cargar los mantenimientos.");
  } finally {
    setLoading(false);
  }
};


const ListarMantenimientosEquiposTable = async (customFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
        const response = await mantenimientoEquiposTicService.getMantenimientosEquiposTic(customFilters);
      //  console.log("Respuesta del servicio ListarMantenimientosEquiposTable:", response.data);
        setListarMantenimientos(response.data.data);
        setPagination(response.data);
    } catch (err) {
        setError("No se pudieron cargar los mantenimientos.");
    } finally {
        setLoading(false);
    }
}
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
          ListarMantenimientosEquiposTable();
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
                setErrorUpdate(err.response.data.errors);
            } else {
                setError("Ocurrió un error inesperado.");
            }
          
        } finally {
          setLoading(false);
        }
      }  

    
   //Actualizar mantenimiento
   const actualizarMantenimiento = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mantenimientoEquiposTicService.actualizarMantenimiento(id, formData);
      console.log("Respuesta al actualizar mantenimiento:", response.data);
      showToast('success', response.data.message);
      ListarMantenimientosEquiposTable();
    } catch (err) {
      console.log("Error al actualizar mantenimiento:", err);
      if (err.response && err.response.data && err.response.data.message) {
        showToast('error', err.response.data.message);
      } else {
        showToast('error', 'No se pudo actualizar el mantenimiento.');
      }
      console.error("Error al actualizar mantenimiento:", err);
      setError("No se pudo actualizar el mantenimiento.");
    } finally {
      setLoading(false);
    }
  };


   //Cambiar estado del mantenimiento
  const cambiarEstadoMantenimiento = async (id, formData) => {

  setLoading(true);
  setError(null);
  try {
  const response = await mantenimientoEquiposTicService.update(id, formData);
  console.log("Respuesta al cambiar estado:", response.data);
    showToast('success', response.data.message);
   ListarMantenimientosEquiposTable();
  } catch (err) {
    console.log("Error al cambiar estado:", err);
    if (err.response && err.response.data && err.response.data.message) {
      showToast('error', err.response.data.message);
    } else {
      showToast('error', 'No se pudo actualizar el estado.');
    }
    console.error("Error al cambiar estado:", err);
    setError("No se pudo actualizar el estado.");
  } finally {
    setLoading(false);
  }
};
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
        obtenerMantenimientos,
        ListarMantenimientosEquiposTable,
        listarMantenimientos,
        cambiarEstadoMantenimiento,
        actualizarMantenimiento,
        errorUpdate
    }
}