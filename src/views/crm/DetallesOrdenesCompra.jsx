import { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { formatCurrency } from "../../helpers";
import useSystem from "../../hooks/useSystem";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { calcularCamposBolsa } from "../../helpers/utils/calculoBolsa";
import { auditApi } from "../../services/api";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Loader2,
  MapPin,
  PackageSearch,
  Plus,
  Trash2,
  Truck,
  UserRound,
} from "lucide-react";




// Función para crear un nuevo detalle "vacío"
function createNewItem() {
  return {
    id: null,// Sin id para que el backend cree un nuevo detalle
    product_id: null,  
    largo_cm: 0,
    ancho_cm: 0,
    calibre: 0,
    cantidad: 0,
    valor_unitario: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cliente_clb: 0,
    cantidad_requerida_kg: 0,
    descripcion: "",
    valor_total: 0,
  };
}

export default function DetallesOrdenesCompra() {
  const { id } = useParams();


  const { ordenesCompra } = useSystem();
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [forzarEntregaParcial, setForzarEntregaParcial] = useState(false);
  const [searchTerm, setSearchTerm] = useState(" ");
  const [documentoVisto, setDocumentoVisto] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

console.log("ordenesCompra desde detalles:", ordenesCompra);
      const { products, isLoading,isEmpty, isFetching } = useProducts({search: searchTerm});



  // Encontrar la orden de compra en tu store/hook
  const ordenSeleccionada = ordenesCompra?.data
    ? ordenesCompra.data.find((orden) => orden.id === parseInt(id))
    : null;
const tieneDocumentoCliente = Boolean(ordenSeleccionada?.cliente_documento);


    useEffect(() => {
      if (ordenSeleccionada) {
        // Para cada detalle del backend, calculamos sus campos y asignamos el número de ítem
        const detallesCalculados = ordenesCompra
          .data
          .find((orden) => orden.id === parseInt(id))
          .detalles.map((det, index) => {
            return {
              ...det,
              observaciones: ` ${index + 1}`,
              ...calcularCamposBolsa(det)
            };
          });
    
        setDetalles(detallesCalculados);
      }
    }, [ordenesCompra, id, ordenSeleccionada]);
    
  // 2. Manejar cambio de input en cada fila
  const handleChangeDetalle = (index, field, value) => {
    const newDetalles = [...detalles];
    // Actualizamos el campo modificado
    newDetalles[index][field] = value;

    // Recalculamos con la función "calcularCampos"
   const recalculados = calcularCamposBolsa(newDetalles[index]);

    // Insertamos los valores calculados en el objeto
    newDetalles[index] = {
      ...newDetalles[index],
      ...recalculados,
    };

    setDetalles(newDetalles);
  };

  const agregarItem = () => {
    const newItem = createNewItem();
    // Calculamos los campos (aunque estén en 0) y asignamos observaciones con el número consecutivo
    const calculados = calcularCamposBolsa(newItem);
    const itemConNumero = { 
      ...newItem, 
      ...calculados,
      observaciones: `${detalles.length + 1}` 
    };
    setDetalles([...detalles, itemConNumero]);
  };
  

  // 4. Lógica para eliminar un item
  const eliminarItem = (index) => {
    const newDetalles = [...detalles];
    newDetalles.splice(index, 1);
    setDetalles(newDetalles);
  };

  // 5. Enviar datos al backend
  const handleGenerarOrdenTrabajo = async () => {
  
    if (!ordenSeleccionada) {
      toast.error("No se encontró la orden de compra");
      return;
    }
    try {
      setLoading(true);
      setErrores({});

      const erroresValidacion = detalles.reduce((acc, det, index) => {
        const tieneProducto =
          det.product_id !== null &&
          det.product_id !== undefined &&
          String(det.product_id).trim() !== "";

        if (!tieneProducto) {
          acc[`detalles.${index}.product_id`] = "Debes seleccionar un producto";
        }

        return acc;
      }, {});

      if (Object.keys(erroresValidacion).length > 0) {
        setErrores(erroresValidacion);
        const primerDetalleSinProducto = detalles.findIndex(
          (det) =>
            det.product_id === null ||
            det.product_id === undefined ||
            String(det.product_id).trim() === ""
        );
        setEditingProductIndex(primerDetalleSinProducto);
        toast.error("Selecciona un producto para cada item antes de generar la orden");
        return;
      }
      

      const token = localStorage.getItem("token");

      const response = await clienteAxios.post(
        `/api/orden-trabajo/${ordenSeleccionada.id}`,
        {
         
          sede_id: Number(sedeId),
          observaciones,
          forzar_entrega_parcial: forzarEntregaParcial, // << ESTE CAMPO NUEVO
 
          detalles: detalles.map((det) => ({
            // Si det.id existe, actualiza; si es null, crea nuevo
            id: det.id,
            product_id: det.product_id,
            largo_cm: det.largo_cm,
            ancho_cm: det.ancho_cm,
            calibre: det.calibre,
            cliente_clb: det.cliente_clb,
            descripcion: det.descripcion,
            cantidad: det.cantidad,
            cantidad_requerida_kg: det.cantidad_requerida_kg,
            valor_unitario: det.valor_unitario,
            valor_total: det.valor_total,
            observaciones: det.observaciones,
            // Otras propiedades si manejas "cantidad_enviada", etc.
            // ...
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Orden de Trabajo generada con éxito");
      // Limpieza o redirección si lo deseas
      // setDetalles([]);
      // setObservaciones("");

    } catch (error) {
      console.error("Error al generar la orden de trabajo:", error);
  if (error.response && error.response.data) {
  const data = error.response.data;

  if (data.errors) {
    // Caso típico de Laravel con "errors"
    setErrores(data.errors);
  } else if (data.error) {
    // Caso donde viene un solo "error"
    setErrores({ sede_id: data.error });
  }
} else {
  toast.error("Ocurrió un error al generar la orden de trabajo");
}

    } finally {
      setLoading(false);
    }
  };
 

//Mostrar documento del cliente


  // Cargar sedes al montar
  useEffect(() => {
    const obtenerSedes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("/api/sedes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
 //       console.log("Sedes obtenidas:", response.data);
        setSedes(response.data);
      } catch (error) {
        toast.error("Error al cargar las sedes", error);
      }
    };
  
    obtenerSedes();
  }, []);
 const safeProducts = Array.isArray(products?.data)
  ? products.data
  : Array.isArray(products)
    ? products
    : [];

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
  const compactInputClass =
    "w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
  const readOnlyMetricClass =
    "rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-semibold text-gray-800";
  const tableHeadClass =
    "sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500";
  const tableCellClass = "border-b border-gray-100 px-3 py-2 align-top";
  const totalOrden = detalles.reduce((sum, detalle) => sum + (Number(detalle.valor_total) || 0), 0);

  const infoCards = [
    {
      label: "Fecha de entrega",
      value: ordenSeleccionada?.fecha_entrega || "No disponible",
      icon: CalendarDays,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Asesor comercial",
      value: ordenSeleccionada?.user?.name || "No disponible",
      icon: UserRound,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Dirección de entrega",
      value: ordenSeleccionada?.ubicacion_entrega || "No disponible",
      icon: MapPin,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Observaciones",
      value: ordenSeleccionada?.observaciones || "No disponible",
      icon: ClipboardList,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  <FileText className="h-3.5 w-3.5" />
                  Orden de compra
                </span>
                {ordenSeleccionada && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    #{ordenSeleccionada.id}
                  </span>
                )}
                {documentoVisto && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Documento revisado
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-tight text-gray-950 sm:text-2xl">
                {ordenSeleccionada
                  ? ordenSeleccionada.cliente?.nombre || "Cliente desconocido"
                  : "Detalles de la Orden de Compra"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisa los detalles comerciales antes de generar la orden de trabajo.
              </p>
            </div>

            {ordenSeleccionada && tieneDocumentoCliente && (
              <button
                onClick={async () => {
                  window.open(
                    `${import.meta.env.VITE_API_URL}/api/orden-compras/${ordenSeleccionada.id}/preview-documento`,
                    "_blank",
                    "noopener,noreferrer"
                  );

                  const response = await auditApi.postOrdenCompraRevisada(ordenSeleccionada.id);

                  toast(response.data.message || "Documento marcado como revisado");

                  setDocumentoVisto(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <Eye className="h-4 w-4" />
                Ver documento del cliente
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            {infoCards.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-900">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!ordenSeleccionada ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">No se encontró la orden de compra con ID {id}</p>
          </div>
        ) : (
          <>
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-950">Detalle de productos</h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {detalles.length} item{detalles.length !== 1 ? "s" : ""} en la orden
                  </p>
                </div>
                <button
                  onClick={agregarItem}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <Plus className="h-4 w-4" />
                  Agregar item
                </button>
              </div>

              {detalles.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <PackageSearch className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-700">No hay items registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[1320px] w-full text-sm">
                    <thead>
                      <tr>
                        <th className={`${tableHeadClass} w-12`}></th>
                        <th className={`${tableHeadClass} w-16`}>Item</th>
                        <th className={`${tableHeadClass} w-10`}></th>
                        <th className={`${tableHeadClass} min-w-[180px]`}>Referencia</th>
                        <th className={`${tableHeadClass} w-24`}>Ancho</th>
                        <th className={`${tableHeadClass} w-24`}>Largo</th>
                        <th className={`${tableHeadClass} w-24`}>Calibre</th>
                        <th className={`${tableHeadClass} w-28`}>Peso bolsa</th>
                        <th className={`${tableHeadClass} w-28`}>Bolsas</th>
                        <th className={`${tableHeadClass} w-24`}>Cliente</th>
                        <th className={`${tableHeadClass} w-28`}>Kg req.</th>
                        <th className={`${tableHeadClass} min-w-[240px]`}>Descripción</th>
                        <th className={`${tableHeadClass} w-24`}>Cantidad</th>
                        <th className={`${tableHeadClass} w-32`}>Valor unit.</th>
                        <th className={`${tableHeadClass} w-32 text-right`}>Valor total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {detalles.map((detalle, index) => (
                        <tr key={index} className="transition hover:bg-blue-50/30">
                          <td className={tableCellClass}>
                            <button
                              onClick={() => eliminarItem(index)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-100"
                              title="Eliminar item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="text"
                              value={detalle.observaciones}
                              onChange={(e) =>
                                handleChangeDetalle(index, "observaciones", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={`${tableCellClass} text-center`}>
                            <button
                              onClick={() => setEditingProductIndex(index)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                              title="Buscar producto"
                            >
                              <PackageSearch className="h-4 w-4" />
                            </button>
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="text"
                              readOnly
                              value={
                                safeProducts.find((p) => String(p.id) === String(detalle.product_id))?.name ||
                                detalle.product?.name ||
                                ""
                              }
                              onClick={() => setEditingProductIndex(index)}
                              placeholder="Sin producto"
                              className={`w-full min-w-[160px] cursor-pointer rounded-md border bg-gray-50 px-2 py-1.5 text-sm text-gray-700 transition hover:border-blue-400 focus:outline-none ${
                                errores[`detalles.${index}.product_id`]
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              title="Clic para cambiar producto"
                            />
                            {errores[`detalles.${index}.product_id`] && (
                              <div className="mt-1 text-xs font-medium text-red-600">
                                {errores[`detalles.${index}.product_id`]}
                              </div>
                            )}
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.ancho_cm}
                              onChange={(e) =>
                                handleChangeDetalle(index, "ancho_cm", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.largo_cm}
                              onChange={(e) =>
                                handleChangeDetalle(index, "largo_cm", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.calibre}
                              onChange={(e) =>
                                handleChangeDetalle(index, "calibre", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <div className={readOnlyMetricClass}>{detalle.peso_bolsa?.toFixed(2)}</div>
                          </td>
                          <td className={tableCellClass}>
                            <div className={readOnlyMetricClass}>{detalle.numero_bolsas || 0}</div>
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="text"
                              value={detalle.cliente_clb}
                              onChange={(e) =>
                                handleChangeDetalle(index, "cliente_clb", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.cantidad_requerida_kg.toFixed(2)}
                              onChange={(e) =>
                                handleChangeDetalle(index, "cantidad_requerida_kg", e.target.value)
                              }
                              className={compactInputClass}
                              step="0.01"
                              min="0"
                            />
                          </td>
                          <td className={tableCellClass}>
                            <textarea
                              value={detalle.descripcion}
                              onChange={(e) =>
                                handleChangeDetalle(index, "descripcion", e.target.value)
                              }
                              className={`${inputClass} min-h-[42px] resize-none uppercase`}
                              rows="2"
                              placeholder="Descripción del producto..."
                            />
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.cantidad}
                              onChange={(e) =>
                                handleChangeDetalle(index, "cantidad", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <input
                              type="number"
                              value={detalle.valor_unitario}
                              onChange={(e) =>
                                handleChangeDetalle(index, "valor_unitario", e.target.value)
                              }
                              className={compactInputClass}
                            />
                          </td>
                          <td className={`${tableCellClass} text-right`}>
                            <div className="rounded-md bg-emerald-50 px-2 py-1.5 font-semibold text-emerald-700">
                              {formatCurrency(detalle.valor_total)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  Total estimado de la orden
                </div>
                <div className="text-xl font-bold text-gray-950">{formatCurrency(totalOrden)}</div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Observaciones de la Orden de Trabajo
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[120px] resize-none`}
                    rows={4}
                    placeholder="Observaciones de la Orden de Trabajo"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                  {errores.observaciones && (
                    <p className="mt-1 text-sm font-medium text-red-600">{errores.observaciones}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      Sede
                    </label>
                    <select
                      className={`w-full rounded-md border bg-white p-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                        errores.sede_id ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      value={sedeId}
                      onChange={(e) => setSedeId(e.target.value)}
                    >
                      <option value="">-- Selecciona una sede --</option>
                      {sedes.map((sede) => (
                        <option key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.sede_id && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {Array.isArray(errores.sede_id) ? errores.sede_id[0] : errores.sede_id}
                      </p>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <input
                      type="checkbox"
                      id="entregasParciales"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={forzarEntregaParcial}
                      onChange={(e) => setForzarEntregaParcial(e.target.checked)}
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Truck className="h-4 w-4 text-gray-500" />
                      Cliente requiere entregas parciales
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                <button
                  onClick={handleGenerarOrdenTrabajo}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Generando..." : "Generar Orden de Trabajo"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modal selector de producto */}
      {editingProductIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingProductIndex(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Seleccionar producto — Ítem {detalles[editingProductIndex]?.observaciones}
                </h3>
              </div>
              <button
                onClick={() => setEditingProductIndex(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <Select
              isLoading={isLoading || isFetching}
              options={safeProducts.map((p) => ({
                value: p.id,
                label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
                code: p.code,
                name: p.name,
              }))}
              value={(() => {
                const det = detalles[editingProductIndex];
                const product = safeProducts.find(
                  (p) => String(p.id) === String(det?.product_id)
                );
                if (product) {
                  return {
                    value: product.id,
                    label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
                  };
                }
                if (det?.product) {
                  return {
                    value: det.product.id,
                    label: `${det.product.code || "Sin código"} - ${det.product.name || "Sin nombre"}`,
                  };
                }
                return null;
              })()}
              onChange={(selectedOption) => {
                const newDetalles = [...detalles];
                newDetalles[editingProductIndex].product_id = selectedOption?.value || null;
                newDetalles[editingProductIndex].referencia = selectedOption?.name || "";
                newDetalles[editingProductIndex].descripcion = selectedOption?.name || "";
                setDetalles(newDetalles);
                setErrores((prevErrores) => {
                  const nextErrores = { ...prevErrores };
                  delete nextErrores[`detalles.${editingProductIndex}.product_id`];
                  return nextErrores;
                });
                setEditingProductIndex(null);
              }}
              onInputChange={(inputValue) => setSearchTerm(inputValue)}
              placeholder="Buscar por código o nombre..."
              noOptionsMessage={() =>
                isLoading
                  ? "Cargando productos..."
                  : isEmpty
                  ? "No se encontraron productos"
                  : "Escribe para buscar"
              }
              autoFocus
              menuIsOpen
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxShadow: "none",
                }),
                menu: (base) => ({ ...base, position: "relative", boxShadow: "none", border: "1px solid #e5e7eb", marginTop: "8px" }),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
