// hooks/useDetallesOrdenTrabajo.js
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { formatCurrency } from "../helpers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LOGO from "/public/images/SETAS.png";
import clienteAxios from "../config/axios";

const FACTOR_PULGADA = 0.393701;

/* ------------- SOLO ESTA FUNCIÓN CAMBIA ------------- */
function calcularCampos(detalle) {
  const largo_cm = parseFloat(detalle.largo_cm) || 0;
  const ancho_cm = parseFloat(detalle.ancho_cm) || 0;
  const calibre  = parseFloat(detalle.calibre ) || 0;
  const faltantes = parseFloat(detalle.faltantes) || 0;

  let peso_bolsa = 0,
      numero_bolsas = 0,
      cantidad_requerida_kg = 0;

  if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
    // 1. Convertir a pulgadas y redondear (política de planta)
    const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
    const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);

    // 2. Resultado intermedio sin dividir todavía
    const resultado = largoIn * anchoIn * 302 * calibre;

    // 3. “Correr la coma” --> dividir por 10 000 y TRUNCAR
    peso_bolsa = Math.max(1, Math.floor(resultado / 10_000)); // gramos

    // 4. Bolsas por kilo y kg requeridos
    numero_bolsas         = Math.round(1000 / peso_bolsa);              // bolsas/kg
    cantidad_requerida_kg = Math.ceil(faltantes * peso_bolsa) / 1000;   // kg
  }

  return { peso_bolsa, numero_bolsas, cantidad_requerida_kg };
}
/* ---------------------------------------------------- */


const cargarImagen = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

