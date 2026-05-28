import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileDown, Lock } from "lucide-react";
import { nominaService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatCOP(value) {
  return "$ " + Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function estadoClass(estado) {
  const map = {
    borrador: "bg-gray-100 text-gray-700",
    aprobado: "bg-green-100 text-green-700",
    cerrado: "bg-indigo-100 text-indigo-700",
    exportado: "bg-blue-100 text-blue-700",
  };
  return map[estado] ?? "bg-gray-100 text-gray-700";
}

function descargarCsv(lineas = [], periodoInicio, periodoFin) {
  const header = ["cuenta", "concepto", "tercero", "centro_costo", "debito", "credito"];
  const rows = lineas.map((linea) => header.map((key) => `"${String(linea[key] ?? "").replaceAll('"', '""')}"`).join(";"));
  const blob = new Blob([[header.join(";"), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `puc_nomina_${periodoInicio}_${periodoFin}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function descargarPdf(blobData, periodoInicio, periodoFin) {
  const url = URL.createObjectURL(new Blob([blobData], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `puc_nomina_${periodoInicio}_${periodoFin}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PageControlContableNomina() {
  const now = new Date();
  const queryClient = useQueryClient();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [quincena, setQuincena] = useState("1");
  const [exportData, setExportData] = useState(null);

  const periodoInicio = useMemo(() => {
    const m = String(mes + 1).padStart(2, "0");
    return quincena === "2" ? `${anio}-${m}-16` : `${anio}-${m}-01`;
  }, [mes, anio, quincena]);

  const periodoFin = useMemo(() => {
    const m = String(mes + 1).padStart(2, "0");
    if (quincena === "1") return `${anio}-${m}-15`;
    return `${anio}-${m}-${new Date(anio, mes + 1, 0).getDate()}`;
  }, [mes, anio, quincena]);

  const params = useMemo(() => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin, per_page: 100 }), [periodoInicio, periodoFin]);
  const { data, isLoading } = useQuery({
    queryKey: ["nominasControlContable", params],
    queryFn: async () => (await nominaService.getNominas(params)).data.data,
  });

  const nominas = data?.data ?? [];
  const totals = nominas.reduce((acc, n) => {
    acc.devengado += Number(n.total_devengado || 0);
    acc.deducciones += Number(n.total_deducciones || 0);
    acc.neto += Number(n.salario_neto || 0);
    return acc;
  }, { devengado: 0, deducciones: 0, neto: 0 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["nominasControlContable"] });
    queryClient.invalidateQueries({ queryKey: ["nominas"] });
    queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
  };

  const approveMutation = useMutation({
    mutationFn: (uuid) => nominaService.aprobarContabilidad(uuid),
    onSuccess: () => {
      showToast("success", "Nómina aprobada");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo aprobar"),
  });

  const closeMutation = useMutation({
    mutationFn: () => nominaService.cerrarPeriodo({ periodo_inicio: periodoInicio, periodo_fin: periodoFin }),
    onSuccess: () => {
      showToast("success", "Período cerrado");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo cerrar"),
  });

  const exportMutation = useMutation({
    mutationFn: async () => (await nominaService.exportarPuc({ periodo_inicio: periodoInicio, periodo_fin: periodoFin })).data.data,
    onSuccess: (data) => {
      setExportData(data);
      descargarCsv(data.lineas, periodoInicio, periodoFin);
      showToast("success", "PUC exportado");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo exportar"),
  });

  const exportPdfMutation = useMutation({
    mutationFn: async () => (await nominaService.exportarPucPdf({ periodo_inicio: periodoInicio, periodo_fin: periodoFin })).data,
    onSuccess: (data) => {
      descargarPdf(data, periodoInicio, periodoFin);
      showToast("success", "PUC exportado en PDF");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo exportar el PDF"),
  });

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Control Contable de Nómina</h1>
          <p className="text-sm text-gray-500">Aprueba, cierra y exporta el período a PUC.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <input type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} className="h-9 w-24 rounded-lg border border-gray-200 px-3 text-sm" />
          <select value={quincena} onChange={(e) => setQuincena(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="1">Primera quincena</option>
            <option value="2">Segunda quincena</option>
          </select>
          <button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending || nominas.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 disabled:opacity-50">
            <Lock className="h-4 w-4" /> Cerrar
          </button>
          <button onClick={() => exportPdfMutation.mutate()} disabled={exportPdfMutation.isPending || nominas.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-sm font-medium text-indigo-700 disabled:opacity-50">
            <FileDown className="h-4 w-4" /> PDF PUC
          </button>
          <button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending || nominas.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white disabled:opacity-50">
            <FileDown className="h-4 w-4" /> CSV PUC
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Devengado</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatCOP(totals.devengado)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Deducciones</p>
          <p className="mt-1 text-lg font-semibold text-orange-600">{formatCOP(totals.deducciones)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Neto</p>
          <p className="mt-1 text-lg font-semibold text-green-600">{formatCOP(totals.neto)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando...</div>
        ) : nominas.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No hay nóminas liquidadas en este período.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-left">Centro costo</th>
                  <th className="px-4 py-3 text-right">Devengado</th>
                  <th className="px-4 py-3 text-right">Deducciones</th>
                  <th className="px-4 py-3 text-right">Neto</th>
                  <th className="px-4 py-3 text-center">Estado contable</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nominas.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.empleado?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{item.contratacion?.numero_documento ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.contratacion?.centro_costo ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCOP(item.total_devengado)}</td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">{formatCOP(item.total_deducciones)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCOP(item.salario_neto)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoClass(item.estado_contable)}`}>{item.estado_contable ?? "borrador"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => approveMutation.mutate(item.uuid)}
                        disabled={approveMutation.isPending || ["aprobado", "cerrado", "exportado"].includes(item.estado_contable)}
                        className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 disabled:opacity-40"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {exportData && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-800">Última exportación</p>
          <p className="mt-1 text-xs text-gray-500">
            Débito {formatCOP(exportData.totales?.debito)} · Crédito {formatCOP(exportData.totales?.credito)} · {exportData.lineas?.length ?? 0} líneas
          </p>
        </div>
      )}
    </div>
  );
}
