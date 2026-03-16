import { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { useGestionProcesos } from '../../hooks/useGestionProcesos';
import { useAuth } from '../../hooks/useAuth';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { Download, Edit, Folder, Move3DIcon, Search, Plus, Building2, FileText, Users, AlertCircle, Calendar, Upload, X, Save, FolderOpen, Archive, User, Clock, Filter, SplineIcon } from 'lucide-react';
import Swal from 'sweetalert2';

function ProcesosDepartamento() {
  // Obtenemos el departamentoId desde la URL
  const [procesoEditando, setProcesoEditando] = useState(null);
  const [nuevoNombreProceso, setNuevoNombreProceso] = useState('');

  const { departamentoId } = useParams();
  
  const [acordeonAbierto, setAcordeonAbierto] = useState("");

  const [usuariosDepartamento, setUsuariosDepartamento] = useState();
  
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
    isloading
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

  // Ocultar proceso "Obsoletos" para roles no autorizados
  const procesosFiltrados = procesos.filter(proceso => {
    // roles que sí pueden ver "Obsoletos"
    const rolesPermitidos = [1, 2];

    if (!rolesPermitidos.includes(user?.role_id)) {
      return proceso.nombre.toLowerCase() !== "obsoletos";
    }

    return true; // admin/director ven todo
  });

  const procesosOrdenados = [...procesosFiltrados].sort((a, b) => {
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
  const docsFiltrados = documentacion.filter(doc =>
    doc.nombre.toLowerCase().includes(inputValue.toLowerCase())
  );
   // ✅ Determinar si el usuario tiene panel de administración
  const tienePermisos = departamentoActual && (user?.role_id === 1 || user?.role_id === 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* ✅ Header mejorado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {departamentoActual?.nombre || "Departamento no seleccionado"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gestión de procesos y documentación
              </p>
            </div>
          </div>

          {/* ✅ Breadcrumb */}
          <nav className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <span>Departamentos</span>
            <span>›</span>
            <span className="text-blue-600 font-medium">
              {departamentoActual?.nombre}
            </span>
            {procesoActual && (
              <>
                <span>›</span>
                <span className="text-indigo-600 font-medium">
                  {procesoActual.nombre}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* ✅ Contenido principal */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className={`grid gap-6 ${tienePermisos ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>

          {/* ✅ Panel de carpetas mejorado */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Carpetas de Procesos
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {procesosOrdenados.length}
                </span>
              </div>
            </div>

            <div className="p-6">
              {procesosOrdenados.length > 0 ? (
                <div className="space-y-3">
                  {procesosOrdenados.map((proceso) => (
                    <div
                      key={proceso.id}
                      className={`group p-4 rounded-lg border transition-all duration-200 ${
                        procesoSeleccionado === proceso.id
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            procesoSeleccionado === proceso.id 
                              ? 'bg-green-200 text-green-700'
                              : 'bg-yellow-200 text-yellow-700'
                          }`}>
                            <Folder className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {proceso.nombre}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Carpeta de documentos
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user?.role_id === 1 && (
                            <button
                              onClick={() => abrirModalEdicion(proceso)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar carpeta"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => cargarDocumentacion(proceso.id)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Ver Docs
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay carpetas disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Panel de documentación mejorado */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {procesoActual?.nombre || "Selecciona una carpeta"}
                  </h2>
                </div>
                {docsFiltrados.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                    {docsFiltrados.length} docs
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {/* ✅ Buscador mejorado */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => setSearchTerm(inputValue.trim())}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg transition-all transform hover:scale-105"
                  title="Buscar"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* ✅ Lista de documentos mejorada */}
              <div className="flex-1 overflow-y-auto">
                {docsFiltrados.length > 0 ? (
                  <div className="space-y-4">
                    {docsFiltrados.map((doc) => (
                      <div key={doc.id} className="group p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-white hover:to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                        
                        {/* Edición inline del nombre */}
                        {editingDocId === doc.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newDocName}
                              onChange={e => setNewDocName(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => guardarNombreDocumento(doc.id)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingDocId(null)}
                                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Header del documento */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                      {doc.nombre}
                                    </h3>
                                    {user?.role_id === 1 && (
                                      <button
                                        onClick={() => {
                                          setEditingDocId(doc.id);
                                          setNewDocName(doc.nombre);
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Metadatos */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">v{doc.version}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>{doc.usuarios.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{formatDate(doc.created_at)}</span>
                                    </div>
                                    {doc.observaciones && (
                                      <div className="sm:col-span-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {doc.observaciones}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex gap-2 ml-4">
                                <a
                                  href={`${clienteAxios.defaults.baseURL}/api/documentos/descargar/${doc.id}`}
                                  download 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-105"
                                  title="Descargar"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                {user?.role_id === 1 && (
                                  <button
                                    onClick={() => confirmarEliminacion(doc.id)}
                                    className="p-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105"
                                    title="Mover a obsoletos"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    {procesoActual ? (
                      <>
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No hay documentos en esta carpeta</p>
                        <p className="text-xs text-gray-400">Sube el primer documento para comenzar</p>
                      </>
                    ) : (
                      <>
                        <Folder className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">Selecciona una carpeta</p>
                        <p className="text-xs text-gray-400">Elige una carpeta para ver su documentación</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Panel de administración mejorado */}
          {departamentoActual && (user?.role_id === 1 || user?.role_id === 2) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Panel de Administración
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {departamentoActual?.nombre}
                </p>
              </div>

              <div className="p-6 space-y-4">
                
                {/* ✅ Acordeón: Registrar Carpeta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-left transition-colors"
                    onClick={() => toggleAcordeon("procesos")}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Crear Nueva Carpeta</span>
                    </div>
                    <Plus className={`w-5 h-5 text-gray-400 transition-transform ${acordeonAbierto === "procesos" ? 'rotate-45' : ''}`} />
                  </button>
                  
                  {acordeonAbierto === "procesos" && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <input
                          type="text"
                          ref={nuevoProcesoRef}
                          placeholder="Nombre de la nueva carpeta"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errorProceso.nombre ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {errorProceso.nombre && (
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errorProceso.nombre[0]}</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => registrarProceso(e, departamentoActual)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Crear Carpeta
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Acordeón: Subir Documentación */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      procesoActual 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' 
                        : 'bg-gray-100 cursor-not-allowed'
                    }`}
                    onClick={() => procesoActual && toggleAcordeon("documentacion")}
                    disabled={!procesoActual}
                  >
                    <div className="flex items-center gap-3">
                      <Upload className={`w-5 h-5 ${procesoActual ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <span className={`font-medium ${procesoActual ? 'text-gray-900' : 'text-gray-500'}`}>
                          Subir Documento
                        </span>
                        {procesoActual && (
                          <p className="text-xs text-gray-600">a {procesoActual.nombre}</p>
                        )}
                      </div>
                    </div>
                    <Plus className={`w-5 h-5 text-gray-400 transition-transform ${acordeonAbierto === "documentacion" ? 'rotate-45' : ''}`} />
                  </button>
                  
                  {acordeonAbierto === "documentacion" && procesoActual && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del documento
                          </label>
                          <input
                            type="text"
                            ref={nuevaDocumentacionNombreRef}
                            placeholder="Ej: Manual de procedimientos"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              erroresDocumentacion.nombre ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                          />
                          {erroresDocumentacion.nombre && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>{erroresDocumentacion.nombre[0]}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Archivo
                          </label>
                          <input
                            type="file"
                            ref={nuevaDocumentacionArchivoRef}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              erroresDocumentacion.documento ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                          />
                          {erroresDocumentacion.documento && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>{erroresDocumentacion.documento[0]}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Versión
                            </label>
                            <input
                              type="text"
                              ref={nuevaDocumentacionVersionRef}
                              placeholder="1.0"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                erroresDocumentacion.version ? "border-red-300 bg-red-50" : "border-gray-300"
                              }`}
                            />
                            {erroresDocumentacion.version && (
                              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{erroresDocumentacion.version[0]}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observaciones
                            </label>
                            <input
                              type="text"
                              ref={nuevaDocumentacionObservacionesRef}
                              placeholder="Cambios realizados..."
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                erroresDocumentacion.observaciones ? "border-red-300 bg-red-50" : "border-gray-300"
                              }`}
                            />
                          </div>
                        </div>

                        <button
                          onClick={registrarDocumentacion}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Subir Documento
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Acordeón: Asignar Tarea */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-left transition-colors"
                    onClick={() => toggleAcordeon("tareas")}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Asignar Tarea</span>
                    </div>
                    <Plus className={`w-5 h-5 text-gray-400 transition-transform ${acordeonAbierto === "tareas" ? 'rotate-45' : ''}`} />
                  </button>
                  
                  {acordeonAbierto === "tareas" && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <input
                          type="text"
                          ref={nuevaTareaNombreRef}
                          placeholder="Nombre de la tarea"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                            error.nombre ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {error.nombre && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error.nombre[0]}</span>
                          </div>
                        )}

                        <textarea
                          ref={nuevaTareaDescripcionRef}
                          placeholder="Descripción detallada de la tarea"
                          rows={3}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none ${
                            error.descripcion ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {error.descripcion && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error.descripcion[0]}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha límite
                            </label>
                            <input
                              type="date"
                              ref={nuevaTareaFechaRef}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                                error.fecha_fin ? "border-red-300 bg-red-50" : "border-gray-300"
                              }`}
                            />
                            {error.fecha_fin && (
                              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error.fecha_fin[0]}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Asignar a
                            </label>
                            <select 
                              ref={nuevaTareaUsuarioRef}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            >
                              <option value="">Seleccionar colaborador</option>
                              {usuariosDepartamento?.map((usuario) => (
                                <option key={usuario.id} value={usuario.id}>
                                  {usuario.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Botón de asignar tarea con isloading */}
                        <button
                          onClick={registrarTarea}
                          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isloading}
                        >
                          {isloading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                              Asignando...
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              Asignar Tarea
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Acordeón: Registrar Novedad */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-left transition-colors"
                    onClick={() => toggleAcordeon("errores")}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Reportar Novedad</span>
                    </div>
                    <Plus className={`w-5 h-5 text-gray-400 transition-transform ${acordeonAbierto === "errores" ? 'rotate-45' : ''}`} />
                  </button>
                  
                  {acordeonAbierto === "errores" && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <textarea
                          ref={nuevErrorDescripcionRef}
                          placeholder="Describe la novedad o incidencia encontrada..."
                          rows={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none ${
                            error.descripcion ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {error.descripcion && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error.descripcion[0]}</span>
                          </div>
                        )}

                        <button
                          onClick={registrarError}
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Reportar Novedad
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal mejorado para editar proceso */}
      {procesoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Editar Carpeta
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la carpeta
                  </label>
                  <input
                    type="text"
                    value={nuevoNombreProceso}
                    onChange={(e) => setNuevoNombreProceso(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setProcesoEditando(null)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editarNombreProceso}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcesosDepartamento;