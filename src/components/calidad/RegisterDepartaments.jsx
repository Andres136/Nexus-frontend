import { createRef, useEffect, useState } from "react"
import useSystem from "../../hooks/useSystem"
import clienteAxios from "../../config/axios"




export default function RegisterDepartaments({onClose}) {

  const [errores, setErrores] = useState({})
  const {handleRegisterDepartaments} = useSystem()

  const nombreRef = createRef()
  const descripcionRef = createRef()
  const iconoRef = createRef()
  const macroprocesos_idRef = createRef()
  const [data, setData] = useState([])  

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      nombre: nombreRef.current.value,
      descripcion: descripcionRef.current.value,
      icono: iconoRef.current.files[0],
      macroprocesos_id: macroprocesos_idRef.current.value
    }

    const success = await handleRegisterDepartaments(data, setErrores)
    if (success) {
      onClose()
    }
   
  }




// Traer los macroprocesos del backend

const obtenermacroprocesos =async ()=>{
  const token = localStorage.getItem('token')
  try {
    const response = await clienteAxios.get('/api/macroprocesos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log(response.data)
setData(response.data)
  } catch (error) {
    console.log(error)
  }
}

useEffect(() => {
  obtenermacroprocesos()
}, [])


  return (
    <form 
    onSubmit={handleSubmit}
    className='grid grid-cols-1 gap-6'>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Departamento</label>
        <input type="text"
         id="nombre"
         name="nombre" 
          ref={nombreRef}
         placeholder="Ingrese un Departamento"
         className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-12" 
         />
         {errores.nombre && <small className='text-red-600'>{errores.nombre}</small>}
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea 
        id="descripcion"
         name="descripcion" 
        ref={descripcionRef}
         placeholder="Ingrese una Descripción" 
         className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-24"></textarea>
         {errores.descripcion && <small className='text-red-600'>{errores.descripcion}</small>} 
      </div>
     

      <div>
  <label className=' block text-sm font-mediun text-gray-700'>Imagen</label>
       <input 
       type='file' 
        name='icono'
        id="icono"
        accept="image/*"
        ref={iconoRef}
       className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-12'/>
       {errores.icono && <small className='text-red-600'>{errores.icono}</small>}
      </div>

      <div>
        <label htmlFor="macroprocesos_id"
         className="block text-sm font-medium text-gray-700">Macroproceso</label>
        <select id="macroprocesos_id"
         name="macroprocesos_id"
          ref={macroprocesos_idRef}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12">
          <option value="">Seleccione un Macroproceso</option>
          {data.map((macroproceso) => (
            <option key={macroproceso.id} value={macroproceso.id}>{macroproceso.nombre}</option>
          ))}
        </select>
        {errores.macroprocesos_id && <small className='text-red-600'>{errores.macroprocesos_id}</small>}
      </div>
      <button
       type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Registrar Departamento
      </button>
    </form>
  )
}
