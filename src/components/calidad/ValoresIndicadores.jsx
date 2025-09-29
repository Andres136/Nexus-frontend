import { useEffect, useState } from "react";
import { valoresIndicadoresApi, departamentosApi} from "../../services/api";
import clienteAxios from "../../config/axios";
import { FileDownIcon, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";



export default function ValoresIndicadores({ valores, setValores, mes, setMes, anio, setAnio }) {
  const { user } = useAuth({ middleware: "auth" });
    const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
    const [selectedObservacion, setSelectedObservacion] = useState(null);
   // no pases options si tu hook no las usa


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
      const params = { mes, anio };
      
      // ✅ AGREGAR: Solo enviar departamento_id si está seleccionado
      if (departamentoId) {
        params.departamento_id = departamentoId;
      }

      console.log('Enviando parámetros:', params); // ✅ DEBUG

      const res = await valoresIndicadoresApi.getAll(params);
      console.log('Respuesta recibida:', res.data); // ✅ DEBUG
      
      setValores(res.data.data || []);
    } catch (error) {
      setValores([]);
  
    }
    setLoading(false);
  };

  const fetchdepartamentos = async () => {
    try {
      const res = await departamentosApi.getAll();
 
      setDepartamentos(res.data);
    } catch (error) {
      setDepartamentos([]);
      console.error("Error fetching departamentos:", error);
    }
  };

  // ✅ CORREGIR: Agregar departamentoId como dependencia
  useEffect(() => {
    fetchValores();
  }, [mes, anio, departamentoId]); // ✅ AGREGAR departamentoId aquí

  // ✅ SEPARAR: Cargar departamentos solo una vez
  useEffect(() => {
    fetchdepartamentos();
  }, []);


  //Funcion para extraer el role_id del usuario
  const roleId = user?.role_id;

  // Mostrar solo si el usuario tiene role_id 1 o 2
const esAdmin = [1, 2].includes(roleId);
const esRegistrador = valores.some(v => v.user_id === user?.id);
const puedeVerTabla = esAdmin || esRegistrador;
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



        {esAdmin && (
        <div>
          <label className="block text-sm text-gray-700">Departamento</label>
          <select
            value={departamentoId}
            onChange={(e) => setDepartamentoId(e.target.value)}
            className="border rounded px-2 py-1"
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
{!puedeVerTabla ? (
  <div className="text-center text-gray-500 py-8">
    No tienes permisos para ver los valores de indicadores.
  </div>
) : loading ? (
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
          {esAdmin && <th className="px-4 py-2">Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {valores.map((v) => (
          <tr key={v.id}>
            <td className="px-4 py-2">{v.indicador?.nombre}</td>
            <td className="px-4 py-2">{v.valor}</td>
            <td className="px-4 py-2">
              {v.indicador?.tipo_meta === "mayor" ? "≥" : "≤"} {v.indicador?.meta}
            </td>
            <td className="px-4 py-2">
              {(() => {
                const estado = calcularEstado(v.valor, v.indicador?.meta, v.indicador?.tipo_meta);
                const clases = {
                  ok: "bg-green-100 text-green-700",
                  medio: "bg-yellow-100 text-yellow-700",
                  critico: "bg-red-100 text-red-700"
                };
                return estado ? (
                  <span className={`${clases[estado]} px-2 py-1 rounded text-xs font-semibold`}>
                    {estado.toUpperCase()}
                  </span>
                ) : "—";
              })()}
            </td>
            <td className="px-4 py-2">
              {new Date(v.fecha).toLocaleDateString("es-CO")}
            </td>
 <td className="px-4 py-2">
                  {v.documento ? (
                    <a
                      href={`${clienteAxios.defaults.baseURL}/api/registro-indicadores/descargar/${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FileDownIcon className="inline-block" size={20} />
                    </a>
                  ) : v.observaciones ? (
                    <div>
                      <span className="text-gray-700">
                        {v.observaciones.length > 50
                          ? `${v.observaciones.substring(0, 50)}...`
                          : v.observaciones}
                      </span>
                      {v.observaciones.length > 50 && (
                        <button
                          onClick={() => setSelectedObservacion(v.observaciones)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          Ver más
                        </button>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

            {esAdmin && (
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={loading}
                  className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
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
)}
      {/* 👇 Modal Tailwind */}
      {selectedObservacion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedObservacion(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
            <p className="text-gray-700 whitespace-pre-line">{selectedObservacion}</p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedObservacion(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
