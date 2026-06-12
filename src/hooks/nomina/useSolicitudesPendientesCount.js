import { useQuery } from "@tanstack/react-query";
import {
  horaExtraService,
  incapacidadService,
  licenciaService,
  permisoService,
  vacacionService,
} from "../../services/nominaService";

const extractTotal = (response) => Number(response?.data?.data?.total ?? 0);

export const useSolicitudesPendientesCount = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["solicitudes-pendientes-count"],
    queryFn: async () => {
      const [permisos, vacaciones, licencias, incapacidades, horasExtras] = await Promise.all([
        permisoService.getPermisos({ status: "pendiente", per_page: 1 }),
        vacacionService.getVacaciones({ status: "pendiente", per_page: 1 }),
        licenciaService.getLicencias({ status: "pendiente", per_page: 1 }),
        incapacidadService.getIncapacidades({ estado_revision: "pendiente", per_page: 1 }),
        horaExtraService.getHorasExtras({ status: "pendiente", per_page: 1 }),
      ]);

      const byTab = {
        permisos: extractTotal(permisos),
        vacaciones: extractTotal(vacaciones),
        licencias: extractTotal(licencias),
        incapacidades: extractTotal(incapacidades),
        "horas-extras": extractTotal(horasExtras),
      };

      return {
        total: Object.values(byTab).reduce((sum, count) => sum + count, 0),
        byTab,
      };
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  return {
    totalPendientes: data?.total ?? 0,
    pendientesPorTab: data?.byTab ?? {},
    isLoading,
    error,
  };
};
