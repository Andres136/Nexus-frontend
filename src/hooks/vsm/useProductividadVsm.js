import { useState } from "react"
import { vsmProduccionService } from "../../services/vsm"
import { showToast } from "../../helpers/utils/showToast"


export const useProductividadVsm = () => {

    const [fomulario, setFormulario] = useState({
       alistamiento_id: null,
       usuario_id: null,
        detalle_id: null,
         cantidad_alistada: null,
    })

    const [error, setError] = useState(null)
    const[loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormulario({
            ...fomulario,
            [e.target.name]: e.target.value
        })
    }


   const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
   const response = await vsmProduccionService.registrarAlistamiento(fomulario)
    showToast("success",response.data.message || "Alistamiento registrado exitosamente")
            setFormulario({
                alistamiento_id: null,
                usuario_id: null,
                detalle_id: null,
                cantidad_alistada: null,
            })

            setLoading(false)
        } catch (err) {
            setError(err.message || "Error al enviar el formulario")
            setLoading(false)
        }
    }

    return {
        fomulario,
        error,
        loading,
        handleChange,
        handleSubmit

    }
}