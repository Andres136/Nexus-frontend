import { createContext, useState } from "react";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";

const SystemContext = createContext();
const SystemProvider =({children}) => {
    const [darkMode, setDarkMode] = useState(false)
    const toggleDarkMode = () => setDarkMode(!darkMode)



const handleRegisterDepartaments = async (data, setErrores) => {
    const token = localStorage.getItem('token')
    try {
        const response = await clienteAxios.post('/api/departamentos', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        })
        console.log(response.data)
        setErrores({})
        toast(response.data.message)
        return true
    } catch (error) {

    if(error.response && error.response.data.errors){   
       const erroresPorCampo={}
       Object.keys(error.response.data.errors).forEach((campo)=>{
        erroresPorCampo[campo]=error.response.data.errors[campo][0]

       })
       setErrores(erroresPorCampo)
       console.log(" Errores por campo: ",erroresPorCampo)
    }
    return false
}
}

 const handlerConsultarUsuarios = async () => {    
    try {
        const response = await clienteAxios.get('/api/users')
        console.log(response.data)
    } catch (error) {
        console.log(error)
    }
}


//Desactivar o Activar el usuario

  

    return (
        <SystemContext.Provider value={{

            darkMode,
            toggleDarkMode,
        
            handleRegisterDepartaments,
            handlerConsultarUsuarios,
     
            
        }}>
            {children}
        </SystemContext.Provider>
    )
}
export {SystemProvider} 
export default SystemContext