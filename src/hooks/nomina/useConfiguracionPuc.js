import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cuentasContablesService } from "../../services/contabilidadService";
import { nominaConceptoContableService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";
import { useGetNominaConceptosContables } from "./useGetNominaConceptosContables";
import { useSincronizarNominaConceptosPuc } from "./useSincronizarNominaConceptosPuc";
import { useUpdateNominaConceptoContable } from "./useUpdateNominaConceptoContable";

function hoyLocal() {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function descargarArchivo(blobData, filename) {
  const url = URL.createObjectURL(blobData);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function useConfiguracionPuc() {
  const [descargandoPlantillaPuc, setDescargandoPlantillaPuc] =
    useState(false);

  const { conceptosContables, isLoading: loadingConceptos } =
    useGetNominaConceptosContables({ per_page: 100 });

  const updateConceptoMutation = useUpdateNominaConceptoContable();
  const sincronizarConceptosMutation = useSincronizarNominaConceptosPuc();

  const { data: cuentasData, isLoading: loadingCuentas } = useQuery({
    queryKey: ["cuentas-contables"],
    queryFn: async () => {
      const response = await cuentasContablesService.getCuentasContables();
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const conceptosLista = useMemo(
    () => conceptosContables?.data?.data ?? [],
    [conceptosContables]
  );

  const cuentasMovimiento = useMemo(
    () =>
      (cuentasData ?? []).filter(
        (cuenta) => cuenta.activo && cuenta.permite_movimiento
      ),
    [cuentasData]
  );

  const actualizarCuentaConcepto = (concepto, puckId) => {
    updateConceptoMutation.mutate(
      {
        uuid: concepto.uuid,
        data: {
          puck_id: puckId ? Number(puckId) : null,
        },
      },
      {
        onSuccess: () => {
          showToast("success", "Cuenta PUC actualizada");
        },
        onError: (error) => {
          showToast(
            "error",
            error.response?.data?.message ||
              "No fue posible actualizar la cuenta PUC"
          );
        },
      }
    );
  };

  const actualizarClasificacionConcepto = (concepto, clasificacion) => {
    updateConceptoMutation.mutate(
      {
        uuid: concepto.uuid,
        data: {
          clasificacion_nomina: clasificacion,
          es_pago_no_salarial: clasificacion === "pago_no_salarial",
        },
      },
      {
        onSuccess: () => {
          showToast("success", "Clasificación actualizada");
        },
        onError: (error) => {
          showToast(
            "error",
            error.response?.data?.message ||
              "No fue posible actualizar la clasificación"
          );
        },
      }
    );
  };

  const sincronizarCuentasPuc = () => {
    sincronizarConceptosMutation.mutate(undefined, {
      onSuccess: (response) => {
        const data = response.data?.data ?? {};
        const enlazados = data.enlazados?.length ?? 0;
        const faltantes = data.faltantes?.length ?? 0;

        showToast(
          "success",
          `PUC sincronizado: ${enlazados} enlazados, ${faltantes} pendientes.`
        );
      },
      onError: (error) => {
        showToast(
          "error",
          error.response?.data?.message || "No fue posible sincronizar el PUC"
        );
      },
    });
  };

  const descargarPlantillaPucFaltante = async () => {
    try {
      setDescargandoPlantillaPuc(true);

      const response =
        await nominaConceptoContableService.plantillaPucFaltante();

      descargarArchivo(
        response.data,
        `plantilla_puc_nomina_faltante_${hoyLocal()}.xlsx`
      );
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          "No fue posible descargar la plantilla PUC."
      );
    } finally {
      setDescargandoPlantillaPuc(false);
    }
  };

  return {
    conceptosLista,
    cuentasMovimiento,
    loadingConceptos,
    loadingCuentas,
    updateConceptoMutation,
    sincronizarConceptosMutation,
    descargandoPlantillaPuc,
    actualizarCuentaConcepto,
    actualizarClasificacionConcepto,
    sincronizarCuentasPuc,
    descargarPlantillaPucFaltante,
  };
}
