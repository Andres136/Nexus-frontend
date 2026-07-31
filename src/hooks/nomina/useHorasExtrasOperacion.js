import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { horaExtraService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";
import { useGetEmpleados } from "./useGetEmpleados";
import { useGetHorasExtras } from "./useGetHorasExtras";
import { useGetKioscos } from "./useGetKioscos";
import { useSedes } from "../useSedes";

function fechaLocal(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function listaPaginada(response) {
  return response?.data?.data ?? response?.data ?? [];
}

export function useHorasExtrasOperacion() {
  const queryClient = useQueryClient();
  const today = fechaLocal();
  const firstDay = `${today.slice(0, 8)}01`;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [userId, setUserId] = useState("");
  const [kioskoDeviceId, setKioskoDeviceId] = useState("");
  const [fechaDesde, setFechaDesde] = useState(firstDay);
  const [fechaHasta, setFechaHasta] = useState(today);
  const [page, setPage] = useState(1);
  const [crear, setCrear] = useState(false);
  const [gestion, setGestion] = useState(null);
  const [creando, setCreando] = useState(false);
  const [loadingUuid, setLoadingUuid] = useState(null);
  const [aprobandoTodas, setAprobandoTodas] = useState(false);
  const [exportando, setExportando] = useState(false);

  const filtrosActivos = useMemo(() => ({
    search: search || undefined,
    status: status || undefined,
    sede_id: sedeId || undefined,
    user_id: userId || undefined,
    kiosko_device_id: kioskoDeviceId || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  }), [fechaDesde, fechaHasta, kioskoDeviceId, search, sedeId, status, userId]);

  const params = useMemo(() => ({
    ...filtrosActivos,
    page,
    per_page: 15,
  }), [filtrosActivos, page]);

  const { horasExtras, isLoading } = useGetHorasExtras(params);
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
    sede_id: sedeId || undefined,
  });
  const { kioscos, isLoading: loadingKioscos } = useGetKioscos({
    sede_id: sedeId || undefined,
    all: true,
  });
  const { sedes } = useSedes();

  const lista = listaPaginada(horasExtras);
  const meta = horasExtras?.data ?? null;
  const sedesLista = Array.isArray(sedes) ? sedes : [];
  const kioscosLista = kioscos?.data?.data ?? kioscos?.data ?? [];

  const actualizarFiltro = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const filtros = {
    search,
    status,
    sedeId,
    userId,
    kioskoDeviceId,
    fechaDesde,
    fechaHasta,
    page,
    setSearch: actualizarFiltro(setSearch),
    setStatus: actualizarFiltro(setStatus),
    setSedeId: (value) => {
      setSedeId(value);
      setUserId("");
      setKioskoDeviceId("");
      setPage(1);
    },
    setUserId: actualizarFiltro(setUserId),
    setKioskoDeviceId: actualizarFiltro(setKioskoDeviceId),
    setFechaDesde: actualizarFiltro(setFechaDesde),
    setFechaHasta: actualizarFiltro(setFechaHasta),
    setPage,
  };

  const handleCrear = async (form) => {
    setCreando(true);
    try {
      const payload = {
        users: form.users.map(Number),
        sede_id: form.sede_id ? Number(form.sede_id) : null,
        kiosko_device_id: form.kiosko_device_id ? Number(form.kiosko_device_id) : null,
        origen: "admin",
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        tipo: form.tipo || "diurna",
        motivo: form.motivo,
      };

      const res = await horaExtraService.createHoraExtra(payload);
      showToast("success", res.data.message || "Hora extra registrada");
      queryClient.invalidateQueries({ queryKey: ["horasExtras"] });
      setCrear(false);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Error al registrar la hora extra");
      throw error;
    } finally {
      setCreando(false);
    }
  };

  const handleGestion = async (observacion) => {
    const { item, accion } = gestion;
    setLoadingUuid(item.uuid);

    try {
      const fn = accion === "aprobar"
        ? horaExtraService.aprobar
        : accion === "desaprobar"
          ? horaExtraService.desaprobar
          : horaExtraService.rechazar;
      const mensajes = { aprobar: "aprobada", desaprobar: "desaprobada", rechazar: "rechazada" };
      const res = await fn(item.uuid, { observacion });
      showToast("success", res.data.message || `Hora extra ${mensajes[accion]}`);
      queryClient.invalidateQueries({ queryKey: ["horasExtras"] });
      setGestion(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Error al procesar la hora extra");
    } finally {
      setLoadingUuid(null);
    }
  };

  const handleAprobarTodas = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Aprobar todas las horas extras pendientes?",
      text: "Se aprobarán todas las horas extras en estado pendiente que cumplan los filtros aplicados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, aprobar todas",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    setAprobandoTodas(true);
    try {
      const res = await horaExtraService.aprobarTodas(filtrosActivos);
      showToast("success", res.data.message || "Horas extras aprobadas");
      queryClient.invalidateQueries({ queryKey: ["horasExtras"] });
    } catch (error) {
      showToast("error", error.response?.data?.message || "Error al aprobar las horas extras");
    } finally {
      setAprobandoTodas(false);
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      const response = await horaExtraService.exportarAprobadas(filtrosActivos);
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `horas_extras_aprobadas_${fechaDesde}_${fechaHasta}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      let message = "No se pudo exportar el archivo.";
      if (error.response?.data instanceof Blob) {
        try {
          const data = JSON.parse(await error.response.data.text());
          message = data.message || message;
        } catch {
          // La respuesta no contiene un error JSON legible.
        }
      }
      showToast("error", message);
    } finally {
      setExportando(false);
    }
  };

  return {
    lista,
    meta,
    filtros,
    empleados,
    sedes: sedesLista,
    kioscos: kioscosLista,
    isLoading,
    loadingCatalogos: loadingEmpleados || loadingKioscos,
    crear,
    setCrear,
    creando,
    handleCrear,
    gestion,
    setGestion,
    loadingUuid,
    handleGestion,
    aprobandoTodas,
    handleAprobarTodas,
    exportando,
    handleExportar,
  };
}
