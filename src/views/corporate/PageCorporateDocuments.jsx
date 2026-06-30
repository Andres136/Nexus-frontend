import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { corporateDocumentsService } from "../../services/corporateDocumentsService";

const emptyForm = {
  id: null,
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  long_description: "",
  icon: "file-text",
  pages: "",
  last_update: "",
  category: "",
  theme: "institucional",
  sort_order: 0,
  is_active: true,
  features: [""],
  benefits: [""],
  file: null,
  preview_url: "",
  download_url: "",
};

const themes = [
  { value: "institucional", label: "Institucional" },
  { value: "gestion", label: "Gestion" },
  { value: "comercial", label: "Comercial" },
  { value: "hseq", label: "HSEQ" },
  { value: "talento", label: "Talento" },
];

const icons = [
  { value: "file-text", label: "Documento" },
  { value: "shield", label: "Escudo" },
  { value: "book", label: "Libro" },
  { value: "handshake", label: "Acuerdo" },
  { value: "badge-check", label: "Certificado" },
];

const apiUrl = import.meta.env.VITE_API_URL || "";

function normalizeDocument(document) {
  return {
    ...emptyForm,
    ...document,
    pages: document.pages ?? "",
    sort_order: document.sort_order ?? 0,
    is_active: Boolean(document.is_active),
    features: document.features?.length ? document.features : [""],
    benefits: document.benefits?.length ? document.benefits : [""],
    file: null,
  };
}

function appendListToFormData(formData, key, list) {
  const cleanList = list.map((item) => item.trim()).filter(Boolean);
  formData.append(key, JSON.stringify(cleanList));
}

