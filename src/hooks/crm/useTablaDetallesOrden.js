import { useContext, useEffect, useState } from "react";
import { useProducts } from "../useProducts";
import { productsApi } from "../../services/api";
import { showToast } from "../../helpers/utils/showToast";
import Swal from "sweetalert2";
import { ProductContext } from "../../context/ProductContext";


export const useTablaDetallesOrden = (detalles, orden) => {

const [search, setSearch] = useState(" ");
  const { stockInfo, getStockWithSuggestions } = useContext(ProductContext);

  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  // Cache interno para conservar todos los productos vistos
const [productCache, setProductCache] = useState({});

  const [bodegasDisponibles, setBodegasDisponibles] = useState([]);
  const [productStock, setProductStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleActivo, setDetalleActivo] = useState(null);
  const [errors, setErrors] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);
  const [stockErrors, setStockErrors] = useState({});
  const [configuracionesDescuento, setConfiguracionesDescuento] = useState({});
  const [alistamientos, setAlistamientos] = useState([]);
  const sedeId = orden?.orden_compra?.sede?.id;
//console.log("DEttalles orden:", orden);

  // AGREGAR: Estados para cache y tracking
  const [stockCache, setStockCache] = useState({});
  // Estado local para alternar modo

  // useEffect para calcular automáticamente la cantidad total
  useEffect(() => {
    if (detalleActivo) {
      // Sumar cantidades de bodegas del producto original
      const totalBodegas = (detalleActivo.bodegas || []).reduce(
        (sum, b) => sum + (parseFloat(b.cantidad) || 0),
        0
      );

      // Sumar cantidades de bodegas de productos equivalentes
      const totalEquivalentes = (
        detalleActivo.producto_equivalentes || []
      ).reduce(
        (sumEq, eq) =>
          sumEq +
          (eq.bodegas || []).reduce(
            (sumB, b) => sumB + (parseFloat(b.cantidad) || 0),
            0
          ),
        0
      );

      const nuevoTotal = parseFloat(
        (totalBodegas + totalEquivalentes).toFixed(2)
      );

      // Actualizar el valor total solo si cambió
      if (nuevoTotal !== detalleActivo.cantidad_total) {
        setDetalleActivo((prev) => ({
          ...prev,
          cantidad_total: nuevoTotal,
        }));
      }
    }
  }, [detalleActivo?.bodegas, detalleActivo?.producto_equivalentes]);
// Poblamos el cache con productos traídos por búsqueda
useEffect(() => {
  if (!products) return;

  setProductCache(prev => {
    const nuevo = { ...prev };
    products.forEach(p => {
      nuevo[p.id] = p;
    });
    return nuevo;
  });
}, [products]);

// Si un producto equivalente no está en la búsqueda actual, lo cargamos por ID
const ensureProductLoaded = async (id) => {
  if (productCache[id]) return productCache[id];

  try {
    const res = await productsApi.getById(id);
    const prod = res.data.product;

    setProductCache(prev => ({ ...prev, [id]: prod }));

    return prod;
  } catch (e) {
    console.error("Error cargando producto por ID:", id, e);
    return null;
  }
};

const guardarConfiguracionDescuento = (detalleIndex, config) => {
  setConfiguracionesDescuento(prev => ({
    ...prev,
    [detalleIndex]: {
      detalle_id: config.id,
      product_id: config.product_id || config.product?.id,
      cantidad_total: config.cantidad_total,
      bodegas: config.bodegas || [],
      producto_equivalentes: config.producto_equivalentes || [],
    }
  }));
};
  const fetchStockForProduct = async (detalle) => {
    const id = detalle.product_id || detalle.product?.id;
    if (!id) return null;

    try {
      setLoadingStock(true);
      const res = await productsApi.getStock(id,{
        sede_id: sedeId, // PASAR SEDE SI ES NECESARIO
      }); // sigue usando tu función global
      const data = res?.data?.stock;
      return data || null;
    } catch (err) {
      console.error("❌ Error al obtener stock del producto:", err);
      return null;
    } finally {
      setLoadingStock(false);
    }
  };

  const fetchAlistamientos = async () => {
  try {
    const res = await productsApi.getAlistamientosByOT(orden.id);
//console.log("Alistamientos obtenidos:", res.data);
    setAlistamientos(res.data.data?.original?.data || []);
  } catch (error) {
    console.error("Error cargando alistamientos:", error);
  }
};

