import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const [tipo, setTipo] = useState("");
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

  const params = useMemo(() => ({
    search: search || undefined,
    status: status || undefined,
    tipo: tipo || undefined,
    sede_id: sedeId || undefined,
    user_id: userId || undefined,
    kiosko_device_id: kioskoDeviceId || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    page,
    per_page: 15,
  }), [fechaDesde, fechaHasta, kioskoDeviceId, page, search, sedeId, status, tipo, userId]);

  const { horasExtras, isLoading } = useGetHorasExtras(params);
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
    sede_id: sedeId || undefined,
  });
  const { kioscos, isLoading: loadingKioscos } = useGetKioscos({
    sede_id: sedeId || undefined,
    per_page: 100,
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
    tipo,
    sedeId,
    userId,
    kioskoDeviceId,
    fechaDesde,
    fechaHasta,
    page,
    setSearch: actualizarFiltro(setSearch),
    setStatus: actualizarFiltro(setStatus),
    setTipo: actualizarFiltro(setTipo),
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
        tipo: form.tipo,
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
      const fn = accion === "aprobar" ? horaExtraService.aprobar : horaExtraService.rechazar;
      const res = await fn(item.uuid, { observacion });
      showToast("success", res.data.message || `Hora extra ${accion === "aprobar" ? "aprobada" : "rechazada"}`);
      queryClient.invalidateQueries({ queryKey: ["horasExtras"] });
      setGestion(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Error al procesar la hora extra");
    } finally {
      setLoadingUuid(null);
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
  };
}