export default function PageCorporateDocuments({ embedded = false }) {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const localPreviewUrl = useMemo(() => {
    if (!form.file) return "";
    return URL.createObjectURL(form.file);
  }, [form.file]);

  const previewUrl = localPreviewUrl || form.preview_url || form.download_url;

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments(params = {}) {
    setLoading(true);
    try {
      const { data } = await corporateDocumentsService.listAdmin(params);
      setDocuments(data.data ?? []);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message ?? "No se pudieron cargar los documentos.", "error");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateList(field, index, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addListItem(field) {
    setForm((current) => ({ ...current, [field]: [...current[field], ""] }));
  }

  function removeListItem(field, index) {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index).length
        ? current[field].filter((_, itemIndex) => itemIndex !== index)
        : [""],
    }));
  }

  function selectDocument(document) {
    setForm(normalizeDocument(document));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function buildPayload() {
    const formData = new FormData();
    formData.append("slug", form.slug);
    formData.append("title", form.title);
    formData.append("subtitle", form.subtitle);
    formData.append("description", form.description);
    formData.append("long_description", form.long_description || "");
    formData.append("icon", form.icon);
    formData.append("pages", form.pages || "");
    formData.append("last_update", form.last_update || "");
    formData.append("category", form.category);
    formData.append("theme", form.theme);
    formData.append("sort_order", String(form.sort_order || 0));
    formData.append("is_active", form.is_active ? "1" : "0");
    appendListToFormData(formData, "features", form.features);
    appendListToFormData(formData, "benefits", form.benefits);
    if (form.file) formData.append("file", form.file);
    return formData;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      const response = form.id
        ? await corporateDocumentsService.update(form.id, payload)
        : await corporateDocumentsService.create(payload);

      const saved = response.data.data;
      await loadDocuments(search ? { search } : {});
      setForm(normalizeDocument(saved));
      Swal.fire("Listo", response.data.message, "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message ?? "No se pudo guardar el documento.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(document) {
    const result = await Swal.fire({
      title: "Inactivar documento",
      text: `El documento ${document.title} dejara de aparecer en la vista publica.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Inactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await corporateDocumentsService.deactivate(document.id);
      await loadDocuments(search ? { search } : {});
      if (form.id === document.id) resetForm();
      Swal.fire("Listo", "Documento inactivado correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message ?? "No se pudo inactivar el documento.", "error");
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadDocuments(search ? { search } : {});
  }

  return (
    <main className={`${embedded ? "bg-white p-4" : "min-h-screen bg-slate-100 px-4 py-6"} text-slate-900`}>
      <div className={`${embedded ? "space-y-4" : "mx-auto max-w-7xl space-y-4"}`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          {!embedded && (
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">Documentos corporativos</h1>
              <p className="text-sm text-slate-500">Registro, publicacion y vista previa de recursos PDF.</p>
            </div>
          )}
          {embedded && (
            <div>
              <h3 className="text-lg font-semibold tracking-normal text-slate-900">Centro de recursos</h3>
              <p className="text-sm text-slate-500">Gestiona documentos PDF visibles para clientes y usuarios.</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={16} />
              Nuevo
            </button>
            <button
              type="button"
              onClick={() => loadDocuments(search ? { search } : {})}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[390px_minmax(0,1fr)]">
          <section className="rounded-lg border border-slate-200 bg-white">
            <form onSubmit={handleSearch} className="flex gap-2 border-b border-slate-200 p-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                  placeholder="Buscar"
                />
              </div>
              <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Buscar
              </button>
            </form>

            <div className="max-h-[720px] overflow-y-auto p-2">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Cargando documentos...</div>
              ) : documents.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">No hay documentos registrados.</div>
              ) : (
                documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => selectDocument(document)}
                    className={`mb-2 w-full rounded-md border p-3 text-left transition ${
                      form.id === document.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{document.title}</p>
                        <p className="truncate text-xs text-slate-500">{document.category} / {document.theme}</p>
                      </div>
                      {document.is_active ? (
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                      ) : (
                        <XCircle className="mt-0.5 shrink-0 text-slate-400" size={16} />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{document.file_size || "PDF"}</span>
                      <span>{document.downloads_count ?? 0} descargas</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
            <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Titulo
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Slug
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="se genera si queda vacio" />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
                  Subtitulo
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} required />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
                  Descripcion corta
                  <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" value={form.description} onChange={(e) => updateField("description", e.target.value)} required />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
                  Descripcion extendida
                  <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" value={form.long_description} onChange={(e) => updateField("long_description", e.target.value)} />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Categoria
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.category} onChange={(e) => updateField("category", e.target.value)} required />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Tema
                  <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.theme} onChange={(e) => updateField("theme", e.target.value)}>
                    {themes.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Icono
                  <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.icon} onChange={(e) => updateField("icon", e.target.value)}>
                    {icons.map((icon) => <option key={icon.value} value={icon.value}>{icon.label}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Paginas
                  <input type="number" min="1" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.pages} onChange={(e) => updateField("pages", e.target.value)} />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Fecha actualizacion
                  <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.last_update || ""} onChange={(e) => updateField("last_update", e.target.value)} />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Orden
                  <input type="number" min="0" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.sort_order} onChange={(e) => updateField("sort_order", e.target.value)} />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ListEditor title="Caracteristicas" items={form.features} field="features" onChange={updateList} onAdd={addListItem} onRemove={removeListItem} />
                <ListEditor title="Beneficios" items={form.benefits} field="benefits" onChange={updateList} onAdd={addListItem} onRemove={removeListItem} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  Archivo PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2"
                    onChange={(event) => updateField("file", event.target.files?.[0] ?? null)}
                    required={!form.id}
                  />
                </label>
                <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => updateField("is_active", e.target.checked)} />
                  Publicado
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(form)}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Inactivar
                  </button>
                )}
              </div>
            </form>

            <aside className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Vista previa</h2>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                    Abrir <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{form.title || "Titulo del documento"}</p>
                    <p className="text-sm text-slate-500">{form.subtitle || "Subtitulo"}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{form.description || "Descripcion corta del documento."}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>Categoria: {form.category || "-"}</span>
                  <span>Tema: {form.theme || "-"}</span>
                  <span>Paginas: {form.pages || "-"}</span>
                  <span>Descargas: {form.downloads_count ?? 0}</span>
                </div>
              </div>

              <div className="mt-3 h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {previewUrl ? (
                  <iframe title="Vista previa PDF" src={previewUrl} className="h-full w-full" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Upload size={32} />
                    <p className="text-sm">Selecciona o carga un PDF.</p>
                  </div>
                )}
              </div>

    
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

function ListEditor({ title, field, items, onChange, onAdd, onRemove }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button type="button" onClick={() => onAdd(field)} className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50">
          <Plus size={15} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${field}-${index}`} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => onChange(field, index, event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder={`${title} ${index + 1}`}
            />
            <button type="button" onClick={() => onRemove(field, index)} className="rounded-md border border-slate-300 p-2 text-slate-500 hover:bg-slate-50">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
