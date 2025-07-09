import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function ObtenerDatosConductores() {
  const [conductores, setConductores] = useState([]);
  const [archivos, setArchivos] = useState({});

  useEffect(() => {
    obtenerConductoresNuevamente();
  }, []);

  const obtenerConductoresNuevamente = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get("/api/datos-conductores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConductores(response.data.data);
    } catch (error) {
      console.error("Error al obtener los datos de los conductores:", error);
      toast.error("Error al cargar la lista de conductores");
    }
  };

  const handleFileChange = (e, id, tipoArchivo) => {
    const file = e.target.files[0];
    setArchivos((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [tipoArchivo]: file,
      },
    }));
  };

const actualizarArchivos = async (id, conductor) => {
  const formData = new FormData();
  const archivosConductor = archivos[id] || {};

  Object.entries(archivosConductor).forEach(([key, file]) => {
    formData.append(key, file);
  });

  // Agrega los campos editables al FormData
  formData.append("tipo_licencia", conductor.tipo_licencia || '');
  formData.append("fecha_expedicion", conductor.fecha_expedicion || '');
  formData.append("fecha_vencimiento", conductor.fecha_vencimiento || '');
  formData.append("categoria", conductor.categoria || '');
  formData.append("grupo_sanguineo", conductor.grupo_sanguineo || '');

  try {
    const token = localStorage.getItem("token");
    const response = await clienteAxios.post(
      `/api/datos-conductores/${id}?_method=PUT`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success(response.data.message);
    obtenerConductoresNuevamente();
  } catch (error) {
    console.error("Error actualizando datos:", error);
    toast.error("Error al actualizar datos del conductor");
  }
};


  return (
    <div className="overflow-x-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Datos de Conductores</h1>
      <Link
        to="/auth/crm/crear-datos-conductores"
        className="bg-gray-700 text-white px-4 py-2 rounded mb-4 inline-block hover:bg-gray-800 transition-colors"
      >
        Registrar Nuevo Conductor
      </Link>

      {conductores.length === 0 ? (
        <p className="text-gray-500">
          No hay Datos de conductores registrados.
        </p>
      ) : (

        <div className="grid grid-cols-1">
        <table className="min-w-full text-sm border border-gray-300 col-span-1">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Conductor</th>
              <th className="border p-2">Cédula</th>
              <th className="border p-2">Licencia</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">F. Exp</th>
              <th className="border p-2">F. Venc</th>
              <th className="border p-2">Categoría</th>
              <th className="border p-2">Grupo</th>
              <th className="border p-2">RUNT</th>
              <th className="border p-2">Licencia</th>
              <th className="border p-2">Comparendo</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {conductores.map((conductor) => (
              <tr key={conductor.id}>
                <td className="border p-2">{conductor.id}</td>
                <td className="border p-2">
                  {conductor.user
                    ? `${conductor.user.name} ${conductor.user.last_name ?? ""}`
                    : "Sin usuario"}
                </td>

                <td className="border p-2">{conductor.cedula}</td>
              

                <td className="border p-2">
                  {conductor.licencia_conduccion || "Sin licencia"}
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    value={conductor.tipo_licencia || ""}
                    onChange={(e) => {
                      const nuevoValor = e.target.value;  
                      setConductores((prev) =>
                        prev.map((c) =>
                          c.id === conductor.id
                            ? { ...c, tipo_licencia: nuevoValor }
                            : c
                        )
                      );
                    }}
                    className="text-xs w-full border px-1"
                  />
                </td>

              <td className="border p-2">
                <input
                  type="date"
                  value={conductor.fecha_expedicion || ""}    
                  onChange={(e) => {
                    const nuevoValor = e.target.value;
                    setConductores((prev) =>
                      prev.map((c) =>
                        c.id === conductor.id
                          ? { ...c, fecha_expedicion: nuevoValor }
                          : c
                      )
                    );
                  }}
                  className="text-xs w-full border px-1"
                />
              </td>
            <td className="border p-2">
              <input
                type="date"
                value={conductor.fecha_vencimiento || ""}
                onChange={(e) => {
                  const nuevoValor = e.target.value;
                  setConductores((prev) =>
                    prev.map((c) =>
                      c.id === conductor.id
                        ? { ...c, fecha_vencimiento: nuevoValor }   
                        : c
                    )
                  );
                }}
                className="text-xs w-full border px-1"
              />
            </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={conductor.categoria || ""}
                    onChange={(e) => {
                      const nuevoValor = e.target.value;
                      setConductores((prev) =>
                        prev.map((c) =>
                          c.id === conductor.id
                            ? { ...c, categoria: nuevoValor }
                            : c
                        )
                      );
                    }}
                    className="text-xs w-full border px-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={conductor.grupo_sanguineo || ""}
                    onChange={(e) => {
                      const nuevoValor = e.target.value;
                      setConductores((prev) =>
                        prev.map((c) =>
                          c.id === conductor.id
                            ? { ...c, grupo: nuevoValor }
                            : c
                        )
                      );
                    }}
                    className="text-xs w-full border px-1"
                  />
                </td>
                {/* RUT */}
                <td className="border p-2">
                  {conductor.rut_archivo && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/storage/${
                        conductor.rut_archivo
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline block"
                    >
                      Ver RUNT
                    </a>
                  )}
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, conductor.id, "rut_archivo")
                    }
                    className="text-xs mt-1"
                  />
                </td>
                {/* Licencia */}
                <td className="border p-2">
                  {conductor.licencia_archivo && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/storage/${
                        conductor.licencia_archivo
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline block"
                    >
                      Ver Licencia
                    </a>
                  )}
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, conductor.id, "licencia_archivo")
                    }
                    className="text-xs mt-1"
                  />
                </td>
                {/* Comparendo */}
                <td className="border p-2">
                  {conductor.comparendo_archivo && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/storage/${
                        conductor.comparendo_archivo
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline block"
                    >
                      Ver Comparendo
                    </a>
                  )}
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, conductor.id, "comparendo_archivo")
                    }
                    className="text-xs mt-1"
                  />
                </td>
                {/* Botón */}
                <td className="border p-2 text-center">
                  <button
                    onClick={() => actualizarArchivos(conductor.id, conductor)}
                    className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                  >
                    Actualizar
                  </button>
                    <Link
    to={`/auth/crm/conductores/${conductor.id}/revisiones`}
    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-700 text-xs block mt-1"
  >
    Revisiones
  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
