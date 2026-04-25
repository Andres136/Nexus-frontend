import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import { showToast } from "../../helpers/utils/showToast"

import { ordenesServicioApi } from "../../services/api"
import { useOrdenesOsBydi } from "./useOrdenesOsBydi"
import { useEntregasProveedores } from "../useEntregasProveedores"



export function useOrdenServicioDetalle() {

  const { id } = useParams()

  const { orden, loading } = useOrdenesOsBydi(id)
  const { proveedoresAll, procesos} = useEntregasProveedores()
  const [detallesEditados, setDetallesEditados] = useState({})
  const [observacionesOrden, setObservacionesOrden] = useState("")
  const [pdfUrl, setPdfUrl] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

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

    setGuardando(true)

    try {

 const detalles = orden.detalles.map(detalle => {
console.log("🚀  detalle:", detalle);
const obsList = detalle.orden_compra_detalle?.observaciones || []
const obs = obsList[obsList.length - 1] || null

  const key = detalle.orden_compra_detalle_id
  const editado = detallesEditados[key] || {}
return {
  observacion_id: obs?.id ?? null,
  orden_compra_detalle_id: detalle.orden_compra_detalle_id,
  proceso_bolsas_id: editado.proceso_bolsas_id ?? obs?.proceso_bolsas_id ?? null,
  observacion: editado.observacion ?? obs?.observacion ?? "",
  cantidad: Number(editado.cantidad ?? detalle.cantidad)
}

})
const detallesValidos = detalles.filter(d =>
  d.observacion_id && d.proceso_bolsas_id
)

if (detallesValidos.length !== detalles.length) {
  showToast("error", "Todos los detalles deben tener proceso y observación");
  setGuardando(false);
  return;
}
      const response = await ordenesServicioApi.update(id, {
        proveedor_id: detallesEditados.proveedor_id || orden.proveedor_id,
        observaciones: observacionesOrden,
        detalles
      })

      setPdfUrl(response.data.pdf_url || null)

      showToast(
        "success",
        response.data.message 
      )
console.log("🚀  response:", response.data);
    } catch (error) {

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