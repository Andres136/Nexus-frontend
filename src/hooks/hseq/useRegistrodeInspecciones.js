import { useState } from "react"
import { InspeccionesHseqService } from "../../services/hseqService"
import { showToast } from "../../helpers/utils/showToast"
import { useQueryClient } from "@tanstack/react-query"


export const useRegistrodeInspecciones = () => {


    const [formData, setFormData] = useState({
        sede_id: '',
        tipo_inspeccion_id: '',
        fecha: '',
        estado: 'pendiente',
        observaciones: '',
  
        
    })

    const[error , setError] = useState(null)
    const[loading, setLoading] = useState(false)
    const queryClient = useQueryClient()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Aquí iría la lógica para enviar formData a la API
           const response =  await InspeccionesHseqService.createInspeccion(formData)
           showToast('success', response.data.message || 'Registro de inspección creado exitosamente')
              setFormData({
                sede_id: '',
                tipo_inspeccion_id: '',
                fecha: '',
                estado: 'pendiente',
                observaciones: '',
              })
              queryClient.invalidateQueries(["inspecciones"])
        } catch (err) {
            console.error("Error al crear el registro de inspección:", err)
               if (err.response?.status === 422) {
                setError(err.response.data.errors);
            } else {
                showToast("error", "Hubo un problema al crear el tipo de inspección");
            }
        } finally {
            setLoading(false)
        }
    }
    
    //Eliminar inspección
    const handleDelete = async (id) => {
        try {
            await InspeccionesHseqService.deleteInspeccion(id)
            showToast('success', 'Inspección eliminada exitosamente')
            queryClient.invalidateQueries(["inspecciones"])
        } catch (err) {
            console.error("Error al eliminar la inspección:", err)
            showToast("error", "Hubo un problema al eliminar la inspección");
        }
    }
    return{
        formData,
        error,
        loading,
        handleChange,
        handleSubmit,
        handleDelete
    }
}