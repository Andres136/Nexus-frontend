import React, { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import Select from "react-select";
import { toast } from "react-toastify";

export default function CambiarProveedor({ ordenId, proveedorActual }) {
  const [proveedores, setProveedores] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const token = localStorage.getItem("token");

  // 1️⃣ Carga la lista de proveedores
  useEffect(() => {
    (async () => {
      try {
        const res = await clienteAxios.get("/api/proveedores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const opts = res.data.proveedores.data.map((p) => ({
          value: p.id,
          label: p.nombre,
        }));
        setProveedores(opts);
      } catch {
        toast.error("Error cargando proveedores");
      }
    })();
  }, [token]);

  // 2️⃣ Preselecciona el proveedor actual
  useEffect(() => {
    if (proveedorActual && proveedores.length) {
      const actual = proveedores.find((p) => p.value === proveedorActual);
      setSeleccion(actual || null);
    }
  }, [proveedorActual, proveedores]);

  // 3️⃣ Función que llama al endpoint de actualización
  const handleActualizar = async () => {
    if (!seleccion) {
      toast.error("Selecciona un proveedor");
      return;
    }
    try {
      await clienteAxios.put(
        `/api/ordenes-compra-proveedor/${ordenId}/update-proveedor`,
        { proveedor_id: seleccion.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Proveedor actualizado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar proveedor");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="mb-2 font-semibold">Cambiar Proveedor Orden #{ordenId}</h3>
      <Select
        options={proveedores}
        value={seleccion}
        onChange={setSeleccion}
        placeholder="Selecciona nuevo proveedor"
      />
      <button
        onClick={handleActualizar}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Actualizar Proveedor
      </button>
    </div>
  );
}
