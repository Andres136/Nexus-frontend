import { useEffect, useState } from "react";
import { valoresIndicadoresApi } from "../../services/api";
import clienteAxios from "../../config/axios";
import { FileDownIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";


export default function ValoresIndicadores({ valores, setValores, mes, setMes, anio, setAnio }) {
  const { user } = useAuth({ middleware: "auth" }); // no pases options si tu hook no las usa
  const [loading, setLoading] = useState(false);
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const fetchValores = async () => {

    setLoading(true);
    try {
      const res = await valoresIndicadoresApi.getAll({
        mes,
        anio,
      });
    
      setValores(res.data.data || []);
    } catch (error) {
      setValores([]);
      console.error("Error fetching valores:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchValores();
  }, [mes, anio]);

  //Funcion para extraer el role_id del usuario
  const roleId = user?.role_id;

  // Mostrar solo si el usuario tiene role_id 1 o 2
const esRegistrador = valores.some(v => v.user_id === user?.id);

if (![1, 2].includes(roleId) && !esRegistrador) {
  return null;
}
  //Funcion para eliminar un valor de indicador con Swal
  const handleDelete = async(id)=>{
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await valoresIndicadoresApi.delete(id);
          Swal.fire("Eliminado", "El valor del indicador ha sido eliminado.", "success");
          fetchValores(); // Refresca la lista después de eliminar
        } catch (error) {
          console.error("Error al eliminar el valor del indicador:", error);
          Swal.fire("Error", "Hubo un problema al eliminar el valor del indicador.", "error");
        }
      }
    });
  }

  function calcularEstado(valor, meta, tipoMeta) {
  if (valor == null || meta == null || !tipoMeta) return "";
  meta = Number(meta);
  valor = Number(valor);

  if (tipoMeta === "mayor") {
    if (valor >= meta) return "ok";
    if (valor >= meta * 0.8) return "medio"; // ejemplo: 80% de la meta
    return "critico";
  } else {
    if (valor <= meta) return "ok";
    if (valor <= meta * 1.2) return "medio"; // ejemplo: hasta 20% por encima
    return "critico";
  }
}
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Valores de Indicadores
      </h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>
        <button
          onClick={fetchValores}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 self-end"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando...</div>
      ) : valores.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay valores registrados para este mes.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Indicador</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Meta</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Análisis</th>
                {/* solo mostrar para role_id 1 y 2 */}
                {roleId === 1 || roleId === 2 ? (
                  <th className="px-4 py-2">Acciones</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {valores.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-2">{v.indicador?.nombre}</td>
                  <td className="px-4 py-2">{v.valor}</td>
              <td className="px-4 py-2">
  {v.indicador?.tipo_meta === "mayor" ? (
    <span className="text-gray-500 mr-1">≥</span>
  ) : (
    <span className="text-gray-500 mr-1">≤</span>
  )}
  {v.indicador?.meta}
</td>
                  
               <td className="px-4 py-2">
  {(() => {
    const estado = calcularEstado(v.valor, v.indicador?.meta, v.indicador?.tipo_meta);
    if (estado === "ok")
      return (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
          OK
        </span>
      );
    if (estado === "medio")
      return (
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
          Medio
        </span>
      );
    if (estado === "critico")
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
          Crítico
        </span>
      );
    return null;
  })()}
</td>
                  <td className="px-4 py-2">{v.fecha}</td>
                  <td className="px-4 py-2">
                    {v.documento ? (
                      <div className="flex justify-center">
                        <a
                          href={`${clienteAxios.defaults.baseURL}/api/registro-indicadores/descargar/${v.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          download
                          title="Descargar documento"
                        >
                          <FileDownIcon className="inline-block" size={20} />
                        </a>
                      </div>
                    ) : (
                      <div className="flex justify-center">—</div>
                    )}
                  </td>

                  {roleId === 1 || roleId === 2 ? (
                    <td className="px-4 py-2">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                        Eliminar
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
