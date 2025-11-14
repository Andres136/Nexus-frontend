import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import ModalCarpeta from "../../components/crm/ModalCarpeta";
import { toast } from "react-toastify";
import {
  FolderOpen,
  FolderPlus,
  Search,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Folder,
  Loader2,
  AlertCircle
} from "lucide-react";

// Hook para manejar debounce (evita llamadas API innecesarias)
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que pase el tiempo
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
      console.log("Hubo un error al registrar la carpeta:", error);
  
      // Verificar si el error es de validación (código 422)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          // Recorremos los mensajes de cada campo y los mostramos con toast
          Object.values(validationErrors).forEach((messages) => {
            console.log(messages);
            messages.forEach((msg) => {
              toast.error(msg);
            });
          });
        }
      } else {
        // Otro tipo de error (401, 500, etc.)
        toast.error("Ocurrió un error al registrar la carpeta.");
        console.error(error);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de Carpetas
              </h1>
              <p className="text-gray-600 mt-1">
                Organiza y administra tu documentación digital
              </p>
            </div>
          </div>

          {/* ✅ Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6" />
                <div>
                  <p className="text-emerald-100 text-sm">Total Carpetas</p>
                  <p className="text-2xl font-bold">{data?.total || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <p className="text-blue-100 text-sm">Total Documentos</p>
                  <p className="text-2xl font-bold">
                    {data?.data?.reduce((acc, carpeta) => acc + (carpeta.documentos?.length || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6" />
                <div>
                  <p className="text-purple-100 text-sm">Página Actual</p>
                  <p className="text-2xl font-bold">{data?.current_page || 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ✅ Panel izquierdo - Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                  <FolderPlus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Nueva Carpeta</h2>
              </div>

              {/* ✅ Buscador mejorado */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar Carpetas
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* ✅ Formulario mejorado */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  registrarCarpeta.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Carpeta
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingresa el nombre..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={registrarCarpeta.isLoading}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 transform hover:scale-105 ${
                    registrarCarpeta.isLoading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  }`}
                >
                  {registrarCarpeta.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {registrarCarpeta.isLoading ? "Creando..." : "Crear Carpeta"}
                </button>
              </form>
            </div>
          </div>

          {/* ✅ Panel derecho - Lista de carpetas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Lista de Carpetas</h3>
                    <p className="text-sm text-gray-600">
                      {searchTerm ? `Resultados para "${searchTerm}"` : "Todas las carpetas"}
                    </p>
                  </div>
                  {isLoading && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              {/* ✅ Manejo de estados mejorado */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium">Error al cargar carpetas</p>
                        <p className="text-red-600 text-sm mt-1">
                          Verifica tu conexión e intenta nuevamente
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Cargando carpetas...</p>
                    </div>
                  </div>
                ) : data?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No se encontraron carpetas" : "No hay carpetas registradas"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? `No hay resultados para "${searchTerm}"`
                        : "Crea tu primera carpeta para comenzar a organizar documentos"
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {data?.data.map((carpeta) => (
                      <div
                        key={carpeta.id}
                        onClick={() => setCarpetaSeleccionada(carpeta)}
                        className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-300">
                              <Folder className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                {carpeta.nombre}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {carpeta.documentos?.length || 0} documento{carpeta.documentos?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ✅ Paginación mejorada */}
              {data && data.data?.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!data?.prev_page_url}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Página <span className="font-semibold">{data?.current_page}</span> de{" "}
                        <span className="font-semibold">{data?.last_page}</span>
                      </span>
                      <div className="hidden sm:block text-sm text-gray-500">
                        ({data?.total} total)
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!data?.next_page_url}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Modal (sin cambios en lógica) */}
        {carpetaSeleccionada && (
          <ModalCarpeta
            carpeta={carpetaSeleccionada}
            onClose={() => setCarpetaSeleccionada(null)}
          />
        )}
      </div>
    </div>
  );
}