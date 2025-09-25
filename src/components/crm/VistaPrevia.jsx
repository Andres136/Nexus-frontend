import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordenesCompraProveedoresApi, } from "../../services/api";
import { toast } from "react-toastify";

export default function VistaPrevia() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        setLoading(true);
        const res = await ordenesCompraProveedoresApi.getPdf(id);
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Error cargando PDF", err);
        toast.error("No se pudo cargar el PDF");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPDF();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", `orden_compra_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Vista previa Orden de Compra #{id}
        </h2>
        <Link
          to="/auth/crm/proveedores-ordenes-compra"
          className="text-blue-600 hover:underline"
        >
          ← Volver
        </Link>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Descargar
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Imprimir
        </button>
      <button
  onClick={async () => {
    try {
      await ordenesCompraProveedoresApi(id);
      toast.success("📧 Correo enviado correctamente al proveedor");
    } catch (err) {
      toast.error("❌ Error al enviar el correo");
      console.error(err);
    }
  }}
  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
>
  📧 Enviar Email
</button>

        <button className="bg-gray-500 text-white px-4 py-2 rounded">
          <Link to={`/auth/crm/oc-provedor-update/${id}`}>
            Editar
          </Link>
        </button>
      </div>

      {/* Visor PDF nativo */}
      <div className="border rounded bg-gray-50 p-4 text-center">
        {loading && <p>Cargando PDF...</p>}
        {!loading && pdfUrl && (
          <iframe
            src={pdfUrl}
            title={`Orden de Compra ${id}`}
            width="100%"
            height="700px"
            className="border rounded"
          />
        )}
      </div>
    </div>
  );
}
