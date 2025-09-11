import { useEffect, useState } from "react";
import { indicadoresApi, departamentosApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";
import Select from "react-select";

export default function ObtenerIndicadores({
  onSelect,
  indicadores,
  setIndicadores,
}) {
  const { user } = useAuth({ middleware: "auth" }); // no pases options si tu hook no las usa
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({
    last_page: 1,
    current_page: 1,
    total: 0,
    per_page: 10,
  }); 

  const fetchdepartamentos = async () => {
    try {
      const res = await departamentosApi.getAll();
      setDepartamentos(res.data);
 
    } catch (error) {
      setDepartamentos([]);
      console.error("Error fetching departamentos:", error);
    }
  };

  const fetchIndicadores = async (depId = "", page = 1) => {
    const res = await indicadoresApi.getIndicadoresDepartamento({ departamento_id: depId, page });

    setIndicadores(res.data.data || []);
    setPaginacion({
      last_page: res.data.last_page,
      current_page: res.data.current_page,
      total: res.data.total,
      per_page: res.data.per_page,
    });

  };
  useEffect(() => {
    fetchIndicadores(departamentoId, pagina);
  }, [departamentoId, pagina]);

  useEffect(() => {
    fetchdepartamentos();
  }, []);

  const puedeEditar = [1, 2].includes(user?.role_id);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await indicadoresApi.delete(id);
          setIndicadores(
            indicadores.filter((indicador) => indicador.id !== id)
          );
          Swal.fire("Eliminado", "El indicador ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error eliminando indicador:", error);
          Swal.fire(
            "Error",
            "Hubo un problema al eliminar el indicador.",
            "error"
          );
        }
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 p-4 gap-4">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg col-span-1">
          <p className="text-xs text-gray-500 mt-2 p-2">
            Haz clic en un indicador para editarlo en el formulario.
          </p>

      {puedeEditar && (
  <div className="p-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Filtrar por Departamento
    </label>
    <Select
      options={[
        { value: "", label: "Todos los departamentos" },
        ...departamentos.map((dep) => ({
          value: dep.id,
          label: dep.nombre,
        })),
      ]}
      value={
        departamentoId
          ? {
              value: departamentoId,
              label:
                departamentos.find((d) => d.id === departamentoId)
                  ?.nombre || "Departamento no encontrado",
            }
          : { value: "", label: "Todos los departamentos" }
      }
      onChange={(selected) => {
        setDepartamentoId(selected ? selected.value : "");
        setPagina(1);
      }}
      placeholder="Selecciona un departamento"
    />
  </div>
)}

          {indicadores.length === 0 ? (
            <p className="text-center p-4 text-gray-500">
              No hay indicadores disponibles.
            </p>
          ) : (
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
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {indicadores.map((indicador) => (
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
                    <td className="px-4 py-2">
                      {indicador.descripcion || "—"}
                    </td>
                    {puedeEditar && (
                      <td className="px-4 py-2">
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          onClick={(e) => {
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

          {paginacion.last_page > 1 && (
  <div className="flex justify-center items-center gap-2 my-4">
    <button
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      disabled={pagina === 1}
      onClick={() => setPagina(p => Math.max(1, p - 1))}
    >
      Anterior
    </button>
    <span className="text-sm text-gray-700">
      Página {paginacion.current_page} de {paginacion.last_page}
    </span>
    <button
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      disabled={pagina === paginacion.last_page}
      onClick={() => setPagina(p => Math.min(paginacion.last_page, p + 1))}
    >
      Siguiente
    </button>
  </div>
)}
        </div>
      </div>
    </div>
  );
}
