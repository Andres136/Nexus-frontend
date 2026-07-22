import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { showToast } from "../../helpers/utils/showToast";
import { ordenesCarteraApi } from "../../services/api";
import { useDebounce } from "../useDebounce";

export const useOrdenesCarteraVencida = () => {
  const [filtros, setFiltros] = useState({
    buscar: "",
    estado: "",
    page: 1,
    per_page: 10,
  });

  const filtrosDebounced = useDebounce(filtros, 500);

  const queryClient = useQueryClient();

  const obtenerOrdenes = async () => {
    const response = await ordenesCarteraApi.listar(filtrosDebounced);
    return response.data;
  };

  const query = useQuery({
    queryKey: ["ordenesCarteraVencida", filtrosDebounced],
    queryFn: obtenerOrdenes,
    placeholderData: keepPreviousData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const cambiarPagina = (page) => {
    setFiltros((prev) => ({ ...prev, page }));
  };

  const desactivar = async (orden) => {
    const confirm = await Swal.fire({
      title: "¿Desactivar orden?",
      text: `La OC #${orden.id} de ${orden.cliente?.nombre ?? "este cliente"} no podrá generar Orden de Trabajo mientras esté desactivada.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await ordenesCarteraApi.desactivar(orden.id);
      showToast("success", response.data.message || "Orden desactivada");
      queryClient.invalidateQueries({ queryKey: ["ordenesCarteraVencida"] });
    } catch (error) {
      showToast("error", error.response?.data?.error || "No se pudo desactivar la orden");
    }
  };

  const activar = async (orden) => {
    try {
      const response = await ordenesCarteraApi.activar(orden.id);
      showToast("success", response.data.message || "Orden activada");
      queryClient.invalidateQueries({ queryKey: ["ordenesCarteraVencida"] });
    } catch (error) {
      showToast("error", error.response?.data?.error || "No se pudo activar la orden");
    }
  };

  return {
    filtros,
    handleChange,
    cambiarPagina,
    ordenes: query.data?.data ?? [],
    pagination: query.data,
    totalValor: query.data?.total_valor ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    activar,
    desactivar,
  };
};
