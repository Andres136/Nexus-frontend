
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import {useAuth} from "../../hooks/useAuth";
import AsyncSelect from "react-select/async";

import Swal from "sweetalert2";
export default function Pqr() {
  const [pqrs, setPqrs] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const { obtenerUsuarios, users,user } = useAuth({ middleware: "auth" });
  


  const fetchPqrs = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await clienteAxios.get(`/api/pqrs`, {
        params: {
          empresa,
          estado,
          page: pagina
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPqrs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        total: response.data.total,
        prev_page_url: response.data.prev_page_url,
        next_page_url: response.data.next_page_url,
      });

    } catch (error) {
      console.error("Error al cargar PQRs", error);
    }
  };

  // funcion para  cambiar el estado de una PQR
  const cambiarEstado = async (id, estadoId) => {
    const nuevoEstado = estadoId === 1 ? 2 : 1;
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cambiar el estado de esta PQR?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          const response = await clienteAxios.put(`/api/pqrs/${id}/estado`, { estado_id: nuevoEstado }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(response.data.message);
          fetchPqrs();
        } catch (error) {
          console.error("❌ Error al cambiar el estado", error);
          toast.error("Error al cambiar el estado");
        }
      }
    });
  };
  
  

  useEffect(() => {
    fetchPqrs();
    obtenerUsuarios();
  }, [empresa, estado, pagina]);


  const asignarResponsable = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.put(
        `/api/pqrs/${mensajeSeleccionado.id}/asignar`,
        { asignado_a: mensajeSeleccionado.asignado_a },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message); // ✅ ahora usa el mensaje desde el backend
      fetchPqrs(); // Recarga la tabla
      setMensajeSeleccionado(null); // Cierra el modal
    } catch (error) {
           console.log(error);
      toast.error("Error al asignar responsable.");
      console.error(error);
    }
  };
  
  const confirmarEliminacion = (id) => {
    Swal.fire({
      title: '¿Deseas eliminar esta PQR?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          await  clienteAxios.delete(`/api/pqrs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("PQR eliminada correctamente");
          fetchPqrs();
        } catch (error) {
          console.log("❌ Error al eliminar PQR", error);
     
          toast.error("Error al eliminar PQR");
        }
      }
    });
  };
