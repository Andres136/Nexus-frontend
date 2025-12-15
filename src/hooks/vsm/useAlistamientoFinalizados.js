import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { alistamientosFinalizadosService } from "../../services/vsm";

const segundosAHoras = (segundos = 0) => {
  return Number((segundos / 3600).toFixed(2));
};

export default function useAlistamientosFinalizados({
  page = 1,
  perPage = 10,
  usuarioId = null,
  clienteId = null,
  sedeId = null,
}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        per_page: perPage,
        usuario_id: usuarioId,
        cliente_id: clienteId,
        sede_id: sedeId,
      };

      const res = await alistamientosFinalizadosService.obtenerAlistamientosFinalizados(
        params
      );

      // 🔁 Transformación SOLO de presentación
      const transformed = res.data.data.map((item) => ({
        ...item,
        horas_totales: segundosAHoras(item.segundos_transcurridos),
        usuarios: item.usuarios.map((u) => ({
          ...u,
          horas_usuario: segundosAHoras(u.segundos_usuario),
        })),
      }));

      setData(transformed);
      setMeta({
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        total: res.data.total,
      });
    } catch (error) {
      console.error("Error cargando alistamientos finalizados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, usuarioId, clienteId, sedeId]);

  return { data, meta, loading };
}
