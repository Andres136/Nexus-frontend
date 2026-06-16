import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { nominaService } from "../../services/nominaService";
import { useGetNominas } from "./useGetNominas";

function descargarArchivo(blobData, filename, type) {
  const blob = new Blob([blobData], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }

  return data?.message || fallback;
}

export function useControlContableNomina() {
  const now = useMemo(() => new Date(), []);
  const queryClient = useQueryClient();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [quincena, setQuincena] = useState("1");

  const periodoInicio = useMemo(() => {
    const mesTexto = String(mes + 1).padStart(2, "0");
    return quincena === "2" ? `${anio}-${mesTexto}-16` : `${anio}-${mesTexto}-01`;
  }, [mes, anio, quincena]);

  const periodoFin = useMemo(() => {
    const mesTexto = String(mes + 1).padStart(2, "0");
    if (quincena === "1") return `${anio}-${mesTexto}-15`;
    return `${anio}-${mesTexto}-${new Date(anio, mes + 1, 0).getDate()}`;
  }, [mes, anio, quincena]);

  const params = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin, per_page: 100 }),
    [periodoInicio, periodoFin]
  );

  const { nominas: data, isLoading } = useGetNominas(params);
  const nominas = useMemo(() => data?.data?.data ?? [], [data]);

  const totals = useMemo(() => nominas.reduce((acc, nomina) => {
    acc.devengado += Number(nomina.total_devengado || 0);
    acc.deducciones += Number(nomina.total_deducciones || 0);
    acc.neto += Number(nomina.salario_neto || 0);
    return acc;
  }, { devengado: 0, deducciones: 0, neto: 0 }), [nominas]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["nominas"] });
    queryClient.invalidateQueries({ queryKey: ["nominasControlContable"] });
    queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
  };

  const approveMutation = useMutation({
    mutationFn: (uuid) => nominaService.aprobarContabilidad(uuid),
    onSuccess: () => {
      showToast("success", "Nómina aprobada");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo aprobar"),
  });

  const closeMutation = useMutation({
    mutationFn: () => nominaService.cerrarPeriodo({ periodo_inicio: periodoInicio, periodo_fin: periodoFin }),
    onSuccess: () => {
      showToast("success", "Período cerrado");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo cerrar"),
  });

  const exportExcelMutation = useMutation({
    mutationFn: async () => (await nominaService.exportarPucExcel({ periodo_inicio: periodoInicio, periodo_fin: periodoFin })).data,
    onSuccess: (data) => {
      descargarArchivo(
        data,
        `puc_nomina_${periodoInicio}_${periodoFin}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      showToast("success", "PUC exportado en Excel");
      invalidate();
    },
    onError: async (err) => showToast("error", await getErrorMessage(err, "No se pudo exportar el Excel")),
  });

  const exportPdfMutation = useMutation({
    mutationFn: async () => (await nominaService.exportarPucPdf({ periodo_inicio: periodoInicio, periodo_fin: periodoFin })).data,
    onSuccess: (data) => {
      descargarArchivo(data, `puc_nomina_${periodoInicio}_${periodoFin}.pdf`, "application/pdf");
      showToast("success", "PUC exportado en PDF");
      invalidate();
    },
    onError: async (err) => showToast("error", await getErrorMessage(err, "No se pudo exportar el PDF")),
  });

  return {
    mes,
    setMes,
    anio,
    setAnio,
    quincena,
    setQuincena,
    periodoInicio,
    periodoFin,
    nominas,
    totals,
    isLoading,
    approveMutation,
    closeMutation,
    exportExcelMutation,
    exportPdfMutation,
  };
}
