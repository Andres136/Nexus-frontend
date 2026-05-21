import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ClipboardX, ChevronRight } from "lucide-react";
import { useRegisterProductoNoConforme } from "../../hooks/calidad/useRegisterproductoNoConforme";
import { useClientes } from "../../hooks/useClientes";
import Select from "react-select";
import { useProducts } from "../../hooks/useProducts";
import useMisOrdenesCompra from "../../hooks/useMisOrdenesCompra";

const TIPOS_FALLA = [
  { value: "", label: "Seleccione tipo de falla" },
  { value: "defecto_calidad", label: "Defecto de calidad" },
  { value: "incumplimiento_especificacion", label: "Incumplimiento de especificación" },
  { value: "dano_fisico", label: "Daño físico" },
  { value: "contaminacion", label: "Contaminación" },
  { value: "otro", label: "Otro" },
];

export default function RegisterProductoNoConforme({ onClose }) {
  const { formData, loading, error, handleChange, handleSubmit } = useRegisterProductoNoConforme();
  const { clientesTodos: clientes } = useClientes();
  const { products, isLoading, isEmpty } = useProducts({ search: " " });
  const { ordenes } = useMisOrdenesCompra();

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit(formData);
    if (result && onClose) onClose();
  };

  // Clases CSS compactas
  const inputCls = "mt-0.5 block w-full border border-gray-300 rounded shadow-sm h-8 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors";
  const labelCls = "block text-[11px] font-semibold text-gray-700 uppercase tracking-wider";
  const errCls   = "text-red-500 text-[10px] mt-0.5 leading-tight block";

  // Estilos compactos para React-Select
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: 32,
      height: 32,
      fontSize: 12,
      borderRadius: '0.25rem',
      borderColor: '#d1d5db',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    }),
    valueContainer: (base) => ({ ...base, padding: '0 6px' }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: 30 }),
    dropdownIndicator: (base) => ({ ...base, padding: 4 }),
    clearIndicator: (base) => ({ ...base, padding: 4 }),
    menu: (base) => ({ ...base, fontSize: 12 })
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
              <Link to="/auth/novedades" className="hover:text-indigo-600 transition-colors">Calidad</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Producto No Conforme</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Formulario centrado */}
      <div className="flex justify-center">
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-x-3 gap-y-2.5 bg-white p-1 w-full max-w-lg">

      {/* Cliente */}
      <div>
        <label className={labelCls}>Cliente</label>
        <div className="mt-0.5">
          <Select
            name="cliente_id"
            options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
            value={clientes.find(c => c.id === formData.cliente_id) ? { value: formData.cliente_id, label: clientes.find(c => c.id === formData.cliente_id).nombre } : null}
            onChange={(option) => handleChange({ target: { name: "cliente_id", value: option ? option.value : "" } })}
            placeholder="Buscar..."
            classNamePrefix="rs"
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
        {error?.cliente_id && <span className={errCls}>{error.cliente_id[0]}</span>}
      </div>

      {/* Producto */}
      <div>
        <label className={labelCls}>Producto</label>
        <div className="mt-0.5">
          <Select
            name="producto_id"
            options={products.map(p => ({ value: p.id, label: p.name }))}
            value={products.find(p => p.id === formData.producto_id) ? { value: formData.producto_id, label: products.find(p => p.id === formData.producto_id).name } : null}
            onChange={(option) => handleChange({ target: { name: "producto_id", value: option ? option.value : "" } })}
            placeholder="Buscar..."
            isLoading={isLoading}
            isDisabled={isLoading || isEmpty}
            classNamePrefix="rs"
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
        {error?.producto_id && <span className={errCls}>{error.producto_id[0]}</span>}
      </div>

      {/* Orden de compra */}
      <div>
        <label className={labelCls}>Orden de compra</label>
        <div className="mt-0.5">
          <Select
            name="orden_compra_id"
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
        </div>
        {error?.orden_compra_id && <span className={errCls}>{error.orden_compra_id[0]}</span>}
      </div>

      {/* Tipo de falla */}
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

      {/* Cantidad afectada */}
      <div>
        <label className={labelCls}>Cantidad afectada</label>
        <input
          type="number"
          name="cantidad_afectada"
          value={formData.cantidad_afectada}
          onChange={handleChange}
          placeholder="0"
          min="1"
          className={inputCls}
        />
        {error?.cantidad_afectada && <span className={errCls}>{error.cantidad_afectada[0]}</span>}
      </div>

      {/* Fecha de reporte */}
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

      {/* Descripción inicial */}
      <div className="col-span-2">
        <label className={labelCls}>Descripción inicial</label>
        <textarea
          name="descripcion_inicial"
          value={formData.descripcion_inicial}
          onChange={handleChange}
          placeholder="Describa brevemente el problema..."
          rows={2}
          className="mt-0.5 block w-full border border-gray-300 rounded shadow-sm px-2 py-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none transition-colors"
        />
        {error?.descripcion_inicial && <span className={errCls}>{error.descripcion_inicial[0]}</span>}
      </div>

      {/* Error general */}
      {error?.general && (
        <div className="col-span-2 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-red-600 text-[11px] text-center font-medium">{error.general[0]}</p>
        </div>
      )}

      {/* Botón Submit */}
      <div className="col-span-2 mt-1 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="py-1.5 px-8 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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