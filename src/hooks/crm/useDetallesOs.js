import { useState } from "react";
import Swal from "sweetalert2";

export default function useDetallesOs(formData, setFormData) {
  const [cantidadInput, setCantidadInput] = useState({});
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const agregarDetalle = (item) => {
    const cantidad = cantidadInput[item.detalle_id];

    if (!cantidad || Number(cantidad) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Cantidad inválida",
        text: "Por favor ingresa una cantidad válida mayor a cero.",
      });
      return;
    }

    if (Number(cantidad) > item.cantidad_faltante) {
      Swal.fire({
        icon: "error",
        title: "Cantidad inválida",
        text: "La cantidad no puede ser mayor al faltante.",
      });
      return;
    }

    const existe = formData.detalles.some(
      d => d.orden_compra_detalle_id === item.detalle_id
    );

    if (existe) {
      Swal.fire({
        icon: "error",
        title: "Detalle duplicado",
        text: "Este detalle ya fue agregado.",
      });
      return;
    }

    const nuevoDetalle = {
      orden_compra_detalle_id: item.detalle_id,
      cantidad: Number(cantidad),
      _info: {
        numero_orden: item.numero_orden,
        producto_nombre: item.producto.nombre,
        producto_descripcion: item.producto.descripcion,
        cantidad_faltante: item.cantidad_faltante,
        observaciones: item.observaciones || []
      }
    };

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle]
    }));

    setCantidadInput(prev => ({
      ...prev,
      [item.detalle_id]: ""
    }));

    setProductoSeleccionado(null);
  };

  const eliminarDetalle = (detalle_id) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter(
        d => d.orden_compra_detalle_id !== detalle_id
      )
    }));

    setCantidadInput(prev => {
      const nuevo = { ...prev };
      delete nuevo[detalle_id];
      return nuevo;
    });
  };

  const estaAgregado = (detalle_id) => {
    return formData.detalles.some(
      d => d.orden_compra_detalle_id === detalle_id
    );
  };

    const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      minHeight: "38px",
      "&:hover": { borderColor: "#9ca3af" },
    }),
  };

  return {
    cantidadInput,
    setCantidadInput,
    productoSeleccionado,
    setProductoSeleccionado,
    agregarDetalle,
    eliminarDetalle,
    estaAgregado,
    selectStyles
  };
}