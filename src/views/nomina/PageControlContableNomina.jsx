import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileDown, Lock, X } from "lucide-react";
import { useControlContableNomina } from "../../hooks/nomina/useControlContableNomina";
import { useNominaPucPayload } from "../../hooks/nomina/useNominaPucPayload";

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

export default function PageControlContableNomina() {
  const [nominaPreviewUuid, setNominaPreviewUuid] = useState("");
  const {
    mes,
    setMes,
    anio,
    setAnio,
    quincena,
    setQuincena,
    nominas,
    totals,
    isLoading,
    approveMutation,
    closeMutation,
    exportExcelMutation,
    exportPdfMutation,
  } = useControlContableNomina();
  const {
    payloadPuc,
    isLoading: loadingPayloadPuc,
    error: payloadPucError,
  } = useNominaPucPayload(nominaPreviewUuid, { enabled: Boolean(nominaPreviewUuid) });
  const payloadPreview = payloadPuc?.data ?? payloadPucError?.response?.data?.data ?? null;
  const payloadMessage = payloadPucError?.response?.data?.message ?? "";
  const cuentasFaltantes = useMemo(() => payloadPreview?.cuentas_faltantes ?? [], [payloadPreview]);

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
          <button onClick={() => exportExcelMutation.mutate()} disabled={exportExcelMutation.isPending || nominas.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white disabled:opacity-50">
            <FileDown className="h-4 w-4" /> Excel PUC
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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setNominaPreviewUuid(item.uuid)}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-700"
                        >
                          <Eye className="h-3.5 w-3.5" /> JSON PUC
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(item.uuid)}
                          disabled={approveMutation.isPending || ["aprobado", "cerrado", "exportado"].includes(item.estado_contable)}
                          className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 disabled:opacity-40"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {nominaPreviewUuid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preview JSON PUC</h2>
                <p className="text-sm text-gray-500">Estructura contable generada desde la nómina liquidada.</p>
              </div>
              <button
                type="button"
                onClick={() => setNominaPreviewUuid("")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {loadingPayloadPuc ? (
                <div className="py-12 text-center text-sm text-gray-400">Generando preview contable...</div>
              ) : (
                <>
                  {payloadPucError && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">{payloadMessage || "El payload tiene validaciones pendientes."}</p>
                          {cuentasFaltantes.length > 0 && (
                            <p className="mt-1 text-xs">Configura las cuentas faltantes en Configuración de nómina.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {cuentasFaltantes.length > 0 && (
                    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="px-4 py-3 text-left">Concepto</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                            <th className="px-4 py-3 text-left">Motivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {cuentasFaltantes.map((item) => (
                            <tr key={item.codigo}>
                              <td className="px-4 py-3 font-medium text-gray-800">{item.codigo}</td>
                              <td className="px-4 py-3 text-right text-gray-700">{formatCOP(item.valor)}</td>
                              <td className="px-4 py-3 text-gray-500">{item.motivo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <pre className="max-h-[48vh] overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-gray-100">
                    {JSON.stringify(payloadPreview ?? payloadPuc ?? payloadPucError?.response?.data ?? {}, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