useEffect(() => {
  if (orden.id) {
    fetchAlistamientos();
  }
}, [orden.id]);

    // Normalización de datos al cargar el detalle
    const alistamientosPorDetalle = (detalleId) => {
  return alistamientos.filter(
    (a) => a.orden_compra_detalle_id === detalleId
  );
};

  useEffect(() => {
    if (!detalles || detalles.length === 0) return;
    let cancelado = false;

    const fetchAllStock = async () => {
      const results = await Promise.allSettled(
        detalles.map(async (detalle) => {
          const productId = detalle.product_id || detalle.product?.id;
          if (!productId) return null;
          try {
            const res = await getStockWithSuggestions(productId,{
                sede_id: sedeId, // PASAR SEDE SI ES NECESARIO
            });
    //console.log("Stock con sugerencias para producto", productId, res);
            const data = res?.data;
            return { productId, data };
          } catch (e) {
            return { productId, data: null };
          }
        })
      );

      if (cancelado) return;

      const nuevoCache = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.data) {
          const { productId, data } = r.value;
          nuevoCache[productId] = data;
        }
      });

      setStockCache((prev) => ({ ...prev, ...nuevoCache }));
    };

    fetchAllStock();
    return () => {
      cancelado = true;
    };
  }, [JSON.stringify(detalles)]);

  // ✅ CAMBIAR: useEffect para usar resumen_por_bodega
  useEffect(() => {
    if (!modalOpen || !detalleActivo) return;
    if (stockInfo?.stock) {
      setProductStock(stockInfo.stock || null);

      // ✅ USAR: resumen_por_bodega como en DetalleTraslado
      setBodegasDisponibles(stockInfo.stock?.resumen_por_bodega || []);

      /*    console.log(
        "Stock info actualizado en modal:",
        stockInfo.stock?.resumen_por_bodega
      );*/
      setLoadingStock(false);
    }
  }, [stockInfo, modalOpen, detalleActivo]);
  useEffect(() => {
    setPdfUrl(null);
  }, [orden.id]);

  // 🔹 Prefetch de stock por producto (para poblar la columna Bodegas)
  useEffect(() => {
    if (!detalles || detalles.length === 0) return;

    const fetch = async () => {
      for (const d of detalles) {
        const productId = d.product_id || d.product?.id;
        if (!productId) continue;

        // si ya tenemos cache con bodegas, no vuelvas a pedir
        const ya = stockCache[productId]?.producto_base?.resumen_por_bodega;
        if (ya && ya.length > 0) continue;

        try {
          const res = await productsApi.getStock(productId,{
            sede_id: sedeId, // PASAR SEDE SI ES NECESARIO
          });
             
          const stockData = res?.data?.stock || null;
          if (stockData) {
            setStockCache((prev) => ({
              ...prev,
              [productId]: {
                ...(prev[productId] || {}),
                producto_base: {
                  stock_total: stockData.stock_total ?? 0,
                  resumen_por_bodega: stockData.resumen_por_bodega ?? [],
                },
              },
            }));
          }
        } catch (e) {
          // silencioso
        }
      }
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(detalles), sedeId]);
// 🆕 Función para enviar instrucciones de alistamiento a la DB
const enviarInstruccionesAlistamiento = async () => {
  try {
    setLoadingStock(true);

    const items = Object.values(configuracionesDescuento);

    if (items.length === 0) {
      showToast("warning", "No hay configuraciones guardadas para enviar");
      return;
    }

    // TRANSFORMACIÓN A FORMATO PLANO (CLAVE)
    const instrucciones = items.flatMap(config => {
      const ot = orden.id;

      // 🔹 Producto original
   const originales = (config.bodegas || []).map(b => ({
  orden_trabajo_id: ot,
  orden_compra_detalle_id: config.detalle_id, // ✅ FIX
  producto_id: config.product_id,
  bodega_id: b.bodega_id,
  cantidad: parseFloat(b.cantidad) || 0,
  tipo: "original",
  observacion: b.razon || null
}));

      // 🔹 Productos equivalentes
      const equivalentes = (config.producto_equivalentes || []).flatMap(eq =>
        (eq.bodegas || []).map(b => ({
          orden_trabajo_id: ot,
          orden_compra_detalle_id: config.detalle_id, // ✅ FIX
          producto_id: eq.id,
          bodega_id: b.bodega_id,
          cantidad: parseFloat(b.cantidad) || 0,
          tipo: "equivalente",
          observacion: eq.razon || null
        }))
      );

      return [...originales, ...equivalentes];
    });

    const payload = {
      items: instrucciones
    };

    console.log("📦 Payload alistamiento:", payload);

    // 🔹 Enviar a backend
    const res = await productsApi.postInstruccionesAlistamiento(payload);
    showToast("success", res?.data?.message || "Instrucciones de alistamiento enviadas correctamente");

    // 🔹 Limpiar estados relacionados
    setModalOpen(false);
    setProductStock(null);
    setDetalleActivo(null);
    setStockCache({});
    setConfiguracionesDescuento({});

  } catch (error) {
    console.error("❌ Error enviando alistamiento:", error);
 if (error.response?.status === 400 && Array.isArray(error.response?.data?.errores)) {

  const html = error.response.data.errores.map(err => `
    <div style="text-align:left; margin-bottom:10px;">
      <b>📦 ${err.producto}</b><br/>
      🏬 Bodega: ${err.bodega}<br/>
      📍 Sede: ${err.sede}<br/>
      📊 Stock: ${err.stock}<br/>
      📦 Ya alistado: ${err.ya_alistado_global}<br/>
      ➕ Solicitado: ${err.solicitado}<br/>
      ❌ <span style="color:red;">${err.mensaje}</span>
    </div>
  `).join("");

  Swal.fire({
    title: "Stock insuficiente",
    html: html,
    icon: "error",
    confirmButtonText: "Entendido",
    width: 600,
  });

  return;
}
  } finally {
    setLoadingStock(false);
  }
};
  const handleDescontarStockMasivo = async () => {
    try {
      setLoadingStock(true);
      showToast("info", "Procesando descuento masivo de stock...");

      // 🔹 Construir el payload con todos los productos visibles
      const items = detalles.map((detalle) => ({
        orden_trabajo_id: orden.id,
        orden_compra_id: detalle.orden_compra_id,
        producto_id: detalle.product_id,
        cantidad: parseFloat(detalle.cantidad) || 0,
        bodegas: (detalle.bodegas || []).map((b) => ({
          bodega_id: b.bodega_id,
          cantidad: parseFloat(b.cantidad) || 0,
          bodega_nombre: b.bodega_nombre,
          sede_nombre: b.sede_nombre,
        })),
        producto_equivalentes: (detalle.producto_equivalentes || []).map(
          (eq) => ({
            id: eq.id,
            razon: eq.razon || "",
            bodegas: (eq.bodegas || []).map((b) => ({
              bodega_id: b.bodega_id,
              cantidad: parseFloat(b.cantidad) || 0,
              bodega_nombre: b.bodega_nombre,
              sede_nombre: b.sede_nombre,
            })),
          })
        ),
      }));
      console.log("🔥 PAYLOAD DESCUENTO:", JSON.stringify(items, null, 2));

      // 🔹 Llamar tu endpoint Laravel
      const res = await productsApi.postDescontarStockMasivo({ items });

      if (res?.data?.success) {
        const pdfs = res.data.pdfs || [];
        showToast("success", "Descuento masivo completado correctamente ");

        // 🔹 Si solo hay un PDF, abrirlo directamente
        if (pdfs.length === 1) {
          window.open(pdfs[0].pdf, "_blank");
        }
        // 🔹 Si hay varios, mostrar lista interactiva
        else if (pdfs.length > 1) {
          const links = pdfs
            .map(
              (p) =>
                `<a href="${p.pdf}" target="_blank" style="display:block;margin:4px 0;color:#0d6efd;text-decoration:none;">
                📄 OT-${p.orden_trabajo_id}
              </a>`
            )
            .join("");

          Swal.fire({
            title: "PDFs generados",
            html: `<div style="text-align:left;">${links}</div>`,
            icon: "success",
            confirmButtonText: "Cerrar",
            width: 600,
          });
        } else {
          showToast("info", "No se generaron documentos PDF.");
        }

        // Abrir todos los PDFs generados (uno por movimiento)

        // Limpieza TOTAL DE LOS ESTADOS GLOBALES
        setModalOpen(false);
        setProductStock(null);
        setDetalleActivo(null);
        setStockCache({});
      } else {
        showToast(
          "warning",
          res?.data?.error ||
            "El proceso terminó con advertencias. Revisa los faltantes o errores parciales."
        );
        console.warn("⚠️ Errores parciales:", res?.data?.errores);
      }
    } catch (error) {
      console.error("❌ Error en descuento masivo:", error);

  const response = error.response?.data;
  console.error("Respuesta de error:", response);

  //  ERRORES DE NEGOCIO POR ÍTEM (stock insuficiente)
  if (error.response?.status === 400 && Array.isArray(response?.errores)) {
    const fieldErrors = {};

    response.errores.forEach((err) => {
      const index = detalles.findIndex(
        (d) => d.product_id === err.producto_id
      );

      if (index !== -1) {
        // Error global del item
        fieldErrors[`items.${index}.cantidad`] = [err.mensaje];

        // Error específico por bodega
        fieldErrors[`items.${index}.bodegas.${err.bodega_id}`] = [err.mensaje];
      }
    });

    setErrors(fieldErrors);
    console.warn("⚠️ Errores parciales:", fieldErrors);

    showToast(
      "error",
      "Hay productos con stock insuficiente. Revisa los campos marcados."
    );
    return;
  }

  if (error.response?.status === 422 && response?.errors) {
  setErrors(response.errors);
  showToast("warning", "Hay errores de validación.");
  return;
}

    } finally {
      setLoadingStock(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    // ✅ CAMBIO: Sin Math.floor para mantener decimales
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };


    return{


        search,
        setSearch,
        products,
        isLoading,
        isFetching,
        isEmpty,
        bodegasDisponibles,
        productStock,
        loadingStock,
        modalOpen,
        setModalOpen,
        detalleActivo,
        setDetalleActivo,
        errors,
        setErrors,
        pdfUrl,
        setPdfUrl,
        stockErrors,
        setStockErrors,
        ensureProductLoaded,
        handleDescontarStockMasivo,
        formatNumber,
         stockCache,
         fetchStockForProduct,
         setProductStock,
         setBodegasDisponibles,
         setLoadingStock,
         productCache,
            guardarConfiguracionDescuento,
            setConfiguracionesDescuento,
            configuracionesDescuento,
            enviarInstruccionesAlistamiento,
            alistamientos,
            setAlistamientos,
            alistamientosPorDetalle

    }
}