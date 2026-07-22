// hooks/useDetallesOrdenTrabajo.js
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";



import clienteAxios from "../config/axios";
import { calcularCamposBolsa } from "../helpers/utils/calculoBolsa";



/* ---------------------------------------------------- */




export default function useDetallesOrdenTrabajo() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  const [errores, setErrores] = useState({});
  const [observaciones, setObservaciones] = useState("");


  const [detalles, setDetalles] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [carteraInfo, setCarteraInfo] = useState(null);



  const fetchOrden = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get(`/api/orden-trabajo/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      //  console.log('Respuesta de la API orden trabajo:', response.data);
        setOrden(response.data);
      } catch (error) {
        toast.error("No se pudo cargar la orden de trabajo.");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchOrden();
  }, [id]);

  //Obtener entregas con el numero de orden de trabajo
  // Obtener entregas con el número de orden de trabajo

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

     
      setEntregas(normalizadas);     // 👈 ahora es SIEMPRE un array
    } catch (error) {
      toast.error("No se pudo cargar las entregas.");
    }
  };

useEffect(() => {

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
        const calc = calcularCamposBolsa(detalle);
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

  }, [orden]);

  // Estado de cartera del cliente de esta orden (vencida / próxima a vencer)
  useEffect(() => {
    const clienteId = orden?.orden_compra?.cliente_id || orden?.orden_compra?.cliente?.id;
    if (!clienteId) {
      setCarteraInfo(null);
      return;
    }

    const obtenerCartera = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await clienteAxios.get(`/api/clientes/${clienteId}/cartera-resumen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCarteraInfo(data.cartera);
      } catch {
        setCarteraInfo(null);
      }
    };

    obtenerCartera();
  }, [orden?.orden_compra?.cliente_id, orden?.orden_compra?.cliente?.id]);

  const handleChangeDetalle = (index, field, value) => {
    setDetalles((prev) => {
      const nuevos = [...prev];
      if (!nuevos[index]) return nuevos;

      nuevos[index][field] = value;
      if (["largo_cm", "ancho_cm", "calibre", "cantidad", "valor_unitario"].includes(field)) {
        const calc = calcularCamposBolsa(nuevos[index]);
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



  const handleGuardarOrden = async () => {
  

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
          observaciones: d.observaciones || "",
          cantidad_enviada: parseFloat(d.nuevaCantidad)|| 0,
        })),
      };

      const response = await clienteAxios.post(`/api/orden-trabajo/${ordenCompraId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
 
      toast.success(response.data.message || "Orden de Trabajo actualizada");
      await fetchOrden(); // Refrescar datos de la orden después de guardar
      await fetchEntregas(); // Refrescar entregas después de guardar
      if (response.data.pdf_url) {
        // Si se generó un PDF, actualizar el estado
        setOrden((prev) => ({ ...prev, pdf_url: response.data.pdf_url }));
      }
      if (response.data.ordenTrabajo?.detalles) {
        const nuevosDetalles = response.data.ordenTrabajo.detalles.map((d) => {
          const calc = calcularCamposBolsa(d);
          return {
            ...d,
            cantidadEnviada: d.cantidad_enviada || 0,
            faltantes: d.faltantes || 0,
            nuevaCantidad: 0,
            ...calc,
            faltantesTemporal: undefined,
          };
        });
        setDetalles(nuevosDetalles);
      }
    } catch (error) {
      setErrores(error.response?.data?.errors || {});
      console.error(error);
      toast.error("Error al guardar la orden de trabajo");
    } finally {
      setLoading(false);
    }
  };




  const handleGuardarYGenerarPDF = async () => {

    await handleGuardarOrden();
  
  
  };
  const handleSeleccionarTodo = (checked) => {
    const nuevos = {};
    detalles.forEach((detalle) => {
      nuevos[detalle.id] = checked;
    });

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
    carteraInfo,
    handleGuardarYGenerarPDF,
    handleChangeDetalle,
 
    handleSeleccionarTodo, // 👈 aquí la expones
    refetchOrden: fetchOrden, 

  

  };
}
