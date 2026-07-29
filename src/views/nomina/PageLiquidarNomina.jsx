import { ArrowLeft, Calculator, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormLiquidarNomina from "../../components/nomina/FormLiquidarNomina";

export default function PageLiquidarNomina() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const volver = () => navigate("/auth/crm/nomina/procesar");
  const initialData = {
    user_id: searchParams.get("user_id") ?? "",
    periodo_inicio: searchParams.get("periodo_inicio") ?? "",
    periodo_fin: searchParams.get("periodo_fin") ?? "",
  };

  return (
    <div className="w-full min-w-0 p-4 sm:p-6">
      <button
        type="button"
        onClick={volver}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al resumen de nómina
      </button>

      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-6 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Nómina individual
            </p>
            <h1 className="text-2xl font-bold">Nueva liquidación</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Calcula, revisa y aprueba la liquidación antes de registrarla definitivamente.
            </p>
          </div>
          <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
            <Calculator className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <FormLiquidarNomina onClose={volver} initialData={initialData} />
        </main>

        <aside className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 xl:sticky xl:top-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-indigo-950">Flujo controlado</h2>
          <p className="mt-2 text-sm leading-6 text-indigo-800">
            La nómina periódica solo puede liquidarse después de generar y aprobar su preliquidación.
          </p>
          <ol className="mt-4 space-y-3 text-sm text-indigo-900">
            {["Completa los datos", "Genera la preliquidación", "Revisa y aprueba", "Liquida la versión aprobada"].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-700">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
