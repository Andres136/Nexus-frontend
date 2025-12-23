import { Edit,  Eye,  SplitIcon,  Trash2, Truck } from "lucide-react";
import { useProveedores } from "../../hooks/useProveedores";
import {  Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";




export default function ObtenerOrdenesProveedores() {


const { user } = useAuth({middleware: 'auth'});
const [weekFilter, setWeekFilter] = useState("");

//console.log(user);
const isAdmin = user?.role_id === 1;
const isAdministrativo = user?.role_id === 4 || user?.role_id === 5;


  const navigate = useNavigate();
  const {
    ordenes,
    loading,
    pagina,
    lastPage,
    setPagina,
    obtenerOrdenes,
    searchTerm,
    setSearchTerm,
    eliminarOrden,
  } = useProveedores();

  const handleBuscar = () => {
    setPagina(1);
    obtenerOrdenes(1, searchTerm, weekFilter);
  };

  //Formatear fecha
  const formatearFecha = (fecha) => {
    const opciones = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(fecha).toLocaleDateString("col-CO", opciones);
  };
  return (
    <div className="grid grid-cols-1 ">

      <div className="col-span-1">
      <h2 className="text-2xl font-bold mb-4">Órdenes de Compra Proveedores</h2>
      <Link
        to="/auth/crm/proveedores"
        className="m-4 inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm "
      >
        ← Volver
      </Link>
   <div className="mb-4 flex gap-2">

  {/* Búsqueda texto */}
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
    placeholder="Buscar por número de orden o proveedor..."
    className="border p-2 rounded w-full"
  />

  {/* 🔍 Filtro por semana */}
  <input
    type="week"
    value={weekFilter}
    onChange={(e) => setWeekFilter(e.target.value)}
    className="border p-2 rounded"
  />

  <button
    onClick={handleBuscar}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Buscar
  </button>

</div>


      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Número O-C</th>
              <th className="border px-4 py-2">Fecha </th>
              <th className="border px-4 py-2">Empresa</th>
              <th className="border px-4 py-2">Sedes</th>
              
              <th className="border px-4 py-2">Proveedor</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Usuario</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.data?.map((orden) => (
              <tr key={orden.id}>
                <td className="border px-4 py-2">{orden.numero_orden}</td>
                <td className="border px-4 py-2">{formatearFecha(orden.fecha)}</td>
                <td className="border px-4 py-2">{orden.empresa?.nombre}</td>
               <td className="border px-4 py-2">{orden.sede_nombre || 'Sin sede'}</td>

                
                <td className="border px-4 py-2">{orden.proveedor?.nombre}</td>
                <td className="border px-4 py-2 text-center">
              <span
  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
    orden.estado_calculado === "Pendiente"
      ? "bg-red-100 text-red-800"
      : orden.estado_calculado === "Completada"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800"
  }`}
>
  {orden.estado_calculado}
</span>

                </td>

                <td className="border px-4 py-2">{orden.usuario?.name}</td>
              <td className="border px-4 py-2 flex gap-2 justify-center">

    <button
      onClick={() =>
        navigate(`/auth/crm/ordenes-proveedor-entregas/${orden.id}/registrar-entrega`)
      }
      className="bg-green-500 text-white px-3 py-1 rounded"
    >
      <Truck size={16} />
    </button>
 


    <button
      onClick={() => navigate(`/auth/crm/oc-provedor-update/${orden.id}`)}
      className="bg-blue-500 text-white px-3 py-1 rounded"
    >
      <Edit size={16} />
    </button>



 

  {isAdministrativo || user?.role_id === 1 &&(
    <button
      onClick={() =>
        navigate(`/auth/crm/ordenes-proveedor/dividir-orden/${orden.id}`)
      }
      className="bg-yellow-500 text-white px-3 py-1 rounded"
    >
      <SplitIcon size={16} />
    </button>
  )}

  {/* Vista previa → Todos los roles */}
  <button
    onClick={() =>
      navigate(`/auth/crm/ordenes-proveedor-preview/${orden.id}`)
    }
    className="bg-purple-500 text-white px-3 py-1 rounded"
  >
    <Eye size={16} />
  </button>
  {isAdmin &&(
    <button
      onClick={() => eliminarOrden(orden.id)}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      <Trash2 size={16} />
    </button>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex justify-between">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {lastPage}
        </span>
        <button
          disabled={pagina === lastPage}
          onClick={() => setPagina(pagina + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Siguiente
        </button>
      </div>
      </div>
    </div>
  );
}
