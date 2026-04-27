import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { facturasService } from "../../services/contabilidadService";

export const useRegisterFacturaCompras = () => {

  const [factura, setFactura] = useState({
    factura: {
      proveedor_id: null,
      empresa_id: null,
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
  const [pdfUrl, setPdfUrl] = useState(null);
  

  // 🔹 manejar inputs de factura
const handleFacturaChange = (e) => {
  const { name, value } = e.target;

  // 🔥 CASO ESPECIAL: IMPUESTOS (ARRAY)
  if (name === "impuestos") {
    setFactura((prev) => ({
      ...prev,
      impuestos: value,
    }));
    return;
  }

  // 🔹 NORMAL (FACTURA)
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
        puck_id: null,        // 🔥 obligatorio en tu backend
        cantidad: 1,
        precio_unitario: 0,
        impuestos: [],        // 🔥 impuestos por ítem
      },
    ],
  }));
};
  // 🔹 actualizar detalle
 const updateDetalle = (index, field, value) => {
  setFactura((prev) => {
    const nuevos = prev.detalles.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );
    return { ...prev, detalles: nuevos };
  });
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
    console.log("Enviando factura:", factura); // 👉 Para depuración
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
    setPdfUrl(response.data.data.pdf_url); // 👉 Guardar URL del PDF para mostrarlo después
    console.log("Respuesta del servidor:", response); // 👉 Para depuración
    showToast("success", response.data.message || "Factura registrada exitosamente");
    setFactura({
      factura: {
        proveedor_id: null,
        empresa_id: null,
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
    pdfUrl,
    handleFacturaChange,
    addDetalle,
    updateDetalle,
    removeDetalle,
    handleSubmitFactura,
    loading,
    error,
  };
};