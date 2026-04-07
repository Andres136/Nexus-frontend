import { useEffect, useState } from "react"

import { showToast } from "../../helpers/utils/showToast"
import { GestionarFacturaApi } from "../../services/api"
import { useQueryClient } from "@tanstack/react-query"


export const useRegisterGestionCarteraFactura = (carteraId) => {
  const [formData, setFormData] = useState({
    gestion_cartera_id: carteraId,
    tipo: "",
    observacion: "",
    fecha_compromiso: "",
    soportes: []
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      gestion_cartera_id: carteraId
    }))
  }, [carteraId])

  // 🔹 INPUTS normales
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  //  ARCHIVOS
 const handleFiles = (e) => {
  const files = Array.from(e.target.files)

 // console.log("FILES CAPTURADOS:", files)

  setFormData(prev => ({
    ...prev,
    soportes: files
  }))
}
  // SUBMIT CON FORM DATA
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()

      data.append("gestion_cartera_id", formData.gestion_cartera_id)
      data.append("tipo", formData.tipo)
      data.append("observacion", formData.observacion)

      if (formData.fecha_compromiso) {
        data.append("fecha_compromiso", formData.fecha_compromiso)
      }

      formData.soportes.forEach(file => {
        data.append("soportes[]", file)
      })

      const response = await GestionarFacturaApi.create(data)

      showToast("success", response.data.message)

      // reset
      setFormData({
        gestion_cartera_id: carteraId,
        tipo: "",
        observacion: "",
        fecha_compromiso: "",
        soportes: []
      })

      queryClient.invalidateQueries(["cartera-factura", carteraId])

    } catch (error) {
      console.log("Error:", error)
      showToast("error", "Error al registrar gestión")

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    handleChange,
    handleFiles,
    handleSubmit,
    errors,
    loading
  }
}