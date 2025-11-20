import { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { useGestionProcesos } from '../../hooks/useGestionProcesos';
import { useAuth } from '../../hooks/useAuth';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { Download, Edit, Folder, Move3DIcon, Search } from 'lucide-react';
import Swal from 'sweetalert2';

function ProcesosDepartamento() {
  // Obtenemos el departamentoId desde la URL
  const [procesoEditando, setProcesoEditando] = useState(null);
const [nuevoNombreProceso, setNuevoNombreProceso] = useState('');

  const { departamentoId } = useParams();
  
  const [acordeonAbierto, setAcordeonAbierto] = useState("");

  const [usuariosDepartamento, setUsuariosDepartamento] = useState();
  // Dentro de ProcesosDepartamento, junto al resto de useState:
const [filtroDocs, setFiltroDocs] = useState('');
// Añade junto a los otros useState:
const [editingDocId, setEditingDocId] = useState(null);
const [newDocName, setNewDocName] = useState('');
const [inputValue, setInputValue] = useState('');   // lo que escribe el usuario
const [searchTerm, setSearchTerm] = useState('');   // el término al que filtrar




  const toggleAcordeon = (seccion) => {
    setAcordeonAbierto((prev) => (prev === seccion ? "" : seccion));
  };

  // Extraemos la información del usuario
  const { user } = useAuth({ middleware: "auth" });

const ordenManual = [
  "Registros",
  "Recursos",
  "Procedimientos",
  "Políticas",
  "Otros documentos",
  "Instructivos",
  "Formatos",
  "Caracterización del proceso"
];

  // Consumimos el hook
  const {
    departamentos,
    procesos,
    documentacion,
    departamentoSeleccionado,
    procesoSeleccionado,
    error,
    errorProceso,
    erroresProceso,
    erroresDocumentacion,
    
    // Refs
    nuevoProcesoRef,
    nuevaDocumentacionNombreRef,
    nuevaDocumentacionArchivoRef,
    nuevaDocumentacionVersionRef,
    nuevaDocumentacionObservacionesRef,
    nuevaTareaNombreRef,
    nuevaTareaDescripcionRef,
    nuevaTareaFechaRef,
    nuevErrorDescripcionRef,
    nuevaTareaUsuarioRef,
    
    // Métodos
    cargarProcesos,
    cargarDocumentacion,
    registrarProceso,
    registrarDocumentacion,
    registrarTarea,
    registrarError,
    formatDate,
    moverAObsoletos,
  } = useGestionProcesos();

  // Cuando el componente monte o cambie el departamentoId, cargamos los procesos
  useEffect(() => {
    if (departamentoId) {
      cargarProcesos(departamentoId);
      cargarUsuariosDepartamento(departamentoId);
    }
    // eslint-disable-next-line
  }, [departamentoId]);

  const departamentoActual = departamentos.find(
    (dep) => dep.id === Number(departamentoSeleccionado)
  );
  
  const procesoActual = procesos.find(
    (p) => p.id === Number(procesoSeleccionado)
  );


  //Asignar Tareas a usuarios que pertenezcan al departamento
 
const cargarUsuariosDepartamento = async (departamentoId) => {
      const token = localStorage.getItem('token');  
      try {
        const response = await clienteAxios.get(`/api/usuarios/departamento/${departamentoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        
        });
        
        setUsuariosDepartamento(response.data);
      } catch (error) {
        console.error('Error al cargar los usuarios del departamento:', error);
        toast.error('No hay  usuarios para registrado para el departamento');
      }
}

//Actualizar el nombre del documento
const guardarNombreDocumento = async (docId) => {
  const token = localStorage.getItem('token');
  try {
    await clienteAxios.put(
      `/api/documentos/${docId}`,
      { nombre: newDocName },
      { headers: { Authorization: `Bearer ${token}` }}
    );
    toast.success('Nombre de documento actualizado');
    setEditingDocId(null);
    cargarDocumentacion(procesoSeleccionado);
  } catch (error) {
    console.error('Error al actualizar documento', error);
    toast.error('No se pudo actualizar el nombre');
  }
};

//Eliminar documento
const eliminarDocumento = async (documentoId) => {
  const token = localStorage.getItem("token");
  try {
    await clienteAxios.delete(`/api/documentos/${documentoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Documento eliminado");
    cargarDocumentacion(procesoSeleccionado);  // recargamos la lista
  } catch (error) {
    console.error("Error al eliminar documento", error);
    toast.error("Error al eliminar");
  }
}
const confirmarEliminacion = (documentoId) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, mover a obsoletos',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      moverAObsoletos(documentoId);
    }
  });
}
const procesosOrdenados = [...procesos].sort((a, b) => {
  const indexA = ordenManual.indexOf(a.nombre);
  const indexB = ordenManual.indexOf(b.nombre);

  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
});

