import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nominaParametroLaboralService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";
import { useGetContrataciones } from "./useGetContrataciones";
import { useGetAjustesSalariales } from "./useGetAjustesSalariales";
import { useRegisterAjusteSalarial } from "./useRegisterAjusteSalarial";
import { useDeleteAjusteSalarial } from "./useDeleteAjusteSalarial";

function hoyLocal() {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const PARAMETRO_LABORAL_DEFAULT = {
  uuid: "",
  anio: new Date().getFullYear(),
  fecha_vigencia: `${new Date().getFullYear()}-01-01`,
  salario_minimo: "",
  auxilio_transporte: "",
  activo: true,
};

const AJUSTE_SALARIAL_DEFAULT = {
  contratacion_id: "",
  tipo_ajuste: "salario_minimo",
  salario_nuevo: "",
  auxilio_nuevo: "",
  no_salarial_nuevo: "",
  porcentaje_aumento: "",
  fecha_vigencia: hoyLocal(),
  motivo: "",
  observacion: "",
  status: true,
};

export const TIPOS_AJUSTE_SALARIAL = [
  { value: "salario_minimo", label: "Salario mínimo anual" },
  { value: "aumento_porcentual", label: "Aumento porcentual" },
  { value: "aumento_manual", label: "Aumento manual" },
  { value: "promocion", label: "Promoción" },
  { value: "cambio_cargo", label: "Cambio de cargo" },
  { value: "correccion", label: "Corrección" },
];

export function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function parseMoneyInput(value) {
  if (value === null || value === undefined || value === "") return 0;

  return Number(String(value).replace(/[^\d-]/g, ""));
}

export function useConfiguracionParametrosLaborales() {
  const queryClient = useQueryClient();

  const [parametroLaboralForm, setParametroLaboralForm] = useState(
    PARAMETRO_LABORAL_DEFAULT
  );

  const [ajusteForm, setAjusteForm] = useState(AJUSTE_SALARIAL_DEFAULT);

  const { contrataciones } = useGetContrataciones({
    per_page: 100,
    status: 1,
  });

  const { ajustesSalariales, isLoading: loadingAjustes } =
    useGetAjustesSalariales({ per_page: 8 });

  const ajusteMutation = useRegisterAjusteSalarial({
    onSuccess: () => setAjusteForm(AJUSTE_SALARIAL_DEFAULT),
  });

  const deleteAjusteMutation = useDeleteAjusteSalarial();

  const { data: parametrosLaboralesData } = useQuery({
    queryKey: ["nomina-parametros-laborales", { per_page: 5 }],
    queryFn: async () => {
      const response = await nominaParametroLaboralService.getParametros({
        per_page: 5,
      });

      return response.data.data;
    },
  });

  const contratosLista = useMemo(
    () => contrataciones?.data?.data ?? contrataciones?.data ?? [],
    [contrataciones]
  );

  const ajustesLista = useMemo(
    () => ajustesSalariales?.data?.data ?? ajustesSalariales?.data ?? [],
    [ajustesSalariales]
  );

  const parametrosLaboralesLista = useMemo(
    () => parametrosLaboralesData?.data ?? [],
    [parametrosLaboralesData]
  );

  const contratoSeleccionado = useMemo(
    () =>
      contratosLista.find(
        (item) => String(item.id) === String(ajusteForm.contratacion_id)
      ),
    [ajusteForm.contratacion_id, contratosLista]
  );

  useEffect(() => {
    const vigente = parametrosLaboralesLista[0];

    if (!vigente || parametroLaboralForm.uuid) return;

    setParametroLaboralForm({
      uuid: vigente.uuid ?? "",
      anio: vigente.anio ?? new Date().getFullYear(),
      fecha_vigencia: vigente.fecha_vigencia
        ? String(vigente.fecha_vigencia).slice(0, 10)
        : `${new Date().getFullYear()}-01-01`,
      salario_minimo: vigente.salario_minimo ?? "",
      auxilio_transporte: vigente.auxilio_transporte ?? "",
      activo: vigente.activo ?? true,
    });
  }, [parametrosLaboralesLista, parametroLaboralForm.uuid]);

  useEffect(() => {
    if (!contratoSeleccionado) return;

    setAjusteForm((prev) => ({
      ...prev,
      salario_nuevo:
        prev.salario_nuevo || contratoSeleccionado.base_salario || "",
      auxilio_nuevo:
        prev.auxilio_nuevo || contratoSeleccionado.auxilio_transporte || "",
      no_salarial_nuevo:
        prev.no_salarial_nuevo || contratoSeleccionado.no_salarial || 0,
    }));
  }, [contratoSeleccionado]);

  const parametroLaboralMutation = useMutation({
    mutationFn: (payload) => {
      const data = {
        ...payload,
        anio: Number(payload.anio),
        salario_minimo: parseMoneyInput(payload.salario_minimo),
        auxilio_transporte: parseMoneyInput(payload.auxilio_transporte),
        activo: true,
      };

      return payload.uuid
        ? nominaParametroLaboralService.updateParametro(payload.uuid, data)
        : nominaParametroLaboralService.createParametro(data);
    },
    onSuccess: (response) => {
      showToast(
        "success",
        response.data?.message || "Parámetro laboral guardado"
      );

      queryClient.invalidateQueries({
        queryKey: ["nomina-parametros-laborales"],
      });

      queryClient.invalidateQueries({
        queryKey: ["nomina-parametro-laboral-vigente"],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        error.response?.data?.message ||
          "No fue posible guardar el parámetro laboral"
      );
    },
  });

  const handleParametroLaboral = (event) => {
    const { name, value } = event.target;

    setParametroLaboralForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAjuste = (event) => {
    const { name, value, type, checked } = event.target;

    setAjusteForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      const base = Number(contratoSeleccionado?.base_salario || 0);

      if (name === "contratacion_id") {
        const contrato = contratosLista.find(
          (item) => String(item.id) === String(value)
        );

        next.salario_nuevo = contrato?.base_salario ?? "";
        next.auxilio_nuevo = contrato?.auxilio_transporte ?? "";
        next.no_salarial_nuevo = contrato?.no_salarial ?? 0;
        next.porcentaje_aumento = "";
      }

      if (name === "porcentaje_aumento" && base > 0) {
        next.tipo_ajuste = "aumento_porcentual";
        next.salario_nuevo = Math.round(
          base * (1 + Number(value || 0) / 100)
        );
      }

      return next;
    });
  };

  const guardarParametroLaboral = (event) => {
    event.preventDefault();

    if (!parametroLaboralForm.salario_minimo) {
      showToast("error", "Ingresa el salario mínimo vigente.");
      return;
    }

    parametroLaboralMutation.mutate(parametroLaboralForm);
  };

  const guardarAjusteSalarial = (event) => {
    event.preventDefault();

    if (!ajusteForm.contratacion_id) {
      showToast("error", "Selecciona el contrato del empleado.");
      return;
    }

    ajusteMutation.mutate({
      ...ajusteForm,
      contratacion_id: Number(ajusteForm.contratacion_id),
      salario_nuevo: Number(ajusteForm.salario_nuevo || 0),
      auxilio_nuevo: Number(ajusteForm.auxilio_nuevo || 0),
      no_salarial_nuevo: Number(ajusteForm.no_salarial_nuevo || 0),
      porcentaje_aumento:
        ajusteForm.porcentaje_aumento === ""
          ? null
          : Number(ajusteForm.porcentaje_aumento),
      status: true,
    });
  };

  const eliminarAjuste = (uuid) => {
    if (!window.confirm("¿Eliminar este ajuste salarial?")) return;

    deleteAjusteMutation.mutate(uuid);
  };

  return {
    parametroLaboralForm,
    ajusteForm,
    contratosLista,
    ajustesLista,
    loadingAjustes,
    parametroLaboralMutation,
    ajusteMutation,
    deleteAjusteMutation,
    handleParametroLaboral,
    handleAjuste,
    guardarParametroLaboral,
    guardarAjusteSalarial,
    eliminarAjuste,
    TIPOS_AJUSTE_SALARIAL,
    formatCOP,
  };
}
