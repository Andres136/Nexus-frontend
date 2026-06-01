import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import {
  FileText, Image, Video, Globe, Download, Plus, Trash2, Save, Eye,
  List, Edit3, Search, RefreshCw, ArrowLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { plantillasApi } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "";

// Convierte rutas relativas del backend ("storage/...") en URLs absolutas
const storageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${API_URL}/${url.replace(/^\/+/, "")}`;
};

export default function PlantillaEditor() {
  // ── Campos simples ────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [contenido, setContenido] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [imagenMascota, setImagenMascota] = useState(null);

  // ── Colecciones ───────────────────────────────────────────────────────────
  // Imágenes: existentes = {url,titulo}[] del backend · nuevas = File[]
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  // Logos: existentes = {url,nombre}[] del backend · nuevos = File[]
  const [logosExistentes, setLogosExistentes] = useState([]);
  const [logosNuevos, setLogosNuevos] = useState([]);

  const [certificaciones, setCertificaciones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [descargas, setDescargas] = useState([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);
  const [modo, setModo] = useState("crear");
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // ── Refs para file-inputs ocultos ─────────────────────────────────────────
  const logoInputRef = useRef(null);
  const imagenesInputRef = useRef(null);

  // ── Cargar lista ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (modo === "lista") cargarPlantillas();
  }, [modo]);

  const cargarPlantillas = async () => {
    setLoading(true);
    try {
      const response = await plantillasApi.getAll();
      setPlantillas(response.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTipo("");
    setContenido("");
    setVideoUrl("");
    setImagenPrincipal(null);
    setImagenMascota(null);
    setImagenesExistentes([]);
    setImagenesNuevas([]);
    setLogosExistentes([]);
    setLogosNuevos([]);
    setCertificaciones([]);
    setRedes([]);
    setDescargas([]);
    setPlantillaEditando(null);
  };

  // ── Editar ────────────────────────────────────────────────────────────────
  const handleEditar = async (plantilla) => {
    try {
      setLoading(true);
      const response = await plantillasApi.getForEdit(plantilla.id);
      const data = response.data?.data || {};

      setNombre(data.nombre || "");
      setTipo(data.tipo || "");
      setContenido(data.contenido_html || "");
      setVideoUrl(data.video_url || "");
      setImagenPrincipal(data.imagen_principal || null);
      setImagenMascota(data.imagen_mascota || null);

      setImagenesExistentes(Array.isArray(data.imagenes) ? data.imagenes : []);
      setImagenesNuevas([]);
      setLogosExistentes(Array.isArray(data.logos_empresas) ? data.logos_empresas : []);
      setLogosNuevos([]);
      setCertificaciones(Array.isArray(data.certificaciones) ? data.certificaciones : []);
      setRedes(Array.isArray(data.redes_sociales) ? data.redes_sociales : []);
      setDescargas(Array.isArray(data.descargas) ? data.descargas : []);

      setPlantillaEditando(data);
      setModo("editar");
    } catch {
      Swal.fire("Error", "No se pudo cargar la plantilla", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleEliminar = async (plantilla) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará la plantilla "${plantilla.nombre}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await plantillasApi.delete(plantilla.id);
      Swal.fire("Eliminado", "Plantilla eliminada correctamente", "success");
      cargarPlantillas();
    } catch {
      Swal.fire("Error", "No se pudo eliminar la plantilla", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar / Actualizar ──────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre de la plantilla es obligatorio", "warning");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();

      // Campos simples
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("contenido_html", contenido);
      if (videoUrl) formData.append("video_url", videoUrl);

      // Imagen principal: solo si es un archivo nuevo
      if (imagenPrincipal instanceof File) {
        formData.append("imagen_principal", imagenPrincipal);
      }

      // Imagen mascota (GAIA): solo si es un archivo nuevo
      if (imagenMascota instanceof File) {
        formData.append("imagen_mascota", imagenMascota);
      }

      // Imágenes: existentes a conservar + nuevas a subir
      formData.append("imagenes_keep", JSON.stringify(imagenesExistentes));
      imagenesNuevas.forEach((f) => formData.append("imagenes[]", f));

      // Logos: existentes a conservar + nuevos a subir
      formData.append("logos_keep", JSON.stringify(logosExistentes));
      logosNuevos.forEach((f) => formData.append("logos_empresas[]", f));

      // Certificaciones (un solo loop)
      certificaciones.forEach((cert, index) => {
        formData.append(`certificaciones[${index}][nombre]`, cert.nombre || "");
        formData.append(`certificaciones[${index}][url_cert]`, cert.url_cert || "");
        if (cert.logo instanceof File) {
          formData.append(`certificaciones[${index}][logo]`, cert.logo);
        } else if (typeof cert.logo === "string" && cert.logo) {
          formData.append(`certificaciones[${index}][logo]`, cert.logo);
        }
      });

      // Redes sociales
      redes.forEach((r, index) => {
        formData.append(`redes_sociales[${index}][nombre]`, r.nombre || "");
        formData.append(`redes_sociales[${index}][url]`, r.url || "");
      });

      // Descargas
      descargas.forEach((d, index) => {
        formData.append(`descargas[${index}][nombre]`, d.nombre || "");
        formData.append(`descargas[${index}][link]`, d.link || "");
      });

      if (plantillaEditando) {
        await plantillasApi.update(plantillaEditando.id, formData);
        Swal.fire("✅ Actualizado", "Plantilla actualizada correctamente", "success");
      } else {
        await plantillasApi.create(formData);
        Swal.fire("✅ Guardado", "Plantilla creada correctamente", "success");
      }

      limpiarFormulario();
      setModo("lista");
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire("❌ Error", "No se pudo guardar la plantilla", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (arr, setArr, index) => {
    const next = [...arr];
    next.splice(index, 1);
    setArr(next);
  };

  const plantillasFiltradas = plantillas.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════════
  // VISTA LISTA
  // ════════════════════════════════════════════════════════════════
  if (modo === "lista") {
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
                onClick={() => { limpiarFormulario(); setModo("crear"); }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nueva Plantilla
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-b-2xl">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
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
                      {plantilla.tipo && (
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{plantilla.tipo}</span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
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

  // ════════════════════════════════════════════════════════════════
  // VISTA FORMULARIO (crear / editar)
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setModo("lista")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {plantillaEditando ? "Editar Plantilla" : "Editor de Plantillas"}
                </h1>
                <p className="text-gray-600">
                  {plantillaEditando ? `Modificando: ${plantillaEditando.nombre}` : "Crea y personaliza plantillas de correo profesionales"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModo("lista")}
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
                {showPreview ? "Ocultar" : "Vista previa"}
              </button>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow-lg rounded-b-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

            {/* ── Panel izquierdo ────────────────────────────── */}
            <div className="space-y-6">

              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Nombre de la plantilla *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Bienvenida a nuevos clientes"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Tipo de plantilla</label>
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  placeholder="Ej: Bienvenida, Promocional, Informativo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Imagen principal */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Imagen de portada (banner)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenPrincipal(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {imagenPrincipal && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={imagenPrincipal instanceof File ? URL.createObjectURL(imagenPrincipal) : storageUrl(imagenPrincipal)}
                      alt="Portada"
                      className="max-h-40 rounded-lg shadow border border-gray-200 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImagenPrincipal(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >×</button>
                  </div>
                )}
              </div>

              {/* Imagen mascota (GAIA) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Imagen de mascota (aparece en el saludo)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenMascota(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                {imagenMascota && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={imagenMascota instanceof File ? URL.createObjectURL(imagenMascota) : storageUrl(imagenMascota)}
                      alt="Mascota"
                      className="w-24 h-24 rounded-full object-contain border-2 border-green-200 shadow bg-green-50"
                    />
                    <button
                      type="button"
                      onClick={() => setImagenMascota(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >×</button>
                  </div>
                )}
              </div>

              {/* Imágenes del cuerpo */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Imágenes del cuerpo</label>

                {/* Existentes */}
                {imagenesExistentes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {imagenesExistentes.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={storageUrl(img.url)}
                          alt={img.titulo || "imagen"}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setImagenesExistentes((e) => e.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nuevas (nombres de archivo) */}
                {imagenesNuevas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {imagenesNuevas.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-700">
                        <span className="truncate max-w-[110px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setImagenesNuevas((n) => n.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input oculto + botón */}
                <input
                  ref={imagenesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    setImagenesNuevas((n) => [...n, ...Array.from(e.target.files)]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => imagenesInputRef.current.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                >
                  <Plus className="w-4 h-4" />
                  Agregar imágenes
                </button>
              </div>

              {/* Contenido HTML */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Contenido principal</label>
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
                        ["clean"],
                      ],
                    }}
                  />
                </div>
              </div>

              {/* Video */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Video className="inline w-4 h-4 mr-1 text-gray-500" />
                  Video (YouTube, Vimeo o enlace externo)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* ── Panel derecho ───────────────────────────────── */}
            <div className="space-y-6">

              {/* Logos de empresas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Image className="w-4 h-4 text-purple-600" />
                    Logos de empresas
                  </h3>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current.click()}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    setLogosNuevos((n) => [...n, ...Array.from(e.target.files)]);
                    e.target.value = "";
                  }}
                />

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {/* Existentes */}
                  {logosExistentes.map((logo, i) => (
                    <div key={`ex-${i}`} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                      <img src={storageUrl(logo.url)} alt={logo.nombre || "Logo"} className="w-10 h-10 object-contain rounded border border-gray-100" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{logo.nombre || "Logo"}</span>
                      <button
                        type="button"
                        onClick={() => setLogosExistentes((e) => e.filter((_, idx) => idx !== i))}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* Nuevos */}
                  {logosNuevos.map((logo, i) => (
                    <div key={`nw-${i}`} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded border border-blue-200 flex items-center justify-center">
                        <Image className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="flex-1 text-sm text-blue-700 truncate">{logo.name}</span>
                      <button
                        type="button"
                        onClick={() => setLogosNuevos((n) => n.filter((_, idx) => idx !== i))}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {logosExistentes.length === 0 && logosNuevos.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">No hay logos agregados</p>
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
                    type="button"
                    onClick={() => setCertificaciones([...certificaciones, { nombre: "", logo: "", url_cert: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {certificaciones.map((cert, i) => (
                    <div key={i} className="space-y-2 p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Nombre de certificación"
                          value={cert.nombre}
                          onChange={(e) => {
                            const arr = [...certificaciones];
                            arr[i].nombre = e.target.value;
                            setCertificaciones(arr);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(certificaciones, setCertificaciones, i)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Preview logo existente */}
                        {typeof cert.logo === "string" && cert.logo && (
                          <img src={storageUrl(cert.logo)} alt="logo cert" className="w-10 h-10 object-contain rounded border border-gray-200 shrink-0" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const arr = [...certificaciones];
                            arr[i].logo = e.target.files[0];
                            setCertificaciones(arr);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="URL del certificado (opcional)"
                        value={cert.url_cert || ""}
                        onChange={(e) => {
                          const arr = [...certificaciones];
                          arr[i].url_cert = e.target.value;
                          setCertificaciones(arr);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  ))}
                  {certificaciones.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">No hay certificaciones agregadas</p>
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
                    type="button"
                    onClick={() => setRedes([...redes, { nombre: "", url: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {redes.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={r.nombre}
                        onChange={(e) => {
                          const arr = [...redes];
                          arr[i].nombre = e.target.value;
                          setRedes(arr);
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
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
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(redes, setRedes, i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {redes.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">No hay redes sociales agregadas</p>
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
                    type="button"
                    onClick={() => setDescargas([...descargas, { nombre: "", link: "" }])}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
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
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
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
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(descargas, setDescargas, i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {descargas.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-2">No hay archivos agregados</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer botones */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {plantillaEditando ? `Editando: ${plantillaEditando.nombre}` : `Plantilla: ${nombre || "Sin nombre"}`}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModo("lista")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Guardando..." : plantillaEditando ? "Actualizar Plantilla" : "Guardar Plantilla"}
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
              {tipo && <p className="text-sm text-gray-500 mb-2">Tipo: {tipo}</p>}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contenido }} />
              {videoUrl && (
                <div className="mt-4">
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                    <Video className="w-4 h-4" />
                    Ver video
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
