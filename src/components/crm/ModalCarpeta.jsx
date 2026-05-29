import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  X,
  Upload,
  FileText,
  Download,
  Trash2,
  Folder,
  Plus,
  Loader2,
  AlertCircle,
  File,
  CheckCircle
} from "lucide-react";

const MAX_UPLOAD_MB = 8;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

const formatFileSize = (bytes = 0) => {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const getFileExtension = (fileName = "") => {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
};

const normalizeUploadError = (uploadError) => {
  if (!uploadError) return [];
  if (typeof uploadError === "string") return [uploadError];

  const responseData = uploadError?.response?.data || uploadError;
  const maxUploadMessage = `El archivo no debe exceder los ${MAX_UPLOAD_MB} MB.`;

  if (responseData?.errors && typeof responseData.errors === "object") {
    return Object.values(responseData.errors).flat().map((message) => {
      if (
        typeof message === "string" &&
        (message.includes("failed to upload") || message.includes("POST data is too large"))
      ) {
        return maxUploadMessage;
      }

      return message;
    });
  }

  const message = responseData?.message || uploadError?.message;

  if (
    typeof message === "string" &&
    (message.includes("failed to upload") || message.includes("POST data is too large"))
  ) {
    return [maxUploadMessage];
  }

  return [message || "No se pudo subir el documento. Intentalo nuevamente."];
};

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
      try {
        const response = await clienteAxios.get(
          `/api/registrar-documentacion/${carpeta.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (err) {
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
  });

  const documentosCarpeta = Array.isArray(documentos) ? documentos : [];

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
        setError(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos", carpeta.id] });
      queryClient.invalidateQueries({ queryKey: ["carpetas"] });
      setArchivo(null);
      setNombreDocumento("");
    },
  });

    const eliminarDocumento = useMutation({
      mutationFn: async (id) => {
        const token = localStorage.getItem('token')
        const { data } = await clienteAxios.delete(
          `/api/registrar-documentacion/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        return data
      },
  
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ['documentos', carpeta.id] })
  
        const previous = queryClient.getQueryData(['documentos', carpeta.id])
  
        queryClient.setQueryData(
          ['documentos', carpeta.id],
          old => Array.isArray(old) ? old.filter(doc => doc.id !== id) : []
        )
  
        return { previous }
      },
  
      onError: (err, id, context) => {
        queryClient.setQueryData(
          ['documentos', carpeta.id],
          context?.previous ?? []
        )
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      },
  
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['documentos', carpeta.id] })
        queryClient.invalidateQueries({ queryKey: ['carpetas'] })
      },
  
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

  const isUploading = subirDocumento.isPending || subirDocumento.isLoading;
  

  const handleSubirDocumento = () => {
    if (!archivo) {
      setError("Selecciona un archivo primero");
      return;
    }
    subirDocumento.mutate();
  };

  const handleArchivoChange = (event) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setArchivo(null);
      return;
    }

    const extension = getFileExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setArchivo(null);
      setError("Formato no permitido. Usa PDF, DOC, DOCX, XLS o XLSX.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setArchivo(null);
      setError(`El archivo pesa ${formatFileSize(file.size)}. El limite actual es ${MAX_UPLOAD_MB} MB.`);
      event.target.value = "";
      return;
    }

    setArchivo(file);
  };

  const uploadErrors = normalizeUploadError(error);

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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg flex-shrink-0">
                <Folder className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold truncate">{carpeta?.nombre}</h2>
                <p className="text-blue-100 mt-1">
                  {documentosCarpeta.length} documento{documentosCarpeta.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 flex-shrink-0"
              title="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-88px)]">
          <div className="lg:w-80 lg:flex-shrink-0 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Subir Documento</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                    Seleccionar archivo
                    </label>
                    <span className="text-xs font-medium text-gray-500">Max. {MAX_UPLOAD_MB} MB</span>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleArchivoChange}
                      accept={ACCEPTED_EXTENSIONS.join(",")}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`
                        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                        ${archivo 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }
                      `}
                    >
                      {archivo ? (
                        <div className="text-center px-4 w-full">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-700 truncate" title={archivo.name}>
                            {archivo.name}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {formatFileSize(archivo.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Haz clic para seleccionar
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, DOC, DOCX, XLS, XLSX
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del documento (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre personalizado..."
                    value={nombreDocumento}
                    onChange={(e) => setNombreDocumento(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button
                  onClick={handleSubirDocumento}
                  disabled={!archivo || isUploading}
                  className={`
                    w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200
                    ${!archivo || isUploading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                    }
                  `}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Subir Documento
                    </>
                  )}
                </button>

                {uploadErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800 mb-1">
                          Error al subir archivo
                        </h4>
                        <div className="text-sm text-red-600">
                          {uploadErrors.map((message, index) => (
                            <p key={index}>{message}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col">
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Documentos de la carpeta</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Cargando documentos...</p>
                  </div>
                </div>
              ) : documentosCarpeta.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No hay documentos
                  </h4>
                  <p className="text-gray-500">
                    Sube tu primer documento para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documentosCarpeta.map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-200">
                            <File className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                              {doc.nombre}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Documento #{doc.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <a
                            href={`${clienteAxios.defaults.baseURL}/api/download/${doc.id}`}
                            download
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                            title="Descargar documento"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEliminar(doc.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                            title="Eliminar documento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
                <span>
                  Total: {documentosCarpeta.length} documento{documentosCarpeta.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">Carpeta: {carpeta?.nombre}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ModalCarpeta.propTypes = {
  carpeta: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    nombre: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