const abrirModalEdicion = (proceso) => {
  setProcesoEditando(proceso);
  setNuevoNombreProceso(proceso.nombre);
};
const editarNombreProceso = async () => {
  const token = localStorage.getItem("token");
  try {
    await clienteAxios.put(`/api/procesos/${procesoEditando.id}`, {
      nombre: nuevoNombreProceso,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Nombre de carpeta actualizado");
    setProcesoEditando(null);
    cargarProcesos(departamentoId); // recargar
  } catch (error) {
    toast.error("Error al actualizar nombre");
    console.error(error);
  }
};

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setProcesoEditando(null);
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
// Filtra por nombre (case-insensitive)
// Reemplaza tu docsFiltrados actual por esto:
const docsFiltrados = documentacion.filter(doc =>
  doc.nombre.toLowerCase().includes(inputValue.toLowerCase())
);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Título del Departamento */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
         {departamentoActual?.nombre || "No seleccionado"}
      </h2>
<div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role_id === 1 || user?.role_id === 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 mb-6`}>

        {/* Columna 1: Procesos Registrados */}
       <section className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">📁 Carpetas</h3>

      {procesosOrdenados.length > 0 ? (
        <ul className="flex flex-col divide-y divide-gray-200">
          {procesosOrdenados.map((proceso) => (
        <li
  key={proceso.id}
  className={`p-4 rounded-xl transition border ${
    procesoSeleccionado === proceso.id
      ? 'bg-green-100 border-green-500 py-4 flex items-center justify-between'
      : 'bg-white border-gray-200 hover:bg-gray-50 flex items-center justify-between'
  } flex flex-col sm:flex-row justify-between sm:items-center gap-4`}
>
  {/* Nombre de la carpeta */}
  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
    <Folder size={22} className="text-yellow-500" />
    {proceso.nombre}
  </div>

  {/* Acciones: Editar + Ver documentación */}
  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
    {user?.role_id === 1 && (
      <button
        onClick={() => abrirModalEdicion(proceso)}
        className="text-sm text-blue-600 hover:underline"
      >
        <Edit size={20} className="inline mr-1" />
      </button>
    )}
    <button
      onClick={() => cargarDocumentacion(proceso.id)}
      className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2 text-sm"
    >
      <Folder size={12} />
      Ver Documentación
    </button>
  </div>
</li>

          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay Carpetas disponibles.</p>
      )}
    </section>

        {/* Columna 2: Documentación Disponible */}
 
  <section className="flex flex-col bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition min-h-0">
  <h3 className="text-xl font-semibold mb-4 text-gray-800">
    {procesoActual?.nombre || "No has seleccionado una carpeta"}
  </h3>

  {/* Buscador */}
<div className="flex items-center justify-between mb-4 gap-2">
  <div className="relative flex-1">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <path strokeWidth="2" d="M21 21l-4.35-4.35" />
      </svg>
    </span>
    <input
      type="text"
      placeholder="Buscar documento..."
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      className="border pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 transition"
    />
  </div>
  <button
    onClick={() => setSearchTerm(inputValue.trim())}
    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition"
    title="Refrescar"
  >
   <Search size={16} />
  </button>
</div>


 <div className="flex-1 overflow-y-auto">

{docsFiltrados.length > 0 ? (
  <ul className="space-y-4">
    {docsFiltrados.map((doc) => (
      <li key={doc.id} className="p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full">
          {/* Inline editing del nombre */}
          {editingDocId === doc.id ? (
            <>
              <input
                type="text"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                className="p-2 border rounded w-full mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => guardarNombreDocumento(doc.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingDocId(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg text-gray-700">{doc.nombre}</p>
              {user?.role_id === 1 && (
                <button
                  onClick={() => {
                    setEditingDocId(doc.id);
                    setNewDocName(doc.nombre);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          )}

          {/* Resto de metadatos */}
          <p className="text-gray-500 text-sm">Versión: {doc.version}</p>
          <p className="text-gray-500 text-sm">Observaciones: {doc.observaciones || 'N/A'}</p>
          <p className="text-gray-500 text-sm">Subido por: {doc.usuarios.name}</p>
          <p className="text-gray-500 text-sm">Fecha: {formatDate(doc.created_at)}</p>
        </div>

        {/* Botones descargar/eliminar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={`${clienteAxios.defaults.baseURL}/api/documentos/descargar/${doc.id}`}
            download target="_blank" rel="noopener noreferrer"
           className="bg-gray-800 text-white px-4 py-3 rounded hover:bg-gray-900 flex items-center gap-2 h-10"
          >
            <Download size={16}/> 
          </a>
          {user?.role_id === 1 && (
            <button
              onClick={() => confirmarEliminacion(doc.id)}
       className="bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 h-10"
            >
              <Move3DIcon size={16} />
            </button>
          )}
        </div>
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-500">No hay documentación disponible.</p>
)}</div>
</section>



        {/* Columna 3: Formularios de Registro (solo para administradores) */}
        {departamentoActual && (user?.role_id === 1 || user?.role_id === 2)   &&(
          <section className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div>
              <h3 className='text-xl font-semibold mb-4'>
                Formulario de Registro para : {departamentoActual?.nombre || "No hay un proceso seleccionado"}
              </h3>
              {/* Aquí se incluyen los acordeones para registrar procesos, documentación, tareas y errores */}
              
              {/* Acordeón: Registrar Items */}
              <div className="mt-6">
                <button
                  className="w-full text-left p-4 font-semibold text-white bg-gray-500 rounded-lg focus:outline-none"
                  onClick={() => toggleAcordeon("procesos")}
                >
                  Registrar Carpeta
                </button>
                {acordeonAbierto === "procesos" && (
                  <div className="p-4">
                    <input
                      type="text"
                      ref={nuevoProcesoRef}
                      placeholder="Nombre del proceso"
                      className={`p-3 border rounded-lg w-full ${
                        errorProceso.nombre ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errorProceso.nombre && (
                      <p className="text-red-500 text-sm mt-1">{errorProceso.nombre[0]}</p>
                    )}
                    <button
                      onClick={(e)=>registrarProceso(e,departamentoActual)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-green-700 transition"
                    >
                      Registrar Carpeta
                    </button>
                  </div>
                )}
              </div>

              {/* Acordeón: Registrar Documentación */}
              <div className="mt-6">
               <button
  className="w-full text-left p-4 font-semibold text-white bg-gray-500 rounded-lg focus:outline-none"
  onClick={() => toggleAcordeon("documentacion")}
  disabled={!procesoActual}       // opcional, para bloquear si no hay proceso
>
 { procesoActual ? (
    <span className="text-gray-100">
      {`${procesoActual.nombre} – Sube un archivo`}
    </span>
  ) : (
    <span className="text-white">
      No se ha seleccionado una Carpeta
    </span>
  )
}

</button>

                {acordeonAbierto === "documentacion" && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-2">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Nombre del documento</label>
                      <input
                        type="text"
                        ref={nuevaDocumentacionNombreRef}
                        placeholder="Nombre del documento"
                        className={`p-3 border rounded-lg w-full ${
                          erroresDocumentacion.nombre ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {erroresDocumentacion.nombre && (
                        <p className="text-red-500 text-sm mt-1">
                          {erroresDocumentacion.nombre[0]}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Archivo del documento</label>
                      <input
                        type="file"
                        ref={nuevaDocumentacionArchivoRef}
                        className={`p-3 border rounded-lg w-full ${
                          erroresDocumentacion.documento ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {erroresDocumentacion.documento && (
                        <p className="text-red-500 text-sm mt-1">
                          {erroresDocumentacion.documento[0]}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Versión</label>
                      <input
                        type="text"
                        ref={nuevaDocumentacionVersionRef}
                        placeholder="Versión"
                        className={`p-3 border rounded-lg w-full ${
                          erroresDocumentacion.version ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {erroresDocumentacion.version && (
                        <p className="text-red-500 text-sm mt-1">
                          {erroresDocumentacion.version[0]}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
  <label className="block text-gray-700 font-semibold mb-2">Observaciones</label>
  <input
    type="text"
    ref={nuevaDocumentacionObservacionesRef}
    placeholder="Observaciones sobre la versión"
    className={`p-3 border rounded-lg w-full ${
      erroresDocumentacion.observaciones ? "border-red-500" : "border-gray-300"
    }`}
  />
  {erroresDocumentacion.observaciones && (
    <p className="text-red-500 text-sm mt-1">
      {erroresDocumentacion.observaciones[0]}
    </p>
  )}
</div>

                    <button
                      onClick={registrarDocumentacion}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 transition"
                    >
                      Registrar Documentación
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  className="w-full text-left p-4 font-semibold text-white bg-gray-500 rounded-lg focus:outline-none"
                  onClick={() => toggleAcordeon("tareas")}
               
                >
                  {departamentoActual?.nombre ? `Registrar Tarea para ${departamentoActual?.nombre}` : "Registrar Tarea"}
                </button>
                {acordeonAbierto === "tareas" &&  (
                  <div className="p-4">
                    <input
                      type="text"
                      ref={nuevaTareaNombreRef}
                      placeholder="Nombre de la tarea"
                      className={`p-3 border rounded-lg w-full ${
                        error.nombre ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error.nombre && (
                      <p className="text-red-500 text-sm mt-1">{error.nombre[0]}</p>
                    )}
                    <textarea
                      ref={nuevaTareaDescripcionRef}
                      placeholder="Descripción de la tarea"
                      className={`p-3 border rounded-lg w-full mt-3 ${
                        error.descripcion ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error.descripcion && (
                      <p className="text-red-500 text-sm mt-1">{error.descripcion[0]}</p>
                    )}
                    <input
                      type="date"
                      ref={nuevaTareaFechaRef}
                      className={`p-3 border rounded-lg w-full mt-3 ${
                        error.fecha_fin ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error.fecha_fin && (
                      <p className="text-red-500 text-sm mt-1">{error.fecha_fin[0]}</p>
                    )}

<select className='m-3 p-2 border rounded-lg w-full mt-3' ref={nuevaTareaUsuarioRef}>
    <option value="" disabled>Selecciona un Colaborador</option>
    {usuariosDepartamento?.map((usuario) => (
        <option key={usuario.id} value={usuario.id}>{usuario.name}</option>
    ))}
</select>

                    
                    <button
                      onClick={registrarTarea}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-green-700 transition"
                    >
                      Registrar Tarea
                    </button>
                  </div>
                )}
              </div>

              {/* Acordeón: Registrar Errores */}
              <div className="mt-6">
                <button
                  className="w-full text-left p-4 font-semibold text-white bg-gray-500 rounded-lg focus:outline-none"
                  onClick={() => toggleAcordeon("errores")}
                >
                  Registrar Novedad : {departamentoActual?.nombre}
                </button>
                {acordeonAbierto === "errores" && (
                  <div className="p-4">
                    <textarea
                      ref={nuevErrorDescripcionRef}
                      placeholder="Descripción de la novedad"
                      className={`p-3 border rounded-lg w-full ${
                        error.descripcion ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error.descripcion && (
                      <p className="text-red-500 text-sm mt-1">{error.descripcion[0]}</p>
                    )}
                    <button
                      onClick={registrarError}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-red-700 transition"
                    >
                      Registrar Novedad
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      {/* Modal para editar nombre de proceso */}{procesoEditando && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h3 className="text-lg font-semibold mb-4">Editar nombre de carpeta</h3>
      <input
        type="text"
        value={nuevoNombreProceso}
        onChange={(e) => setNuevoNombreProceso(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setProcesoEditando(null)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={editarNombreProceso}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}

    </div>

    
  );
}

export default ProcesosDepartamento;
