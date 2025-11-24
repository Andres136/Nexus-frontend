import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function DividirOcProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [selecciones, setSelecciones] = useState({}); // detalle_id => proveedor_id

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");

      const ordenRes = await clienteAxios.get(`/api/ordenes-compra-proveedor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const proveedoresRes = await clienteAxios.get(`/api/proveedores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const datos = ordenRes.data.orden || ordenRes.data;
      setOrden(datos);

      const lista = proveedoresRes.data.proveedores?.data || [];
      setProveedores(lista);

      // Inicializar selecciones
      const inicial = {};
      (datos.productos || datos.detalles).forEach(det => {
        inicial[det.id] = null;
      });
      setSelecciones(inicial);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos");
      navigate("/auth/crm/proveedores-ordenes-compra");
    }
  };

  const seleccionarProveedor = (detalleId, proveedorId) => {
    setSelecciones(prev => ({
      ...prev,
      [detalleId]: proveedorId
    }));
  };

 const procesarDivision = async () => {
  const items = Object.entries(selecciones)
    .filter(([detalleId, proveedorId]) => proveedorId !== null)
    .map(([detalleId, proveedorId]) => ({
      detalle_id: Number(detalleId),
      proveedor_id: proveedorId
    }));

  if (items.length === 0) {
    toast.warning("Seleccione al menos un ítem y proveedor");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await clienteAxios.post(
      `/api/ordenes-compra-proveedor/${orden.id}/dividir`,
      { items },
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log(res);
    const nuevas = res.data.ordenes_generadas || [];

    if (nuevas.length === 0) {
      toast.error("No se generaron órdenes");
      return;
    }

    // ✅ SOLUCIÓN: Usar window.location en lugar de navigate dentro de Swal
    Swal.fire({
      title: "Órdenes generadas exitosamente",
      html: `
        <div class="space-y-2">
          <p class="text-gray-600 mb-4">Haz clic en cualquier orden para verla:</p>
          ${nuevas.map((o, idx) => `
            <div class="p-2 border rounded">
              <button 
                class="btn-open-order w-full text-left p-2 hover:bg-blue-50 rounded"
                data-id="${o.id}" 
                style="color:#2563eb; font-weight: 600; background: none; border: none; cursor: pointer;"
              >
                📋 ${o.numero_orden}
              </button>
            </div>
          `).join("")}
        </div>
      `,
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Ver primera orden",
      cancelButtonText: "Ir a lista",
      width: 500,
      didRender: () => {
        // ✅ Usar window.location.href en lugar de navigate
        document.querySelectorAll('.btn-open-order').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const ordenId = btn.dataset.id;
            Swal.close();
            // ✅ Cambiar la ubicación directamente
            window.location.href = `/auth/crm/ordenes-proveedor-preview/${ordenId}`;
          });
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Ir a la primera orden
        window.location.href = `/auth/crm/ordenes-proveedor-preview/${nuevas[0].id}`;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ✅ Ir a la lista
        navigate("/auth/crm/ordenes-compra-proveedor");
      }
    });

  } catch (err) {
    console.error(err);
    toast.error("Error al dividir la orden");
  }
};

const eliminarItem = (detalleId) => {
  Swal.fire({
    title: "¿Eliminar ítem?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      // Eliminar del estado local
      setOrden(prev => {
        const nuevosDetalles = (prev.productos || prev.detalles).filter(det => det.id !== detalleId);
        return {
          ...prev,
          productos: nuevosDetalles,
          detalles: nuevosDetalles
        };
      });

      // Eliminar también la selección del proveedor
      setSelecciones(prev => {
        const copy = { ...prev };
        delete copy[detalleId];
        return copy;
      });

      toast.success("Ítem eliminado");
    }
  });
};


  if (loading) return <p className="p-6">Cargando…</p>;

  const detalles = orden.productos || orden.detalles;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Dividir Orden {orden.numero_orden}
        </h2>

        <Link
          to="/auth/crm/proveedores-ordenes-compra"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          ← Volver
        </Link>
      </div>

      <p className="text-gray-700 mb-4">
        Seleccione qué proveedor manejará cada ítem.
      </p>

      <table className="min-w-full border bg-white rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Item</th>
            <th className="p-3 border">Código</th>
            <th className="p-3 border">Descripción</th>
            <th className="p-3 border">Cantidad</th>
            <th className="p-3 border">Acciones</th>
            <th className="p-3 border">Proveedor destino</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map(det => (
            <tr key={det.id} className="hover:bg-gray-50">
              <td className="p-3 border text-center">{det.item}</td>
              <td className="p-3 border text-center">{det.code}</td>
              <td className="p-3 border">{det.descripcion}</td>
              <td className="p-3 border text-center">{det.cantidad_solicitada}</td>
              <td className="p-3 border text-center">
                <button
                  onClick={() => eliminarItem(det.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  Eliminar
                </button>
              </td>
              <td className="p-3 border">
                <Select
                  options={proveedores.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))}
                  onChange={(opt) =>
                    seleccionarProveedor(det.id, opt?.value || null)
                  }
                  placeholder="Asignar proveedor"
                  isClearable
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <button
          onClick={procesarDivision}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Generar nuevas órdenes
        </button>
      </div>
    </div>
  );
}
