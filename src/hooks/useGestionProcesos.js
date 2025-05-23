
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth'; // Ajusta la ruta si es necesario
import clienteAxios from '../config/axios';

export function useGestionProcesos() {
  const { user } = useAuth({ middleware: 'auth' });

  // --- Estados ---
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [documentacion, setDocumentacion] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [errores, setErrores] = useState({});

  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(0);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(0);

  // Estados para validación / errores
  const [error, setError] = useState({});
  const [errorProceso, setErrorProceso] = useState({});
  const [erroresProceso, setErroresProceso] = useState({});
  const [erroresDocumentacion, setErroresDocumentacion] = useState({});

  // Refs para formularios
  const nuevoProcesoRef = useRef(null);
  const nuevaDocumentacionNombreRef = useRef(null);
  const nuevaDocumentacionArchivoRef = useRef(null);
  const nuevaDocumentacionVersionRef = useRef(null);
  const nuevaTareaNombreRef = useRef(null);
  const nuevaTareaDescripcionRef = useRef(null);
  const nuevaTareaFechaRef = useRef(null);
  const nuevaTareaUsuarioRef = useRef(null);
  const nuevErrorDescripcionRef = useRef(null);

  // --- useEffect ---
  useEffect(() => {
    cargarDatos();
  }, []);

  // --- Funciones / Métodos ---

  async function cargarDatos() {
    const token = localStorage.getItem('token');
    try {
      const [macroprocesosResponse, departamentoResponse] = await Promise.all([
        clienteAxios.get('/api/macroprocesos', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        clienteAxios.get('/api/departamentos', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMacroprocesos(macroprocesosResponse.data);
      setDepartamentos(departamentoResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    }
  }

  async function cargarProcesos(departamento_id) {
    const token = localStorage.getItem('token');
    try {
      const response = await clienteAxios.get(
        `/api/procesos/departamento/${departamento_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProcesos(response.data);
      setDepartamentoSeleccionado(departamento_id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No hay procesos registrados para este departamento');
        setProcesos([]);
        setDepartamentoSeleccionado(departamento_id);
      }
    }
  }

  async function cargarDocumentacion(proceso_id) {
    const token = localStorage.getItem('token');
    try {
      const response = await clienteAxios.get(`/api/documentacion/${proceso_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocumentacion(response.data);
      setProcesoSeleccionado(proceso_id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No hay documentación registrada para este proceso');
        setDocumentacion([]);
        setProcesoSeleccionado(proceso_id);
      }
    }
  }

  async function registrarProceso(e) {
    e.preventDefault();
    const nombreProceso = nuevoProcesoRef.current?.value || '';
  
    const token = localStorage.getItem('token');
    try {
      const payload = {
        nombre: nombreProceso,
        departamento_id: departamentoSeleccionado,
        user_id: user.id,
      };
      await clienteAxios.post('/api/procesos', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Proceso registrado correctamente');
      // Limpiar input
      if (nuevoProcesoRef.current) {
        nuevoProcesoRef.current.value = '';
      }
      setErrorProceso({});
      // Recargar procesos
      cargarProcesos(departamentoSeleccionado);
    } catch (error) {
      console.log(error)
      if (error.response && error.response.data.errors) {
        setErrorProceso(error.response.data.errors);
      } else {
        console.error('Error al registrar proceso:', error);
      }
    }
  }

  async function registrarDocumentacion(e) {
    e.preventDefault();
    const nombreDocumentacion = nuevaDocumentacionNombreRef.current?.value || '';
    const documento = nuevaDocumentacionArchivoRef.current?.files[0];
    const version = nuevaDocumentacionVersionRef.current?.value || '';

   
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nombre', nombreDocumentacion);
    formData.append('documento', documento);
    formData.append('proceso_id', procesoSeleccionado);
    formData.append('user_id', user.id);
    formData.append('version', version);

    try {
      await clienteAxios.post('/api/documentos', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Documentación registrada correctamente');
      // Limpiar inputs
      if (nuevaDocumentacionArchivoRef.current) {
        nuevaDocumentacionArchivoRef.current.value = '';
      }
      if (nuevaDocumentacionNombreRef.current) {
        nuevaDocumentacionNombreRef.current.value = '';
      }
      if (nuevaDocumentacionVersionRef.current) {
        nuevaDocumentacionVersionRef.current.value = '';
      }
      setErroresDocumentacion({});
      cargarDocumentacion(procesoSeleccionado);
    } catch (error) {
      console.log(error)
      if (error.response && error.response.data.errors) {
        setErroresDocumentacion(error.response.data.errors);
      } else {
        console.error('Error al registrar documentación:', error);
      }
    }
  }

  async function registrarTarea(e) {
    console.log()
    e.preventDefault();
    const nombre = nuevaTareaNombreRef.current?.value || '';
    const descripcion = nuevaTareaDescripcionRef.current?.value || '';
    const fecha_fin = nuevaTareaFechaRef.current?.value || '';
    const user_id = nuevaTareaUsuarioRef.current?.value || '';

  
    const token = localStorage.getItem('token');
    const payload = {
      nombre,
      descripcion,
      fecha_fin,
      departamento_id: departamentoSeleccionado,
      user_id,
    };
    try {
      const response = await clienteAxios.post('/api/tareas', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tarea registrada correctamente');
      setTareas([...tareas, response.data]);
      // Limpiar campos
      if (nuevaTareaNombreRef.current) nuevaTareaNombreRef.current.value = '';
      if (nuevaTareaDescripcionRef.current) nuevaTareaDescripcionRef.current.value = '';
      if (nuevaTareaFechaRef.current) nuevaTareaFechaRef.current.value = '';
      if (nuevaTareaUsuarioRef.current) nuevaTareaUsuarioRef.current.value = '';
      setError({});
      console.log(response.data)
   
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors);
        console.log(error.response.data.errors)
      } else {
        console.error('Error al registrar tarea:', error);
      }
    }
  }

  async function registrarError(e) {
    e.preventDefault();
    const descripcion = nuevErrorDescripcionRef.current?.value || '';
    
    const token = localStorage.getItem('token');
    const payload = {
      descripcion,
      departamento_id:departamentoSeleccionado,
      user_id: user.id,
    };
    try {
      const response = await clienteAxios.post('/api/errores', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Error registrado correctamente');
      setErrores([...errores, response.data]);
    
      if (nuevErrorDescripcionRef.current) {
        nuevErrorDescripcionRef.current.value = '';
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors);
        console.log(error.response.data.errors)
      } else {
        console.error('Error al registrar error:', error);
      }
    }
  }

  function formatDate(dateString) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, opciones);
  }


  //Eliminar un documento de cada colaborador

  
  // Retornamos todo lo que se necesita usar en los componentes:
  return {
    // Estados
    user,
    macroprocesos,
    departamentos,
    procesos,
    documentacion,
    tareas,
    errores,
    departamentoSeleccionado,
    procesoSeleccionado,

    // Estados de error locales
    error,
    errorProceso,
    erroresProceso,
    erroresDocumentacion,

    // Refs
    nuevoProcesoRef,
    nuevaDocumentacionNombreRef,
    nuevaDocumentacionArchivoRef,
    nuevaDocumentacionVersionRef,
    nuevaTareaNombreRef,
    nuevaTareaDescripcionRef,
    nuevaTareaFechaRef,
    nuevErrorDescripcionRef,
    nuevaTareaUsuarioRef,

    // Métodos
    cargarDatos,
    cargarProcesos,
    cargarDocumentacion,
    registrarProceso,
    registrarDocumentacion,
    registrarTarea,
    registrarError,
    formatDate,
    
  };
}
