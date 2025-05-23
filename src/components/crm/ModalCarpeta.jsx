import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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

    // 3) Eliminar documento
    const eliminarDocumento = useMutation({
      mutationFn: async (id) => {
        const token = localStorage.getItem('token')
        const { data } = await clienteAxios.delete(
          `/api/documentos-administrativos/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        return data
      },
  
      // **Antes** de enviar el DELETE, cancelamos y sacamos la caché actual
      onMutate: async (id) => {
        await queryClient.cancelQueries(['documentos', carpeta.id])
  
        const previous = queryClient.getQueryData(['documentos', carpeta.id])
  
        // **Actualizamos** la caché: filtramos el documento borrado
        queryClient.setQueryData(
          ['documentos', carpeta.id],
          old => old.filter(doc => doc.id !== id)
        )
  
        // devolvemos el snapshot para poder revertir en onError
        return { previous }
      },
  
      // Si hay error, restauramos la caché original
      onError: (err, id, context) => {
        queryClient.setQueryData(
          ['documentos', carpeta.id],
          context.previous
        )
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      },
  
      // Al final (sea éxito o error), opcionalmente refetch o no
      onSettled: () => {
        queryClient.invalidateQueries(['documentos', carpeta.id])
      },
  
      // En el caso de éxito, podemos mostrar el mensaje
      onSuccess: (data) => {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: data.message,
          timer: 1500,
          showConfirmButton: false
        })
      }
    });
  

  const handleSubirDocumento = () => {
    if (!archivo) {
      setError("Selecciona un archivo primero");
      return;
    }
    subirDocumento.mutate();
  };

  
  const handleEliminar = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarDocumento.mutate(id);
      }
    });
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
                <div className="space-x-2">
                  <a
                    href={`${clienteAxios.defaults.baseURL}/api/download/${doc.id}`}
                    className="text-blue-600"
                    download
                  >
                    ⬇️
                  </a>
                  <button
                    onClick={() => handleEliminar(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
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
