import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { productsApi } from "../../services/api";

export default function SincronizacionSiigoProductos() {
  const [loading, setLoading] = useState(false);

  // 🔹 Función genérica para manejar la sincronización
  const ejecutarSincronizacion = async (tipo) => {
    setLoading(true);
    try {
      const response =
        tipo === "global"
          ? await productsApi.sincronizarProductosSiigoGlobal({})
          : await productsApi.sincronizarProductosSiigoSetas({});

      const data = response.data.data.productos_sincronizados;

    

      // ✅ Mostrar resultados en SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Sincronización completada",
        html: `
          <div style="text-align: left;">
            <p><b>Productos creados:</b> ${data.productos_guardados}</p>
            <p><b>Productos actualizados:</b> ${data.productos_actualizados}</p>
            <p><b>Productos omitidos:</b> ${data.productos_omitidos}</p>
            <hr style="margin: 8px 0;" />
            <p><b>Total procesados:</b> ${data.total_procesados}</p>
          </div>
        `,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      console.error("Error al sincronizar:", error);
      Swal.fire({
        icon: "error",
        title: "Error al sincronizar",
        text:
          error.response?.data?.message ||
          "Ocurrió un error al conectar con el servidor.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-6">
      <button
        onClick={() => ejecutarSincronizacion("global")}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Sincronizando..." : "Siigo Global"}
      </button>

      <button
        onClick={() => ejecutarSincronizacion("setas")}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Sincronizando..." : "Siigo SetasPlast"}
      </button>
    </div>
  );
}
