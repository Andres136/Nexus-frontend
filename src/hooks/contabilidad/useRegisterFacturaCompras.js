import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { facturasService } from "../../services/contabilidadService";

export const useRegisterFacturaCompras = () => {

  const [factura, setFactura] = useState({
    factura: {
      proveedor_id: null,
      estado_id: null,
      numero_factura: "",
      fecha_emision: "",
      fecha_vencimiento: "",
      total: "",
      subtotal: "",
      observaciones: "",
      numero_factura_proveedor: "",
    },
    detalles: [],
    pagos: [],
    gastos: [],
    impuestos: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 manejar inputs de factura
  const handleFacturaChange = (e) => {
    const { name, value } = e.target;

    setFactura((prev) => ({
      ...prev,
      factura: {
        ...prev.factura,
        [name]: value,
      },
    }));
  };

  // 🔹 agregar detalle
  const addDetalle = () => {
    setFactura((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          producto_id: null,
          cantidad: 1,
          precio_unitario: 0,
        },
      ],
    }));
  };

  // 🔹 actualizar detalle
  const updateDetalle = (index, field, value) => {
    const nuevos = [...factura.detalles];
    nuevos[index][field] = value;

    setFactura((prev) => ({
      ...prev,
      detalles: nuevos,
    }));
  };

  // 🔹 eliminar detalle
  const removeDetalle = (index) => {
    const nuevos = factura.detalles.filter((_, i) => i !== index);

    setFactura((prev) => ({
      ...prev,
      detalles: nuevos,
    }));
  };


  const handleSubmitFactura = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
   const payload = {
      factura: factura.factura,
      detalles: factura.detalles,
      pagos: factura.pagos,
      gastos: factura.gastos,
      impuestos: factura.impuestos,
    };

    const  response = await  facturasService.createFactura(payload);
    showToast("success", response.data.message || "Factura registrada exitosamente");
    setFactura({
      factura: {
        proveedor_id: null,
        estado_id: null,
        numero_factura: "",
        fecha_emision: "",
        fecha_vencimiento: "",
        total: "",
        subtotal: "",
        observaciones: "",
        numero_factura_proveedor: "",
      },
      detalles: [],
      pagos: [],
      gastos: [],
      impuestos: [],
    });

    } catch (err) {
        console.error("Error al registrar la factura:", err);
     if (err.response?.status === 422) {
        setError(err.response.data.errors); // 👈 AQUÍ está la magia
        showToast("error", "Errores de validación");
      } else {
        setError({ general: ["Ocurrió un error al registrar la factura"] });
        showToast("error", "Ocurrió un error al registrar la factura");
      }
    } finally {
      setLoading(false);
    }
  
  }
  return {
    factura,
    setFactura,
    handleFacturaChange,
    addDetalle,
    updateDetalle,
    removeDetalle,
    handleSubmitFactura,
    loading,
    error,
  };
};