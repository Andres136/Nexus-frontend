import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardX, ChevronRight, Plus, Trash2, PackageSearch, Info } from "lucide-react";
import { useRegisterProductoNoConforme } from "../../hooks/calidad/useRegisterproductoNoConforme";
import { useClientes } from "../../hooks/useClientes";
import Select from "react-select";
import { useProducts } from "../../hooks/useProducts";
import useMisOrdenesCompra from "../../hooks/useMisOrdenesCompra";
import { useProveedores } from "../../hooks/useProveedores";
import { proveedoresApi } from "../../services/api";

const TIPOS_FALLA = [
  { value: "", label: "Seleccione tipo de falla" },
  { value: "defecto_calidad", label: "Defecto de calidad" },
  { value: "incumplimiento_especificacion", label: "Incumplimiento de especificación" },
  { value: "dano_fisico", label: "Daño físico" },
  { value: "contaminacion", label: "Contaminación" },
  { value: "otro", label: "Otro" },
];

const TIPOS_ORIGEN = [
  { value: "cliente", label: "Cliente (OC de venta)" },
  { value: "proveedor", label: "Proveedor (OC de compra)" },
  { value: "interno", label: "Interno (proceso propio)" },
];

export default function RegisterProductoNoConforme({ onClose }) {
  const navigate = useNavigate();
  const { formData, setFormData, loading, error, handleChange, handleSubmit } = useRegisterProductoNoConforme();
  const { clientesTodos: clientes } = useClientes();
  const { products, isLoading, isEmpty } = useProducts({ search: " " });
  const { ordenes } = useMisOrdenesCompra();
  const { ordenes: ordenesProveedor, obtenerOrdenes: obtenerOrdenesProveedor } = useProveedores();
  const [proveedores, setProveedores] = useState([]);

  const esOrigenCliente = formData.origen === "cliente";
  const esOrigenProveedor = formData.origen === "proveedor";
  const esOrigenInterno = formData.origen === "interno";

  const agregarProducto = () => {
    setFormData((prev) => ({
      ...prev,
      productos: [...prev.productos, { producto_id: "", cantidad_afectada: "" }],
    }));
  };

  const eliminarProducto = (index) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const actualizarProducto = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  useEffect(() => {
    if (esOrigenProveedor) obtenerOrdenesProveedor();
  }, [esOrigenProveedor, obtenerOrdenesProveedor]);

  useEffect(() => {
    if (!esOrigenProveedor || proveedores.length > 0) return;
    proveedoresApi.getAll().then((res) => setProveedores(res.data.proveedores ?? []));
  }, [esOrigenProveedor, proveedores.length]);

  const ordenesProveedorLista = ordenesProveedor?.data ?? [];

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit(formData);
    if (!result) return;
    if (onClose) {
      onClose();
    } else {
      navigate("/auth/crm/no-conformidades");
    }
  };

  const labelCls = "block text-sm font-medium text-gray-700 mb-1";
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const errCls = "mt-1 block text-xs text-red-600";
  const sectionTitleCls = "text-sm font-semibold text-gray-800";

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 38,
      fontSize: 14,
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
      "&:hover": { borderColor: "#a5b4fc" },
    }),
    menu: (base) => ({ ...base, fontSize: 14, zIndex: 20 }),
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <ClipboardX className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Registro Producto No Conforme</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Link to="/auth/crm/no-conformidades" className="hover:text-indigo-600 transition-colors">Productos No Conformes</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Registrar</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="mx-auto max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-6">

          {/* Sección: Origen */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className={sectionTitleCls}>Origen del reporte</h2>

            <div>
              <label className={labelCls}>Origen</label>
              <select
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className={`${inputCls} bg-white`}
              >
                {TIPOS_ORIGEN.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {error?.origen && <span className={errCls}>{error.origen[0]}</span>}
            </div>

            {esOrigenCliente && (
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-blue-50/60 p-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Cliente</label>
                  <Select
                    options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
                    value={clientes.find(c => c.id === formData.cliente_id) ? { value: formData.cliente_id, label: clientes.find(c => c.id === formData.cliente_id).nombre } : null}
                    onChange={(option) => handleChange({ target: { name: "cliente_id", value: option ? option.value : "" } })}
                    placeholder="Buscar cliente..."
                    classNamePrefix="rs"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {error?.cliente_id && <span className={errCls}>{error.cliente_id[0]}</span>}
                </div>

                <div>
                  <label className={labelCls}>Orden de compra (cliente)</label>
                  <Select
                    options={ordenes.map(o => ({ value: o.id, label: `OC-${o.id} - ${o.cliente.nombre}` }))}
                    value={ordenes.find(o => o.id === formData.orden_compra_id) ? { value: formData.orden_compra_id, label: `OC-${formData.orden_compra_id}` } : null}
                    onChange={(option) => handleChange({ target: { name: "orden_compra_id", value: option ? option.value : "" } })}
                    placeholder="Seleccionar..."
                    isDisabled={ordenes.length === 0}
                    classNamePrefix="rs"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {error?.orden_compra_id && <span className={errCls}>{error.orden_compra_id[0]}</span>}
                </div>
              </div>
            )}

            {esOrigenProveedor && (
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-purple-50/60 p-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Proveedor</label>
                  <Select
                    options={proveedores.map(p => ({ value: p.id, label: p.nombre }))}
                    value={proveedores.find(p => p.id === formData.proveedor_id) ? { value: formData.proveedor_id, label: proveedores.find(p => p.id === formData.proveedor_id).nombre } : null}
                    onChange={(option) => handleChange({ target: { name: "proveedor_id", value: option ? option.value : "" } })}
                    placeholder="Buscar proveedor..."
                    classNamePrefix="rs"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {error?.proveedor_id && <span className={errCls}>{error.proveedor_id[0]}</span>}
                </div>

                <div>
                  <label className={labelCls}>Orden de compra (proveedor)</label>
                  <Select
                    options={ordenesProveedorLista.map(o => ({ value: o.id, label: `${o.numero_orden} - ${o.proveedor?.nombre ?? ""}` }))}
                    value={ordenesProveedorLista.find(o => o.id === formData.orden_compra_proveedor_id) ? { value: formData.orden_compra_proveedor_id, label: ordenesProveedorLista.find(o => o.id === formData.orden_compra_proveedor_id).numero_orden } : null}
                    onChange={(option) => handleChange({ target: { name: "orden_compra_proveedor_id", value: option ? option.value : "" } })}
                    placeholder="Seleccionar..."
                    isDisabled={ordenesProveedorLista.length === 0}
                    classNamePrefix="rs"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {error?.orden_compra_proveedor_id && <span className={errCls}>{error.orden_compra_proveedor_id[0]}</span>}
                </div>
              </div>
            )}

            {esOrigenInterno && (
              <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <p>Es un proceso interno: no hace falta asociar cliente, proveedor ni productos.</p>
              </div>
            )}
          </section>

          {/* Sección: Productos afectados */}
          {!esOrigenInterno && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className={sectionTitleCls}>Productos afectados</h2>
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar producto
                </button>
              </div>

              {formData.productos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-8 text-center">
                  <PackageSearch className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">Aún no has agregado ningún producto.</p>
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.productos.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Producto</label>
                        <Select
                          options={products.map(p => ({ value: p.id, label: p.name }))}
                          value={products.find(p => p.id === item.producto_id) ? { value: item.producto_id, label: products.find(p => p.id === item.producto_id).name } : null}
                          onChange={(option) => actualizarProducto(index, "producto_id", option ? option.value : "")}
                          placeholder="Buscar producto..."
                          isLoading={isLoading}
                          isDisabled={isLoading || isEmpty}
                          classNamePrefix="rs"
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                        {error?.[`productos.${index}.producto_id`] && (
                          <span className={errCls}>{error[`productos.${index}.producto_id`][0]}</span>
                        )}
                      </div>
                      <div className="w-24">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={item.cantidad_afectada}
                          onChange={(e) => actualizarProducto(index, "cantidad_afectada", e.target.value)}
                          className={inputCls}
                        />
                        {error?.[`productos.${index}.cantidad_afectada`] && (
                          <span className={errCls}>{error[`productos.${index}.cantidad_afectada`][0]}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarProducto(index)}
                        className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        title="Quitar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error?.productos && (
                <span className={errCls}>{Array.isArray(error.productos) ? error.productos[0] : error.productos}</span>
              )}
            </section>
          )}

          {/* Sección: Detalle del reporte */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className={sectionTitleCls}>Detalle del reporte</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Tipo de falla</label>
                <select
                  name="tipo_falla"
                  value={formData.tipo_falla}
                  onChange={handleChange}
                  className={`${inputCls} bg-white`}
                >
                  {TIPOS_FALLA.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {error?.tipo_falla && <span className={errCls}>{error.tipo_falla[0]}</span>}
              </div>

              <div>
                <label className={labelCls}>Fecha de reporte</label>
                <input
                  type="date"
                  name="fecha_reporte"
                  value={formData.fecha_reporte}
                  onChange={handleChange}
                  className={inputCls}
                />
                {error?.fecha_reporte && <span className={errCls}>{error.fecha_reporte[0]}</span>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción inicial</label>
              <textarea
                name="descripcion_inicial"
                value={formData.descripcion_inicial}
                onChange={handleChange}
                placeholder="Describa brevemente el problema..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
              {error?.descripcion_inicial && <span className={errCls}>{error.descripcion_inicial[0]}</span>}
            </div>
          </section>

          {/* Error general */}
          {error?.general && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
              {error.general[0]}
            </div>
          )}

          {/* Botón Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar No Conforme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RegisterProductoNoConforme.propTypes = {
  onClose: PropTypes.func,
};
