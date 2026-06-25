import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  capacitacionEncuestaPublicaService,
  capacitacionEncuestaService,
} from "../../services/capacitacionEncuestaService";
import { showToast } from "../../helpers/utils/showToast";

const QUERY_KEY = ["capacitacion-encuestas"];

export const useCapacitacionEncuestas = (filters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async () => {
      const response = await capacitacionEncuestaService.getAll(filters);
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const crear = useMutation({
    mutationFn: (data) => capacitacionEncuestaService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Encuesta creada");
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo crear la encuesta"),
  });

  const actualizar = useMutation({
    mutationFn: ({ uuid, data }) => capacitacionEncuestaService.update(uuid, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Encuesta actualizada");
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo actualizar la encuesta"),
  });

  const eliminar = useMutation({
    mutationFn: (uuid) => capacitacionEncuestaService.remove(uuid),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Encuesta eliminada");
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo eliminar la encuesta"),
  });

  const enviar = useMutation({
    mutationFn: ({ uuid, userIds }) => capacitacionEncuestaService.enviar(uuid, userIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      const enviados = response.data?.links?.length ?? 0;
      showToast("success", `Encuesta enviada a ${enviados} usuario${enviados !== 1 ? "s" : ""}`);
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo enviar la encuesta"),
  });

  return {
    encuestas: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    crear: crear.mutate,
    isCreando: crear.isPending,
    actualizar: actualizar.mutate,
    isActualizando: actualizar.isPending,
    eliminar: eliminar.mutate,
    isEliminando: eliminar.isPending,
    enviar: enviar.mutate,
    isEnviando: enviar.isPending,
  };
};

export const useCapacitacionEncuestaUsuarios = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ["capacitacion-encuestas-usuarios", filters],
    queryFn: async () => {
      const response = await capacitacionEncuestaService.usuarios(filters);
      return response.data;
    },
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCapacitacionEncuestaResultados = (uuid) => {
  return useQuery({
    queryKey: ["capacitacion-encuesta-resultados", uuid],
    queryFn: async () => {
      const response = await capacitacionEncuestaService.resultados(uuid);
      return response.data;
    },
    enabled: Boolean(uuid),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCapacitacionEncuestaPublica = (token) => {
  const [respondida, setRespondida] = useState(false);

  const query = useQuery({
    queryKey: ["capacitacion-encuesta-publica", token],
    queryFn: async () => {
      const response = await capacitacionEncuestaPublicaService.getByToken(token);
      return response.data;
    },
    enabled: Boolean(token) && !respondida,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const responderMutation = useMutation({
    mutationFn: (respuestas) => capacitacionEncuestaPublicaService.responder(token, respuestas),
    onSuccess: () => setRespondida(true),
  });

  return {
    envio: query.data ?? null,
    encuesta: query.data?.encuesta ?? null,
    usuario: query.data?.usuario ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    errorStatus: query.error?.response?.status ?? null,
    responder: responderMutation.mutate,
    isEnviando: responderMutation.isPending,
    respondida,
  };
};
