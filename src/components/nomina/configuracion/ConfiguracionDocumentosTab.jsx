import PropTypes from "prop-types";
import { Upload } from "lucide-react";

export default function ConfiguracionDocumentosTab({
  firmaFile,
  setFirmaFile,
  firmaMutation,
  guardarFirma,
}) {
  return (
    <form
      onSubmit={guardarFirma}
      className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Cambiar firma de Talento Humano
          </h2>
          <p className="text-sm text-gray-500">
            Actualiza la firma autorizada que se aplica en documentos PDF.
          </p>
        </div>

        <button
          type="submit"
          disabled={!firmaFile || firmaMutation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {firmaMutation.isPending ? "Guardando..." : "Guardar firma"}
        </button>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Seleccionar archivo
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => setFirmaFile(event.target.files?.[0] ?? null)}
            className="mt-1 block h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </label>

        {firmaFile && (
          <p className="text-xs font-medium text-gray-500">{firmaFile.name}</p>
        )}
      </div>
    </form>
  );
}

ConfiguracionDocumentosTab.propTypes = {
  firmaFile: PropTypes.object,
  setFirmaFile: PropTypes.func.isRequired,
  firmaMutation: PropTypes.shape({
    isPending: PropTypes.bool,
  }).isRequired,
  guardarFirma: PropTypes.func.isRequired,
};
