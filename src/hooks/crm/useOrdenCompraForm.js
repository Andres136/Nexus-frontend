import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchOrdenCompra,
  createOrdenCompra,
  updateOrdenCompra,
  downloadOrdenPdf,
} from "../../services/ordenCompraService";

const FORM_INICIAL = {
  fecha_entrega: "",
  cliente_id: "",
  ubicacion_entrega: "",
  observaciones: "",
  cliente_documento: null,
  empresa_id: "",
  detalles: [],
};

function parsearErroresDetalles(errors) {
  const resultado = {};
  Object.entries(errors).forEach(([key, messages]) => {
    const match = key.match(/^detalles\.(\d+)\.(.+)$/);
    if (match) {
      const idx = Number(match[1]);
      const campo = match[2];
      if (!resultado[idx]) resultado[idx] = {};
      resultado[idx][campo] = Array.isArray(messages) ? messages[0] : messages;
    }
  });
  return resultado;
}

export default function useOrdenCompraForm({ modo, id }) {
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mostrarModalObservaciones, setMostrarModalObservaciones] = useState(false);
  const [observacionDetectada, setObservacionDetectada] = useState(false);

  useEffect(() => {
    if (modo !== "edicion" || !id) return;
    fetchOrdenCompra(id)
      .then(({ data }) => {
        setFormData({
          fecha_entrega: data.fecha_entrega,
          cliente_id: data.cliente_id,
          ubicacion_entrega: data.ubicacion_entrega,
          observaciones: data.observaciones,
          cliente_documento: data.cliente_documento,
          empresa_id: data.empresa_id,
          detalles: data.detalles.map((d) => ({
            id: d.id,
            product_id: d.product_id,
            product: d.product || d.producto || null,
            largo_cm: d.largo_cm,
            ancho_cm: d.ancho_cm,
            calibre: d.calibre,
            cantidad: d.cantidad,
            cantidad_enviada: d.cantidad_enviada,
            faltantes: d.faltantes,
            valor_unitario: d.valor_unitario,
            peso_bolsa: d.peso_bolsa,
            numero_bolsas: d.numero_bolsas,
            cliente_clb: d.cliente_clb,
            cantidad_requerida_kg: d.cantidad_requerida_kg,
            descripcion: d.descripcion,
            observaciones: d.observaciones,
            tipo_embalaje: d.tipo_embalaje,
            codigo_embalaje: d.codigo_embalaje,
            valor_total: d.valor_total,
          })),
        });
      })
      .catch(() => toast.error("Error al cargar la orden para editar."));
  }, [modo, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "observaciones" && value.trim() !== "" && !observacionDetectada) {
      setMostrarModalObservaciones(true);
      setObservacionDetectada(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, cliente_documento: e.target.files[0] }));
  };

  const handleDetallesChange = useCallback((detallesActualizados) => {
    setFormData((prev) => ({ ...prev, detalles: detallesActualizados }));
  }, []);

  const enviarOrden = async () => {
    setErrores({});
    setErroresDetalles({});
    setGuardando(true);

    try {
      const data = new FormData();
      data.append("fecha_entrega", formData.fecha_entrega);
      data.append("cliente_id", formData.cliente_id);
      data.append("ubicacion_entrega", formData.ubicacion_entrega);
      data.append("observaciones", formData.observaciones);
      data.append("empresa_id", formData.empresa_id);
      if (formData.cliente_documento) {
        data.append("cliente_documento", formData.cliente_documento);
      }

      const detallesNormalizados = formData.detalles.map((detalle) => {
        const d = { ...detalle };
        delete d.product;
        delete d.producto;

        return {
          ...d,
          product_id:
            d.product_id === "" || d.product_id === undefined ? null : d.product_id,
        };
      });
      detallesNormalizados.forEach((detalle, i) => {
        Object.entries(detalle).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            data.append(`detalles[${i}][${key}]`, value);
          }
        });
      });

      const response =
        modo === "edicion"
          ? await updateOrdenCompra(id, data)
          : await createOrdenCompra(data);

      toast.success(response.data.message);
      downloadOrdenPdf(response.data.orden_compra.id);
      setErrores({});
      setErroresDetalles({});

      if (modo !== "edicion") {
        setFormData(FORM_INICIAL);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const allErrors = error.response.data.errors;
        const errForm = {};
        const errDetalles = {};
        Object.entries(allErrors).forEach(([key, value]) => {
          if (key.startsWith("detalles.")) {
            errDetalles[key] = value;
          } else {
            errForm[key] = Array.isArray(value) ? value[0] : value;
          }
        });
        setErrores(errForm);
        setErroresDetalles(parsearErroresDetalles(errDetalles));
      } else {
        toast.error("Error al enviar la orden");
      }
    } finally {
      setGuardando(false);
    }
  };

  return {
    formData,
    setFormData,
    errores,
    erroresDetalles,
    guardando,
    mostrarModalObservaciones,
    setMostrarModalObservaciones,
    handleInputChange,
    handleFileChange,
    handleDetallesChange,
    enviarOrden,
  };
}
