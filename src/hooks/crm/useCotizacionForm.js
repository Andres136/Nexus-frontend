import { useEffect, useState } from "react";
import useCotizacionItems, { calcularValores } from "../useCotizacionItems";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  fetchCotizacion,
  createCotizacion,
  updateCotizacion,
  downloadCotizacionPdf,
} from "../../services/cotizacionService";

const OBSERVACIONES_DEFAULT = `❖ El precio ofertado es para pago a treinta (30) días calendario.

❖ Tiempo de Entrega: Quince (15) a veinte (20) días para el primer pedido, tres (03) a seis (06) días para los pedidos posteriores.

❖ Disponibilidad del Producto: Garantizamos la disponibilidad del producto.

❖ Las entregas en la ciudad de Bogotá las ofrecemos punto a punto. Para los municipios Girardot, Melgar, Ricaurte, Flandes, Viotá, Tocaima, Soacha, Funza, Madrid, Mosquera, Cali, Barranquilla, Soledad no tienen ningún recargo. Se realizan despachos a nivel nacional.

❖ Todos nuestros artículos tienen garantía por defectos de fabricación.

❖ Nuestros paquetes van rotulados con el nombre de la empresa, número de unidades del paquete, medida de la bolsa, color, calibre y código de barras.

❖ Para el caso de las bolsas marcadas es importante que el "cliché" lo aporte el cliente. En caso de no tenerlos, se cotiza como valor adicional y los mismos son propiedad del cliente.

❖ Apoyando la mitigación del impacto ambiental, todos nuestros productos son fabricados a partir de materiales Biodegradables y 100% reciclables, certificados y respaldados con fichas técnicas.
`;

const FORM_INICIAL = {
  cliente_id: "",
  empresa: "setasplast",
  observaciones: OBSERVACIONES_DEFAULT,
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

export default function useCotizacionForm({ modo, id }) {
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [detallesCargados, setDetallesCargados] = useState([]);
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { rows, updateItem, addItem, removeItem, resetItems } = useCotizacionItems({
    errores,
    onChange: (detalles) => setFormData((prev) => ({ ...prev, detalles })),
    initialRows: detallesCargados,
  });

  useEffect(() => {
    if (modo !== "edicion" || !id) return;
    fetchCotizacion(id)
      .then(({ data }) => {
        setFormData({
          cliente_id: data.cliente_id,
          empresa: data.empresa,
          observaciones: data.observaciones,
          detalles: data.detalles,
        });
        setDetallesCargados(
          data.detalles.map((item, i) => ({
            ...item,
            ...calcularValores(item),
            _uuid: crypto.randomUUID(),
            itemNumber: i + 1,
          }))
        );
      })
      .catch(() => toast.error("Error al cargar la cotización"));
  }, [modo, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cliente_id" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const resetFormulario = () => {
    setFormData(FORM_INICIAL);
    setDetallesCargados([]);
    setErrores({});
    resetItems();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.detalles.length) {
      toast.error("Debe ingresar al menos un ítem");
      return;
    }
    setLoading(true);
    try {
      const detallesLimpios = formData.detalles.map(({ _uuid, itemNumber, ...item }) => ({
        ...item,
        largo_cm: Number(item.largo_cm || 0),
        ancho_cm: Number(item.ancho_cm || 0),
        calibre: Number(item.calibre || 0),
        cantidad: Number(item.cantidad || 0),
        precio_total: Number(item.precio_total || 0),
        valor_unitario: Number(item.valor_unitario || 0),
        valor_paquete: Number(item.valor_paquete || 0),
        valor_total: Number(item.valor_total || 0),
        numero_bolsas: Number(item.numero_bolsas || 0),
        cantidad_requerida_kg: Number(item.cantidad_requerida_kg || 0),
        iva_porcentaje: Number(item.iva_porcentaje ?? 19),
      }));

      const payload = { ...formData, detalles: detallesLimpios };
      const response = modo === "edicion"
        ? await updateCotizacion(id, payload)
        : await createCotizacion(payload);

      toast.success(modo === "edicion" ? "Cotización actualizada" : "Cotización creada");
      downloadCotizacionPdf(response.data.cotizacion.id);
      navigate("/auth/crm/mis-cotizaciones");
      resetFormulario();
    } catch (error) {
      if (error.response?.data?.errors) {
        const all = error.response.data.errors;
        const errForm = {};
        const errDet = {};
        Object.entries(all).forEach(([key, val]) => {
          if (key.startsWith("detalles.")) errDet[key] = val;
          else errForm[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrores(errForm);
        setErroresDetalles(parsearErroresDetalles(errDet));
        toast.error("Errores en el formulario, por favor revisa");
      } else {
        toast.error("Error al guardar la cotización");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSubtotal = rows.reduce((s, r) => s + (r.valor_paquete || 0), 0);
  const totalIva = rows.reduce((s, r) => s + ((r.valor_total || 0) - (r.valor_paquete || 0)), 0);
  const totalGeneral = totalSubtotal + totalIva;

  return {
    formData,
    setFormData,
    rows,
    errores,
    erroresDetalles,
    loading,
    totalSubtotal,
    totalIva,
    totalGeneral,
    updateItem,
    addItem,
    removeItem,
    handleChange,
    handleSubmit,
  };
}
