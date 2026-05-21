import { useState } from "react";
import { FileBadge, Send, CheckCircle, ChevronDown } from "lucide-react";

const TIPOS = [
  "Certificado laboral con salario",
  "Certificado laboral sin salario",
  "Certificado de prestaciones",
  "Constancia de trabajo",
];

export default function PageCertificadoLaboral() {
  const [tipo, setTipo]       = useState(TIPOS[0]);
  const [destino, setDestino] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSolicitar = async () => {
    if (!destino.trim()) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 1200));
    setEnviando(false);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="p-6 max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center gap-4">
          <CheckCircle className="h-14 w-14 text-green-500" strokeWidth={1.5} />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Solicitud enviada</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tu certificado será generado y enviado a <span className="font-medium text-gray-700">{destino}</span>.
            </p>
          </div>
          <button
            onClick={() => { setEnviado(false); setDestino(""); }}
            className="mt-2 px-5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Certificado Laboral</h1>
        <p className="text-sm text-gray-500 mt-0.5">Solicita tu certificado laboral. Lo recibirás por correo electrónico.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de certificado</label>
          <div className="relative">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full h-10 pl-3 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo o entidad destino
          </label>
          <input
            type="text"
            placeholder="ej: banco@ejemplo.com o Banco Colombia"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-1">Indica a quién va dirigido el certificado.</p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 flex items-start gap-3">
          <FileBadge className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-gray-700">{tipo}</p>
            {destino && (
              <p className="text-xs text-gray-500 mt-0.5">Dirigido a: {destino}</p>
            )}
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={handleSolicitar}
          disabled={!destino.trim() || enviando}
          className="flex items-center justify-center gap-2 w-full h-10 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {enviando ? (
            <span className="animate-pulse">Enviando solicitud...</span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Solicitar certificado
            </>
          )}
        </button>
      </div>
    </div>
  );
}
