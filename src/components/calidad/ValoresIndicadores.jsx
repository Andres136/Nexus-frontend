import { useEffect, useState, useMemo } from "react";
import { valoresIndicadoresApi, departamentosApi } from "../../services/api"; // 👈 asegúrate de tener este endpoint
import clienteAxios from "../../config/axios";
import { FileDownIcon, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";

export default function ValoresIndicadores({ valores, setValores, mes, setMes, anio, setAnio }) {
  const { user } = useAuth({ middleware: "auth" });
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoId, setDepartamentoId] = useState(""); // 👈 filtro de departamento

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  // --- Cargar departamentos si es role 1 ---
  useEffect(() => {
    if (user?.role_id === 1) {
      departamentosApi.getAll().then((res) => {
        setDepartamentos(res.data || []);
      }).catch(() => {
        setDepartamentos([]);
      });
    }
  }, [user]);

  const fetchValores = async () => {
    setLoading(true);
    try {
      const res = await valoresIndicadoresApi.getAll({
        mes,
        anio,
        ...(departamentoId ? { departamento_id: departamentoId } : {}) // 👈 filtro solo si se elige
      });
      setValores(res.data.data || []);
    } catch (error) {
      console.error("Error fetching valores:", error);
      setValores([]);
      Swal.fire("Error", "No se pudieron cargar los valores de indicadores", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchValores();
  }, [mes, anio, departamentoId]); // 👈 también cuando cambie el depto

  // --- Permisos ---
  const permisos = useMemo(() => {
    const roleId = user?.role_id;
    const esAdmin = [1, 2].includes(roleId);
    const esRegistrador = valores.some(v => v.user_id === user?.id);
    return { esAdmin, puedeVerTabla: esAdmin || esRegistrador };
  }, [user, valores]);

  // --- Calcular estado ---
  const calcularEstado = (valor, meta, tipoMeta) => {
    if (!valor || !meta || !tipoMeta) return "";
    valor = Number(valor); meta = Number(meta);
    if (tipoMeta === "mayor") {
      if (valor >= meta) return "ok";
      if (valor >= meta * 0.8) return "medio";
      return "critico";
    } else {
      if (valor <= meta) return "ok";
      if (valor <= meta * 1.2) return "medio";
      return "critico";
    }
  };

  const clasesEstado = {
    ok: "bg-green-100 text-green-700",
    medio: "bg-yellow-100 text-yellow-700",
    critico: "bg-red-100 text-red-700",
  };
const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await valoresIndicadoresApi.delete(id);
        setValores((prev) => prev.filter((v) => v.id !== id));
        Swal.fire("Eliminado", "El valor del indicador ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error eliminando valor:", error);
        Swal.fire("Error", "No se pudo eliminar el valor del indicador.", "error");
      }
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Valores de Indicadores
      </h2>

      {/* --- Filtros --- */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border rounded px-3 py-2 w-28"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>

        {/* 👇 Filtro solo visible para role 1 */}
        {user?.role_id === 1 && (
          <div>
            <label className="block text-sm text-gray-700">Departamento</label>
            <select
              value={departamentoId}
              onChange={(e) => setDepartamentoId(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

 
      </div>
      {/* --- Tabla --- */}
      {permisos.puedeVerTabla ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Indicador</th>
                <th className="px-4 py-2 border-b">Valor</th>
                <th className="px-4 py-2 border-b">Meta</th>
                <th className="px-4 py-2 border-b">Estado</th>
                {permisos.esAdmin && (
                  <th className="px-4 py-2 border-b">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {valores.map((valor) => (
                <tr key={valor.id}>
                  <td className="px-4 py-2 border-b">{valor.indicador.nombre}</td>
                  <td className="px-4 py-2 border-b">{valor.valor}</td>
                  <td className="px-4 py-2 border-b">{valor.indicador.meta}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`inline-block px-2 py-1 rounded ${clasesEstado[calcularEstado(valor.valor, valor.indicador.meta, valor.indicador.tipo_meta)]}`}>
                      {calcularEstado(valor.valor, valor.indicador.meta, valor.indicador.tipo_meta)}
                    </span>
                  </td>
                  {permisos.esAdmin && (
                    <td className="px-4 py-2 border-b">
              
                      <button
                        onClick={() => handleEliminar(valor.id)}
                        className="text-red-600 hover:underline ml-2"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No tienes permiso para ver esta tabla.</p>
      )}
    </div>
  );
}
