import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { showToast } from "../../helpers/utils/showToast"
import { useQueryClient } from "@tanstack/react-query"
import { carteraApi } from "../../services/api"

export const useUpdateCartera = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState(null)

  const toNumber = (v) => {
    const n = parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }

  const normalizeData = (data) => ({
    ...data,
    cliente_id: data.cliente?.id || '',
    user_comercial_id: data.comercial?.id || '',
    empresa_id: data.empresa?.id || '',
    // Agregar porcentajes iniciales (calculados desde los valores existentes)
    porcentaje_iva: data.base ? ((toNumber(data.iva) / toNumber(data.base)) * 100).toFixed(2) : '19',
    porcentaje_rete_renta: data.base ? ((toNumber(data.rete_renta) / toNumber(data.base)) * 100).toFixed(2) : '0',
    porcentaje_rete_ica: data.base ? ((toNumber(data.rete_ica) / toNumber(data.base)) * 100).toFixed(2) : '0',
    pagos: data.pagos || []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data } = await carteraApi.getDetalleCartera(id)
        setForm(normalizeData(data.data))
      } catch (error) {
        console.log(error)
        showToast("error", "Error cargando datos")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  // Función para recalcular valores
  const recalcular = (datos) => {
    const baseNum = toNumber(datos.base)
    const ivaValor = baseNum * (toNumber(datos.porcentaje_iva) / 100)
    const reteRentaValor = baseNum * (toNumber(datos.porcentaje_rete_renta) / 100)
    const reteIcaValor = baseNum * (toNumber(datos.porcentaje_rete_ica) / 100)
    const total = baseNum + ivaValor - reteRentaValor - reteIcaValor

    return {
      ...datos,
      iva: ivaValor.toFixed(2),
      rete_renta: reteRentaValor.toFixed(2),
      rete_ica: reteIcaValor.toFixed(2),
      valor_total: total.toFixed(2)
    }
  }

  // HANDLE CHANGE con recálculo automático
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => {
      const nuevos = { ...prev, [name]: value }

      // Recalcular si cambió base o algún porcentaje
      if (['base', 'porcentaje_iva', 'porcentaje_rete_renta', 'porcentaje_rete_ica'].includes(name)) {
        return recalcular(nuevos)
      }

      return nuevos
    })
  }

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const payload = {
        valor_total: form.valor_total,
        cliente_id: form.cliente_id,
        empresa_id: form.empresa_id,
        numero_factura: form.numero_factura,
        fecha_factura: form.fecha_factura,
        dias_credito: form.dias_credito,
        base: form.base,
        iva: form.iva,
        rete_renta: form.rete_renta,
        rete_ica: form.rete_ica,
        observaciones: form.observaciones,
        user_comercial_id: form.user_comercial_id,
      }
      const response = await carteraApi.update(id, payload)
      showToast("success", response.data.message)
      queryClient.invalidateQueries(["carteraClientes"])
      navigate("/auth/crm/cartera-clientes")
    } catch (error) {
      console.log(error)
      if (error.response?.data) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    errors,
    handleChange,
    handleUpdate
  }
}