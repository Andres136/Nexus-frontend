import { useOrdenesOs } from "../../../hooks/crm/useOrdenesOs";
import { useEntregasProveedores } from "../../../hooks/useEntregasProveedores";
import { useEmpresas } from "../../../hooks/useEmpresas";
import Select from "react-select";
import DetallesOs from "./DetallesOs";

export default function RegistrarOs() {
  const {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    obtenerProductosPorId,
    productosbyId,
      pdfUrl,    
     
  } = useOrdenesOs();
  const { proveedoresAll } = useEntregasProveedores();
  const { empresas } = useEmpresas();

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      minHeight: "38px",
      "&:hover": { borderColor: "#9ca3af" },
    }),
  };

  return (
    <div className="w-full px-4 py-4">
      <form onSubmit={handleSubmit}>
        {/* Encabezado compacto */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <h1 className="text-lg font-semibold text-gray-800 mb-3">
            Registrar Orden de Servicio
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Empresa */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Empresa
              </label>
              <Select
                placeholder="Seleccionar..."
                styles={selectStyles}
                options={empresas.map((empresa) => ({
                  value: empresa.id,
                  label: empresa.nombre,
                }))}
                onChange={(selectedOption) =>
                  setFormData({
                    ...formData,
                    empresa_id: selectedOption?.value ?? null,
                  })
                }
                isClearable
              />
              {error?.empresa && (
                <span className="text-red-500 text-xs">{error.empresa[0]}</span>
              )}
            </div>

            {/* Proveedor */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Proveedor
              </label>
              <Select
                placeholder="Seleccionar..."
                styles={selectStyles}
                options={proveedoresAll.map((proveedor) => ({
                  value: proveedor.id,
                  label: proveedor.nombre,
                }))}
                onChange={(selectedOption) =>
                  setFormData({
                    ...formData,
                    proveedor_id: selectedOption?.value ?? null,
                  })
                }
                isClearable
              />
              {error?.proveedor_id && (
                <span className="text-red-500 text-xs">{error.proveedor_id[0]}</span>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Fecha
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-2 py-[7px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
              {error?.fecha && (
                <span className="text-red-500 text-xs">{error.fecha[0]}</span>
              )}
            </div>

         

            {/* Observación */}
            <div className="col-span-2 md:col-span-4 lg:col-span-6">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Observación
              </label>
              <input
                type="text"
                placeholder="Ingrese observaciones..."
                className="w-full border border-gray-300 rounded px-2 py-[7px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
              {error?.observaciones && (
                <span className="text-red-500 text-xs">{error.observaciones[0]}</span>
              )}
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <DetallesOs 
          obtenerProductosPorId={obtenerProductosPorId}
           productosbyId={productosbyId}
            formData={formData} 
            setFormData={setFormData}
       
             />
        </div>

        {/* Botón Registrar */}
<div className="flex justify-end gap-3">

  {/* Botón Registrar */}
  <button
    type="submit"
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-8 py-2 rounded transition-colors duration-200 flex items-center gap-2"
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    )}
    {loading ? "Registrando..." : "Registrar Orden"}
  </button>

  {/* Botón Descargar PDF */}
  {pdfUrl && (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded transition-colors duration-200 flex items-center gap-2"
    >
       Descargar PDF
    </a>
  )}

</div>
      </form>
    </div>
  );
}