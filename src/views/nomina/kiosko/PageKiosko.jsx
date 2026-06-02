import PropTypes from "prop-types";
import KioskoScanner from "./KioskoScanner";
import KioskoAcciones from "./KioskoAcciones";
import { useKiosko } from "../../../hooks/nomina/useKiosko";

function PantallaEstado({ titulo, detalle, error }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <div className="w-16 h-16 rounded-full bg-red-900/40 flex items-center justify-center mb-2">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
      ) : (
        <svg className="animate-spin h-10 w-10 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      <p className="text-white text-lg font-semibold">{titulo}</p>
      {detalle && <p className="text-gray-400 text-sm max-w-xs">{detalle}</p>}
    </div>
  );
}

PantallaEstado.propTypes = {
  titulo: PropTypes.string.isRequired,
  detalle: PropTypes.string,
  error: PropTypes.bool,
};

export default function PageKiosko() {
  const {
    status,
    loadMsg,
    errorMsg,
    kioskoInfo,
    faceMatcher,
    empleadosMap,
    cedulaMap,
    jornadaId,
    jornadaActiva,
    step,
    empleadoActual,
    ultimaMarca,
    refrescarJornadaOperativa,
    handleReconocido,
    handleAccionCompleta,
    handleCancelar,
  } = useKiosko();

  if (status === "loading") return <PantallaEstado titulo={loadMsg} />;
  if (status === "error")   return <PantallaEstado titulo="Error al iniciar" detalle={errorMsg} error />;

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {step === "scanner" && (
        <KioskoScanner
          faceMatcher={faceMatcher}
          empleadosMap={empleadosMap}
          cedulaMap={cedulaMap}
          kioskoInfo={kioskoInfo}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          ultimaMarca={ultimaMarca}
          onRefrescarJornada={refrescarJornadaOperativa}
          onReconocido={handleReconocido}
          onEntradaCompleta={handleAccionCompleta}
        />
      )}
      {step === "acciones" && empleadoActual && (
        <KioskoAcciones
          empleado={empleadoActual}
          kioskoInfo={kioskoInfo}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          onRefrescarJornada={refrescarJornadaOperativa}
          onDone={handleAccionCompleta}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
}
