import { useEffect, useState, createRef } from 'react';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

export default function GestionProcesos() {
 const { user } = useAuth({ middleware: 'auth' });
 const [macroprocesos, setMacroprocesos] = useState([]);
 const [departamentos, setDepartamentos] = useState([]);
 const [procesos, setProcesos] = useState([]);
 const [documentacion, setDocumentacion] = useState([]);
 const [tareas, setTareas] = useState([]);
 const [errores, setErrores] = useState({});
 


 const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(0);
 const [procesoSeleccionado, setProcesoSeleccionado] = useState(0);

 //Errores para la validacion
    const [error, setError] = useState({});
    const [errorProceso, setErrorProceso] = useState({});
    const [erroresProceso, setErroresProceso] = useState({});
    const [erroresDocumentacion, setErroresDocumentacion] = useState({});




    const nuevoProcesoRef  = createRef();
    const nuevaDocumentacionNombreRef = createRef();
    const nuevaDocumentacionArchivoRef = createRef();
    const nuevaDocumentacionVersionRef = createRef();
    const nuevaTareaNombreRef = createRef();
    const nuevaTareaDescripcionRef = createRef();
    const nuevaTareaFechaRef = createRef();
    const nuevErrorDescripcionRef = createRef();



    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('token');
            try {
                // First API call
                const macroprocesosResponse = await clienteAxios.get('/api/macroprocesos', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
    
                // Second API call
                const departamentoResponse = await clienteAxios.get('/api/departamentos', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
    
                console.log('Macroprocesos:', macroprocesosResponse.data);
                console.log('Departamentos:', departamentoResponse.data);
                
                setMacroprocesos(macroprocesosResponse.data);
                setDepartamentos(departamentoResponse.data);
                // Add state setter for departamentos if needed
                // setDepartamentos(departamentoResponse.data.departamentos);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                // Add error handling here (e.g., show error message to user)
            }
        };
    
        cargarDatos();
    }, []);



  const cargarProcesos = async (departamento_id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await clienteAxios.get(`/api/procesos/departamento/${departamento_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log( 'error',response.data);
            setProcesos(response.data);
            setDepartamentoSeleccionado(departamento_id);
        } catch (error) {
          if(error.response && error.response.status === 404){
              toast.error('No hay procesos registrados para este departamento');
              setProcesos([]);
              setDepartamentoSeleccionado(departamento_id);
        }
  } }

    const cargarDocumentacion = async (proceso_id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await clienteAxios.get(`/api/documentacion/${proceso_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Esta es la documentacion',response.data);
            console.log('Proceso ID:', proceso_id);
            setDocumentacion(response.data);
            setProcesoSeleccionado(proceso_id);
        } catch (error) {
           if(error.response && error.response.status === 404){
               toast.error('No hay documentación registrada para este proceso');
               setDocumentacion([]);
               setProcesoSeleccionado(proceso_id);
        }
    }
  }

    const registrarProceso = async (e) => {
      e.preventDefault()
        const nombreProceso = nuevoProcesoRef.current.value;
        if(!nombreProceso.trim()){
            toast.error("El nombre del proceso es requerido");
            return;
           

        } console.log('Registrando proceso en departamento ID:', departamentoSeleccionado);
        const token = localStorage.getItem('token');

        try {

          const payload ={
            nombre: nombreProceso,
            departamento_id: departamentoSeleccionado,
            user_id: user.id,
          }
            await clienteAxios.post('/api/procesos',payload, {
             headers: {
                    Authorization: `Bearer ${token}`,
             },
                
            }, );


            toast.success('Proceso registrado correctamente');
            nuevoProcesoRef.current.value = '';
            setErrorProceso({});
            cargarProcesos(departamentoSeleccionado);
        } catch (error) {
          if(error.response  &&  error.response.data.errors){
              setErrorProceso(error.response.data.errors);
          }else{
              console.error('Error al registrar proceso:', error);
          }
            
            
        }
    }

    const registrarDocumentacion = async (e) => {
      e.preventDefault()
        const nombreDocumentacion = nuevaDocumentacionNombreRef.current.value;
        const archivo = nuevaDocumentacionArchivoRef.current.files[0];
        const version = nuevaDocumentacionVersionRef.current.value;
        if(!nombreDocumentacion.trim()){
            toast.error("El nombre de la documentación es requerido");
            return;
        }
        if(!archivo){
            toast.error("El archivo es requerido");
            return;
        }
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nombre', nombreDocumentacion);
        formData.append('documento', archivo);
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
            nuevaDocumentacionArchivoRef.current.value = '';
            nuevaDocumentacionNombreRef.current.value = '';
            nuevaDocumentacionVersionRef.current.value = '';

            setErroresDocumentacion({});
            cargarDocumentacion(procesoSeleccionado);
        } catch (error) {
            if(error.response  &&  error.response.data.errors){
                setErroresDocumentacion(error.response.data.errors);
            }else{
                console.error('Error al registrar documentación:', error);
            }
        }
    }


    const registrarTarea = async (e) => {
      e.preventDefault()
      const nombre = nuevaTareaNombreRef.current.value;
      const descripcion = nuevaTareaDescripcionRef.current.value;
      const fecha_fin= nuevaTareaFechaRef.current.value;

      if(!nombre.trim()|| !descripcion.trim() || !fecha_fin.trim()){
          toast.error('Todos los campos son requeridos');
          return;
      }

      const token = localStorage.getItem('token');
      const payload = {
          nombre,   
          descripcion,
          fecha_fin,
          proceso_id: procesoSeleccionado, // ID del proceso seleccionado
          user_id: user.id,
      }
    
 try {
  
  const response = await clienteAxios.post('/api/tareas', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  toast.success('Tarea registrada correctamente');
  setTareas([...tareas, response.data]);
  nuevaTareaNombreRef.current.value = '';
  nuevaTareaDescripcionRef.current.value = '';
  nuevaTareaFechaRef.current.value = '';
  setError({});
 } catch (error) {
    if(error.response && error.response.data.errors){
      setError(error.response.data.errors);
    }else{
      console.error('Error al registrar tarea:', error);
    }
  
 }

    }

    //Registrar errores
    const registrarError = async (e) => {
      e.preventDefault()
      const descripcion = nuevErrorDescripcionRef.current.value;
      if(!descripcion.trim()){
          toast.error('La descripción del error es requerida');
          return;
      }
      const token = localStorage.getItem('token');
      const payload = {
          descripcion,
          proceso_id: procesoSeleccionado,
          user_id: user.id,
      }
      try {
        const response = await clienteAxios.post('/api/errores', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Error registrado correctamente');
        setErrores([...errores, response.data]);
        nuevErrorDescripcionRef.current.value = '';
      } catch (error) {
        if(error.response && error.response.data.errors){
          setError(error.response.data.errors);
      }
    }}

    const departamentoActual = departamentos.find(
      (dep) => dep.id === departamentoSeleccionado
    );
    
    const procesosActuales = procesos.find(
      (pro) => pro.id === procesoSeleccionado
    )


     const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
return (        
 <>
    <div className="p-6 bg-gray-50 min-h-screen ">
    
  


      {/* Listado de Macroprocesos y Departamentos */}
      <div className="grid grid-cols-1  gap-12">
        {macroprocesos.map((macroproceso) => (
          <div key={macroproceso.id}
          className='mb-8'>
            <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center uppercase">{macroproceso.nombre}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {departamentos
                .filter((dep) => {    console.log(`Departamento ${dep.nombre} - Macroprocesos ID: ${dep.macroprocesos_id}`);
                return dep.macroprocesos_id === macroproceso.id;} )
                 
                .map((departamento) => (
                  <div
                  key={departamento.id}
                  onClick={() => cargarProcesos(departamento.id)}
                  className="p-4 bg-white shadow-md rounded-lg transition cursor-pointer hover:shadow-lg hover:scale-105 transform duration-300 flex flex-col items-center "
                  >
                  <h3 className="text-lg font-bold text-center">{departamento.nombre}</h3>
                  <div className='p-4 animate-bounce'>
                     <img 
                  className='w-12 h-12 '
                  src={departamento.icono} alt="" />
                  </div>
                   
                  <p>{departamento.descripcion}</p>
                  </div>
                ))}
              </div>
              </div>
            ))}
            </div>

           { /* Listado de Procesos */}
                 
           {departamentoSeleccionado && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold text-gray-700 mb-4 animate-fade-in">
  Procesos del Departamento: {departamentoActual?.nombre || "No seleccionado"}
</h2>


    {/* Formulario para registrar procesos */}
    <div className="mb-4">
      <input
        type="text"
        ref={nuevoProcesoRef}
        placeholder="Nombre del proceso"
        className={`p-2 border rounded-lg w-full ${
          erroresProceso.nombre ? "border-red-500" : ""
        }`}
      />
      {erroresProceso.nombre && (
        <p className="text-red-500 text-sm">{erroresProceso.nombre[0]}</p>
      )}
      <button
        onClick={registrarProceso}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
      >
        Registrar Proceso
      </button>
    </div>

    {/* Mensaje o listado de procesos */}
    {procesos.length > 0 ? (
      <div>
        {procesos.map((proceso) => (
          <div
            key={proceso.id}
            className="p-4 bg-white shadow-md rounded-lg mb-4 flex items-center justify-between"
          >
            <p className="font-bold">{proceso.nombre}</p>
            <button
              onClick={() => cargarDocumentacion(proceso.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Ver Documentación
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 mt-4">
        No hay procesos registrados para este departamento.
      </p>
    )}
  </div>
)}


            {/* Listado de Documentación */}
      {procesoSeleccionado && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Documentación de: {procesosActuales?.nombre || 'Proceso no selecionado'}</h2>
{/* Listado de Documentación con opcion de descargar */}
{documentacion.length > 0 ? (
        <ul className="space-y-4">
          {documentacion.map((doc) => (
            <li
              key={doc.id}
              className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg">{doc.nombre}</p>
                <p className="text-gray-500">Versión: {doc.version}</p>
                <p className="text-gray-500">Subido por: {doc.usuarios.name}</p>
                <p className='text-gray-500'>Fecha que se subio el archivo: {formatDate(doc.created_at)}</p>
                
              </div>
              <a
                href={doc.documento} // Ruta del documento
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Descargar
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay documentación disponible.</p>
      )}
          <div className="mb-4">
            <input
              type="text"
              ref={nuevaDocumentacionNombreRef}
              placeholder="Nombre del documento"
              className={`p-2 border rounded-lg w-full ${erroresDocumentacion.nombre ? "border-red-500" : ""}`}
            />
            {erroresDocumentacion.nombre && (
              <p className="text-red-500 text-sm">{erroresDocumentacion.nombre[0]}</p>
            )}
            <input
              type="file"
              ref={nuevaDocumentacionArchivoRef}
              className={`p-2 border rounded-lg w-full mt-2 ${erroresDocumentacion.archivo ? "border-red-500" : ""}`}
            />

            <input
              type="text"
              ref={nuevaDocumentacionVersionRef}
              placeholder="Versión"
              className={`p-2 border rounded-lg w-full mt-2 ${erroresDocumentacion.version ? "border-red-500" : ""}`}/>
            {erroresDocumentacion.archivo && (
              <p className="text-red-500 text-sm">{erroresDocumentacion.archivo[0]}</p>
            )}
            <button
              onClick={registrarDocumentacion}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Registrar Documentación
            </button>
          </div>
          {/*Registrar Tarea*/} 
          <div className="mb-4">
            <input
              type="text"
              ref={nuevaTareaNombreRef}
              placeholder="Nombre de la tarea"
              className={`p-2 border rounded-lg w-full ${error.nombre ? "border-red-500" : ""}`}
            />
            {error.nombre && (
              <p className="text-red-500 text-sm">{error.nombre[0]}</p>
            )}
            <textarea
              ref={nuevaTareaDescripcionRef}
              placeholder="Descripción de la tarea"
              className={`p-2 border rounded-lg w-full mt-2 ${error.descripcion ? "border-red-500" : ""}`}
            />
            {error.descripcion && (
              <p className="text-red-500 text-sm">{error.descripcion[0]}</p>
            )}
            <input
              type="date"
              ref={nuevaTareaFechaRef}
              className={`p-2 border rounded-lg w-full mt-2 ${error.fecha_fin ? "border-red-500" : ""}`}
            />
            {error.fecha_fin && (
              <p className="text-red-500 text-sm">{error.fecha_fin[0]}</p>
            )}
            <button
              onClick={registrarTarea}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Registrar Tarea
            </button></div>

            {/*Registrar Errores*/}
            <div className="mb-4"></div>
              <input
                type="text"
                ref={nuevErrorDescripcionRef}
                placeholder="Descripción del error"
                className={`p-2 border rounded-lg w-full ${error.descripcion ? "border-red-500" : ""}`}
              />
              {error.descripcion && (
                <p className="text-red-500 text-sm">{error.descripcion[0]}</p>
              )}
              <button
                onClick={registrarError}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2"
              >
                Registrar Error
              </button>
        </div>
      )}
    </div>

 </>
)
}
