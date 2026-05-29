import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { encuestaPublicaService } from "../../services/encuestaService";

export const useEncuestaPublica = (token) => {
  const [respondida, setRespondida] = useState(false);

  // ─── Cargar encuesta por token ────────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["encuesta-publica", token],
    queryFn: async () => {
      const res = await encuestaPublicaService.getByToken(token);
      return res.data;
    },
    enabled: !!token && !respondida,
    retry: false,          // no reintentar: 404 = token inválido o ya respondido
    refetchOnWindowFocus: false,
  });

  // ─── Enviar respuestas ────────────────────────────────────────────────────
  const { mutate: responder, isPending: isEnviando } = useMutation({
    mutationFn: (respuestas) => encuestaPublicaService.responder(token, respuestas),
    onSuccess: () => {
      setRespondida(true);
    },
  });

  const yaRespondida = data?.estado === "respondida";

  return {
    encuesta: data?.encuesta ?? null,
    cliente: data?.cliente ?? null,
    estado: data?.estado ?? null,
    isLoading,
    isError,
    errorStatus: error?.response?.status ?? null,
    responder,
    isEnviando,
    respondida,
    yaRespondida,
  };
};
