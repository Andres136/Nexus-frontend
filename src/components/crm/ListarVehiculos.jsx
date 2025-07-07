// IMPORTACIONES Y CONFIGURACIÓN
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { useAuth } from "../../hooks/useAuth";
import "yet-another-react-lightbox/styles.css";
import Lightbox from "yet-another-react-lightbox";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function ListarVehiculos() {
  const { user } = useAuth({ middleware: "auth" });
  const [archivosEditados, setArchivosEditados] = useState({});

  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [imagenActual, setImagenActual] = useState("");

  const [paginasInternas, setPaginasInternas] = useState({});
  const [fechasInternas, setFechasInternas] = useState({});
  const [fotosPorVehiculo, setFotosPorVehiculo] = useState({});
  const [galeria, setGaleria] = useState([]);
  const [edicionFechas, setEdicionFechas] = useState({});

  const fetchVehiculos = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        `/api/vehiculos-all?search=${search}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVehiculos(response.data.vehiculos);
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
    }
    setLoading(false);
  };

  const cargarFotosVehiculo = async (vehiculoId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await clienteAxios.get(
        `/api/vehiculos/${vehiculoId}/fotos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFotosPorVehiculo((prev) => ({
        ...prev,
        [vehiculoId]: response.data, // si el array viene como [] directo
      }));
    } catch (error) {
      console.error("Error al cargar fotos del vehículo", error);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, [search, page]);

  const filtrarYPaginar = (items, fecha, pagina, porPagina = 3) => {
    const filtrado = fecha
      ? items.filter(
          (i) =>
            i.fecha_programada === fecha ||
            i.fecha_vencimiento === fecha ||
            i.fecha === fecha
        )
      : items;
    const inicio = (pagina - 1) * porPagina;
    return filtrado.slice(inicio, inicio + porPagina);
  };

  const actualizarPagina = (vehiculoId, seccion, nuevaPagina) => {
    setPaginasInternas((prev) => ({
      ...prev,
      [vehiculoId]: {
        ...prev[vehiculoId],
        [seccion]: nuevaPagina,
      },
    }));
  };

  const manejarCambioArchivo = (documentoId, archivo) => {
    setArchivosEditados((prev) => ({
      ...prev,
      [documentoId]: archivo,
    }));
  };

  const manejarCambioFecha = (documentoId, campo, valor) => {
    setEdicionFechas((prev) => ({
      ...prev,
      [documentoId]: {
        ...(prev[documentoId] || {}),
        [campo]: valor,
      },
    }));
  };

  const actualizarFecha = (vehiculoId, seccion, nuevaFecha) => {
    setFechasInternas((prev) => ({
      ...prev,
      [vehiculoId]: {
        ...prev[vehiculoId],
        [seccion]: nuevaFecha,
      },
    }));
  };

  const guardarFechasDocumento = async (documentoId) => {
    const datos = edicionFechas[documentoId];

    if (!datos?.fecha_vencimiento)
      return toast.error("La fecha de vencimiento es obligatoria");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("fecha_vencimiento", datos.fecha_vencimiento);
      formData.append("fecha_renovacion", datos.fecha_renovacion ?? "");

      if (archivosEditados[documentoId]) {
        formData.append("documento_pdf", archivosEditados[documentoId]);
      }

      await clienteAxios.post(
        `/api/documentos/${documentoId}/fechas?_method=PUT`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Fechas actualizadas correctamente");
      fetchVehiculos(); // refresca la lista
      setEdicionFechas((prev) => {
        const nuevo = { ...prev };
        delete nuevo[documentoId];
        return nuevo;
      });
    } catch (error) {
      console.error("Error al actualizar fechas", error);
      toast.error("No se pudieron guardar las fechas");
    }
  };

  //Eliminar un vehiculo
  const handleEliminar = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (resultado.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await clienteAxios.delete(`/api/vehiculos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await Swal.fire(
          "¡Eliminado!",
          "El vehículo fue eliminado correctamente.",
          "success"
        );

        fetchVehiculos(); // ⚠️ Refresca la lista en vez de navegar
      } catch (error) {
        console.error("Error al eliminar el vehículo:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al intentar eliminar el vehículo.",
          "error"
        );
      }
    }
  };

  const obtenerPagina = (id, seccion) => paginasInternas[id]?.[seccion] || 1;
  const obtenerFecha = (id, seccion) => fechasInternas[id]?.[seccion] || "";

  return (
    <div className="p-4 grid grid-cols-1  gap-4">
      <h2 className="text-xl font-bold mb-4">Vehículos</h2>
      <div className="flex justify-start mb-2">
        <Link
          to="/auth/crm/vehiculos"
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm inline-block"
        >
          ← Volver
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por placa, modelo o marca"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="border rounded p-2 mb-4 w-full max-w-md"
      />

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : (
        <>
          {vehiculos.data.map((vehiculo) => {
            return (
              <div key={vehiculo.id} className="border rounded mb-4 shadow">
                <div
                  className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 p-4 gap-4 cursor-pointer"
                  onClick={() => {
                    setExpanded(expanded === vehiculo.id ? null : vehiculo.id);
                    if (!fotosPorVehiculo[vehiculo.id]) {
                      cargarFotosVehiculo(vehiculo.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={encodeURI(
                        `${import.meta.env.VITE_API_URL}/storage/${
                          vehiculo.foto
                        }`
                      )}
                      alt={`Foto de ${vehiculo.placa}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = encodeURI(
                          `${import.meta.env.VITE_API_URL}/storage/${
                            vehiculo.foto
                          }`
                        );
                        setGaleria([{ src: url }]); // <-- importante
                        setOpenLightbox(true);
                      }}
                      className="w-28 h-20 object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {vehiculo.placa} — {vehiculo.marca} {vehiculo.modelo}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Tipo: {vehiculo.tipo}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Modelo : {vehiculo.modelo}
                        </span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                          Marca: {vehiculo.marca}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Licencia Transito: {vehiculo.licencia_transito}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Conductor Asiginado {vehiculo.conductor}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Año: {vehiculo.anio}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                          Estado: {vehiculo.estado}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Km actual:{" "}
                          {vehiculo.kilometraje_actual.toLocaleString("es-CO")}
                        </span>

                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          nombre: {vehiculo.nombre}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Tipo de servicio: {vehiculo.tipo_servicio}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Color: {vehiculo.color}
                        </span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                          Tipo de carrocería: {vehiculo.tipo_carroceria}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Tipo de combustible: {vehiculo.tipo_combustible}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Número de motor: {vehiculo.numero_motor}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Número de chasis: {vehiculo.numero_chasis}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                          Propietario: {vehiculo.propietario}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Identificación: {vehiculo.identificacion}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Organismo de tránsito: {vehiculo.organismo_transito}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Fecha de matrícula: {vehiculo.fecha_matricula}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 mt-4">
                    <Link
                      to={`/auth/crm/vehiculos/${vehiculo.id}/fotos`}
                      className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      📤 Subir más fotos
                    </Link>
                    <button
                      onClick={() =>
                        navigate(`/auth/crm/vehiculos/${vehiculo.id}/editar`)
                      }
                      className="bg-yellow-500 text-white px-4 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      ✏️ Editar
                    </button>

                    {user?.role_id === 1 && (
                      <button
                        onClick={() => handleEliminar(vehiculo.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        Eliminar Vehículo
                      </button>
                    )}
                  </div>
                </div>

                {expanded === vehiculo.id && (
                  <div className="p-4 bg-white text-sm space-y-6">
                    {fotosPorVehiculo[vehiculo.id] &&
                      fotosPorVehiculo[vehiculo.id].length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-lg font-semibold mb-2">
                            📷 Galería del Vehículo
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {fotosPorVehiculo[vehiculo.id].map((foto) => (
                              <img
                                key={foto.id}
                                src={`${import.meta.env.VITE_API_URL}/storage/${
                                  foto.ruta_foto
                                }`}
                                alt={`Foto ${foto.id}`}
                                onClick={() => {
                                  const fotos =
                                    fotosPorVehiculo[vehiculo.id] || [];
                                  const slides = fotos.map((f) => ({
                                    src: `${
                                      import.meta.env.VITE_API_URL
                                    }/storage/${f.ruta_foto}`,
                                  }));
                                  setGaleria(slides);
                                  setOpenLightbox(true);
                                }}
                                className="w-28 h-20 object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    {["mantenimientos", "documentos", "inspecciones"].map(
                      (seccion) => (
                        <div key={seccion} className="mt-4">
                          <h4 className="font-semibold mb-2">
                            {seccion === "mantenimientos" &&
                              "🛠️ Mantenimientos"}
                            {seccion === "documentos" && "📄 Documentos"}
                            {seccion === "inspecciones" && "🧪 Inspecciones"}
                          </h4>

                          <input
                            type="date"
                            value={obtenerFecha(vehiculo.id, seccion)}
                            onChange={(e) =>
                              actualizarFecha(
                                vehiculo.id,
                                seccion,
                                e.target.value
                              )
                            }
                            className="mb-2 border rounded p-1 text-sm"
                          />

                          <div className="overflow-x-auto">
                            <table className="min-w-full table-auto text-sm border border-gray-200">
                              <thead className="bg-gray-200 text-gray-700">
                                {seccion === "mantenimientos" && (
                                  <tr>
                                    <th>Próximo</th>
                                  <th>Kilometraje Programado</th>
                                    <th>Realizado</th>
                                    <th>Tipo</th>
                                    <th>Taller</th>
                                    <th>Soporte</th>
                                    <th>Trabajo</th>
                                    <th>Costo</th>
                                  </tr>
                                )}
                                {seccion === "documentos" && (
                                  <tr>
                                    <th>Tipo</th>
                                    <th>Vencimiento</th>
                                    <th>Renovación</th>
                                    <th>Estado</th>
                                    <th>PDF</th>
                                    <th>Guardar</th>
                                  </tr>
                                )}
                                {seccion === "inspecciones" && (
                                  <tr>
                                    <th>Fecha</th>
                                    <th>Responsable</th>
                                    <th>Estado</th>
                                    <th>Archivo</th>
                                  </tr>
                                )}
                              </thead>
                              <tbody>
                                {filtrarYPaginar(
                                  vehiculo[seccion],
                                  obtenerFecha(vehiculo.id, seccion),
                                  obtenerPagina(vehiculo.id, seccion)
                                ).map((item) => (
                                  <tr
                                    key={item.id}
                                    className="border-t text-center"
                                  >
                                    {seccion === "mantenimientos" && (
                                      <>
                                        <td>{item.fecha_programada}</td>
                                        <td>{item.kilometro_programado}</td>
                                        <td>
                                          {item.fecha_realizado ?? (
                                            <i className="text-gray-400">
                                              Pendiente
                                            </i>
                                          )}
                                        </td>
                                        <td>{item.tipo_mantenimiento}</td>
                                        <td>{item.taller}</td>
                                        <td>
                                          {item.archivo ? (
                                            item.archivo.endsWith(".pdf") ? (
                                              <a
                                                href={encodeURI(
                                                  `${
                                                    import.meta.env.VITE_API_URL
                                                  }/storage/${item.archivo}`
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                              >
                                                📄 Ver PDF
                                              </a>
                                            ) : (
                                              <img
                                                src={encodeURI(
                                                  `${
                                                    import.meta.env.VITE_API_URL
                                                  }/storage/${item.archivo}`
                                                )}
                                                alt="Soporte"
                                                onClick={() => {
                                                  setImagenActual(
                                                    `${
                                                      import.meta.env
                                                        .VITE_API_URL
                                                    }/storage/${item.archivo}`
                                                  );
                                                  setGaleria([
                                                    {
                                                      src: `${
                                                        import.meta.env
                                                          .VITE_API_URL
                                                      }/storage/${
                                                        item.archivo
                                                      }`,
                                                    },
                                                  ]);
                                                  setOpenLightbox(true);
                                                }}
                                                className="w-16 h-16 object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                                              />
                                            )
                                          ) : (
                                            <span className="text-gray-400 italic">
                                              No disponible
                                            </span>
                                          )}
                                        </td>

                                        <td>{item.descripcion_trabajo}</td>
                                        <td>
                                          $
                                          {parseFloat(
                                            item.costo
                                          ).toLocaleString("es-CO")}
                                        </td>
                                      </>
                                    )}
                                    {seccion === "documentos" && (
                                      <>
                                        <td>{item.tipo_documento}</td>
                                        <td>
                                          <input
                                            type="date"
                                            className="border rounded p-1 text-sm"
                                            value={
                                              edicionFechas[item.id]
                                                ?.fecha_vencimiento ??
                                              item.fecha_vencimiento
                                            }
                                            onChange={(e) =>
                                              manejarCambioFecha(
                                                item.id,
                                                "fecha_vencimiento",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="date"
                                            className="border rounded p-1 text-sm"
                                            value={
                                              edicionFechas[item.id]
                                                ?.fecha_renovacion ??
                                              item.fecha_renovacion
                                            }
                                            onChange={(e) =>
                                              manejarCambioFecha(
                                                item.id,
                                                "fecha_renovacion",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>

                                        <td>
                                          {(() => {
                                            const hoy = new Date();
                                            const vencimiento = new Date(
                                              item.fecha_vencimiento
                                            );
                                            const diasRestantes = Math.ceil(
                                              (vencimiento - hoy) /
                                                (1000 * 60 * 60 * 24)
                                            );

                                            if (diasRestantes < 0) {
                                              return (
                                                <span className="text-red-600 font-bold">
                                                  ❌ Vencido
                                                </span>
                                              );
                                            } else if (diasRestantes <= 30) {
                                              return (
                                                <span className="text-yellow-600 font-semibold">
                                                  ⚠️ Por vencer
                                                </span>
                                              );
                                            } else {
                                              return (
                                                <span className="text-green-600">
                                                  ✅ Vigente
                                                </span>
                                              );
                                            }
                                          })()}
                                        </td>

                                        <td>
                                          <a
                                            href={encodeURI(
                                              `${
                                                import.meta.env.VITE_API_URL
                                              }/storage/${item.documento_pdf}`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline"
                                          >
                                            Ver
                                          </a>
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) =>
                                              manejarCambioArchivo(
                                                item.id,
                                                e.target.files[0]
                                              )
                                            }
                                            className="text-xs mt-1 p-2"
                                          />
                                        </td>

                                        <td>
                                          <button
                                            onClick={() =>
                                              guardarFechasDocumento(item.id)
                                            }
                                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                          >
                                            Guardar
                                          </button>
                                        </td>
                                      </>
                                    )}
                                    {seccion === "inspecciones" && (
                                      <>
                                        <td>{item.fecha}</td>
                                        <td>{item.responsable}</td>
                                        <td>{item.estado_general}</td>
                                        <td>
                                          {item.documento ? (
                                            <a
                                              href={`${
                                                import.meta.env.VITE_API_URL
                                              }/storage/${item.documento}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                              download
                                            >
                                              Descargar
                                            </a>
                                          ) : (
                                            <span className="text-gray-400 italic">
                                              No adjunto
                                            </span>
                                          )}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-center gap-3 mt-2">
                            <button
                              onClick={() =>
                                actualizarPagina(
                                  vehiculo.id,
                                  seccion,
                                  Math.max(
                                    obtenerPagina(vehiculo.id, seccion) - 1,
                                    1
                                  )
                                )
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              ⬅️
                            </button>
                            <span className="text-sm px-2 py-1 border rounded">
                              Página {obtenerPagina(vehiculo.id, seccion)}
                            </span>
                            <button
                              onClick={() =>
                                actualizarPagina(
                                  vehiculo.id,
                                  seccion,
                                  obtenerPagina(vehiculo.id, seccion) + 1
                                )
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
                              disabled={
                                filtrarYPaginar(
                                  vehiculo[seccion],
                                  obtenerFecha(vehiculo.id, seccion),
                                  obtenerPagina(vehiculo.id, seccion)
                                ).length < 3
                              }
                            >
                              ➡️
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Lightbox
            open={openLightbox}
            close={() => {
              setOpenLightbox(false);
              setGaleria([]);
            }}
            slides={galeria}
          />

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={vehiculos.current_page === 1}
              className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-1 border">
              Página {vehiculos.current_page} de {vehiculos.last_page}
            </span>
            <button
              onClick={() =>
                setPage((prev) =>
                  prev < vehiculos.last_page ? prev + 1 : prev
                )
              }
              disabled={vehiculos.current_page === vehiculos.last_page}
              className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
