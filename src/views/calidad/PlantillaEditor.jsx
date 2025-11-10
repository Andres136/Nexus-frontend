import { useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { FileText, Image, Video, Globe, Download, Plus, Trash2, Save, Eye } from "lucide-react";

import Swal from "sweetalert2";
import { plantillasApi } from "../../services/api";

export default function PlantillaEditor() {
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [imagenes, setImagenes] = useState([]);
  const [logosEmpresas, setLogosEmpresas] = useState([]);
  const [certificaciones, setCertificaciones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [descargas, setDescargas] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGuardar = async () => {
    try {
const formData = new FormData();
formData.append("nombre", nombre);
formData.append("contenido_html", contenido);
if (videoFile instanceof File) {
  formData.append("video_file", videoFile);
}


// Adjuntar múltiples archivos
imagenes.forEach((img) => formData.append("imagenes[]", img));
logosEmpresas.forEach((logo) => formData.append("logos_empresas[]", logo));

// Campos tipo JSON
// 🔹 Certificaciones (nombre + logo + url_cert)
certificaciones.forEach((cert, index) => {
  formData.append(`certificaciones[${index}][nombre]`, cert.nombre || "");
  formData.append(`certificaciones[${index}][url_cert]`, cert.url_cert || "");
  if (cert.logo instanceof File) {
    formData.append(`certificaciones[${index}][logo]`, cert.logo);
  }
});

// 🔹 Redes sociales
redes.forEach((r, index) => {
  formData.append(`redes_sociales[${index}][nombre]`, r.nombre || "");
  formData.append(`redes_sociales[${index}][url]`, r.url || "");
});

// 🔹 Descargas
descargas.forEach((d, index) => {
  formData.append(`descargas[${index}][nombre]`, d.nombre || "");
  formData.append(`descargas[${index}][link]`, d.link || "");
});


await plantillasApi.create(formData, {
  headers: { "Content-Type": "multipart/form-data" },
});


      Swal.fire("✅ Guardado", "Plantilla registrada correctamente", "success");
    } catch (error) {
        console.error("Error al guardar la plantilla:", error);
      Swal.fire("❌ Error", "No se pudo guardar la plantilla", error);
    }
  };

  // ✅ NUEVA: Función para eliminar elementos
  const removeItem = (array, setArray, index) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    setArray(newArray);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ✅ MEJORADO: Header más atractivo */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editor de Plantillas</h1>
                <p className="text-gray-600">Crea y personaliza plantillas de correo profesionales</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Vista previa'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* ✅ PANEL IZQUIERDO: Editor */}
            <div className="space-y-6">
              {/* ✅ MEJORADO: Nombre de plantilla */}
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

              {/* ✅ MEJORADO: Editor de contenido */}
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

              {/* ✅ MEJORADO: Video URL */}
             <div className="space-y-3">
  <label className="block text-sm font-semibold text-gray-700">
    Video o catálogo destacado
  </label>

  {/* Campo para subir video MP4 */}
  <div className="flex items-center gap-3">
    <input
      type="file"
      accept="video/mp4"
      onChange={(e) => setVideoFile(e.target.files[0])}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
    />
    {videoFile && (
      <p className="text-xs text-green-600 truncate w-1/2">
        {videoFile.name}
      </p>
    )}
  </div>

  {/* Campo alternativo para URL (YouTube o PDF) */}
  <input
    type="url"
    placeholder="https://youtube.com/watch?v=... o https://setasplast.com.co/...pdf"
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
  />
</div>

            </div>

            {/* ✅ PANEL DERECHO: Elementos adicionales */}
            <div className="space-y-6">
              {/* ✅ MEJORADO: Logos de empresas */}
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
    arr[i] = e.target.files[0]; // guardamos el archivo
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

              {/* ✅ MEJORADO: Certificaciones */}
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
                          arr[i].logo = e.target.files[0]; // guardamos el archivo
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

              {/* ✅ MEJORADO: Redes sociales */}
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

              {/* ✅ MEJORADO: Descargas */}
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

          {/* ✅ MEJORADO: Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Plantilla: {nombre || "Sin nombre"}
              </div>
              <button
                onClick={handleGuardar}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4" />
                Guardar Plantilla
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NUEVO: Panel de vista previa */}
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
                  <strong>Video:</strong> {videoUrl}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}