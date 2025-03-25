import {   useMemo } from "react";
import { useState } from "react";
import clienteAxios from "../../config/axios";
import { useQuery } from "@tanstack/react-query";


export default function Inventarios() {

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const pageSize = 25; // Cantidad de productos por página

  
  const fetchStock = async () => {
    const token = localStorage.getItem("token");
    const [stockGlobalRes, stockSetasplastRes] = await Promise.all([
      clienteAxios.get("/api/stock-global", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      clienteAxios.get("/api/stock", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const stockGlobal = stockGlobalRes.data.results.map((item) => ({
      ...item,
      fuente: "Stock Global",
    }));
    const stockSetasplast = stockSetasplastRes.data.results.map((item) => ({
      ...item,
      fuente: "Stock Setasplast",
    }));

    return [...stockGlobal, ...stockSetasplast];
  };

  // React Query para manejar la petición
  const { data: productos = [], isLoading, error } = useQuery({
    queryKey: ["inventario"], // La clave identifica la consulta en caché
    queryFn: fetchStock, // Función que obtiene los datos
    staleTime: 5 * 60 * 1000, // Mantiene los datos en caché por 5 minutos
    cacheTime: 10 * 60 * 1000, // Los datos permanecen en caché por 10 minutos aunque se dejen de usar
    refetchOnWindowFocus: false, // Evita re-fetch al volver a la ventana
  });
// Filtrar y ordenar productos
const filtered = useMemo(() => {
  // Copia el array original para no mutar el estado
  let dataFiltrada = [...productos];

  // Filtro por término de búsqueda
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    dataFiltrada = dataFiltrada.filter((prod) =>
      prod.descripcion.toLowerCase().includes(term)
    );
  }

  // 2. Ordenar según la prioridad:
  //   - (0) saldo < 0 y cantidad_requerida > 0
  //   - (1) saldo < 0
  //   - (2) saldo >= 0
  dataFiltrada.sort((a, b) => {
    const getPriority = (prod) => {
      if (prod.saldo < 0 && prod.cantidad_requerida > 0) return 0; // más arriba
      if (prod.saldo < 0) return 1;
      return 2; // al final
    };
    return getPriority(a) - getPriority(b);
  });
  return dataFiltrada;
}, [productos, searchTerm]);


  // Calcular el total de páginas
  const totalPages = Math.ceil(filtered.length / pageSize);
  // Obtener los productos de la página actual usando slice
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  }
  , [filtered, currentPage, pageSize]);

  // Manejar cambio de búsqueda: reinicia a la página 1 para que no se quede en una página sin resultados
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }
  return (
    <div className="max-w-6xl mx-auto p-6 ">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        📦 Stock de Productos SETASPLAST
      </h1>    <span className="text-gray-600 text-sm">
          {filtered.length} productos encontrados
        </span>

      {/* Input de búsqueda */}
      <input
        type="text"
        placeholder="Buscar producto por descripción..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-2 border rounded-lg mb-4"
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <svg
            className="animate-spin h-6 w-6 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h2zm2 5.292A7.962 7.962 0 014 12H2a10 10 0 0010 10v-2a7.962 7.962 0 01-6-2.708z"
            ></path>
          </svg>
        
        </div>
      ) : (
        <>
          <div className="overflow-x-auto grid grid-cols-1">
            <table className="min-w-full bg-white border border-gray-200 col-span-1">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Código</th>
                  <th className="py-3 px-6 text-left">Descripción</th>
                  <th className="py-3 px-6 text-left">Disponible</th>
                  <th className="py-3 px-6 text-left">Requerida</th>
                  <th className="py-3 px-6 text-left">Saldo</th>
                  <th className="py-3 px-6 text-left">Estado</th>
                  <th className="py-3 px-6 text-left">Bodega</th>
                  <th className="py-3 px-6 text-left">Fuente</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {currentProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6">{prod.codigo || "N/A"}</td>
                    <td className="py-3 px-6">{prod.descripcion}</td>
                    <td className="py-3 px-6">{prod.available_quantity}</td>
                    <td className="py-3 px-6">{prod.cantidad_requerida}</td>
                    <td
                      className={`py-3 px-6 ${
                        prod.saldo < 0 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {prod.saldo ? prod.saldo.toFixed(0) : "0"}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {prod.saldo < 0 ? (
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg inline-block text-sm font-semibold">
                          ⚠️ Falta stock
                        </span>
                      ) : (
                        <span className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block text-sm font-semibold">
                          ✅ Stock suficiente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      {prod.bodega && prod.bodega.length > 0
                        ? prod.bodega
                            .map((wh) => `${wh.name}: ${wh.quantity}`)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="py-3 px-6 font-semibold text-green-700">
                      {prod.fuente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 disabled:opacity-50"
            >
              ◀️ Anterior
            </button>
            <span className="text-gray-700 font-semibold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded ml-2 disabled:opacity-50"
            >
              Siguiente ▶️
            </button>
          </div>
        </>
      )}
    </div>
  )
}
