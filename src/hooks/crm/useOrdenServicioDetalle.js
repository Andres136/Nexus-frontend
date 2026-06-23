import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import { showToast } from "../../helpers/utils/showToast"

import { ordenesServicioApi } from "../../services/api"
import { useOrdenesOsBydi } from "./useOrdenesOsBydi"
import { useEntregasProveedores } from "../useEntregasProveedores"



export function useOrdenServicioDetalle(formData) {

  const { id } = useParams()

  const { orden, loading } = useOrdenesOsBydi(id)
  const { proveedoresAll, procesos} = useEntregasProveedores()
  const [detallesEditados, setDetallesEditados] = useState({})
  const [pdfUrl, setPdfUrl] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [observacionesOrden, setObservacionesOrden] = useState("")

  useEffect(() => {
    if (orden) {
      setObservacionesOrden(orden.observaciones || "")
    }
  }, [orden])


  const handleChange = (detalleId, field, value) => {
    setDetallesEditados(prev => ({
      ...prev,
      [detalleId]: {
        ...prev[detalleId],
        [field]: value
      }
    }))
  }

  const handleGuardar = async () => {
  if (!orden?.detalles) {
    showToast("error", "Orden no cargada aún");
    return;
  }

  setGuardando(true);

  try {
    const datosOrden = formData || {
      empresa_id: orden.empresa_id,
      proveedor_id: detallesEditados.proveedor_id ?? orden.proveedor_id,
      fecha: orden.fecha,
      observaciones: observacionesOrden,
      detalles: (orden.detalles || []).map((detalle) => ({
        id: detalle.id,
        orden_compra_detalle_id: detalle.orden_compra_detalle_id,
        cantidad: detalle.cantidad,
        _info: {
          observaciones: detalle.orden_compra_detalle?.observaciones || [],
        },
      })),
    }

    const detalles = datosOrden.detalles.map(detalle => {
     const obsList = detalle._info?.observaciones || []
      const obs = obsList[0] || null

      const key = detalle.orden_compra_detalle_id
      const editado = detallesEditados[key] || {}

      return {
        observacion_id: obs?.id ?? null,
        orden_compra_detalle_id: detalle.orden_compra_detalle_id,
   proceso_bolsas_id: 
  editado.proceso_bolsas_id 
  ?? detalle.proceso_bolsas_id 
  ?? 1 ,
        observacion: editado.observacion ?? obs?.observacion ?? "",
        cantidad: Number(editado.cantidad ?? detalle.cantidad)
      }
    })

    const response = await ordenesServicioApi.update(id, {
      empresa_id: datosOrden.empresa_id,
      proveedor_id: datosOrden.proveedor_id,
      fecha: datosOrden.fecha,
      observaciones: datosOrden.observaciones,
      detalles
    })

    setPdfUrl(response.data.pdf_url || null)

    showToast("success", response.data.message)

  } catch (error) {
   console.error("Error al actualizar orden de servicio:", error)
    if (error.response?.status === 422) {
      setErrores(error.response.data.errors || {})
    } else {
      console.error(error)
      showToast("error", "Error al actualizar la orden")
    }

  } finally {
    setGuardando(false)
  }
}

  return {
    orden,
    loading,
    detallesEditados,
    observacionesOrden,
    setObservacionesOrden,
    pdfUrl,
    errores,
    guardando,
    handleChange,
    handleGuardar,
    setDetallesEditados,
    proveedoresAll,
    procesos
  }

}
