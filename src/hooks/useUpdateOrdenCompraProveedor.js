import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import clienteAxios from "../config/axios";

export function useUpdateOrdenCompraProveedor(id) {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [ordenBloqueada, setOrdenBloqueada] = useState(false);
  const [mensajeBloqueo, setMensajeBloqueo] = useState("");

  const [formData, setFormData] = useState({
    proveedor_id: null,
    empresa_id: null,
    observaciones: "",
    numero_orden: "",
    fecha_entrega: "",
    sede_id: null,
    detalles: [],
  });

  // 🔹 Cargar orden
  useEffect(() => {
    if (!id) return;

    const cargarOrden = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem("token");
        const res = await clienteAxios.get(
          `/api/ordenes-compra-proveedor/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const orden = res.data.orden || res.data;
        const detalles = orden.detalles || orden.productos || [];

        // 🚫 ORDEN BLOQUEADA
        if (orden.editable === false) {
          setOrdenBloqueada(true);
          setMensajeBloqueo(
            orden.motivo_bloqueo ||
              "Esta orden ya tiene entregas registradas y no puede ser editada."
          );

          setFormData({
            proveedor_id: orden.proveedor_id,
            empresa_id: orden.empresa?.id || orden.empresa_id,
            observaciones: orden.observaciones || "",
            numero_orden: orden.numero_orden,
            sede_id: orden.sede_id,
            fecha_entrega: orden.fecha_entrega || "",
            detalles: [],
          });

          return;
        }

        setFormData({
          proveedor_id: orden.proveedor_id,
          empresa_id: orden.empresa?.id || orden.empresa_id,
          observaciones: orden.observaciones || "",
          numero_orden: orden.numero_orden,
          sede_id: orden.sede_id,
          fecha_entrega: orden.fecha_entrega || "",
          detalles: detalles.map((d, i) => ({
            id: d.id,
            item: i + 1,
            descripcion: d.descripcion || "",
            cantidad_solicitada: Number(d.cantidad_solicitada) || 0,
            code: d.code || "",
            producto_id: d.producto_id || null,
            campo_seleccionado: "description",
          })),
        });
      } catch (error) {
        toast.error("Error al cargar la orden");
        navigate("/auth/crm/proveedores-ordenes-compra");
      } finally {
        setCargando(false);
      }
    };

    cargarOrden();
  }, [id, navigate]);

  // 🔹 Actualizar orden
  const actualizarOrden = async () => {
    setErrores({});
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        proveedor_id: formData.proveedor_id,
        empresa_id: formData.empresa_id,
        observaciones: formData.observaciones,
        fecha_entrega: formData.fecha_entrega,
        detalles: formData.detalles.map((d, i) => ({
          id: d.id,
          item: d.item || i + 1,
          descripcion: d.descripcion,
          cantidad_solicitada: d.cantidad_solicitada,
          code: d.code,
          producto_id: d.producto_id,
    
        })),
      };
  console.log("Payload a enviar:", payload);
      await clienteAxios.put(
        `/api/ordenes-compra-proveedor/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Orden actualizada correctamente");
      navigate(`/auth/crm/ordenes-proveedor-preview/${id}`);
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 422) {
        if (data?.errors) {
          setErrores(data.errors);
          toast.error("Corrija los errores del formulario");
        } else if (data?.message) {
          toast.error(data.message);
          setOrdenBloqueada(true);
          setMensajeBloqueo(data.message);
        }
        return;
      }

      toast.error("Error inesperado al actualizar la orden");
    } finally {
      setGuardando(false);
    }
  };

  return {
    cargando,
    guardando,
    errores,
    ordenBloqueada,
    mensajeBloqueo,
    formData,
    setFormData,
    actualizarOrden,
  };
}
