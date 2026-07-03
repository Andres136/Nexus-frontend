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

export function useSolicitudHorasExtrasOperacion() {
  const queryClient = useQueryClient();
  const today = fechaLocal();
  const firstDay = `${today.slice(0, 8)}01`;

  const [sedeId, setSedeId] = useState("");
  const [guardando, setGuardando] = useState(false);

  const estadoParams = useMemo(() => ({
    mine: true,
    fecha_desde: firstDay,
    fecha_hasta: today,
    per_page: 8,
  }), [firstDay, today]);

  const { horasExtras, isLoading } = useGetHorasExtras(estadoParams);
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
    sede_id: sedeId || undefined,
  });
  const { kioscos, isLoading: loadingKioscos } = useGetKioscos({
    sede_id: sedeId || undefined,
    all: true,
  });
  const { sedes } = useSedes();

  const solicitudes = horasExtras?.data?.data ?? horasExtras?.data ?? [];
  const sedesLista = Array.isArray(sedes) ? sedes : [];
  const kioscosLista = kioscos?.data?.data ?? kioscos?.data ?? [];

  const crearSolicitud = async (form) => {
    setGuardando(true);

    try {
      const payload = {
        users: form.users.map(Number),
        sede_id: form.sede_id ? Number(form.sede_id) : null,
        kiosko_device_id: form.kiosko_device_id ? Number(form.kiosko_device_id) : null,
        origen: "admin",
        fecha: form.fecha,
        horas: Number(form.horas),
        tipo: form.tipo,
        motivo: form.motivo,
      };

      const res = await horaExtraService.createHoraExtra(payload);
      showToast("success", res.data.message || "Solicitud de hora extra registrada");
      queryClient.invalidateQueries({ queryKey: ["horasExtras"] });
    } catch (error) {
      showToast("error", error.response?.data?.message || "Error al registrar la solicitud");
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  return {
    sedeId,
    setSedeId,
    guardando,
    crearSolicitud,
    solicitudes,
    isLoading,
    empleados,
    sedes: sedesLista,
    kioscos: kioscosLista,
    loadingCatalogos: loadingEmpleados || loadingKioscos,
  };
}
