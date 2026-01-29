import { useEffect, useState } from "react";
import { responsabilidadesAsignadasApi } from "../../services/Responsabilidades";

import { showToast } from "../../helpers/utils/showToast";


export function useResponsabilidadesAsignadas(initialParams = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResponsabilidades = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await responsabilidadesAsignadasApi.getAll({
        per_page: pagination.per_page,
        page: params.page ?? pagination.current_page,
        ...initialParams,
        ...params,
      });

      const res = response.data.data;
  //  console.log(res);

      setData(res);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        per_page: res.per_page,
      });
    } catch (err) {
      console.error(err);
      setError("Error al cargar responsabilidades asignadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsabilidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

//Asignar responsabilidades
const assignResponsabilidad = async (data) => {
  setLoading(true);
  setError(null);
 
  try {
    const response = await responsabilidadesAsignadasApi.create(
      data.responsabilidad_id,
      data
    );
    console.log(response);
   showToast(
      "success",
      response.data?.message ?? "Responsabilidad asignada correctamente"
    );

    fetchResponsabilidades();
  } catch (err) {
    console.error(err);
    setError("Error al asignar responsabilidad");
  } finally {
    setLoading(false);
  }
};
//Actualizar responsabilidad asignada
const updateAsignacion = async (pivotId, data) => {
  setLoading(true);
  setError(null);

  try {
    const response = await responsabilidadesAsignadasApi.update(pivotId, data);

    showToast(
      "success",
      response.data?.message ?? "Responsabilidad actualizada correctamente"
    );

    fetchResponsabilidades();
  } catch (err) {
    console.error(err);
    setError("Error al actualizar responsabilidad");
  } finally {
    setLoading(false);
  }
};


//Eliminar responsabilidad asignada
const removeAsignacion = async (pivotId) => {
  setLoading(true);
  setError(null);

  try {
    const response = await responsabilidadesAsignadasApi.delete(Number(pivotId));
    showToast(
      "success",
      response.data?.message ?? "Responsabilidad Desactctamente"
    );
    fetchResponsabilidades();
  } catch (err) {
    console.error(err);
    setError("Error al eliminar responsabilidad");
  } finally {
    setLoading(false);
  }
};

  return {
    data,
    pagination,
    loading,
    error,
    fetchResponsabilidades,
    assignResponsabilidad,
    updateAsignacion,
    removeAsignacion
  };
}
