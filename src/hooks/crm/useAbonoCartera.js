import { useEffect, useState } from "react"
import { carteraApi } from "../../services/api"
import { showToast } from "../../helpers/utils/showToast"


export const useAbonoCartera = (carteraId) => {


const [formData, setFormData] = useState({
gestion_cartera_id: carteraId,
    valor_pago: '',
    fecha_pago: '',
  })
const [errors, setErrors] = useState({})
const [loading, setLoading] = useState(false)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cartera_id: carteraId
    }))
  }, [carteraId])
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
  
    e.preventDefault()
  

    try{
        // Simulación de envío a API
  const response = await carteraApi.createAbono(formData)
showToast('success', response.data.message)

// Reiniciar el formulario después del éxito
setFormData({
    gestion_cartera_id: carteraId,
    valor_pago: '',
    fecha_pago: '',
})
    }
    catch(error){
        console.log("Error al crear abono:", error)
    if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)

    }
  }}

    return{
        formData,
        setFormData,
        handleChange,
        handleSubmit,
        errors,
        loading
    }
}