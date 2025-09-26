import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ReferenciasExcedidas() {
  const [referencias, setReferencias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerReferencias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("/api/referencias-excedidas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferencias(response.data.referencias_faltantes);
      } catch (error) {
        console.error(error);
        toast.error("Error al obtener referencias faltantes");
      }
    };

    obtenerReferencias();
  }, []);

  // 🔍 Filtro en tiempo real
  const referenciasFiltradas = referencias.filter((ref) => {
    const texto = filtro.toLowerCase();
    return (
      ref.descripcion.toLowerCase().includes(texto) ||
      ref.proveedor.toLowerCase().includes(texto) ||
      ref.numero_orden.toString().includes(texto)
    );
  });

  // 📄 Paginación
  const totalPaginas = Math.ceil(referenciasFiltradas.length / elementosPorPagina);
  const referenciasPaginadas = referenciasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  return (
    <div className="my-6 px-4">
      <h3 className="text-lg font-bold mb-4 text-red-600">
        Referencias con Cantidades Faltantes
      </h3>
      <button
  onClick={() => navigate(-1)} // 👈 vuelve a la ruta anterior
  className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
>
  ← Volver
</button>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por descripción, proveedor o #OC..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaActual(1); // reinicia a la primera página
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {referenciasPaginadas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2"># OC</th>
                <th className="border px-4 py-2">Proveedor</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Descripción</th>
                <th className="border px-4 py-2">Solicitada</th>
                <th className="border px-4 py-2">Entregada</th>
                <th className="border px-4 py-2 text-red-600">Faltantes</th>
              </tr>
            </thead>
            <tbody>
              {referenciasPaginadas.map((ref, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{ref.numero_orden}</td>
                  <td className="border px-4 py-2">{ref.proveedor}</td>
                  <td className="border px-4 py-2">
                    {new Date(ref.fecha_orden).toLocaleDateString("es-CO")}
                  </td>
                  <td className="border px-4 py-2">{ref.descripcion}</td>
                  <td className="border px-4 py-2">{ref.cantidad_solicitada}</td>
                  <td className="border px-4 py-2">{ref.cantidad_entregada}</td>
                  <td className="border px-4 py-2 text-red-600 font-bold">
                    {ref.cantidad_faltante}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : (
        <p className="text-green-600">No hay resultados.</p>
      )}
    </div>
  );
}
