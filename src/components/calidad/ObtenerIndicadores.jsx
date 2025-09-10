import { useEffect, useState } from "react";
import { indicadoresApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";

export default function ObtenerIndicadores({ onSelect, indicadores, setIndicadores }) {
  const { user } = useAuth({ middleware: "auth" }); // no pases options si tu hook no las usa

  useEffect(() => {
    const fetchIndicadores = async () => {
      const res = await indicadoresApi.getAll();
    
      setIndicadores(res.data.data || []);
    };
    fetchIndicadores();
  }, [setIndicadores, indicadores]);

  
const puedeEditar = [1,2].includes(user?.role_id);

const handleDelete = async (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await indicadoresApi.delete(id);
        setIndicadores(indicadores.filter(indicador => indicador.id !== id));
        Swal.fire('Eliminado', 'El indicador ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error eliminando indicador:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el indicador.', 'error');
      }
    }
  });
}
  return (
    <div>
      <div className="grid grid-cols-1 p-4 gap-4">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg col-span-1">
          <p className="text-xs text-gray-500 mt-2 p-2">Haz clic en un indicador para editarlo en el formulario.</p>
          {indicadores.length === 0 ?(
            <p className="text-center p-4 text-gray-500">No hay indicadores disponibles.</p>
          ):(
            
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
          Nombre
        </th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
          Fórmula
        </th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
          Meta
        </th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
          Frecuencia
        </th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
          Descripción
        </th>
            {puedeEditar && (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Acciones</th>
                )}
   
      </tr>
    </thead>
    <tbody>
    {indicadores.map(indicador => (
              <tr
              key={indicador.id}
              className={
                puedeEditar
                  ? "hover:bg-blue-50 cursor-pointer"
                  : "bg-gray-100 cursor-not-allowed"
              }
              onClick={() => {
                if (puedeEditar && onSelect) onSelect(indicador);
              }}
              title={
                puedeEditar
                  ? "Haz clic para editar"
                  : "No tienes permisos para editar"
              }
            >
              <td className="px-4 py-2">{indicador.nombre}</td>
              <td className="px-4 py-2">{indicador.formula}</td>
              <td className="px-4 py-2">{indicador.meta}</td>
              <td className="px-4 py-2">{indicador.frecuencia}</td>
              <td className="px-4 py-2">{indicador.descripcion || "—"}</td>
                   {puedeEditar && (
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(indicador.id);
                        }}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
            </tr>
          ))}
    </tbody>
  </table>
          )}

</div>
</div>


    </div>
  );
}
