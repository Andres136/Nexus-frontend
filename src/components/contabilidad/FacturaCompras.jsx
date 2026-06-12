import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSedes } from "../../hooks/useSedes";
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago";
import { useGetImpuesto } from "../../hooks/contabilidad/useGetImpuesto";
import { useRegisterFacturaCompras } from "../../hooks/contabilidad/useRegisterFacturaCompras";
import { useEmpresas } from "../../hooks/useEmpresas";
import Select from "react-select";

const impuestoSigno = (impuesto) => impuesto?.operacion === "resta" ? -1 : 1;
const impuestoLabel = (impuesto) =>
  `${impuesto.nombre} (${impuesto.operacion === "resta" ? "−" : "+"}${Number(impuesto.porcentaje).toFixed(2)}%)`;
const formatCOP = (value) =>
  Number(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
import DetallesFacturaCompras from "./DetallesFacturaCompras";
import { useGetAllProveedores } from "../../hooks/crm/useGetAllProveedores";
import { facturasService } from "../../services/contabilidadService";

FacturaCompras.propTypes = {
  modo: PropTypes.oneOf(["creacion", "edicion"]),
};

export default function FacturaCompras({ modo = "creacion" }) {
  const { id } = useParams();
  const { proveedores } = useGetAllProveedores();
  const { sedes, bodegasAll } = useSedes();
  const { empresas } = useEmpresas();
  const { formasPago } = useGetFormasPago();
  const { impuestos } = useGetImpuesto();

  const {
    factura,
    pdfUrl,
    diasCredito,
    setDiasCredito,
    handleFacturaChange,
    addDetalle,
    updateDetalle,
    removeDetalle,
    replaceDetalles,
    handleSubmitFactura,
    error,
  } = useRegisterFacturaCompras({ id: id ? Number(id) : null, modo });
  const [ordenesProveedor, setOrdenesProveedor] = useState([]);
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [ordenModalId, setOrdenModalId] = useState(null);
  const [itemsModalSeleccionados, setItemsModalSeleccionados] = useState([]);
  const [busquedaProductosOrden, setBusquedaProductosOrden] = useState("");

  const getError = (field) => error?.[field]?.[0] || null;

  const inputClass =
    "w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition";
  const labelClass =
    "block text-[10px] tracking-wide font-semibold text-slate-500 uppercase mb-1.5";

  const formaPagoSeleccionada = useMemo(() => {
    if (!formasPago?.length || !factura.factura.forma_pago_id) return null;
    return formasPago.find(
      (fp) => Number(fp.id) === Number(factura.factura.forma_pago_id)
    );
  }, [formasPago, factura.factura.forma_pago_id]);

  const esCredito = useMemo(() => {
    const nombre = (formaPagoSeleccionada?.nombre || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return nombre.includes("credito");
  }, [formaPagoSeleccionada]);

  useEffect(() => {
    if (!esCredito) return;
    if (!factura.factura.fecha_emision) return;

    const dias = Number(diasCredito);
    if (!Number.isFinite(dias) || dias < 0) return;

    const base = new Date(`${factura.factura.fecha_emision}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;

    base.setDate(base.getDate() + dias);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    const fechaCalculada = `${yyyy}-${mm}-${dd}`;

    if (fechaCalculada !== factura.factura.fecha_vencimiento) {
      handleFacturaChange({
        target: { name: "fecha_vencimiento", value: fechaCalculada },
      });
    }
  }, [
    esCredito,
    diasCredito,
    factura.factura.fecha_emision,
    factura.factura.fecha_vencimiento,
    handleFacturaChange,
  ]);

  const resumen = useMemo(() => {
    const subtotal = factura.detalles.reduce(
      (acc, d) => acc + Number(d.cantidad) * Number(d.precio_unitario),
      0
    );

    let totalImpuestos = 0;
    const impuestosDetalleMap = {};

    factura.detalles.forEach((det) => {
      const base = Number(det.cantidad) * Number(det.precio_unitario);
      (det.impuestos || []).forEach((i) => {
        const imp = impuestos.find((x) => x.id === i.impuesto_id);
        const porcentaje = Number(imp?.porcentaje || 0);
        const monto = base * (porcentaje / 100) * impuestoSigno(imp);
        totalImpuestos += monto;
        if (impuestosDetalleMap[i.impuesto_id]) {
          impuestosDetalleMap[i.impuesto_id].monto += monto;
        } else {
          impuestosDetalleMap[i.impuesto_id] = {
            nombre: imp?.nombre,
            porcentaje,
            operacion: imp?.operacion || "suma",
            monto,
          };
        }
      });
    });

    const impuestosDetalle = Object.values(impuestosDetalleMap);

    const impuestosGenerales = factura.impuestos.map((i) => {
      const imp = impuestos.find((x) => x.id === i.impuesto_id);
      const porcentaje = Number(imp?.porcentaje || 0);
      const monto = subtotal * (porcentaje / 100) * impuestoSigno(imp);
      totalImpuestos += monto;
      return { nombre: imp?.nombre, porcentaje, operacion: imp?.operacion || "suma", monto };
    });

    const totalCargos = [...impuestosDetalle, ...impuestosGenerales]
      .filter((impuesto) => impuesto.monto > 0)
      .reduce((total, impuesto) => total + impuesto.monto, 0);
    const totalRetenciones = Math.abs(
      [...impuestosDetalle, ...impuestosGenerales]
        .filter((impuesto) => impuesto.monto < 0)
        .reduce((total, impuesto) => total + impuesto.monto, 0)
    );

    return {
      subtotal,
      impuestosDetalle,
      impuestosGenerales,
      totalImpuestos,
      totalCargos,
      totalRetenciones,
      total: subtotal + totalImpuestos,
    };
  }, [factura.detalles, factura.impuestos, impuestos]);

  // Helpers para el valor controlado de react-select
  const selectValue = (list, currentId, labelKey = "nombre") => {
    if (!currentId || !list?.length) return null;
    const item = list.find((x) => Number(x.id) === Number(currentId));
    return item ? { value: item.id, label: item[labelKey] } : null;
  };

  const impuestosGeneralesValue = useMemo(() => {
    if (!factura.impuestos?.length || !impuestos?.length) return [];
    return factura.impuestos.map((i) => {
      const imp = impuestos.find((x) => x.id === i.impuesto_id);
      return imp
        ? { value: imp.id, label: impuestoLabel(imp), porcentaje: imp.porcentaje }
        : null;
    }).filter(Boolean);
  }, [factura.impuestos, impuestos]);

  const esEdicion = modo === "edicion";

  useEffect(() => {
    const proveedorId = factura.factura.proveedor_id;
    if (!proveedorId) {
      setOrdenesProveedor([]);
      return;
    }

    let activo = true;
    setLoadingOrdenes(true);

    facturasService.getOrdenesProveedor(proveedorId)
      .then((response) => {
        if (!activo) return;
        setOrdenesProveedor(response.data?.ordenes?.data ?? []);
      })
      .catch(() => {
        if (activo) setOrdenesProveedor([]);
      })
      .finally(() => {
        if (activo) setLoadingOrdenes(false);
      });

    return () => {
      activo = false;
    };
  }, [factura.factura.proveedor_id]);

  useEffect(() => {
    const ordenIds = factura.ordenes_compra_proveedor_ids ?? [];
    const idsCargados = ordenesSeleccionadas.map((orden) => Number(orden.id)).sort().join(",");
    const idsRequeridos = ordenIds.map(Number).sort().join(",");
    if (!idsRequeridos || idsCargados === idsRequeridos) return;

    Promise.all(ordenIds.map((ordenId) => facturasService.getOrdenProveedorById(ordenId)))
      .then((responses) => setOrdenesSeleccionadas(responses.map((response) => response.data)))
      .catch(() => setOrdenesSeleccionadas([]));
  }, [factura.ordenes_compra_proveedor_ids, ordenesSeleccionadas]);

  const seleccionarOrdenesCompra = async (options) => {
    const ordenIds = (options ?? []).map((option) => option.value);
    handleFacturaChange({
      target: { name: "ordenes_compra_proveedor_ids", value: ordenIds },
    });

    if (ordenIds.length === 0) {
      setOrdenesSeleccionadas([]);
      replaceDetalles(factura.detalles.filter((detalle) => !detalle.orden_compra_proveedor_detalle_id));
      return;
    }

    setLoadingOrdenes(true);
    try {
      const responses = await Promise.all(
        ordenIds.map((ordenId) => facturasService.getOrdenProveedorById(ordenId))
      );
      const ordenes = responses.map((response) => response.data);
      setOrdenesSeleccionadas(ordenes);

      const primeraOrden = ordenes[0];
      if (primeraOrden?.empresa?.id) {
        handleFacturaChange({ target: { name: "empresa_id", value: primeraOrden.empresa.id } });
      }
      if (primeraOrden?.sede_id) {
        handleFacturaChange({ target: { name: "sede_id", value: primeraOrden.sede_id } });
      }

      const detallesPermitidos = new Set(
        ordenes.flatMap((orden) => (orden.productos ?? []).map((producto) => String(producto.id)))
      );

      replaceDetalles(
        factura.detalles.filter(
          (detalle) =>
            !detalle.orden_compra_proveedor_detalle_id ||
            detallesPermitidos.has(String(detalle.orden_compra_proveedor_detalle_id))
        )
      );
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const ordenOptions = ordenesProveedor.map((orden) => ({
    value: orden.id,
    label: `${orden.numero_orden} - ${orden.sede?.nombre || orden.sede_nombre || "Sin sede"}`,
  }));

  const ordenModal = ordenesSeleccionadas.find(
    (orden) => Number(orden.id) === Number(ordenModalId)
  );

  const productosOrdenFiltrados = useMemo(() => {
    const productos = ordenModal?.productos ?? [];
    const termino = busquedaProductosOrden.trim().toLocaleLowerCase("es");

    if (!termino) return productos;

    return productos.filter((producto) =>
      [
        producto.code,
        producto.producto_nombre,
        producto.descripcion,
        producto.estado_producto,
      ].some((valor) =>
        String(valor ?? "").toLocaleLowerCase("es").includes(termino)
      )
    );
  }, [ordenModal, busquedaProductosOrden]);

  const abrirModalOrden = (orden) => {
    const idsOrden = new Set((orden.productos ?? []).map((producto) => String(producto.id)));
    setItemsModalSeleccionados(
      factura.detalles
        .filter((detalle) => idsOrden.has(String(detalle.orden_compra_proveedor_detalle_id)))
        .map((detalle) => String(detalle.orden_compra_proveedor_detalle_id))
    );
    setBusquedaProductosOrden("");
    setOrdenModalId(orden.id);
  };

  const cerrarModalOrden = () => {
    setOrdenModalId(null);
    setItemsModalSeleccionados([]);
    setBusquedaProductosOrden("");
  };

  const alternarItemModal = (productoId) => {
    const id = String(productoId);
    setItemsModalSeleccionados((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((itemId) => itemId !== id)
        : [...anteriores, id]
    );
  };

  const aplicarItemsOrden = () => {
    if (!ordenModal) return;

    const idsOrden = new Set((ordenModal.productos ?? []).map((producto) => String(producto.id)));
    const existentes = new Map(
      factura.detalles.map((detalle) => [
        String(detalle.orden_compra_proveedor_detalle_id),
        detalle,
      ])
    );
    const detallesOtrasOrdenes = factura.detalles.filter(
      (detalle) => !idsOrden.has(String(detalle.orden_compra_proveedor_detalle_id))
    );
    const detallesSeleccionados = (ordenModal.productos ?? [])
      .filter(
        (producto) =>
          producto.producto_id && itemsModalSeleccionados.includes(String(producto.id))
      )
      .map((producto) =>
        existentes.get(String(producto.id)) ?? {
          producto_id: producto.producto_id,
          puck_id: null,
          cantidad: producto.cantidad_solicitada || 1,
          precio_unitario: 0,
          impuestos: [],
          orden_compra_proveedor_detalle_id: producto.id,
        }
      );

    replaceDetalles([...detallesOtrasOrdenes, ...detallesSeleccionados]);
    cerrarModalOrden();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800 leading-tight">
              {esEdicion ? "Editar Factura de Compra" : "Nueva Factura de Compra"}
            </h1>
            <p className="text-xs text-slate-500">
              {esEdicion
                ? "Modifica los datos de la factura existente"
                : "Registra la factura y controla vencimiento e impuestos en una sola vista"}
            </p>
          </div>
        </header>

        <form className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label className={labelClass}>Proveedor</label>
              <Select
                classNamePrefix="nexus-select"
                className="text-sm"
                options={proveedores?.map((p) => ({ value: p.id, label: p.nombre }))}
                value={selectValue(proveedores, factura.factura.proveedor_id)}
                onChange={(s) => {
                  handleFacturaChange({ target: { name: "proveedor_id", value: s?.value ?? null } });
                  handleFacturaChange({ target: { name: "ordenes_compra_proveedor_ids", value: [] } });
                  setOrdenesSeleccionadas([]);
                  replaceDetalles(factura.detalles.filter((detalle) => !detalle.orden_compra_proveedor_detalle_id));
                }}
              />
              {getError("factura.proveedor_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.proveedor_id")}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Órdenes de compra proveedor</label>
              <Select
                classNamePrefix="nexus-select"
                className="text-sm"
                isMulti
                isClearable
                isDisabled={!factura.factura.proveedor_id}
                isLoading={loadingOrdenes}
                options={ordenOptions}
                value={(factura.ordenes_compra_proveedor_ids ?? []).map((ordenId) => {
                  const option = ordenOptions.find((orden) => Number(orden.value) === Number(ordenId));
                  const ordenCargada = ordenesSeleccionadas.find(
                    (orden) => Number(orden.id) === Number(ordenId)
                  );
                  return option ?? (
                    ordenCargada
                      ? { value: ordenCargada.id, label: ordenCargada.numero_orden }
                      : null
                  );
                }).filter(Boolean)}
                onChange={seleccionarOrdenesCompra}
                placeholder={
                  factura.factura.proveedor_id
                    ? "Seleccionar una o varias órdenes..."
                    : "Seleccione proveedor primero"
                }
                noOptionsMessage={() => "El proveedor no tiene órdenes disponibles"}
              />
              {getError("ordenes_compra_proveedor_ids") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError("ordenes_compra_proveedor_ids")}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Empresa</label>
              <Select
                classNamePrefix="nexus-select"
                className="text-sm"
                options={empresas?.map((e) => ({ value: e.id, label: e.nombre }))}
                value={selectValue(empresas, factura.factura.empresa_id)}
                onChange={(s) =>
                  handleFacturaChange({ target: { name: "empresa_id", value: s?.value ?? null } })
                }
              />
              {getError("factura.empresa_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.empresa_id")}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Centro de Costo</label>
              <Select
                classNamePrefix="nexus-select"
                className="text-sm"
                options={sedes?.map((s) => ({ value: s.id, label: s.nombre }))}
                value={selectValue(sedes, factura.factura.sede_id)}
                onChange={(s) =>
                  handleFacturaChange({ target: { name: "sede_id", value: s?.value ?? null } })
                }
              />
              {getError("factura.sede_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.sede_id")}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>N° Factura Proveedor</label>
              <input
                type="text"
                name="numero_factura_proveedor"
                className={inputClass}
                value={factura.factura.numero_factura_proveedor}
                onChange={handleFacturaChange}
              />
              {getError("factura.numero_factura_proveedor") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError("factura.numero_factura_proveedor")}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Fecha Emisión</label>
              <input
                type="date"
                name="fecha_emision"
                className={inputClass}
                value={factura.factura.fecha_emision}
                onChange={handleFacturaChange}
              />
              {getError("factura.fecha_emision") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.fecha_emision")}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Forma de Pago</label>
              <Select
                classNamePrefix="nexus-select"
                className="text-sm"
                options={formasPago?.map((fp) => ({ value: fp.id, label: fp.nombre }))}
                value={selectValue(formasPago, factura.factura.forma_pago_id)}
                onChange={(s) => {
                  handleFacturaChange({ target: { name: "forma_pago_id", value: s?.value ?? null } });
                  if (!s) setDiasCredito("");
                }}
              />
              {getError("factura.forma_pago_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.forma_pago_id")}</p>
              )}
            </div>

            {esCredito && (
              <div>
                <label className={labelClass}>Días Crédito</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="dias_credito"
                  className={inputClass}
                  value={diasCredito}
                  onChange={(e) => setDiasCredito(e.target.value)}
                  placeholder="Ej: 30"
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento"
                className={`${inputClass} ${esCredito ? "bg-slate-100 text-slate-500" : ""}`}
                value={factura.factura.fecha_vencimiento}
                onChange={handleFacturaChange}
                disabled={esCredito}
              />
              {getError("factura.fecha_vencimiento") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.fecha_vencimiento")}</p>
              )}
            </div>

            <div className="sm:col-span-2 xl:col-span-2">
              <label className={labelClass}>Impuesto General</label>
              <Select
                classNamePrefix="nexus-select"
                isMulti
                options={impuestos?.map((i) => ({
                  value: i.id,
                  label: impuestoLabel(i),
                  porcentaje: i.porcentaje,
                }))}
                value={impuestosGeneralesValue}
                onChange={(selected) => {
                  handleFacturaChange({
                    target: {
                      name: "impuestos",
                      value: selected ? selected.map((s) => ({ impuesto_id: s.value, monto: 0 })) : [],
                    },
                  });
                }}
              />
              {getError("factura.impuesto_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.impuesto_id")}</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-slate-200">
            <div className="xl:col-span-2 bg-slate-50/70 rounded-xl p-3 border border-slate-200">
              <label className={labelClass}>Observaciones</label>
              <textarea
                name="observaciones"
                className="w-full min-h-[84px] px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition resize-none"
                value={factura.factura.observaciones}
                onChange={handleFacturaChange}
              />
              {getError("factura.observaciones") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.observaciones")}</p>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 flex flex-col space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-medium">{formatCOP(resumen.subtotal)}</span>
              </div>

              {resumen.impuestosDetalle.map((imp, index) => (
                <div key={`det-${index}`} className="flex justify-between text-sm text-slate-300">
                  <span>Detalle: {imp.nombre} ({imp.operacion === "resta" ? "−" : "+"}{imp.porcentaje}%)</span>
                  <span className={imp.monto < 0 ? "text-red-300" : "text-emerald-300"}>
                    {imp.monto < 0 ? "−" : "+"}{formatCOP(Math.abs(imp.monto))}
                  </span>
                </div>
              ))}

              {resumen.impuestosGenerales.map((imp, index) => (
                <div key={`gen-${index}`} className="flex justify-between text-sm text-slate-400">
                  <span>General: {imp.nombre} ({imp.operacion === "resta" ? "−" : "+"}{imp.porcentaje}%)</span>
                  <span className={imp.monto < 0 ? "text-red-300" : "text-emerald-300"}>
                    {imp.monto < 0 ? "−" : "+"}{formatCOP(Math.abs(imp.monto))}
                  </span>
                </div>
              ))}

              <div className="mt-1 border-t border-slate-700 pt-2 space-y-1">
                <div className="flex justify-between text-xs text-emerald-300">
                  <span>Total cargos</span>
                  <span>+{formatCOP(resumen.totalCargos)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-300">
                  <span>Total retenciones/descuentos</span>
                  <span>−{formatCOP(resumen.totalRetenciones)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Efecto neto</span>
                  <span>{resumen.totalImpuestos < 0 ? "−" : "+"}{formatCOP(Math.abs(resumen.totalImpuestos))}</span>
                </div>
              </div>

              <div className="flex justify-between text-base border-t border-slate-700 pt-2 font-semibold text-white">
                <span>Total final</span>
                <span>{formatCOP(resumen.total)}</span>
              </div>
            </div>
          </div>
        </form>

        {ordenesSeleccionadas.length > 0 && (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ordenesSeleccionadas.map((ordenSeleccionada) => (
              <div
                key={ordenSeleccionada.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      {ordenSeleccionada.numero_orden}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {(ordenSeleccionada.productos ?? []).length} ítems disponibles
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {factura.detalles.filter((detalle) =>
                      (ordenSeleccionada.productos ?? []).some(
                        (producto) =>
                          String(producto.id) ===
                          String(detalle.orden_compra_proveedor_detalle_id)
                      )
                    ).length} seleccionados
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => abrirModalOrden(ordenSeleccionada)}
                  className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Seleccionar ítems y ver entregas
                </button>
              </div>
            ))}
          </section>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4 shadow-sm">
          <DetallesFacturaCompras
            detalles={factura.detalles}
            addDetalle={addDetalle}
            updateDetalle={updateDetalle}
            removeDetalle={removeDetalle}
            bodegasAll={bodegasAll}
            error={error}
            impuestos={impuestos}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmitFactura}
            className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition"
          >
            {esEdicion ? "Actualizar Factura" : "Guardar Factura"}
          </button>
        </div>

        {pdfUrl && (
          <div className="mt-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver PDF de la Factura
            </a>
          </div>
        )}

        {ordenModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-3"
            onClick={cerrarModalOrden}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Seleccionar ítems de {ordenModal.numero_orden}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Marca únicamente los productos que incluirá esta factura.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalOrden}
                  className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <div className="overflow-auto p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full sm:max-w-md">
                    <input
                      type="search"
                      value={busquedaProductosOrden}
                      onChange={(event) => setBusquedaProductosOrden(event.target.value)}
                      placeholder="Buscar por código, producto, descripción o estado..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      {productosOrdenFiltrados.length} de {(ordenModal.productos ?? []).length} productos visibles
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setItemsModalSeleccionados(
                        Array.from(new Set([
                          ...itemsModalSeleccionados,
                          ...productosOrdenFiltrados
                            .filter((producto) => producto.producto_id)
                            .map((producto) => String(producto.id)),
                        ]))
                      )
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Seleccionar visibles
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemsModalSeleccionados([])}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Limpiar selección
                  </button>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-left uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-center">Incluir</th>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2 text-right">Solicitado</th>
                      <th className="px-3 py-2 text-right">Entregado</th>
                      <th className="px-3 py-2 text-right">Pendiente</th>
                      <th className="px-3 py-2">Historial de entregas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productosOrdenFiltrados.map((producto) => {
                      const pendiente = Math.max(
                        0,
                        Number(producto.cantidad_solicitada) - Number(producto.cantidad_entregada)
                      );
                      return (
                        <tr key={producto.id} className="align-top hover:bg-slate-50">
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={itemsModalSeleccionados.includes(String(producto.id))}
                              disabled={!producto.producto_id}
                              onChange={() => alternarItemModal(producto.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-slate-700">
                              {producto.code || "Sin código"} - {producto.producto_nombre || producto.descripcion}
                            </div>
                            <div className="text-slate-400">{producto.estado_producto}</div>
                          </td>
                          <td className="px-3 py-3 text-right">{producto.cantidad_solicitada}</td>
                          <td className="px-3 py-3 text-right text-emerald-700">
                            {producto.cantidad_entregada}
                          </td>
                          <td className="px-3 py-3 text-right text-amber-700">{pendiente}</td>
                          <td className="px-3 py-3">
                            {producto.entregas?.length ? (
                              <div className="space-y-1">
                                {producto.entregas.map((entrega) => (
                                  <div key={entrega.id} className="rounded bg-slate-100 px-2 py-1 text-slate-600">
                                    {entrega.fecha_entrega || entrega.created_at}: {entrega.cantidad_entregada}
                                    {entrega.bodega_nombre ? ` en ${entrega.bodega_nombre}` : ""}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">Sin entregas registradas</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {productosOrdenFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-3 py-10 text-center text-sm text-slate-400">
                          No se encontraron productos con esa búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">
                  {itemsModalSeleccionados.length} ítems seleccionados
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cerrarModalOrden}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={aplicarItemsOrden}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Aplicar ítems a la factura
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
