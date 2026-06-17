import { useEffect, useState } from "react";
import {
  useConfiguracionNomina,
  useUpdateConfiguracionNomina,
} from "./useConfiguracionNomina";

function normalizarHora(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

const CONFIG_DEFAULT = {
  nombre: "Configuración general",
  porcentaje_salud_empleado: 4,
  porcentaje_pension_empleado: 4,
  porcentaje_salud_empleador: 8.5,
  porcentaje_pension_empleador: 12,
  porcentaje_arl: 2.436,
  porcentaje_sena: 2,
  porcentaje_icbf: 3,
  porcentaje_caja_compensacion: 4,
  recargo_extra_diurna: 0.25,
  recargo_extra_nocturna: 0.75,
  recargo_festiva: 0.75,
  recargo_nocturna_festiva: 1.1,
  porcentaje_incapacidad: 0.6667,
  hora_inicio_nocturna: "19:00",
  hora_fin_nocturna: "06:00",
  status: true,
};

export function useConfiguracionPorcentajes() {
  const [configForm, setConfigForm] = useState(CONFIG_DEFAULT);

  const { configuracion: configuracionData, isLoading: loadingConfig } =
    useConfiguracionNomina();

  const configMutation = useUpdateConfiguracionNomina();

  useEffect(() => {
    if (!configuracionData) return;

    setConfigForm({
      nombre: configuracionData.nombre ?? CONFIG_DEFAULT.nombre,
      porcentaje_salud_empleado: configuracionData.porcentaje_salud_empleado ?? 4,
      porcentaje_pension_empleado: configuracionData.porcentaje_pension_empleado ?? 4,
      porcentaje_salud_empleador: configuracionData.porcentaje_salud_empleador ?? 8.5,
      porcentaje_pension_empleador: configuracionData.porcentaje_pension_empleador ?? 12,
      porcentaje_arl: configuracionData.porcentaje_arl ?? 2.436,
      porcentaje_sena: configuracionData.porcentaje_sena ?? 2,
      porcentaje_icbf: configuracionData.porcentaje_icbf ?? 3,
      porcentaje_caja_compensacion: configuracionData.porcentaje_caja_compensacion ?? 4,
      recargo_extra_diurna: configuracionData.recargo_extra_diurna ?? 0.25,
      recargo_extra_nocturna: configuracionData.recargo_extra_nocturna ?? 0.75,
      recargo_festiva: configuracionData.recargo_festiva ?? 0.75,
      recargo_nocturna_festiva: configuracionData.recargo_nocturna_festiva ?? 1.1,
      porcentaje_incapacidad: configuracionData.porcentaje_incapacidad ?? 0.6667,
      hora_inicio_nocturna:
        normalizarHora(configuracionData.hora_inicio_nocturna) || "19:00",
      hora_fin_nocturna:
        normalizarHora(configuracionData.hora_fin_nocturna) || "06:00",
      status: configuracionData.status ?? true,
    });
  }, [configuracionData]);

  const handleConfig = (event) => {
    const { name, value } = event.target;
    setConfigForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardarConfig = (event) => {
    event.preventDefault();

    configMutation.mutate({
      ...configForm,
      porcentaje_salud_empleado: Number(configForm.porcentaje_salud_empleado),
      porcentaje_pension_empleado: Number(configForm.porcentaje_pension_empleado),
      porcentaje_salud_empleador: Number(configForm.porcentaje_salud_empleador),
      porcentaje_pension_empleador: Number(configForm.porcentaje_pension_empleador),
      porcentaje_arl: Number(configForm.porcentaje_arl),
      porcentaje_sena: Number(configForm.porcentaje_sena),
      porcentaje_icbf: Number(configForm.porcentaje_icbf),
      porcentaje_caja_compensacion: Number(configForm.porcentaje_caja_compensacion),
      recargo_extra_diurna: Number(configForm.recargo_extra_diurna),
      recargo_extra_nocturna: Number(configForm.recargo_extra_nocturna),
      recargo_festiva: Number(configForm.recargo_festiva),
      recargo_nocturna_festiva: Number(configForm.recargo_nocturna_festiva),
      porcentaje_incapacidad: Number(configForm.porcentaje_incapacidad),
      hora_inicio_nocturna: configForm.hora_inicio_nocturna,
      hora_fin_nocturna: configForm.hora_fin_nocturna,
      status: true,
    });
  };

  return {
    configForm,
    loadingConfig,
    configMutation,
    handleConfig,
    guardarConfig,
  };
}