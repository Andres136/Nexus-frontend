import { useState, useEffect } from "react"
import { carteraApi } from "../../services/api"
import { useClientes } from "../useClientes"
import{useEmpresas} from "../useEmpresas"
import { useAuth } from "../useAuth"
import { showToast } from "../../helpers/utils/showToast"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

export const useGestionCartera = () => {

  const registroInicial = {
    empresa_id: '',
    numero_factura: '',
    user_comercial_id: '',
    cliente_id: '',
    valor_total: '',
    saldo_pendiente: '',
    observaciones: '',
    fecha_factura: '',
    estado: 'pendiente',
    dias_credito: '',
    base: '',
    iva: '',
    rete_renta: '',
    rete_ica: '',
      // NUEVOS: porcentajes individuales por registro
  porcentaje_iva: '',
  porcentaje_rete_renta: '',
  porcentaje_rete_ica: '',
  }

  const [registros, setRegistros] = useState([registroInicial])

  const [porcentajes, setPorcentajes] = useState({
    iva: '',
    rete_renta: '',
    rete_ica: '',
  })

  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)

  const { clientesTodos} = useClientes()
  const { empresas } = useEmpresas()
  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: 'auth' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useEffect(() => {
    obtenerUsuariosAll()
  }, [])

  const toNumber = (v) => {
    const n = parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }

  // agregar nueva fila
  const agregarRegistro = () => {
    setRegistros(prev => [...prev, registroInicial])
  }

  // eliminar fila
  const eliminarRegistro = (index) => {
    setRegistros(prev => prev.filter((_, i) => i !== index))
  }

  // cambiar valores de cada fila
  const handleChange = (index, e) => {
  const { name, value } = e.target

  setRegistros(prev => {
    const nuevos = [...prev]
    nuevos[index] = {
      ...nuevos[index],
      [name]: value
    }

    // Recalcular si cambió base o algún porcentaje
    if (['base', 'porcentaje_iva', 'porcentaje_rete_renta', 'porcentaje_rete_ica'].includes(name)) {
      const reg = nuevos[index]
      const baseNum = toNumber(reg.base)
      const ivaValor = baseNum * (toNumber(reg.porcentaje_iva) / 100)
      const reteRentaValor = baseNum * (toNumber(reg.porcentaje_rete_renta) / 100)
      const reteIcaValor = baseNum * (toNumber(reg.porcentaje_rete_ica) / 100)
      const total = baseNum + ivaValor - reteRentaValor - reteIcaValor

      nuevos[index] = {
        ...nuevos[index],
        iva: ivaValor.toFixed(2),
        rete_renta: reteRentaValor.toFixed(2),
        rete_ica: reteIcaValor.toFixed(2),
        valor_total: total.toFixed(2)
      }
    }

    return nuevos
  })
}

  const handlePorcentajeChange = (e) => {
    const { name, value } = e.target
    setPorcentajes(prev => ({ ...prev, [name]: value }))
  }

 // Modificar handleNumberChange también para recalcular
const handleNumberChange = (index, e) => {
  const { name, value } = e.target
  const rawValue = value.replace(/\./g, "").replace(/,/g, "")

  if (!/^\d*$/.test(rawValue)) return

  setRegistros(prev => {
    const nuevos = [...prev]
    nuevos[index] = {
      ...nuevos[index],
      [name]: rawValue
    }

    // Recalcular valores
    const reg = nuevos[index]
    const baseNum = toNumber(reg.base)
    const ivaValor = baseNum * (toNumber(reg.porcentaje_iva) / 100)
    const reteRentaValor = baseNum * (toNumber(reg.porcentaje_rete_renta) / 100)
    const reteIcaValor = baseNum * (toNumber(reg.porcentaje_rete_ica) / 100)
    const total = baseNum + ivaValor - reteRentaValor - reteIcaValor

    nuevos[index] = {
      ...nuevos[index],
      iva: ivaValor.toFixed(2),
      rete_renta: reteRentaValor.toFixed(2),
      rete_ica: reteIcaValor.toFixed(2),
      valor_total: total.toFixed(2)
    }

    return nuevos
  })
}

 

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setErrors(null)

    try {

      const response = await carteraApi.create({
        registros
      })

      showToast('success', response.data.message)
      queryClient.invalidateQueries(["carteraClientes"]);
        navigate("/auth/crm/cartera-clientes")
      setRegistros([registroInicial])

    } catch (error) {
   console.log(error)
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || error.response.data.message)
      } else {
        setErrors('Error inesperado. Intenta más tarde.')
      }

    } finally {
      setLoading(false)
    }
  }


  //Cancelar la deuda
 const cancelarDeuda = async (carteraId) => {

  const confirm = await Swal.fire({
    title: "¿Cancelar deuda?",
    text: "Esto pondrá el saldo pendiente en 0",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "No"
  })

  if (!confirm.isConfirmed) return

  try {
    setLoading(true)

    const response = await carteraApi.cancelar(carteraId)

    Swal.fire("Cancelado", response.data.message, "success")
    queryClient.invalidateQueries(["carteraClientes"]);
  } catch (error) {
    console.log("Error al cancelar deuda:", error)
    showToast("error", "Error al cancelar la deuda")
  } finally {
    setLoading(false)
  }
}

// Eliminar un registro de cartera
const eliminarFactura = async (carteraId) => {

  const confirm = await Swal.fire({
    title: "¿Eliminar registro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No"
  })

  if (!confirm.isConfirmed) return

  try {
    setLoading(true)

    const response = await carteraApi.eliminar(carteraId)

    Swal.fire("Eliminado", response.data.message, "success")
    queryClient.invalidateQueries(["carteraClientes"]);
  } catch (error) {
    console.log("Error al eliminar registro:", error)
    showToast("error", "Error al eliminar el registro")
  } finally {
    setLoading(false)
  }
}

  return {
    registros,
    porcentajes,
    errors,
    loading,
    agregarRegistro,
    eliminarRegistro,
    handleChange,
    handlePorcentajeChange,
    handleSubmit,
   clientesTodos,
    usuarios,
    empresas,
    cancelarDeuda,
    handleNumberChange,
    eliminarFactura

  }
}