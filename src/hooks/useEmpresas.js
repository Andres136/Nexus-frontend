import { toast } from "react-toastify";
import { empresaApi } from "../services/api";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export function useEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener todas
  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const response = await empresaApi.getAll();
     
      setEmpresas(response.data);
    } catch (err) {
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Registrar
  const registrarEmpresa = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const response = await empresaApi.create(data);
      toast.success("Empresa creada correctamente",{
           className: "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
  progressClassName: "bg-green-400"
      });
      await fetchEmpresas();
      return response.data;
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data.errors);
      } else {
        toast.error("❌ Error al registrar la empresa");
        setError(err.response?.data || err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualizar
  const updateEmpresa = async (id, data) => {
    setError(null);
    setLoading(true);
    try {
      if (data instanceof FormData) {
        data.append("_method", "PUT");
      }
      const response = await empresaApi.updatePost(id, data);
      toast.success(" Empresa actualizada correctamente",{
           className: "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
  progressClassName: "bg-green-400"
      });
      await fetchEmpresas();
      return response.data;
    } catch (err) {
        console.log(err);
      if (err.response?.status === 422) {
        setError(err.response.data.errors);
      } else {
        toast.error("❌ Error al actualizar la empresa");
        setError(err.response?.data || err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const deleteEmpresa = async (id) => {
    setError(null);
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        await empresaApi.delete(id);
        Swal.fire("Eliminado", "La empresa ha sido eliminada.", "success");
        fetchEmpresas();
      }
    } catch (err) {
      Swal.fire("Error", "Hubo un problema al eliminar la empresa.", "error");
      setError(err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return {
    empresas,
    error,
    loading,
    fetchEmpresas,
    registrarEmpresa,
    updateEmpresa,
    deleteEmpresa,
  };
}
