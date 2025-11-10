import { useState } from 'react';
import { crearQrApi } from '../../services/api';
import { Download, QrCode, Link, AlertCircle, CheckCircle, Loader2, FileImage, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import PlantillaEditor from '../../views/calidad/PlantillaEditor';

export default function CreateQr() {
  const [formData, setFormData] = useState({ url: '' });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      setError('La URL es requerida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await crearQrApi.create(formData);

      setQrData(response.data);
      toast.success('QR generado correctamente');
    } catch (error) {
      console.error('Error al crear el QR:', error);
      setError('Error al generar el QR. Intenta nuevamente.');
      toast.error('Error al generar el QR');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ url: '' });
    setQrData(null);
    setError('');
  };

  // ✅ Prioriza qr_base64 para evitar CORS
  const getQrUrl = () =>
    qrData?.qr_base64 ||
    qrData?.data?.qr_base64 ||
    qrData?.public_url ||
    qrData?.data?.public_url;

  // ✅ Descargar como PNG (sin CORS)
  const downloadQRAsPNG = async (quality = 1, size = 1024) => {
    const qrUrl = getQrUrl();
    if (!qrUrl) {
      toast.error('No se encontró la imagen del QR');
      return;
    }

    setDownloadLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = qrUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;

        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);

        const pngUrl = canvas.toDataURL('image/png', quality);

        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qr-code-${qrData?.id || qrData?.data?.id || Date.now()}-${size}px.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadLoading(false);
        toast.success('QR descargado exitosamente en PNG');
      };

      img.onerror = () => {
        setDownloadLoading(false);
        toast.error('Error al cargar la imagen del QR');
      };
    } catch (error) {
      console.error('Error al descargar PNG:', error);
      toast.error('No se pudo convertir el QR a PNG');
      setDownloadLoading(false);
    }
  };

  // ✅ Descargar como SVG (funciona con base64 o URL pública)
  const downloadQRAsSVG = async () => {
    const qrUrl = getQrUrl();
    if (!qrUrl) {
      toast.error('No se encontró la imagen del QR');
      return;
    }

    try {
      // Si es base64, descarga directamente sin fetch
      if (qrUrl.startsWith('data:image/svg+xml;base64,')) {
        const base64Data = qrUrl.replace('data:image/svg+xml;base64,', '');
        const blob = new Blob([atob(base64Data)], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${qrData?.id || qrData?.data?.id || Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR SVG descargado correctamente');
        return;
      }

      // Si es una URL pública
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error('Error al obtener el QR');
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${qrData?.id || qrData?.data?.id || Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('QR SVG descargado correctamente');
    } catch (error) {
      console.error('Error al descargar SVG:', error);
      toast.error('Error al descargar el QR SVG');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <QrCode className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Generador de Códigos QR
          </h1>
          <p className="text-gray-600">
            Convierte cualquier URL en un código QR descargable
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                URL a convertir
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {error && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !formData.url}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Generar QR
                  </>
                )}
              </button>
              {qrData && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nuevo
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Resultado del QR */}
        {qrData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                ¡QR Generado Exitosamente!
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Vista previa */}
              <div className="text-center">
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <img
                    src={getQrUrl()}
                    alt="Código QR generado"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxWidth: '200px' }}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => downloadQRAsPNG(1, 1024)}
                    disabled={downloadLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all font-semibold disabled:opacity-50"
                  >
                    {downloadLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileImage className="w-4 h-4" />
                    )}
                    Descargar PNG (Alta calidad)
                  </button>

                  <button
                    onClick={downloadQRAsSVG}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-all font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Descargar SVG (Vectorial)
                  </button>
                </div>
              </div>


            </div>
          </div>
        )}
      </div>
      <PlantillaEditor />
    </div>
  );
}
