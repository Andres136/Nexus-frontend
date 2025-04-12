import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function ModalCarpeta({ carpeta, onClose }) {
  const [archivo, setArchivo] = useState(null);
  const [nombreDocumento, setNombreDocumento] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Obtener documentos de la carpeta
  const { data: documentos, isLoading } = useQuery({
    queryKey: ["documentos", carpeta.id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get(
        `/api/registrar-documentacion/${carpeta.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
  });

  // Subir nuevo documento
  const subirDocumento = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("carpeta_id", carpeta.id);
      formData.append("nombre", nombreDocumento || archivo.name);

      const token = localStorage.getItem("token");
      try {
        const res = await clienteAxios.post("/api/registrar-documentacion", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
       toast.success(res.data.message);
        setError(null);
      } catch (err) {
        console.error("Error al subir documento:", err?.response?.data);
        setError(err?.response?.data);
        // relanza el error para React Query
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["documentos", carpeta.id]);
      setArchivo(null);
      setNombreDocumento("");
    },
  });

  const handleSubirDocumento = () => {
    if (!archivo) {
      setError("Selecciona un archivo primero");
      return;
    }
    subirDocumento.mutate();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">📂 {carpeta?.nombre}</h2>

        {/* Subir documento */}
        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Nombre del documento"
            value={nombreDocumento}
            onChange={(e) => setNombreDocumento(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <button
          onClick={handleSubirDocumento}
          className="bg-gray-700 text-white px-4 py-2 rounded mt-2"
        >
          📤 Subir Documento
        </button>

        {/* Mostrar error si existe */}
        {error && (
  <div className="text-red-500 mt-2">
    {/* Si 'error' viene como objeto JSON del backend */}
    {error.errors && typeof error.errors === "object" ? (
      Object.entries(error.errors).map(([campo, mensajes]) => (
        <div key={campo}>
          {mensajes.map((msj, i) => (
            <p key={i}>{msj}</p>
          ))}
        </div>
      ))
    ) : (
      // Si no hay 'errors', mostramos el string o algo genérico
      <p>{error.message || JSON.stringify(error)}</p>
    )}
  </div>
)}


        {/* Listar documentos */}
        <h3 className="text-lg font-semibold mt-4">📄 Documentos</h3>
        {isLoading ? (
          <p>Cargando documentos...</p>
        ) : (
          <ul>
            {documentos?.map((doc) => (
              <li key={doc.id} className="border-b py-2 flex justify-between">
                <span>{doc.nombre}</span>
                <a
                href={`${clienteAxios.defaults.baseURL}/api/download/${doc.id}`}
                  className="text-blue-600"
                  download
                >
                  ⬇️ Descargar
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          ❌ Cerrar
        </button>
      </div>
    </div>
  );
}
