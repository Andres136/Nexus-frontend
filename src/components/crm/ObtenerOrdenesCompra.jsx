
import { useEffect } from "react";
import useSystem from "../../hooks/useSystem";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import clienteAxios from "../../config/axios";
import Swal from "sweetalert2";
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';
export default function ObtenerOrdenesCompra() {
 
  const {
    ordenesCompra,
    isLoading,
    isError,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    busquedaOrdenesCompra,
    setBusquedaOrdenesCompra,
    refetchOrdenesCompra, // ✅ Agregar refetch para actualizar los datos
  } = useSystem();

  // 🔹 Llamar `refetch()` cada vez que cambie `busquedaOrdenesCompra`
  useEffect(() => {
    refetchOrdenesCompra();
  }, [busquedaOrdenesCompra]);

  //Eliminar ordenes de compra
  const eliminarOrdenCompra = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar orden de compra?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
  
    if (!confirmacion.isConfirmed) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.delete(`/api/orden-compras/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({
        title: "¡Eliminada!",
        text: response.data.message || "Orden eliminada con éxito.",
        icon: "success",
      });
  
      refetchOrdenesCompra();
    } catch (error) {
      // Captura mensaje del backend si viene
      const status = error.response?.status;
      const mensaje = error.response?.data?.error || "Ocurrió un error inesperado.";
  
      Swal.fire({
        title: "No se pudo eliminar",
        text:
          status === 403
            ? mensaje // Mensaje personalizado desde el backend
            : "Hubo un problema al intentar eliminar la orden.",
        icon: "error",
      });
    }
  };
  const ordenesOrdenadas = ordenesCompra?.data?.sort(
  (a, b) => (a.orden_trabajo ? 1 : -1)
);

  

  return (
    <>

<div className="grid grid-cols-2 gap-4">

  <h1 className="text-2xl font-semibold">Ordenes de Compra</h1>
  {/* Buscador - Ocupa solo una columna */}
  <div className="col-span-1 flex items-center ">
    <FaSearch className="text-gray-500 mr-2" />
    <input
      type="text"
      placeholder="Buscar orden de compra..."
      className="border px-3 py-2 rounded-lg w-full"
      value={busquedaOrdenesCompra}
      onChange={(e) => setBusquedaOrdenesCompra(e.target.value)}
    />
  </div>

  {/* Mensajes de carga y error - Ocupan 1 columna */}
  <div className="col-span-1 flex items-center justify-end">
    {isLoading && <p className="text-gray-500">Cargando órdenes de compra...</p>}
    {isError && <p className="text-red-500 ml-4">Error al cargar órdenes de compra</p>}
  </div>

  
    <div className="col-span-2 overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse border border-gray-300 shadow-lg">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Id</th>
            <th className="border border-gray-300 px-4 py-2">Cliente</th>
            <th className="border border-gray-300 px-4 py-2">Fecha de Creacion</th>
            <th className="border border-gray-300 px-4 py-2">Fecha Entrega</th>
            <th className="border border-gray-300 px-4 py-2">OT</th>
            <th className="border border-gray-300 px-4 py-2">Estado</th>
           
            <th className="border border-gray-300 px-4 py-2">Dirección de Entrega</th>
            <th className="border border-gray-300 px-4 py-2">Acciones</th>
        

          </tr>
        </thead>
        <tbody>
          {ordenesOrdenadas?.map((orden) => (
            <tr key={orden.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{orden.id}</td>
              <td className="border border-gray-300 px-4 py-2">{orden.cliente.nombre}</td>
              <td className="border border-gray-300 px-4 py-2">

              {new Date(orden.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </td>


              <td className="border border-gray-300 px-4 py-2">
              {new Date(orden.fecha_entrega).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </td>
                            <td className="px-4 py-2 text-center border border-gray-300">
  {orden.orden_trabajo ? (
    <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
      Con OT
    </span>
  ) : (
    <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-semibold">
      Sin OT
    </span>
  )}
</td>
              <td className="px-4 py-3 text-center border border-gray-300">
    {orden.estado.nombre === "Pendiente" ? (
      <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-semibold">
        Pendiente
      </span>
    ) : orden.estado.nombre === "Completado" ? (
      <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
        Completado
      </span>
    ) : (
      <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
        {orden.estado.nombre}
      </span>
    )}
  </td>

             
              <td className="border border-gray-300 px-4 py-2">{orden.ubicacion_entrega}</td>
              <td className="border px-4 py-2">
    <div className="flex justify-center items-center space-x-2">
      <Link
        to={`/auth/crm/detalles-compras/${orden.id}`}
        className="flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded"
      >
        <FaEye />
      </Link>
      <Link
        to={`/auth/crm/editar-compra/${orden.id}`}
        className="flex items-center justify-center bg-yellow-500 text-white px-3 py-1 rounded"
      >
        <FaEdit />
      </Link>
      <button
        onClick={() => eliminarOrdenCompra(orden.id)}
        className="flex items-center justify-center bg-red-600 text-white px-3 py-1 rounded"
      >
        <FaTrash />
      </button>
    </div>
  </td>

     
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Paginación - Ocupa 2 columnas */}
  <div className="col-span-2 flex justify-end mt-4 gap-4">
    <button
      className={`px-4 py-2 rounded-lg ${
        paginaActual === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-green-700"
      }`}
      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
    >
      Anterior
    </button>
    <span>
      Página {paginaActual} de {totalPaginas}
    </span>
    <button
      className={`px-4 py-2 rounded-lg ${
        paginaActual === totalPaginas ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-green-700"
      }`}
      onClick={() => setPaginaActual((prev) => prev + 1)}
    >
      Siguiente
    </button>
  </div>
</div>

    </>
  );
}
