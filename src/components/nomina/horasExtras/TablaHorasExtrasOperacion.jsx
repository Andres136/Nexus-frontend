import PropTypes from "prop-types";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
};

const TIPO_LABEL = {
  diurna: "Diurna",
  nocturna: "Nocturna",
  festiva: "Festiva",
  nocturna_festiva: "Nocturna festiva",
};

export default function TablaHorasExtrasOperacion({ lista, isLoading, loadingUuid, onGestion }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-sm text-gray-400">
        <Loader2 className="h-5 w-5 mr-2 animate-spin text-indigo-500" /> Cargando...
      </div>
    );
  }

  if (lista.length === 0) {
    return <div className="text-center py-16 text-sm text-gray-400">No hay horas extras registradas.</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-100 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {["Empleado", "Sede", "Kiosko", "Fecha", "Tipo", "Horas", "Estado", "Solicitó", "Gestionó", "Acciones"].map((header) => (
            <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-50">
        {lista.map((item) => (
          <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{item.empleado?.name ?? "-"}</td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{item.sede?.nombre ?? "-"}</td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{item.kiosko?.name ?? item.kiosko?.code ?? "Global"}</td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{item.fecha?.slice(0, 10) ?? "-"}</td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                {TIPO_LABEL[item.tipo] ?? item.tipo ?? "-"}
              </span>
            </td>
            <td className="px-4 py-3.5 text-center font-semibold text-gray-800">{item.horas ?? "-"}h</td>
            <td className="px-4 py-3.5">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-500"}`}>
                {item.status ?? "-"}
              </span>
            </td>
            <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{item.solicitante?.name ?? "-"}</td>
            <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
              {item.supervisor?.name ?? <span className="text-amber-500">Pendiente</span>}
            </td>
            <td className="px-4 py-3.5">
              {item.status === "pendiente" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGestion({ item, accion: "aprobar" })}
                    disabled={!!loadingUuid}
                    className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-40"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Aprobar
                  </button>
                  <button
                    onClick={() => onGestion({ item, accion: "rechazar" })}
                    disabled={!!loadingUuid}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Rechazar
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

TablaHorasExtrasOperacion.propTypes = {
  lista: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  loadingUuid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onGestion: PropTypes.func.isRequired,
};
