import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { showToast } from "../../helpers/utils/showToast";
import { nominaService } from "../../services/nominaService";
import { useGetContrataciones } from "./useGetContrataciones";
import { useGetNominaSummary } from "./useGetNominaSummary";
import { useGetNominas } from "./useGetNominas";
import { useEmpresas } from "../useEmpresas";

export const CENTROS_COSTO = ["Bogotá", "Cali", "Barranquilla", "Medellín", "Girardot"];

function normalizarTexto(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCentroCosto(item = {}) {
  if (item.centro_costo) return item.centro_costo;
  if (item.contratacion?.centro_costo) return item.contratacion.centro_costo;
  const sede = item.usuario?.sede?.nombre ?? item.empleado?.sede?.nombre ?? "";
  const empresa = item.empresa?.nombre ?? item.contratacion?.empresa?.nombre ?? "";
  const texto = normalizarTexto(`${sede} ${empresa}`);
  const centro = CENTROS_COSTO.find((nombre) => texto.includes(normalizarTexto(nombre)));
  return centro ?? "Sin sede";
}

export function useProcesarNomina() {
  const now = useMemo(() => new Date(), []);
  const queryClient = useQueryClient();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [quincena, setQuincena] = useState("0");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("resumen");
  const [showLiquidarModal, setShowLiquidarModal] = useState(false);
  const [liquidarInitialData, setLiquidarInitialData] = useState({});
  const [openActions, setOpenActions] = useState(null);
  const [batchEmpresa, setBatchEmpresa] = useState("");
  const [batchPeriodoInicio, setBatchPeriodoInicio] = useState("");
  const [batchPeriodoFin, setBatchPeriodoFin] = useState("");
  const [exportandoPlano, setExportandoPlano] = useState(false);

  const periodoInicio = useMemo(() => {
    const mesTexto = String(mes + 1).padStart(2, "0");
    return `${anio}-${mesTexto}-${quincena === "2" ? "16" : "01"}`;
  }, [mes, anio, quincena]);

  const periodoFin = useMemo(() => {
    const mesTexto = String(mes + 1).padStart(2, "0");
    if (quincena === "1") return `${anio}-${mesTexto}-15`;
    return `${anio}-${mesTexto}-${new Date(anio, mes + 1, 0).getDate()}`;
  }, [mes, anio, quincena]);

  const nominaParams = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin, search: search || undefined, page, per_page: 10 }),
    [periodoInicio, periodoFin, search, page]
  );
  const contratacionParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      per_page: 10,
      status: 1,
      periodo_inicio: periodoInicio,
      periodo_fin: periodoFin,
    }),
    [search, page, periodoInicio, periodoFin]
  );
  const summaryParams = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin }),
    [periodoInicio, periodoFin]
  );

  const { nominas, isLoading: loadingNominas } = useGetNominas(nominaParams);
  const { contrataciones, isLoading } = useGetContrataciones(contratacionParams);
  const { summary, isLoading: loadingSummary } = useGetNominaSummary(summaryParams);
  const { empresas } = useEmpresas();

  const lista = useMemo(() => contrataciones?.data?.data ?? [], [contrataciones]);
  const meta = contrataciones?.data ?? null;
  const nominasLista = useMemo(() => nominas?.data?.data ?? [], [nominas]);
 
  const empresasList = Array.isArray(empresas) ? empresas : [];

  const jornadasList = jornadas?.data?.data ?? [];
  const empresasList = useMemo(() => (Array.isArray(empresas) ? empresas : []), [empresas]);


  const conceptos = useMemo(() => nominasLista
    .filter((item) => !["anulada", "reversada"].includes(item.estado_contable))
    .reduce((acc, item) => {
    acc.salario += Number(item.salario_base_devengado ?? 0);
    acc.auxilio += Number(item.auxilio_transporte ?? 0);
    acc.comisiones += Number(item.total_comisiones ?? 0);
    acc.extras += Number(item.valor_horas_extras_diurnas ?? 0)
      + Number(item.valor_horas_extras_nocturnas ?? 0)
      + Number(item.valor_horas_festivas ?? 0)
      + Number(item.valor_horas_nocturnas_festivas ?? 0);
    acc.salud += Number(item.deduccion_salud ?? 0);
    acc.pension += Number(item.deduccion_pension ?? 0);
    acc.descuentos += Number(item.total_descuentos_adicionales ?? 0);
    acc.devengado += Number(item.total_devengado ?? 0);
    acc.deducciones += Number(item.total_deducciones ?? 0);
    acc.neto += Number(item.salario_neto ?? 0);
    return acc;
  }, {
    salario: 0,
    auxilio: 0,
    comisiones: 0,
    extras: 0,
    salud: 0,
    pension: 0,
    descuentos: 0,
    devengado: 0,
    deducciones: 0,
    neto: 0,
    }), [nominasLista]);

  const centrosCosto = useMemo(() => {
    const base = CENTROS_COSTO.reduce((acc, nombre) => {
      acc[nombre] = { nombre, empleados: 0, liquidados: 0, devengado: 0, deducciones: 0, neto: 0 };
      return acc;
    }, {});

    lista.forEach((contrato) => {
      const centro = getCentroCosto(contrato);
      if (!base[centro]) base[centro] = { nombre: centro, empleados: 0, liquidados: 0, devengado: 0, deducciones: 0, neto: 0 };
      const nomina = contrato.nomina_periodo;
      base[centro].empleados += 1;
      if (nomina) {
        base[centro].liquidados += 1;
        base[centro].devengado += Number(nomina.total_devengado ?? 0);
        base[centro].deducciones += Number(nomina.total_deducciones ?? 0);
        base[centro].neto += Number(nomina.salario_neto ?? 0);
      }
    });

    return Object.values(base);
  }, [lista]);

  const invalidateNomina = useCallback(() => {
    queryClient.invalidateQueries(["nominas"]);
    queryClient.invalidateQueries(["nominaSummary"]);
    queryClient.invalidateQueries(["contrataciones"]);
  }, [queryClient]);

  const handleMes = useCallback((event) => {
    setMes(Number(event.target.value));
    setPage(1);
  }, []);
  const handleAnio = useCallback((event) => {
    setAnio(Number(event.target.value));
    setPage(1);
  }, []);
  const handleQuincena = useCallback((event) => {
    setQuincena(event.target.value);
    setPage(1);
  }, []);
  const handleSearch = useCallback((event) => {
    setSearch(event.target.value);
    setPage(1);
  }, []);
  const batchInicioSeleccionado = batchPeriodoInicio || periodoInicio;
  const batchFinSeleccionado = batchPeriodoFin || periodoFin;

  const descargarArchivoPlano = useCallback(async ({ silentSuccess = false } = {}) => {
    if (!batchInicioSeleccionado || !batchFinSeleccionado) {
      showToast("error", "Selecciona el rango de fechas.");
      return false;
    }

    setExportandoPlano(true);
    try {
      const response = await nominaService.exportarPlano({
        periodo_inicio: batchInicioSeleccionado,
        periodo_fin: batchFinSeleccionado,
        ...(batchEmpresa ? { empresa_id: Number(batchEmpresa) } : {}),
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers?.["content-disposition"] ?? "";
      const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      const empresaNombre = empresasList.find((empresa) => String(empresa.id) === String(batchEmpresa))?.nombre
        ?? "todas_las_empresas";
      const empresaArchivo = normalizarTexto(empresaNombre).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "empresa";
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1].trim())
        : "nomina_liquidada_" + empresaArchivo + "_" + batchInicioSeleccionado + "_" + batchFinSeleccionado + ".xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      if (!silentSuccess) showToast("success", "Excel de nómina descargado.");
      return true;
    } catch (error) {
      let message = "No se pudo descargar el archivo plano.";
      if (error.response?.data instanceof Blob) {
        try {
          const data = JSON.parse(await error.response.data.text());
          message = data.message || message;
        } catch {
          // La respuesta no contiene un error JSON legible.
        }
      }
      showToast("error", message);
      return false;
    } finally {
      setExportandoPlano(false);
    }
  }, [batchEmpresa, batchFinSeleccionado, batchInicioSeleccionado, empresasList]);

  const periodoContrato = useCallback((item = {}) => {
    if (Number(item.pago_frecuencia) !== 15) return { inicio: periodoInicio, fin: periodoFin };
    const seleccionadoEsMesActual = mes === now.getMonth() && anio === now.getFullYear();
    const usaSegundaQuincena = seleccionadoEsMesActual && now.getDate() > 15;
    const mesTexto = String(mes + 1).padStart(2, "0");
    return {
      inicio: `${anio}-${mesTexto}-${usaSegundaQuincena ? "16" : "01"}`,
      fin: usaSegundaQuincena ? periodoFin : `${anio}-${mesTexto}-15`,
    };
  }, [anio, mes, now, periodoFin, periodoInicio]);

  const abrirLiquidacion = useCallback((item = {}) => {
    const periodo = periodoContrato(item);
    setLiquidarInitialData({
      user_id: item.users_id ? String(item.users_id) : "",
      periodo_inicio: periodo.inicio,
      periodo_fin: periodo.fin,
    });
    setShowLiquidarModal(true);
    setOpenActions(null);
  }, [periodoContrato]);

  const descargarDesprendible = useCallback(async (nomina) => {
    if (!nomina?.uuid) {
      showToast("error", "Primero debes liquidar esta nómina.");
      return;
    }
    try {
      const response = await nominaService.desprendiblePdf(nomina.uuid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `desprendible_${nomina.uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setOpenActions(null);
    } catch {
      showToast("error", "No se pudo descargar el desprendible.");
    }
  }, []);

  const enviarDesprendible = useCallback(async (nomina) => {
    if (!nomina?.uuid) {
      showToast("error", "Primero debes liquidar esta nómina.");
      return;
    }
    try {
      const response = await nominaService.enviarDesprendible(nomina.uuid);
      showToast("success", response.data?.message || "Desprendible enviado.");
      setOpenActions(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo enviar el desprendible.");
    }
  }, []);

  const revertMutation = useMutation({
    mutationFn: ({ uuid, motivo }) => nominaService.revertirNomina(uuid, motivo),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Nómina revertida correctamente.");
      invalidateNomina();
      setOpenActions(null);
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo revertir la nómina.");
    },
  });

  const revertirNomina = useCallback(async (nomina) => {
    if (!nomina?.uuid) return;

    const empleado = nomina.empleado?.name ?? "este empleado";
    const result = await Swal.fire({
      title: "Revertir nómina",
      text: `La nómina de ${empleado} se conservará como histórico y el período podrá liquidarse nuevamente.`,
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo obligatorio",
      inputPlaceholder: "Explica por qué debe revertirse esta nómina...",
      inputAttributes: { maxlength: "2000" },
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return "El motivo debe tener al menos 10 caracteres.";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar reversión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    revertMutation.mutate({ uuid: nomina.uuid, motivo: result.value.trim() });
  }, [revertMutation]);

  return {
    mes,
    anio,
    quincena,
    search,
    page,
    setPage,
    activeTab,
    setActiveTab,
    showLiquidarModal,
    setShowLiquidarModal,
    liquidarInitialData,
    openActions,
    setOpenActions,
    batchEmpresa,
    setBatchEmpresa,
    batchPeriodoInicio,
    setBatchPeriodoInicio,
    batchPeriodoFin,
    setBatchPeriodoFin,
    batchInicioSeleccionado,
    batchFinSeleccionado,
    empresasList,
    periodoInicio,
    periodoFin,
    lista,
    meta,
    nominasLista,
    conceptos,
    centrosCosto,
    summary,
    isLoading,
    loadingNominas,
    loadingSummary,
    revertMutation,
    exportandoPlano,
    handleMes,
    handleAnio,
    handleQuincena,
    handleSearch,
    abrirLiquidacion,
    descargarDesprendible,
    enviarDesprendible,
    descargarArchivoPlano,
    revertirNomina,
  };
}
