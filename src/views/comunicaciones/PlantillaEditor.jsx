import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { 
  FileText, Image, Video, Globe, Download, Plus, Trash2, Save, Eye,
  List, Edit3, Mail, Copy, Search, RefreshCw, ArrowLeft
} from "lucide-react";

import Swal from "sweetalert2";
import { plantillasApi } from "../../services/api";

export default function PlantillaEditor() {
  // ✅ Estados existentes
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [logosEmpresas, setLogosEmpresas] = useState([]);
  const [certificaciones, setCertificaciones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [descargas, setDescargas] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // ✅ Nuevos estados para CRUD
  const [modo, setModo] = useState('crear'); // 'crear', 'lista', 'editar'
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // ✅ Cargar plantillas
  useEffect(() => {
    if (modo === 'lista') {
      cargarPlantillas();
    }
  }, [modo]);

  const cargarPlantillas = async () => {
    setLoading(true);
    try {
      const response = await plantillasApi.getAll();
      setPlantillas(response.data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      Swal.fire('Error', 'No se pudieron cargar las plantillas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setContenido("");
    setVideoUrl("");
    setImagenes([]);
    setLogosEmpresas([]);
    setCertificaciones([]);
    setRedes([]);
    setDescargas([]);
    setPlantillaEditando(null);
  };

  // ✅ Función para editar
 const handleEditar = async (plantilla) => {
  try {
    setLoading(true);
    const response = await plantillasApi.getForEdit(plantilla.id);

    // 🔍 Estructura exacta del backend
    const data = response.data?.data || {}; // <- Contiene todos los campos útiles
    console.log("Respuesta al editar plantilla:", data);

    // ✅ Cargar datos principales
    setNombre(data.nombre || "");
    setContenido(data.contenido_html || "");
    setVideoUrl(data.video_url || "");

    // ✅ Cargar colecciones (arrays)
    setImagenes(Array.isArray(data.imagenes) ? data.imagenes : []);
    setLogosEmpresas(Array.isArray(data.logos_empresas) ? data.logos_empresas : []);
    setCertificaciones(Array.isArray(data.certificaciones) ? data.certificaciones : []);
    setRedes(Array.isArray(data.redes_sociales) ? data.redes_sociales : []);
    setDescargas(Array.isArray(data.descargas) ? data.descargas : []);

    // ✅ Guardar la plantilla completa con id para el PUT
    setPlantillaEditando(data);

    // ✅ Cambiar modo a edición
    setModo("editar");
  } catch (error) {
    console.error("Error al cargar plantilla:", error);
    Swal.fire("Error", "No se pudo cargar la plantilla", "error");
  } finally {
    setLoading(false);
  }
};



  // ✅ Función para eliminar
  const handleEliminar = async (plantilla) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la plantilla "${plantilla.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await plantillasApi.delete(plantilla.id);
        Swal.fire('Eliminado', 'Plantilla eliminada correctamente', 'success');
        cargarPlantillas();
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', 'No se pudo eliminar la plantilla', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ Función guardar actualizada
  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Swal.fire('Error', 'El nombre de la plantilla es obligatorio', 'warning');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("contenido_html", contenido);
      if (videoUrl) {
        formData.append("video_url", videoUrl);
      }
imagenes.forEach((img) => {
  if (img instanceof File) {
    formData.append("imagenes[]", img); // ✅ solo archivos nuevos
  }
});

    logosEmpresas.forEach((logo) => {
  if (logo instanceof File) {
    formData.append("logos_empresas[]", logo);
  }
});

certificaciones.forEach((cert, index) => {
  formData.append(`certificaciones[${index}][nombre]`, cert.nombre || "");
  formData.append(`certificaciones[${index}][url_cert]`, cert.url_cert || "");

  if (cert.logo instanceof File) {
    formData.append(`certificaciones[${index}][logo]`, cert.logo);
  } else if (typeof cert.logo === "string") {
    formData.append(`certificaciones[${index}][logo_existente]`, cert.logo);
  }
});


      certificaciones.forEach((cert, index) => {
        formData.append(`certificaciones[${index}][nombre]`, cert.nombre || "");
        formData.append(`certificaciones[${index}][url_cert]`, cert.url_cert || "");
        if (cert.logo instanceof File) {
          formData.append(`certificaciones[${index}][logo]`, cert.logo);
        }
      });

      redes.forEach((r, index) => {
        formData.append(`redes_sociales[${index}][nombre]`, r.nombre || "");
        formData.append(`redes_sociales[${index}][url]`, r.url || "");
      });

      descargas.forEach((d, index) => {
        formData.append(`descargas[${index}][nombre]`, d.nombre || "");
        formData.append(`descargas[${index}][link]`, d.link || "");
      });

      if (plantillaEditando) {
        // Actualizar plantilla existente
        
        await plantillasApi.update(plantillaEditando.id, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("✅ Actualizado", "Plantilla actualizada correctamente", "success");
      } else {
        // Crear nueva plantilla
        await plantillasApi.create(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("✅ Guardado", "Plantilla creada correctamente", "success");
      }

      limpiarFormulario();
      setModo('lista');

    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      Swal.fire("❌ Error", "No se pudo guardar la plantilla", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (array, setArray, index) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    setArray(newArray);
  };

  // ✅ Filtrar plantillas
  const plantillasFiltradas = plantillas.filter(plantilla => 
    plantilla.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ✅ VISTA DE LISTA
  if (modo === 'lista') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <List className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Plantillas</h1>
                  <p className="text-gray-600">Administra tus plantillas de correo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  limpiarFormulario();
                  setModo('crear');
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nueva Plantilla
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={cargarPlantillas}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-b-2xl">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : plantillasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay plantillas disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {plantillasFiltradas.map((plantilla) => (
                  <div key={plantilla.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">{plantilla.nombre}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(plantilla.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(plantilla)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm disabled:opacity-50"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(plantilla)}
                        disabled={loading}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ VISTA DE FORMULARIO (crear/editar) - contenido original
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModo('lista')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {plantillaEditando ? 'Editar Plantilla' : 'Editor de Plantillas'}
                </h1>
                <p className="text-gray-600">
                  {plantillaEditando ? 'Modifica la plantilla existente' : 'Crea y personaliza plantillas de correo profesionales'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModo('lista')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <List className="w-4 h-4" />
                Ver Lista
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Ocultar' : 'Vista previa'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Panel izquierdo - contenido original */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre de la plantilla
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Bienvenida a nuevos clientes"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Imágenes de la plantilla
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImagenes([...e.target.files])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contenido principal
                </label>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={contenido}
                    onChange={setContenido}
                    className="min-h-[300px]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image", "video"],
                        ["clean"]
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Video (YouTube, Vimeo o enlace externo)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... o https://setasplast.com.co/catalogo.pdf"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500 italic">
                  Ingresa el enlace de YouTube o recurso externo que deseas mostrar en el correo.
                </p>
              </div>
            </div>

            {/* Panel derecho - contenido original (logos, certificaciones, etc.) */}
            <div className="space-y-6">
              {/* Logos de empresas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Image className="w-4 h-4 text-purple-600" />
                    Logos de empresas
                  </h3>
                  <button
                    onClick={() => setLogosEmpresas([...logosEmpresas, { url: "", nombre: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {logosEmpresas.map((logo, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const arr = [...logosEmpresas];
                          arr[i] = e.target.files[0];
                          setLogosEmpresas(arr);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => removeItem(logosEmpresas, setLogosEmpresas, i)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {logosEmpresas.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">
                      No hay logos agregados
                    </p>
                  )}
                </div>
              </div>

              {/* Certificaciones */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    Certificaciones
                  </h3>
                  <button
                    onClick={() => setCertificaciones([...certificaciones, { nombre: "", logo: "", url_cert: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {certificaciones.map((cert, i) => (
                    <div key={i} className="space-y-2 p-2 border border-gray-200 rounded-md bg-white">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nombre de certificación"
                          value={cert.nombre}
                          onChange={(e) => {
                            const arr = [...certificaciones];
                            arr[i].nombre = e.target.value;
                            setCertificaciones(arr);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                        />
                        <button
                          onClick={() => removeItem(certificaciones, setCertificaciones, i)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const arr = [...certificaciones];
                          arr[i].logo = e.target.files[0];
                          setCertificaciones(arr);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  ))}
                  {certificaciones.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">
                      No hay certificaciones agregadas
                    </p>
                  )}
                </div>
              </div>

              {/* Redes sociales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Redes sociales
                  </h3>
                  <button
                    onClick={() => setRedes([...redes, { nombre: "", url: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {redes.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Red social"
                        value={r.nombre}
                        onChange={(e) => {
                          const arr = [...redes];
                          arr[i].nombre = e.target.value;
                          setRedes(arr);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={r.url}
                        onChange={(e) => {
                          const arr = [...redes];
                          arr[i].url = e.target.value;
                          setRedes(arr);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeItem(redes, setRedes, i)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {redes.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">
                      No hay redes sociales agregadas
                    </p>
                  )}
                </div>
              </div>

              {/* Descargas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-orange-600" />
                    Archivos descargables
                  </h3>
                  <button
                    onClick={() => setDescargas([...descargas, { nombre: "", link: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {descargas.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del archivo"
                        value={d.nombre}
                        onChange={(e) => {
                          const arr = [...descargas];
                          arr[i].nombre = e.target.value;
                          setDescargas(arr);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="url"
                        placeholder="Enlace de descarga"
                        value={d.link}
                        onChange={(e) => {
                          const arr = [...descargas];
                          arr[i].link = e.target.value;
                          setDescargas(arr);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => removeItem(descargas, setDescargas, i)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {descargas.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">
                      No hay archivos agregados
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {plantillaEditando ? `Editando: ${plantillaEditando.nombre}` : `Plantilla: ${nombre || "Sin nombre"}`}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModo('lista')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Guardando...' : (plantillaEditando ? 'Actualizar' : 'Guardar')} Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Vista Previa
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">{nombre || "Plantilla sin título"}</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: contenido }}
              />
              {videoUrl && (
                <div className="mt-4">
                  <strong>Video:</strong>
                  <div className="mt-2">
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Video className="w-4 h-4" />
                      Ver video
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}