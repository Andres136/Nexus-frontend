import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileSignature, Loader2, Plus, Send, Trash2, Users } from "lucide-react";
import { capacitacionActaService } from "../../services/capacitacionActaService";
import { showToast } from "../../helpers/utils/showToast";

const emptyCompromiso = { descripcion: "", responsable: "", fecha: "" };

export default function PageCapacitacionActa() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    numero: "", titulo: "", objetivo: "", desarrollo: "", conclusiones: "", compromisos: [emptyCompromiso],
  });
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [empresaFirmas, setEmpresaFirmas] = useState("");
  const [downloadingEmpresa, setDownloadingEmpresa] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await capacitacionActaService.get(uuid);
      setData(response.data);
      const acta = response.data.acta;
      if (acta) {
        setForm({
          numero: acta.numero ?? "",
          titulo: acta.titulo ?? "",
          objetivo: acta.objetivo ?? "",
          desarrollo: acta.desarrollo ?? "",
          conclusiones: acta.conclusiones ?? "",
          compromisos: acta.compromisos?.length ? acta.compromisos : [emptyCompromiso],
        });
      } else {
        setForm((current) => ({
          ...current,
          numero: "",
          titulo: `Acta de capacitación — ${response.data.capacitacion.titulo}`,
        }));
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo cargar el acta.");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    capacitacionActaService.users({ search: search || undefined })
      .then((response) => setUsuarios(response.data ?? []))
      .catch(() => setUsuarios([]));
  }, [search]);

  const firmados = data?.acta?.envios?.filter((envio) => envio.estado === "firmada") ?? [];
  const pendientes = data?.acta?.envios?.filter((envio) => envio.estado === "pendiente") ?? [];
  const enviadosIds = useMemo(() => new Set(data?.acta?.envios?.map((envio) => envio.user_id) ?? []), [data]);
  const empresasFirmas = useMemo(() => Array.from(new Map(
    (data?.acta?.envios ?? [])
      .filter((envio) => envio.empresa_id)
      .map((envio) => [String(envio.empresa_id), envio.empresa_nombre || envio.empresa?.nombre])
  )), [data]);
  const enviosFiltrados = (data?.acta?.envios ?? []).filter(
    (envio) => !empresaFirmas || String(envio.empresa_id) === empresaFirmas
  );

  const updateCompromiso = (index, key, value) => setForm((current) => ({
    ...current,
    compromisos: current.compromisos.map((item, i) => i === index ? { ...item, [key]: value } : item),
  }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await capacitacionActaService.save(uuid, {
        ...form,
        compromisos: form.compromisos.filter((item) => item.descripcion.trim()),
      });
      showToast("success", "Acta guardada correctamente.");
      await load();
    } catch (error) {
      showToast("error", error.response?.data?.message || Object.values(error.response?.data?.errors ?? {})[0]?.[0] || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    if (!data?.acta) return showToast("warning", "Guarda el acta antes de enviarla.");
    if (!selectedUsers.length) return showToast("warning", "Selecciona al menos un usuario.");
    setSending(true);
    try {
      const response = await capacitacionActaService.send(uuid, selectedUsers);
      showToast("success", `Acta enviada a ${response.data.enviados?.length ?? 0} usuarios.`);
      setSelectedUsers([]);
      await load();
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo enviar el acta.");
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async (empresaId, empresaNombre) => {
    setDownloadingEmpresa(String(empresaId));
    try {
      const response = await capacitacionActaService.pdf(uuid, empresaId);
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `acta_${data.acta.numero}_${String(empresaNombre).replaceAll(" ", "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("error", "No se pudo descargar el PDF del acta.");
    } finally {
      setDownloadingEmpresa("");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <button onClick={() => navigate("/auth/capacitaciones")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Capacitaciones
            </button>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-950">
              <FileSignature className="h-6 w-6 text-blue-600" /> Acta de capacitación
            </h1>
            <p className="mt-1 text-sm text-slate-500">{data?.capacitacion?.titulo}</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">{pendientes.length} pendientes</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">{firmados.length} firmadas</span>
          </div>
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <form onSubmit={save} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {!data?.puede_gestionar && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Esta acta es de solo lectura. Únicamente {data?.acta?.elaborador?.name ?? "el usuario que la creó"} puede editarla y enviarla.
              </div>
            )}
            <fieldset disabled={!data?.puede_gestionar} className="space-y-4 disabled:opacity-75">
            <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
              <label className="text-sm font-medium text-slate-700">Número de acta
                <input
                  readOnly
                  value={form.numero}
                  placeholder="Se asignará automáticamente"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">Título
                <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Objetivo
              <textarea rows={3} value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium text-slate-700">Desarrollo de la capacitación
              <textarea required rows={9} value={form.desarrollo} onChange={(e) => setForm({ ...form, desarrollo: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Compromisos</h2>
                <button type="button" onClick={() => setForm({ ...form, compromisos: [...form.compromisos, { ...emptyCompromiso }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>
              <div className="space-y-2">
                {form.compromisos.map((item, index) => (
                  <div key={index} className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_220px_150px_auto]">
                    <input placeholder="Descripción del compromiso" value={item.descripcion} onChange={(e) => updateCompromiso(index, "descripcion", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    <input placeholder="Responsable" value={item.responsable} onChange={(e) => updateCompromiso(index, "responsable", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    <input type="date" value={item.fecha} onChange={(e) => updateCompromiso(index, "fecha", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    <button type="button" onClick={() => setForm({ ...form, compromisos: form.compromisos.filter((_, i) => i !== index) })} className="p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </section>
            <label className="block text-sm font-medium text-slate-700">Conclusiones
              <textarea rows={4} value={form.conclusiones} onChange={(e) => setForm({ ...form, conclusiones: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <div className="flex justify-end border-t border-slate-200 pt-4">
              <button disabled={saving || !data?.puede_gestionar} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar acta
              </button>
            </div>
            </fieldset>
          </form>

          <aside className="space-y-4 xl:sticky xl:top-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-blue-600" /> Enviar para firma</h2>
              <input disabled={!data?.puede_gestionar} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario..." className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100" />
              <div className="mt-2 max-h-64 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200">
                {usuarios.map((usuario) => (
                  <label key={usuario.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                    <input type="checkbox" checked={selectedUsers.includes(usuario.id)} disabled={!data?.puede_gestionar || enviadosIds.has(usuario.id)} onChange={() => setSelectedUsers((ids) => ids.includes(usuario.id) ? ids.filter((id) => id !== usuario.id) : [...ids, usuario.id])} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{[usuario.name, usuario.apellidos].filter(Boolean).join(" ")}</span>
                      <span className="block truncate text-xs text-slate-500">{usuario.email}</span>
                      <span className="block truncate text-[11px] font-medium text-blue-600">
                        {usuario.contratacion_activa_nomina?.empresa?.nombre ?? "Sin empresa activa"}
                        {usuario.contratacion_activa_nomina?.numero_documento
                          ? ` · CC ${usuario.contratacion_activa_nomina.numero_documento}`
                          : ""}
                      </span>
                    </span>
                    {enviadosIds.has(usuario.id) && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </label>
                ))}
              </div>
              <button type="button" onClick={send} disabled={!data?.puede_gestionar || sending || !data?.acta || !selectedUsers.length} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar acta
              </button>
            </section>

            {data?.acta?.envios?.length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                  <h2 className="text-sm font-semibold">Control de firmas</h2>
                  <select value={empresaFirmas} onChange={(event) => setEmpresaFirmas(event.target.value)} className="max-w-44 rounded-md border border-slate-300 px-2 py-1 text-xs">
                    <option value="">Todas las empresas</option>
                    {empresasFirmas.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                  </select>
                </div>
                <div className="max-h-72 divide-y divide-slate-100 overflow-auto">
                  {enviosFiltrados.map((envio) => (
                    <div key={envio.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{envio.usuario?.name}</p>
                        <p className="text-xs font-medium text-blue-600">{envio.empresa_nombre || envio.empresa?.nombre || "Sin empresa"}</p>
                        <p className="text-xs text-slate-500">CC {envio.numero_documento || "sin registrar"}</p>
                        <p className="text-xs text-slate-500">{envio.firmada_at ? new Date(envio.firmada_at).toLocaleString("es-CO") : "Pendiente"}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${envio.estado === "firmada" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{envio.estado}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.acta && empresasFirmas.length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Download className="h-4 w-4 text-blue-600" /> Descargar PDF por empresa
                </h2>
                <div className="mt-3 space-y-2">
                  {empresasFirmas.map(([empresaId, empresaNombre]) => (
                    <button
                      key={empresaId}
                      type="button"
                      onClick={() => downloadPdf(empresaId, empresaNombre)}
                      disabled={downloadingEmpresa === empresaId}
                      className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <span>{empresaNombre}</span>
                      {downloadingEmpresa === empresaId
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
