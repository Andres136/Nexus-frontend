import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { showToast } from "../../helpers/utils/showToast";
import { nominaService } from "../../services/nominaService";

function money(value) {
  return "$ " + Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

export default function PageLiquidacionesRetiro() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [descargando, setDescargando] = useState("");
  const params = useMemo(() => ({ search: search || undefined, page, per_page: 20 }), [page, search]);
  const { data, isLoading } = useQuery({
    queryKey: ["liquidacionesRetiro", params],
    queryFn: async () => (await nominaService.getLiquidacionesRetiro(params)).data.data,
  });

  const items = data?.data ?? [];

  const descargarPdf = async (item) => {
    setDescargando(item.uuid);
    try {
      const response = await nominaService.liquidacionRetiroPdf(item.uuid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `liquidacion_retiro_${item.uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("error", "No se pudo descargar la liquidación definitiva.");
    } finally {
      setDescargando("");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Liquidaciones de Retiro</h1>
        <p className="text-sm text-gray-500">Historial de contratos finalizados y prestaciones liquidadas.</p>
      </div>

      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Buscar empleado, documento o motivo..."
        className="mb-4 h-9 w-full max-w-sm rounded-lg border border-gray-200 px-3 text-sm"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No hay liquidaciones definitivas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-left">Documento</th>
                  <th className="px-4 py-3 text-left">Retiro</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-right">Prestaciones</th>
                  <th className="px-4 py-3 text-right">Deducciones</th>
                  <th className="px-4 py-3 text-right">Neto</th>
                  <th className="px-4 py-3 text-right">Archivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const prestaciones = Number(item.cesantias || 0)
                    + Number(item.intereses_cesantias || 0)
                    + Number(item.prima_servicios || 0)
                    + Number(item.vacaciones || 0)
                    + Number(item.indemnizacion || 0);

                  return (
                    <tr key={item.uuid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{item.contratacion?.numero_documento ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{String(item.fecha_retiro).slice(0, 10)}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{String(item.motivo_retiro).replaceAll("_", " ")}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{money(prestaciones)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{money(item.total_deducciones)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{money(item.neto_pagar)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => descargarPdf(item)}
                          disabled={descargando === item.uuid}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {descargando === item.uuid ? "Preparando..." : "PDF"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data?.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
            <span className="text-gray-500">Página {data.current_page} de {data.last_page}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Anterior</button>
              <button type="button" disabled={page >= data.last_page} onClick={() => setPage((value) => value + 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
