import { useState, useEffect } from "react"
import { carteraApi } from "../../services/api"
import { useClientes } from "../useClientes"
import { useAuth } from "../useAuth"
import { showToast } from "../../helpers/utils/showToast"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

export const useGestionCartera = () => {

  const registroInicial = {
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
  }

  const [registros, setRegistros] = useState([registroInicial])

  const [porcentajes, setPorcentajes] = useState({
    iva: '',
    rete_renta: '',
    rete_ica: '',
  })

  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)

  const { clientes } = useClientes()
  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: 'auth' })
  const navigate = useNavigate()

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

      return nuevos
    })
  }

  const handlePorcentajeChange = (e) => {
    const { name, value } = e.target
    setPorcentajes(prev => ({ ...prev, [name]: value }))
  }

  // cálculo automático
  useEffect(() => {

    setRegistros(prev => prev.map(reg => {

      const baseNum = toNumber(reg.base || reg.valor)

      const ivaValor = baseNum * (toNumber(porcentajes.iva) / 100)
      const reteRentaValor = baseNum * (toNumber(porcentajes.rete_renta) / 100)
      const reteIcaValor = baseNum * (toNumber(porcentajes.rete_ica) / 100)

      const total = baseNum + ivaValor - reteRentaValor - reteIcaValor

      return {
        ...reg,
        iva: ivaValor.toFixed(2),
        rete_renta: reteRentaValor.toFixed(2),
        rete_ica: reteIcaValor.toFixed(2),
        valor_total: total.toFixed(2)
      }

    }))

  }, [porcentajes])

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setErrors(null)

    try {

      const response = await carteraApi.create({
        registros
      })

      showToast('success', response.data.message)
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

  } catch (error) {
    console.log("Error al cancelar deuda:", error)
    showToast("error", "Error al cancelar la deuda")
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
    clientes,
    usuarios,
    cancelarDeuda
  }
}