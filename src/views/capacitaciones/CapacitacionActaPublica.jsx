import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Eraser, FileSignature, Loader2, PenLine } from "lucide-react";
import { useParams } from "react-router-dom";
import { capacitacionActaService } from "../../services/capacitacionActaService";

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const image = canvas.toDataURL();
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 180 * window.devicePixelRatio;
      const context = canvas.getContext("2d");
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      context.lineWidth = 2;
      context.lineCap = "round";
      context.strokeStyle = "#0f172a";
      if (image && image !== "data:,") {
        const img = new Image();
        img.onload = () => context.drawImage(img, 0, 0, rect.width, 180);
        img.src = image;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const source = event.touches?.[0] ?? event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };
  const start = (event) => {
    event.preventDefault();
    drawing.current = true;
    const { x, y } = point(event);
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(x, y);
  };
  const draw = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const { x, y } = point(event);
    const context = canvasRef.current.getContext("2d");
    context.lineTo(x, y);
    context.stroke();
  };
  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={stop}
        className="h-[180px] w-full touch-none rounded-md border border-dashed border-slate-400 bg-white"
      />
      <button type="button" onClick={clear} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <Eraser className="h-3.5 w-3.5" /> Limpiar firma
      </button>
    </div>
  );
}

SignaturePad.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default function CapacitacionActaPublica() {
  const { token } = useParams();
  const [envio, setEnvio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [firmaNombre, setFirmaNombre] = useState("");
  const [firmaImagen, setFirmaImagen] = useState("");
  const [acepta, setAcepta] = useState(false);

  useEffect(() => {
    capacitacionActaService.publicGet(token)
      .then((response) => {
        setEnvio(response.data);
        setFirmaNombre(response.data.usuario?.name ?? "");
      })
      .catch(() => setError("El enlace del acta no existe o ya no está disponible."))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    if (!firmaImagen) return setError("Dibuja tu firma antes de continuar.");
    setSaving(true);
    setError("");
    try {
      const response = await capacitacionActaService.sign(token, {
        firma_nombre: firmaNombre,
        firma_imagen: firmaImagen,
        acepta,
      });
      setEnvio(response.data.envio);
    } catch (requestError) {
      setError(requestError.response?.data?.message || Object.values(requestError.response?.data?.errors ?? {})[0]?.[0] || "No se pudo registrar la firma.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!envio) return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center text-slate-600">{error}</div>;

  const { acta } = envio;
  const firmada = envio.estado === "firmada";

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6">
      <main className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-900 px-6 py-6 text-white sm:px-9">
          <div className="flex items-center gap-2 text-sm text-blue-200"><FileSignature className="h-5 w-5" /> Acta de capacitación</div>
          <h1 className="mt-2 text-2xl font-bold">{acta.titulo}</h1>
          <p className="mt-1 text-sm text-slate-300">Acta No. {acta.numero}</p>
        </header>
        <article className="space-y-6 px-6 py-7 sm:px-9">
          <section className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <p><strong>Capacitación:</strong> {acta.capacitacion?.titulo}</p>
            <p><strong>Fecha:</strong> {acta.capacitacion?.fecha_realizacion}</p>
            <p><strong>Modalidad:</strong> {acta.capacitacion?.modalidad}</p>
            <p><strong>Lugar:</strong> {acta.capacitacion?.lugar || "No especificado"}</p>
          </section>
          {acta.objetivo && <section><h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Objetivo</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{acta.objetivo}</p></section>}
          <section><h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Desarrollo</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{acta.desarrollo}</p></section>
          {acta.compromisos?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Compromisos</h2>
              <div className="mt-2 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Compromiso</th><th className="p-3 text-left">Responsable</th><th className="p-3 text-left">Fecha</th></tr></thead>
                  <tbody>{acta.compromisos.map((item, index) => <tr key={index} className="border-t border-slate-100"><td className="p-3">{item.descripcion}</td><td className="p-3">{item.responsable || "—"}</td><td className="p-3">{item.fecha || "—"}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          )}
          {acta.conclusiones && <section><h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Conclusiones</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{acta.conclusiones}</p></section>}

          {firmada ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-2 font-semibold text-emerald-900">Acta firmada correctamente</h2>
              <p className="mt-1 text-sm text-emerald-700">{envio.firma_nombre} · {new Date(envio.firmada_at).toLocaleString("es-CO")}</p>
              {envio.firma_imagen && <img src={envio.firma_imagen} alt="Firma registrada" className="mx-auto mt-3 max-h-28 max-w-xs" />}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-blue-950"><PenLine className="h-5 w-5" /> Firma del asistente</h2>
              <p className="text-sm text-blue-800">Destinatario: <strong>{envio.usuario?.name}</strong> ({envio.usuario?.email})</p>
              <label className="block text-sm font-medium text-slate-700">Nombre completo
                <input required value={firmaNombre} onChange={(e) => setFirmaNombre(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <SignaturePad onChange={setFirmaImagen} />
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" required checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1" />
                Declaro que leí el acta, participé o fui informado de la capacitación y acepto los compromisos aquí registrados.
              </label>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button disabled={saving || !acepta} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Firmar acta
              </button>
            </form>
          )}
        </article>
      </main>
    </div>
  );
}
