import { useQuery } from "@tanstack/react-query";
import { nominaService } from "../../services/nominaService";

export function useNominaPucPayload(nominaUuid, { enabled = true } = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nomina-puc-payload", nominaUuid],
    queryFn: async () => {
      const response = await nominaService.pucPayload(nominaUuid);
      return response.data;
    },
    enabled: enabled && Boolean(nominaUuid),
    retry: (failureCount, error) => failureCount < 1 && Number(error.response?.status || 0) >= 500,
    staleTime: 1000 * 60 * 2,
  });

  return { payloadPuc: data, isLoading, error, refetch };
}
