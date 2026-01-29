import { useEffect, useState } from "react";
import { responsabilidadesApi } from "../../services/Responsabilidades";
import { showToast } from "../../helpers/utils/showToast";


export function useResponsabilidades() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    per_page: 10,
    page: 1
  });

  const fetchResponsabilidades = async () => {
    setLoading(true);

    try {
      const response = await responsabilidadesApi.getAll(filters);

      setData(response.data.data);

      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page
      });

    } finally {
      setLoading(false);
    }
  };



  //Crear Responsabilidades
  const createResponsabilidad = async (data) => {
    try {
      const response = await responsabilidadesApi.create(data);
      showToast(
        "success",
        response.data?.message ?? "Responsabilidad creada correctamente"
      );
      fetchResponsabilidades();
    } catch (error) {
      console.error("Error al crear responsabilidad:", error);
    }
  };

  //Editar Responsabilidades
  const updateResponsabilidad = async (id, data) => {
   //onsole.log("Actualizando responsabilidad:", id, data);
    try {
      const response = await responsabilidadesApi.update(id, data);
      showToast(
        "success",
        response.data?.message ?? "Responsabilidad actualizada correctamente"
      );
      fetchResponsabilidades();
    } catch (error) {
      console.error("Error al editar responsabilidad:", error);
    }
  };

  //Eliminar Responsabilidades
  const deleteResponsabilidad = async (id) => {
    try {
      const response = await responsabilidadesApi.delete(id);
      showToast(
        "success",
        response.data?.message ?? "Responsabilidad eliminada correctamente"
      );
      fetchResponsabilidades();
    } catch (error) {
      console.error("Error al eliminar responsabilidad:", error);
    }
  };

  useEffect(() => {
    fetchResponsabilidades();
  }, [filters]);

  return {
    data,
    pagination,
    loading,
    filters,
    setFilters,
    createResponsabilidad,
    updateResponsabilidad,
    deleteResponsabilidad
  };
}
