import { useParams } from "react-router-dom";
import { useRegisterGestionCarteraFactura } from "../../hooks/crm/useRegisterGestionCarteraFactura";

export default function GestionarFacturaCartera() {
  const { id } = useParams();

  const {
    formData,
    handleChange,
    handleFiles,
    handleSubmit,
    loading,
    errors
  } = useRegisterGestionCarteraFactura(id);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Factura</h2>
          <p className="text-gray-500">ID de Referencia: <span className="font-mono text-blue-600">#{id}</span></p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TIPO DE GESTIÓN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Gestión</label>
            <select 
              name="tipo" 
              onChange={handleChange} 
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Seleccione tipo</option>
              <option value="LLAMADA">📞 Llamada</option>
              <option value="EMAIL">📧 Email</option>
              <option value="VISITA">🤝 Visita</option>
              <option value="PROMESA_PAGO">💰 Promesa de pago</option>
              <option value="WHATSAPP">💬 WhatsApp</option>
            </select>
            {errors.tipo && <p className="mt-1 text-red-500 text-xs italic">{errors.tipo[0]}</p>}
          </div>

          {/* OBSERVACIÓN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              name="observacion"
              placeholder="Detalles de la gestión..."
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px] outline-none"
            />
            {errors.observacion && <p className="mt-1 text-red-500 text-xs italic">{errors.observacion[0]}</p>}
          </div>

          {/* FECHA DE COMPROMISO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Compromiso</label>
            <input
              type="date"
              name="fecha_compromiso"
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.fecha_compromiso && <p className="mt-1 text-red-500 text-xs italic">{errors.fecha_compromiso[0]}</p>}
          </div>

          {/* SOPORTES (DROPZONE SIMULADO) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Adjuntar Soportes</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-blue-50 transition-colors group text-center cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFiles}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 font-medium">Haz clic para subir</span> o arrastra tus archivos aquí
                </p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG hasta 10MB</p>
              </div>
            </div>
            {errors.soportes && <p className="mt-2 text-red-500 text-xs italic">{errors.soportes[0]}</p>}
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${
              loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : "Guardar Gestión"}
          </button>
        </form>
      </div>
    </div>
  );
}