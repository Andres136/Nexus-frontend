import { useState, useEffect } from "react";
import { departamentosApi, indicadoresApi } from "../../services/api";
import { useAuth } from "../useAuth";
import Swal from "sweetalert2";

export function useObtenerIndicadores({ fetchIndicadores, indicadores, setIndicadores,paginacion }) {
  const { user } = useAuth({ middleware: "auth" });
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [search, setSearch] = useState("");


  const puedeEditar = [1, 2].includes(user?.role_id);

  const fetchDepartamentos = async () => {
    try {
      const res = await departamentosApi.getAll();
      setDepartamentos(res.data);
    } catch (error) {
      setDepartamentos([]);
      console.error("Error fetching departamentos:", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await indicadoresApi.delete(id);
          setIndicadores(indicadores.filter((ind) => ind.id !== id));
          Swal.fire("Eliminado", "El indicador ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error eliminando indicador:", error);
          Swal.fire("Error", "Hubo un problema al eliminar el indicador.", "error");
        }
      }
    });
  };
const handleSearchKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    setPagina(1);
    fetchIndicadores(departamentoId, 1, search);
  }
};

  useEffect(() => {
    setPagina(1);
  }, [departamentoId]);

useEffect(() => {
  fetchIndicadores(departamentoId, pagina);
}, [departamentoId, pagina]);

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  return {
    departamentoId,
    setDepartamentoId,
    departamentos,
    pagina,
    setPagina,
    puedeEditar,
    handleDelete,
    paginacion,
    search,
    setSearch,
    handleSearchKeyDown
  };
}