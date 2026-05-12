import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSedes } from "../../hooks/useSedes";
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago";
import { useGetImpuesto } from "../../hooks/contabilidad/useGetImpuesto";
import { useRegisterFacturaCompras } from "../../hooks/contabilidad/useRegisterFacturaCompras";
import { useEmpresas } from "../../hooks/useEmpresas";
import Select from "react-select";
import DetallesFacturaCompras from "./DetallesFacturaCompras";
import { useGetAllProveedores } from "../../hooks/crm/useGetAllProveedores";

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
    handleSubmitFactura,
    error,
  } = useRegisterFacturaCompras({ id: id ? Number(id) : null, modo });

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
        const monto = base * (porcentaje / 100);
        totalImpuestos += monto;
        if (impuestosDetalleMap[i.impuesto_id]) {
          impuestosDetalleMap[i.impuesto_id].monto += monto;
        } else {
          impuestosDetalleMap[i.impuesto_id] = { nombre: imp?.nombre, porcentaje, monto };
        }
      });
    });

    const impuestosDetalle = Object.values(impuestosDetalleMap);

    const impuestosGenerales = factura.impuestos.map((i) => {
      const imp = impuestos.find((x) => x.id === i.impuesto_id);
      const porcentaje = Number(imp?.porcentaje || 0);
      const monto = subtotal * (porcentaje / 100);
      totalImpuestos += monto;
      return { nombre: imp?.nombre, porcentaje, monto };
    });

    return { subtotal, impuestosDetalle, impuestosGenerales, totalImpuestos, total: subtotal + totalImpuestos };
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
        ? { value: imp.id, label: `${imp.nombre} (${Number(imp.porcentaje).toFixed(2)}%)`, porcentaje: imp.porcentaje }
        : null;
    }).filter(Boolean);
  }, [factura.impuestos, impuestos]);

  const esEdicion = modo === "edicion";
// EL PROBLEMA YA NO ES LA DATA.
// EL PROBLEMA ESTÁ EN react-select VALUE MATCHING.

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
                onChange={(s) =>
                  handleFacturaChange({ target: { name: "proveedor_id", value: s?.value ?? null } })
                }
              />
              {getError("factura.proveedor_id") && (
                <p className="text-red-500 text-xs mt-1">{getError("factura.proveedor_id")}</p>
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
                  label: `${i.nombre} (${Number(i.porcentaje).toFixed(2)}%)`,
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
                <span className="font-medium">${resumen.subtotal.toFixed(2)}</span>
              </div>

              {resumen.impuestosDetalle.map((imp, index) => (
                <div key={`det-${index}`} className="flex justify-between text-sm text-slate-300">
                  <span>{imp.nombre} ({imp.porcentaje}%)</span>
                  <span>${imp.monto.toFixed(2)}</span>
                </div>
              ))}

              {resumen.impuestosGenerales.map((imp, index) => (
                <div key={`gen-${index}`} className="flex justify-between text-sm text-slate-400">
                  <span>{imp.nombre} ({imp.porcentaje}%)</span>
                  <span>${imp.monto.toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between text-base border-t border-slate-700 pt-2 font-semibold text-white">
                <span>Total</span>
                <span>${resumen.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>

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
      </div>
    </div>
  );
}
