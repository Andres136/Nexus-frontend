import PropTypes from "prop-types";
import { Lock } from "lucide-react";

export default function AccesoDenegado({ mensaje }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center text-gray-700">
      <Lock className="w-20 h-20 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">No puedes acceder a esta sección</h2>
      <p className="text-lg">
        {mensaje || "Esta sección es solo para el responsable del departamento o un administrador."}
      </p>
      <p className="text-sm mt-2 text-gray-500">
        Solicita autorización al administrador del sistema.
      </p>
    </div>
  );
}

AccesoDenegado.propTypes = {
  mensaje: PropTypes.string,
};