export default function useDetallesOrdenTrabajo() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  const [errores, setErrores] = useState({});
  const [observaciones, setObservaciones] = useState("");

  const [revisados, setRevisados] = useState({});
  const [detalles, setDetalles] = useState([]);
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get(`/api/orden-trabajo/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Detalles:', response.data);
        setOrden(response.data);
      } catch (error) {
        toast.error("No se pudo cargar la orden de trabajo.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrden();
  }, [id]);

  //Obtener entregas con el numero de orden de trabajo
  // Obtener entregas con el número de orden de trabajo
useEffect(() => {
  const fetchEntregas = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await clienteAxios.get(`/api/entregas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // data puede ser {entregas: [...] } o directamente un array
      const lista = Array.isArray(data) ? data : (data?.entregas ?? []);
      // opcional: normaliza tipos
      const normalizadas = lista.map(e => ({
        ...e,
        cantidad: parseFloat(e.cantidad ?? 0),
        faltante: parseFloat(e.faltante ?? 0),
        detalle_id: e.detalle_id ?? e.detalle?.id ?? null,
      }));

      console.log('Entregas normalizadas:', normalizadas);
      setEntregas(normalizadas);     // 👈 ahora es SIEMPRE un array
    } catch (error) {
      toast.error("No se pudo cargar las entregas.");
    }
  };

  fetchEntregas();
}, [id]);


  useEffect(() => {
    if (!orden || !orden.orden_compra) return;
    const arrayDetalles = Array.isArray(orden.orden_compra.detalles)
      ? orden.orden_compra.detalles
      : [];

    const detallesCalculados = arrayDetalles
      .map((detalle) => {
        if (!detalle) return null;
        const calc = calcularCampos(detalle);
        return {
          ...detalle,
          cantidadEnviada: detalle.cantidad_enviada || 0,
          faltantes: detalle.faltantes || 0,
          ...calc,
          faltantesTemporal: undefined,
        };
      })
      .filter(Boolean);

    setDetalles(detallesCalculados);
    setObservaciones(orden.observaciones || "");
    setRevisados(
      detallesCalculados.reduce((acc, d) => {
        acc[d.id] = false;
        return acc;
      }, {})
    );
  }, [orden]);

  const handleChangeDetalle = (index, field, value) => {
    setDetalles((prev) => {
      const nuevos = [...prev];
      if (!nuevos[index]) return nuevos;

      nuevos[index][field] = value;
      if (["largo_cm", "ancho_cm", "calibre", "cantidad", "valor_unitario"].includes(field)) {
        const calc = calcularCampos(nuevos[index]);
        nuevos[index] = { ...nuevos[index], ...calc };
      }
      if (field === "cantidadEnviada") {
        const cantidadEnviada = parseInt(value) || 0;
        const cantidadRequerida = parseFloat(nuevos[index].faltantes) || 0;
        nuevos[index].faltantesTemporal = Math.max(cantidadRequerida - cantidadEnviada, 0);
      }
      return nuevos;
    });
  };

  const handleCheckboxChange = (id) => {
    setRevisados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGuardarOrden = async () => {
    if (!Object.values(revisados).every((v) => v)) {
      toast.error("Por favor revisa todos los detalles antes de guardar");
      return;
    }

    try {
      setLoading(true);
      setErrores({});
      const token = localStorage.getItem("token");
      const ordenCompraId = orden.orden_compra.id;
      const payload = {
        observaciones,
        detalles: detalles.map((d) => ({
          id: d.id,
          largo_cm: d.largo_cm,
          ancho_cm: d.ancho_cm,
          calibre: d.calibre,
          cantidad: d.cantidad,
          valor_unitario: d.valor_unitario,
          descripcion: d.descripcion || "",
          cantidad_enviada: d.cantidadEnviada,
          observaciones: d.observaciones || "",
        })),
      };

      const response = await clienteAxios.post(`/api/orden-trabajo/${ordenCompraId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      toast.success(response.data.message || "Orden de Trabajo actualizada");
      if (response.data.ordenTrabajo?.detalles) {
        const nuevosDetalles = response.data.ordenTrabajo.detalles.map((d) => {
          const calc = calcularCampos(d);
          return {
            ...d,
            cantidadEnviada: d.cantidad_enviada || 0,
            faltantes: d.faltantes || 0,
            ...calc,
            faltantesTemporal: undefined,
          };
        });
        setDetalles(nuevosDetalles);
      }
    } catch (error) {
      setErrores(error.response?.data?.errors || {});
      toast.error("Error al guardar la orden de trabajo");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarPDF = async () => {
    const doc = new jsPDF();
    try {
      const logo = await cargarImagen(LOGO);
      doc.addImage(logo, "PNG", 10, 10, 25, 25); // proporciones más equilibradas
      doc.setFontSize(18);
      doc.text("ORDEN DE TRABAJO", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.text(`Orden #${orden.id}`, 14, 35);
      doc.text(`Cliente: ${orden.cliente?.nombre || "N/A"}`, 14, 41);
      doc.text(`Fecha de entrega: ${orden.fecha_entrega}`, 14, 47);
      doc.text(`Generado por el Asesor: ${orden.user?.name || "N/A"}`, 14, 53);


     const tableBody = [];

detalles.forEach((d, idx) => {
  // Fila principal del detalle
  tableBody.push([
    d.observaciones || "",
    d.ancho_cm,
    d.largo_cm,
    d.descripcion || "",
    d.calibre,
    d.cliente_clb,
    d.cantidad_requerida_kg?.toFixed(2) || 0,
    d.cantidad,
    d.cantidadEnviada,
    d.faltantesTemporal ?? d.faltantes,
    formatCurrency(d.valor_unitario),
    formatCurrency(d.valor_total),
    "" // Celda vacía para entregas en la fila principal
  ]);

  // Filtra entregas por detalle
  const entregasDetalle = entregas.filter(e => e.detalle_id === d.id);

  // Si hay entregas, agrega una fila debajo del item
  if (entregasDetalle.length > 0) {
    const entregasTexto = entregasDetalle.map(e =>
      `Cant: ${e.cantidad} | Fecha: ${e.fecha_entrega ? new Date(e.fecha_entrega).toLocaleDateString() : ""} | Usuario: ${e.usuario?.name || "N/A"}`
    ).join('\n');

    tableBody.push([
      { content: `Entregas:\n${entregasTexto}`, colSpan: 13, styles: { fontStyle: 'italic', textColor: [32, 128, 64], fontSize: 8, fillColor: [240, 255, 240] } }
    ]);
  }
});

autoTable(doc, {
  startY: 60,
  head: [[
    "Item", "Ancho", "Largo", "Descripcion", "Calibre", "Cliente CLB",
    "Cant. Req. (Kg)", "Cantidad", "Enviada", "Faltantes",
    "Valor Unit.", "Valor Total"
  ]],
  body: tableBody,
  styles: { fontSize: 8 },
});
      const totalKg = detalles.reduce(
        (acc, d) => acc + (parseFloat(d.cantidad_requerida_kg) || 0),
        0
      );
      
      let y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Valor Total: ${formatCurrency(orden.orden_compra.valor_total)}`, 14, y);
      y += 7; // Ajusta separación
      doc.text(`Total Kg Calculados: ${totalKg.toFixed(2)} Kg`, 14, y); // ✅ ESTA LÍNEA NUEVA
      y += 10;
      doc.text("Observaciones generales:", 14, y);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(observaciones || "Sin observaciones", 180), 14, y + 6);

// ... después de la tabla principal y antes de doc.save()



      doc.save(`Orden_Trabajo_${orden.id}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("No se pudo cargar el logo o generar el PDF.");
    }
  };

  const handleGuardarYGenerarPDF = async () => {
    if (!Object.values(revisados).every((v) => v)) {
      toast.error("Por favor revisa todos los detalles antes de guardar");
      return;
    }
    await handleGuardarOrden();
    await handleGenerarPDF();
  };
  const handleSeleccionarTodo = (checked) => {
    const nuevos = {};
    detalles.forEach((detalle) => {
      nuevos[detalle.id] = checked;
    });
    setRevisados(nuevos);
  };
  
//Obtener entregas



//Llamar a la función para obtener entregas al cargar el componente

  return {
    orden,
    detalles,
    observaciones,
    setObservaciones,
    errores,
    loading,
    entregas,
    handleGuardarYGenerarPDF,
    handleChangeDetalle,
    handleCheckboxChange,
    handleSeleccionarTodo, // 👈 aquí la expones


    revisados,
  };
}
