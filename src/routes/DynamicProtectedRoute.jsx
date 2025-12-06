import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Lock } from "lucide-react"; // ← icono elegante (usa lucide-react)

export default function DynamicProtectedRoute({ permission, children }) {
  const { permissions, loadingPermissions } = useAuth({ middleware: "auth" });

  // 🟡 1. Permisos todavía NO cargados
  if (loadingPermissions) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-600">
        <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600 mb-4"></span>
        <p className="text-lg font-medium">Cargando permisos...</p>
      </div>
    );
  }

  // 🔴 2. NO TIENE PERMISO → Mostrar pantalla elegante
  if (!permissions.includes(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center text-gray-700">
        <Lock className="w-20 h-20 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
        <p className="text-lg">
          No tienes permisos para acceder a esta sección.
        </p>
        <p className="text-sm mt-2 text-gray-500">
          Solicita autorización al administrador del sistema.
        </p>
      </div>
    );
  }

  // 🟢 3. TIENE PERMISO → Renderiza la vista
  return children;
}
