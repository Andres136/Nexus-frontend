import { useEffect, useState } from "react";
import { valoresIndicadoresApi } from "../../services/api";
import clienteAxios from "../../config/axios";
import { FileDownIcon } from "lucide-react";

export default function ValoresIndicadores({ valores, setValores, mes, setMes, anio, setAnio }) {
  
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
              </tr>
            </thead>
            <tbody>
              {valores.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-2">{v.indicador?.nombre}</td>
                  <td className="px-4 py-2">{v.valor}</td>
                  <td className="px-4 py-2">{v.indicador?.meta}</td>
                  <td className="px-4 py-2">
                    {v.estado === "ok" && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        OK
                      </span>
                    )}
                    {v.estado === "medio" && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                        Medio
                      </span>
                    )}
                    {v.estado === "critico" && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                        Crítico
                      </span>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
