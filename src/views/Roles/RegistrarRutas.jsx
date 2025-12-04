import { useState } from "react";

import Swal from "sweetalert2";
import clienteAxios from "../../config/axios";

export default function RegistrarRutas() {
  const [rutas, setRutas] = useState([
    { path: "", name: "", module: "", enabled: true }
  ]);

  // Agregar fila
  const agregarFila = () => {
    setRutas([
      ...rutas,
      { path: "", name: "", module: "", enabled: true }
    ]);
  };

  // Eliminar fila
  const eliminarFila = (index) => {
    if (rutas.length === 1) return;
    setRutas(rutas.filter((_, i) => i !== index));
  };

  // Cambios en inputs
  const handleChange = (index, campo, valor) => {
    const nuevas = [...rutas];
    nuevas[index][campo] = valor;
    setRutas(nuevas);
  };

  // Guardar en el backend
  const guardarRutas = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await clienteAxios.post(
        "/api/guardar-rutas",
        { rutas },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Guardado", data.message, "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar",
        "error"
      );
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Registrar Rutas</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Path</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Módulo</th>
            <th className="p-2">Activo</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rutas.map((ruta, index) => (
            <tr key={index}>
              <td className="p-2">
                <input
                  type="text"
                  value={ruta.path}
                  placeholder="/crm/clientes"
                  onChange={(e) =>
                    handleChange(index, "path", e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </td>

              <td className="p-2">
                <input
                  type="text"
                  value={ruta.name}
                  placeholder="Clientes"
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </td>

              <td className="p-2">
                <input
                  type="text"
                  value={ruta.module}
                  placeholder="CRM"
                  onChange={(e) =>
                    handleChange(index, "module", e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </td>

              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={ruta.enabled}
                  onChange={(e) =>
                    handleChange(index, "enabled", e.target.checked)
                  }
                />
              </td>

              <td className="p-2 text-center">
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => eliminarFila(index)}
                  disabled={rutas.length === 1}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={agregarFila}
        >
          Agregar Ruta
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={guardarRutas}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
