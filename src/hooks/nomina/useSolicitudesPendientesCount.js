import { useQuery } from "@tanstack/react-query";
import {
  horaExtraService,
  incapacidadService,
  licenciaService,
  permisoService,
  solicitudPrestamoService,
  vacacionService,
} from "../../services/nominaService";

const extractTotal = (response) => Number(response?.data?.data?.total ?? 0);

export const useSolicitudesPendientesCount = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["solicitudes-pendientes-count"],
    queryFn: async () => {
      const [permisos, vacaciones, licencias, incapacidades, horasExtras, prestamos] = await Promise.all([
        permisoService.getPermisos({ status: "pendiente", per_page: 1 }),
        vacacionService.getVacaciones({ status: "pendiente", per_page: 1 }),
        licenciaService.getLicencias({ status: "pendiente", per_page: 1 }),
        incapacidadService.getIncapacidades({ estado_revision: "pendiente", per_page: 1 }),
        horaExtraService.getHorasExtras({ status: "pendiente", per_page: 1 }),
        solicitudPrestamoService.getSolicitudes({ status: "pendiente", per_page: 1 }),
      ]);

      const solicitudesByTab = {
        permisos: extractTotal(permisos),
        vacaciones: extractTotal(vacaciones),
        licencias: extractTotal(licencias),
        incapacidades: extractTotal(incapacidades),
        "horas-extras": extractTotal(horasExtras),
      };
      const nominaByTab = {
        descuentos: extractTotal(prestamos),
      };

      return {
        totalSolicitudes: Object.values(solicitudesByTab).reduce((sum, count) => sum + count, 0),
        totalNomina: Object.values(nominaByTab).reduce((sum, count) => sum + count, 0),
        byTab: {
          ...solicitudesByTab,
          ...nominaByTab,
        },
      };
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  return {
    totalPendientes: data?.totalSolicitudes ?? 0,
    totalNominaPendientes: data?.totalNomina ?? 0,
    pendientesPorTab: data?.byTab ?? {},
    isLoading,
    error,
  };
};
