import { ShieldCheck } from "lucide-react";

import { useConfiguracionNominaTabs } from "../../hooks/nomina/useConfiguracionNominaTabs";
import { useConfiguracionPorcentajes } from "../../hooks/nomina/useConfiguracionPorcentajes";
import { useConfiguracionParametrosLaborales } from "../../hooks/nomina/useConfiguracionParametrosLaborales";
import { useConfiguracionPuc } from "../../hooks/nomina/useConfiguracionPuc";
import { useConfiguracionDocumentos } from "../../hooks/nomina/useConfiguracionDocumentos";

import ConfiguracionNominaTabs from "../../components/nomina/configuracion/ConfiguracionNominaTabs";
import ConfiguracionDocumentosTab from "../../components/nomina/configuracion/ConfiguracionDocumentosTab";
import ConfiguracionParametrosLaboralesTab from "../../components/nomina/configuracion/ConfiguracionParametrosLaboralesTab";
import ConfiguracionPorcentajesTab from "../../components/nomina/configuracion/ConfiguracionPorcentajesTab";
import ConfiguracionPucTab from "../../components/nomina/configuracion/ConfiguracionPucTab";

export default function PageConfiguracionNomina() {
  const tabsHook = useConfiguracionNominaTabs();
  const porcentajesHook = useConfiguracionPorcentajes();
  const parametrosLaboralesHook = useConfiguracionParametrosLaborales();
  const pucHook = useConfiguracionPuc();
  const documentosHook = useConfiguracionDocumentos();

  const { activeConfigTab } = tabsHook;

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
            Configuración
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Configuración de nómina
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Organiza parámetros laborales, contabilidad y documentos del módulo.
          </p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 flex items-center gap-3">
          <ShieldCheck
            className="h-5 w-5 text-indigo-600"
            strokeWidth={1.8}
          />

          <div>
            <p className="text-xs font-semibold text-indigo-900">
              Control por rol asignado
            </p>

            <p className="text-[11px] text-indigo-700">
              Esta vista queda lista para restringir cambios a Talento Humano o
              Administrador.
            </p>
          </div>
        </div>
      </div>

      <ConfiguracionNominaTabs {...tabsHook} />

      {activeConfigTab === "documentos" && (
        <ConfiguracionDocumentosTab {...documentosHook} />
      )}

      {activeConfigTab === "laboral" && (
        <ConfiguracionParametrosLaboralesTab {...parametrosLaboralesHook} />
      )}

      {activeConfigTab === "porcentajes" && (
        <ConfiguracionPorcentajesTab {...porcentajesHook} />
      )}

      {activeConfigTab === "contable" && (
        <ConfiguracionPucTab {...pucHook} />
      )}

    </div>
  );
}
