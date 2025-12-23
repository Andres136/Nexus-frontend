export default function ClienteDocumentoPreview({ ordenId }) {
  if (!ordenId) return null;

  const url = `${import.meta.env.VITE_API_URL}/api/orden-compras/${ordenId}/preview-documento`;

  return (
    <div className="bg-white border rounded-md shadow-sm mt-4">
      <div className="px-3 py-2 border-b bg-gray-100 text-sm font-semibold text-gray-700">
        Documento del cliente (solo lectura)
      </div>

      <iframe
        src={url}
        title="Documento del cliente"
        className="w-full h-[550px]"
      />
    </div>
  );
}
