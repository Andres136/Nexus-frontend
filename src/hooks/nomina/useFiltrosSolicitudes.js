import { useMemo, useState } from "react";
import { useGetEmpleados } from "./useGetEmpleados";
import { useSedes } from "../useSedes";

function fechaLocal(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useFiltrosSolicitudes({ estadoKey = "status" } = {}) {
  const hoy = fechaLocal();
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [fechaDesde, setFechaDesde] = useState(`${hoy.slice(0, 8)}01`);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
    sede_id: sedeId || undefined,
  });
  const { sedes } = useSedes();

  const params = useMemo(() => ({
    search: search || undefined,
    user_id: userId || undefined,
    sede_id: sedeId || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    [estadoKey]: estado || undefined,
    page,
    per_page: 15,
  }), [estado, estadoKey, fechaDesde, fechaHasta, page, search, sedeId, userId]);

  const update = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return {
    params,
    values: { search, userId, sedeId, fechaDesde, fechaHasta, estado, page },
    actions: {
      setSearch: update(setSearch),
      setUserId: update(setUserId),
      setSedeId: (value) => {
        setSedeId(value);
        setUserId("");
        setPage(1);
      },
      setFechaDesde: update(setFechaDesde),
      setFechaHasta: update(setFechaHasta),
      setEstado: update(setEstado),
      setPage,
    },
    empleados,
    sedes: Array.isArray(sedes) ? sedes : [],
    loadingEmpleados,
  };
}
