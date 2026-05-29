import { createContext, useContext, useState, useCallback } from "react";

const EncuestaContext = createContext();

const EncuestaProvider = ({ children }) => {
  // Encuesta seleccionada — permite pasar el ID entre páginas sin prop drilling
  // Ej: EncuestasPage selecciona una → ResultadosEncuesta la lee al montar
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);

  const seleccionar = useCallback((encuesta) => {
    setEncuestaSeleccionada(encuesta);
  }, []);

  const limpiar = useCallback(() => {
    setEncuestaSeleccionada(null);
  }, []);

  return (
    <EncuestaContext.Provider
      value={{
        encuestaSeleccionada,
        seleccionar,
        limpiar,
      }}
    >
      {children}
    </EncuestaContext.Provider>
  );
};

const useEncuestaContext = () => {
  const ctx = useContext(EncuestaContext);
  if (!ctx) throw new Error("useEncuestaContext debe usarse dentro de EncuestaProvider");
  return ctx;
};

export { EncuestaProvider, useEncuestaContext };
export default EncuestaContext;
