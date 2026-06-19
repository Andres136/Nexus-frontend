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
  nombre: "",
  porcentaje_salud_empleado: "",
  porcentaje_pension_empleado: "",
  porcentaje_salud_empleador: "",
  porcentaje_pension_empleador: "",
  porcentaje_arl: "",
  porcentaje_sena: "",
  porcentaje_icbf: "",
  porcentaje_caja_compensacion: "",
  recargo_extra_diurna: "",
  recargo_extra_nocturna: "",
  recargo_festiva: "",
  recargo_nocturna_festiva: "",
  porcentaje_incapacidad: "",
  hora_inicio_nocturna: "",
  hora_fin_nocturna: "",
  status: true,
};

export function useConfiguracionPorcentajes() {
  const [configForm, setConfigForm] = useState(CONFIG_DEFAULT);

  const {
    configuracion: configuracionData,
    isLoading: loadingConfig,
    error: configError,
  } = useConfiguracionNomina();

  const configMutation = useUpdateConfiguracionNomina();

  useEffect(() => {
    if (!configuracionData) return;

    setConfigForm({
      nombre: configuracionData.nombre ?? "",
      porcentaje_salud_empleado: configuracionData.porcentaje_salud_empleado ?? "",
      porcentaje_pension_empleado: configuracionData.porcentaje_pension_empleado ?? "",
      porcentaje_salud_empleador: configuracionData.porcentaje_salud_empleador ?? "",
      porcentaje_pension_empleador: configuracionData.porcentaje_pension_empleador ?? "",
      porcentaje_arl: configuracionData.porcentaje_arl ?? "",
      porcentaje_sena: configuracionData.porcentaje_sena ?? "",
      porcentaje_icbf: configuracionData.porcentaje_icbf ?? "",
      porcentaje_caja_compensacion: configuracionData.porcentaje_caja_compensacion ?? "",
      recargo_extra_diurna: configuracionData.recargo_extra_diurna ?? "",
      recargo_extra_nocturna: configuracionData.recargo_extra_nocturna ?? "",
      recargo_festiva: configuracionData.recargo_festiva ?? "",
      recargo_nocturna_festiva: configuracionData.recargo_nocturna_festiva ?? "",
      porcentaje_incapacidad: configuracionData.porcentaje_incapacidad ?? "",
      hora_inicio_nocturna: normalizarHora(configuracionData.hora_inicio_nocturna),
      hora_fin_nocturna: normalizarHora(configuracionData.hora_fin_nocturna),
      status: configuracionData.status ?? true,
    });
  }, [configuracionData]);

  const handleConfig = (event) => {
    const { name, value } = event.target;
    setConfigForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardarConfig = (event) => {
    event.preventDefault();

    if (!configuracionData || configError) return;

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
    configError,
    configReady: Boolean(configuracionData),
    configMutation,
    handleConfig,
    guardarConfig,
  };
}