const cargarOpcionesUsuarios = async (inputValue, callback) => {
  try {
    const token = localStorage.getItem("token");

    const response = await clienteAxios.get(`/api/usuarios/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        search: inputValue,
      },
    });

    const opciones = response.data.map((u) => ({
      value: u.id,
      label: u.name,
    }));

    console.log("Usuarios cargados:", opciones);
    callback(opciones);
  } catch (error) {
    console.error("Error al cargar usuarios dinámicamente", error.response ?? error);
    callback([]);
  }
};



  return (
    <div className="container p-4">
      <h2 className="text-2xl font-bold mb-4">📋 Listado de PQRs</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Buscar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
      </div>
  <div className="grid grid-cols-1">
  <table className="w-full bg-white border shadow-sm text-sm col-span-1">
      <thead className="bg-gray-800 text-white uppercase">
  <tr>
    <th className="py-2 px-4 text-left">Nombre</th>
    <th className="py-2 px-4 text-left">Empresa</th>
    <th className="py-2 px-4 text-left">Teléfono</th>
    <th className="py-2 px-4 text-left">Responsable</th>

    <th className="py-2 px-4 text-left">Mensaje </th>
    <th className="py-2 px-4 text-left">Estado</th>
    <th className="py-2 px-4 text-left">Fecha</th>
    <th className="py-2 px-4 text-left">Fecha de Actualizacion</th>
  </tr>
</thead>
<tbody>
  {pqrs.map((pqr) => (
    <tr key={pqr.id} className="border-t hover:bg-gray-50">
      <td className="py-2 px-4">{pqr.nombre}</td>
      <td className="py-2 px-4">{pqr.empresa}</td>
      <td className="py-2 px-4">{pqr.telefono}</td>
      <td className="py-2 px-4">{pqr.asignado?.name || "Sin asignar"}</td>

      <td className="py-2 px-4">
        <button
     onClick={() => setMensajeSeleccionado(pqr)}

          className=" hover:underline"
        >
          Ver Mensaje
        </button>
</td>

<td className="py-2 px-4">
  {pqr.estado?.nombre || "Sin estado"}
  {user?.role_id === 1 && (
    <button
      onClick={() => cambiarEstado(pqr.id, pqr.estado_id)}
      className="ml-2 text-sm text-green-600 underline"
    >
      Cambiar estado
    </button>
  )}

{user?.role_id === 1 && (
  <button
    onClick={() => confirmarEliminacion(pqr.id)}
    className="ml-2 text-sm text-red-600 underline"
  >
    Eliminar
  </button>
)}

</td>


      <td className="py-2 px-4">
        {new Date(pqr.created_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}{" "}
        {new Date(pqr.created_at).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="py-2 px-4">
        {new Date(pqr.updated_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}{" "}
        {new Date(pqr.updated_at).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
    </tr>
  ))}
</tbody>

      </table>

  </div>
     

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPagina(pagina - 1)}
          disabled={!pagination.prev_page_url}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">Página {pagination.current_page}</span>
        <button
          onClick={() => setPagina(pagina + 1)}
          disabled={!pagination.next_page_url}
          className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      {mensajeSeleccionado && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">


<div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
  <h3 className="text-xl font-semibold mb-4">📩 Detalles de la PQR</h3>

  <p><strong>Nombre:</strong> {mensajeSeleccionado.nombre}</p>
  <p><strong>Empresa:</strong> {mensajeSeleccionado.empresa}</p>
  <p><strong>Correo:</strong> {mensajeSeleccionado.email}</p>
  <p><strong>Mensaje:</strong></p>
  <p className="text-gray-800 whitespace-pre-line mb-4">
    {mensajeSeleccionado.mensaje}
  </p>

  {user?.role_id === 1 && (
  <>
    <label className="block mb-2 font-semibold">Asignar a:</label>
   <AsyncSelect
  className="mb-4"
  cacheOptions
  defaultOptions
  loadOptions={cargarOpcionesUsuarios}
  placeholder="Seleccionar responsable..."
  value={
    
    mensajeSeleccionado.asignado_a
      ? {
          value: mensajeSeleccionado.asignado_a,
          label:
            users.find((u) => u.id === mensajeSeleccionado.asignado_a)?.name ||
            "Seleccionado",
        }
      : null
  }
  onChange={(selected) =>
    setMensajeSeleccionado((prev) => ({
      ...prev,
      asignado_a: selected?.value || "",
    }))
  }
/>

  </>
)}
{(user?.role_id === 1 || user?.id === mensajeSeleccionado.asignado_a) && (
  <>
    <label className="block mb-2 font-semibold">Respuesta:</label>
    <textarea
      className="w-full border px-3 py-2 rounded mb-4"
      rows="4"
      value={mensajeSeleccionado.respuesta || ""}
      onChange={(e) =>
        setMensajeSeleccionado((prev) => ({
          ...prev,
          respuesta: e.target.value,
        }))
      }
      placeholder="Escribe tu respuesta..."
    ></textarea>

    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={async () => {
          try {
            const token = localStorage.getItem("token");
            await clienteAxios.put(
              `/api/pqrs/${mensajeSeleccionado.id}/responder`,
              { respuesta: mensajeSeleccionado.respuesta },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            toast.success("Respuesta guardada correctamente");
            fetchPqrs();
            setMensajeSeleccionado(null);
          } catch (error) {
            toast.error("Error al guardar la respuesta");
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar respuesta
      </button>
    </div>
  </>
)}


  <div className="flex justify-end gap-2">
    <button
      onClick={() => setMensajeSeleccionado(null)}
      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
    >
      Cancelar
    </button>
    <button
      onClick={asignarResponsable}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Asignar
    </button>
  </div>
</div>

  </div>
)}

    </div>
  );
}
