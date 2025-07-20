import { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { useGestionProcesos } from '../../hooks/useGestionProcesos';
import { useAuth } from '../../hooks/useAuth';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { Download, Folder } from 'lucide-react';
import Swal from 'sweetalert2';

function ProcesosDepartamento() {
  // Obtenemos el departamentoId desde la URL
  const [procesoEditando, setProcesoEditando] = useState(null);
const [nuevoNombreProceso, setNuevoNombreProceso] = useState('');

  const { departamentoId } = useParams();
  
  const [acordeonAbierto, setAcordeonAbierto] = useState("");

  const [usuariosDepartamento, setUsuariosDepartamento] = useState();

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
        console.log('Usuarios del departamento:', response.data);
        setUsuariosDepartamento(response.data);
      } catch (error) {
        console.error('Error al cargar los usuarios del departamento:', error);
        toast.error('No hay  usuarios para registrado para el departamento');
      }
}


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
    text: "Esta acción eliminará el documento permanentemente",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarDocumento(documentoId);
    }
  });
}
const procesosOrdenados = [...procesos].sort((a, b) => {
  return ordenManual.indexOf(a.nombre) - ordenManual.indexOf(b.nombre);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Título del Departamento */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
         {departamentoActual?.nombre || "No seleccionado"}
      </h2>
<div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role_id === 1 || user?.role_id === 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 mb-6`}>

        {/* Columna 1: Procesos Registrados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">📁 Carpetas</h3>

      {procesosOrdenados.length > 0 ? (
        <ul className="space-y-4">
          {procesosOrdenados.map((proceso) => (
        <li
  key={proceso.id}
  className={`p-4 rounded-xl transition border ${
    procesoSeleccionado === proceso.id
      ? 'bg-green-100 border-green-500'
      : 'bg-white border-gray-200 hover:bg-gray-50'
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
        Editar
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
    </div>

        {/* Columna 2: Documentación Disponible */}
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[70vh] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {procesoActual?.nombre || "No has seleccionado una carpeta"}
      </h3>

      {documentacion.length > 0 ? (
        <ul className="space-y-4">
          {documentacion.map((doc) => (
            <li
              key={doc.id}
              className="p-4 bg-gray-100 shadow-sm rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              {/* Texto de la documentación */}
              <div className="w-full">
                <p className="font-bold text-lg text-gray-700">{doc.nombre}</p>
                <p className="text-gray-500 text-sm">Versión: {doc.version}</p>
                <p className="text-gray-500 text-sm">
                  Observaciones: {doc.observaciones || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">Subido por: {doc.usuarios.name}</p>
                <p className="text-gray-500 text-sm">
                  Fecha de subida: {formatDate(doc.created_at)}
                </p>
              </div>

              {/* Botón de descarga */}
              <a
                href={`${clienteAxios.defaults.baseURL}/api/documentos/descargar/${doc.id}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Download size={16} />
                Descargar
              </a>
              {user?.role_id === 1 && (
  <button
    onClick={() => confirmarEliminacion(doc.id)}
    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
  >
    Eliminar
  </button>
)}

            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay documentación disponible.</p>
      )}
    </div>

        {/* Columna 3: Formularios de Registro (solo para administradores) */}
        {departamentoActual && (user?.role_id === 1 || user?.role_id === 2)   &&(
          <div className="bg-white p-4 rounded-lg shadow-md">
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
                >
                   {procesoActual?.nombre || <span className='text-white'>No se ha seleccionado una Carpeta</span>}
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
                    <input
                      type="text"
                      ref={nuevErrorDescripcionRef}
                      placeholder="Descripción del error"
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
          </div>
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
