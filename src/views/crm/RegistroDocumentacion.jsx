import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import ModalCarpeta from "../../components/crm/ModalCarpeta";
import { toast } from "react-toastify";

// Hook para manejar debounce (evita llamadas API innecesarias)
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RegistroDocumentacion() {
  const [nombre, setNombre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  // Obtener carpetas con paginación y buscador
  const { data, isLoading, error } = useQuery({
    queryKey: ["carpetas", debouncedSearchTerm, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get("/api/carpetas", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: debouncedSearchTerm, page: currentPage },
      });
   
      return response.data;
    },
    keepPreviousData: true,
  });

  // Registrar nueva carpeta
// Registrar nueva carpeta
const registrarCarpeta = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      // Hacemos la petición y guardamos la respuesta
      const response = await clienteAxios.post(
        "/api/carpetas",
        { nombre }, // Enviamos el nombre de la carpeta
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Retornamos los datos de la respuesta
      return response.data;
    },
    onSuccess: (data) => {
      // data aquí es lo que retornamos en "return response.data" arriba
      // por ejemplo { message: "Carpeta creada con éxito", ... }
      setNombre(""); // Limpiar el input
      queryClient.invalidateQueries(["carpetas"]); // Refrescar la lista de carpetas
      // Si el backend envió un "message", lo mostramos en un toast de éxito
      if (data.message) {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      console.error("Hubo un error al registrar la carpeta:", error);
  
      // Verificar si el error es de validación (código 422)
      if (error.response?.status === 422) {
    
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          // Recorremos los mensajes de cada campo y los mostramos con toast
          Object.values(validationErrors).forEach((messages) => {
            messages.forEach((msg) => {
              toast.error(msg);
            });
          });
        }
      } else {
        // Otro tipo de error (401, 500, etc.)
        toast.error("Ocurrió un error al registrar la carpeta.");
      }
    },
  });
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📂 Gestión de Carpetas</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar carpeta..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Formulario de creación */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          registrarCarpeta.mutate();
        }}
        className="mb-4 flex gap-2"
      >
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la carpeta..."
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded ${
            registrarCarpeta.isLoading ? "bg-gray-400" : "bg-gray-800 hover:bg-green-700"
          }`}
          disabled={registrarCarpeta.isLoading}
        >
          ➕ Agregar
        </button>
      </form>

      {/* Manejo de errores */}
      {error && <p className="text-red-500 text-sm mb-2">❌ Error al cargar carpetas.</p>}

      {/* Lista de carpetas con paginación */}
      <div className="bg-white p-4 shadow rounded-lg">
        {isLoading ? (
          <p className="text-gray-500">Cargando carpetas...</p>
        ) : data?.data?.length === 0 ? (
          <p className="text-gray-500">No hay carpetas registradas.</p>
        ) : (
          <ul>
            {data?.data.map((carpeta) => (
              <li
                key={carpeta.id}
                className="flex justify-between items-center border-b py-2"
                onClick={()=> setCarpetaSeleccionada(carpeta)}
              >
                <span className="text-gray-700 font-medium">
                  📁 {carpeta.nombre} ({carpeta.documentos?.length || 0} documentos)
                </span>
              </li>
            ))}
          </ul>

         
        )}
      </div>
 {carpetaSeleccionada && (
            <ModalCarpeta
              carpeta={carpetaSeleccionada}
              onClose={() => setCarpetaSeleccionada(null)}
            />
          )}
      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={!data?.prev_page_url}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          ◀️ Anterior
        </button>
        <span className="text-gray-700 font-semibold">
          Página {data?.current_page} de {data?.last_page}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={!data?.next_page_url}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Siguiente ▶️
        </button>
      </div>
    </div>
  );
}

