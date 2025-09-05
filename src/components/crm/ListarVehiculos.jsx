// src/pages/ListarVehiculos.jsx
import { Link, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useAuth } from "../../hooks/useAuth";

import { useListarVehiculos } from "../../hooks/useListarVehiculos";

export default function ListarVehiculos() {
  const { user } = useAuth({ middleware: "auth" });

  const navigate = useNavigate();

  const {
    // datos y control
    vehiculos,
    loading,
    search,
    page,
    setSearch,
    setPage,

    // UI
    expanded,
    toggleExpand,
    fotosPorVehiculo,
    abrirLightbox,
    openLightbox,
    galeria,
    cerrarLightbox,

    // tablas internas
    actualizarPagina,
    actualizarFecha,
    manejarCambioArchivo,
    manejarCambioFecha,
    guardarFechasDocumento,
    obtenerPagina,
    obtenerFecha,
    filtrarYPaginar,

    // acciones
    eliminarVehiculo,

    // util de documentos
    diasHasta,
    estadoDoc,
    resumenDocumentos,
    eliminarRegistro,
    getFechaEdit,
  } = useListarVehiculos();
  // Agregar después de la línea del hook
  const calcularPaginacionInterna = (items, itemsPorPagina = 3) => {
    const total = items?.length || 0;
    const totalPaginas = Math.ceil(total / itemsPorPagina) || 1;
    return { total, totalPaginas };
  };

  return (
    <div className="p-4 grid grid-cols-1 gap-4">
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
            const resumen = resumenDocumentos(vehiculo);

            return (
              <div key={vehiculo.id} className="border rounded mb-4 shadow">
                {/* Header de tarjeta */}
                <div
                  className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 p-4 gap-4 cursor-pointer"
                  onClick={() => toggleExpand(vehiculo.id)}
                >
                  {/* Foto */}
                  <img
                    src={encodeURI(
                      `${import.meta.env.VITE_API_URL}/storage/${vehiculo.foto}`
                    )}
                    alt={`Foto de ${vehiculo.placa}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = encodeURI(
                        `${import.meta.env.VITE_API_URL}/storage/${
                          vehiculo.foto
                        }`
                      );
                      abrirLightbox([{ src: url }]);
                    }}
                    className="w-28 h-20 object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                  />

                  {/* Datos principales */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {vehiculo.placa} — {vehiculo.marca} {vehiculo.modelo}
                    </h3>

                    {/* Chips de atributos */}
                    <div className="flex flex-wrap gap-2 text-xs mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Tipo: {vehiculo.tipo}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Modelo: {vehiculo.modelo}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                        Marca: {vehiculo.marca}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Licencia: {vehiculo.licencia_transito}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Conductor: {vehiculo.conductor}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Año: {vehiculo.anio}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                        Estado: {vehiculo.estado}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Km actual:{" "}
                        {vehiculo.kilometraje_actual?.toLocaleString("es-CO")}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Nombre: {vehiculo.nombre}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Servicio: {vehiculo.tipo_servicio}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Color: {vehiculo.color}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                        Carrocería: {vehiculo.tipo_carroceria}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Combustible: {vehiculo.tipo_combustible}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Motor: {vehiculo.numero_motor}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Chasis: {vehiculo.numero_chasis}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                        Propietario: {vehiculo.propietario}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Identificación: {vehiculo.identificacion}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Organismo: {vehiculo.organismo_transito}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        F. matrícula: {vehiculo.fecha_matricula}
                      </span>
                    </div>

                    {/* Resumen Documentos con enlaces */}
                    <div className="flex flex-wrap gap-2 text-xs mt-2">
                      <p
                        className="px-2 py-0.5 rounded bg-red-100 text-red-800 underline"
                        title="Ver documentos vencidos del vehículo"
                      >
                        ❌ Vencidos: {resumen.vencidos}
                      </p>

                      <p
                        className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 underline"
                        title="Ver documentos por vencer del vehículo"
                      >
                        ⚠️ Por vencer: {resumen.porVencer}
                      </p>

                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">
                        ✅ Vigentes: {resumen.vigentes}
                      </span>

                      {resumen.masUrgente && (
                        <p
                          className="ml-2 underline text-blue-700"
                          title="Ir al documento más urgente del vehículo"
                        >
                          🔔 Más urgente: {resumen.masUrgente.tipo} ·{" "}
                          {new Date(
                            resumen.masUrgente.fecha
                          ).toLocaleDateString("es-CO")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap justify-end gap-3 mt-4">
                    <Link
                      to={`/auth/crm/vehiculos/${vehiculo.id}/fotos`}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      📤 Subir más fotos
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auth/crm/vehiculos/${vehiculo.id}/editar`);
                      }}
                      className="bg-yellow-500 text-white px-4 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      ✏️ Editar
                    </button>
                    {user?.role_id === 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarVehiculo(vehiculo.id);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        Eliminar Vehículo
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel expandible */}
                {expanded === vehiculo.id && (
                  <div className="p-4 bg-white text-sm space-y-6">
                    {/* Galería de fotos (si hay) */}
                    {fotosPorVehiculo[vehiculo.id]?.length > 0 && (
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
                                const slides = (
                                  fotosPorVehiculo[vehiculo.id] || []
                                ).map((f) => ({
                                  src: `${
                                    import.meta.env.VITE_API_URL
                                  }/storage/${f.ruta_foto}`,
                                }));
                                abrirLightbox(slides);
                              }}
                              className="w-28 h-20 object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secciones: mantenimientos, documentos, inspecciones */}
                    {["mantenimientos", "documentos", "inspecciones"].map(
                      (seccion) => (
                        <div key={seccion} className="mt-4">
                          <h4 className="font-semibold mb-2">
                            {seccion === "mantenimientos" &&
                              "🛠️ Mantenimientos"}
                            {seccion === "documentos" && "📄 Documentos"}
                            {seccion === "inspecciones" && "🧪 Inspecciones"}
                          </h4>

                          {/* Filtro por fecha */}
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

                          {/* Si es documentos, mostrar urgentes arriba (top 5) */}
                          {seccion === "documentos" &&
                            (() => {
                              const docs = vehiculo.documentos || [];
                              const urgentes = docs
                                .filter((d) =>
                                  ["VENCIDO", "POR_VENCER"].includes(
                                    estadoDoc(d.fecha_vencimiento)
                                  )
                                )
                                .sort(
                                  (a, b) =>
                                    diasHasta(a.fecha_vencimiento) -
                                    diasHasta(b.fecha_vencimiento)
                                )
                                .slice(0, 5);

                              return urgentes.length > 0 ? (
                                <div className="mb-2 p-2 rounded bg-amber-50 border border-amber-200">
                                  <div className="flex items-center justify-between">
                                    <strong className="text-amber-800">
                                      ⚠️ Documentos urgentes
                                    </strong>
                                  </div>
                                  <ul className="mt-1 text-xs text-amber-900 space-y-1">
                                    {urgentes.map((d) => (
                                      <li
                                        key={d.id}
                                        className="flex items-center justify-between"
                                      >
                                        <span>
                                          {d.tipo_documento} · vence{" "}
                                          {new Date(
                                            d.fecha_vencimiento
                                          ).toLocaleDateString("es-CO")}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded ${
                                            diasHasta(d.fecha_vencimiento) < 0
                                              ? "bg-red-100 text-red-700"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {diasHasta(d.fecha_vencimiento) < 0
                                            ? "VENCIDO"
                                            : `${diasHasta(
                                                d.fecha_vencimiento
                                              )} días`}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null;
                            })()}

                          {/* Tabla */}
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
                                    <th>Acciones</th>
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
                                    <th>Eliminar</th>
                                  </tr>
                                )}
                                {seccion === "inspecciones" && (
                                  <tr>
                                    <th>Fecha</th>
                                    <th>Responsable</th>
                                    <th>Estado</th>
                                    <th>Archivo</th>
                                    <th>Acciones</th>
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
                                    {/* MANTENIMIENTOS */}
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
                                                  abrirLightbox([
                                                    {
                                                      src: `${
                                                        import.meta.env
                                                          .VITE_API_URL
                                                      }/storage/${
                                                        item.archivo
                                                      }`,
                                                    },
                                                  ]);
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
                                        <td>
                                          {user.id && user.role_id === 1 && (
                                            <button
                                              onClick={() =>
                                                eliminarRegistro(
                                                  item.id,
                                                  "mantenimientos"
                                                )
                                              }
                                              className="text-red-600 hover:underline"
                                            >
                                              Eliminar
                                            </button>
                                          )}
                                        </td>
                                      </>
                                    )}

                                    {/* DOCUMENTOS */}
                                    {seccion === "documentos" && (
                                      <>
                                        <td>{item.tipo_documento}</td>

                                        <td>
                                          <input
                                            type="date"
                                            className="border rounded p-1 text-sm"
                                            value={getFechaEdit(
                                              item,
                                              "fecha_vencimiento"
                                            )} // <— AHORA lee del buffer
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
                                            value={getFechaEdit(
                                              item,
                                              "fecha_renovacion"
                                            )} // <— AHORA lee del buffer
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
                                            const est = estadoDoc(
                                              item.fecha_vencimiento
                                            );
                                            if (est === "VENCIDO") {
                                              return (
                                                <span className="text-red-600 font-bold">
                                                  ❌ Vencido
                                                </span>
                                              );
                                            }
                                            if (est === "POR_VENCER") {
                                              return (
                                                <span className="text-yellow-600 font-semibold">
                                                  ⚠️ Por vencer
                                                </span>
                                              );
                                            }
                                            return (
                                              <span className="text-green-600">
                                                ✅ Vigente
                                              </span>
                                            );
                                          })()}
                                        </td>
                                        <td>
                                          {item.documento_pdf ? (
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
                                          ) : (
                                            <span className="text-gray-400 italic">
                                              No adjunto
                                            </span>
                                          )}
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
                                        <td>
                                          {user.id && user.role_id === 1 && (
                                            <button
                                              onClick={() =>
                                                eliminarRegistro(
                                                  item.id,
                                                  "documentos"
                                                )
                                              }
                                              className="text-red-600 hover:underline"
                                            >
                                              Eliminar
                                            </button>
                                          )}
                                        </td>
                                      </>
                                    )}

                                    {/* INSPECCIONES */}
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
                                        <td>
                                          {user.id && user.role_id === 1 && (
                                            <button
                                              onClick={() =>
                                                eliminarRegistro(
                                                  item.id,
                                                  "inspecciones"
                                                )
                                              }
                                              className="text-red-600 hover:underline"
                                            >
                                              Eliminar
                                            </button>
                                          )}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Paginación interna de sección */}
                          {/* Paginación interna de sección MEJORADA */}
                          {(() => {
                            const { total, totalPaginas } =
                              calcularPaginacionInterna(vehiculo[seccion]);
                            const paginaActual = obtenerPagina(
                              vehiculo.id,
                              seccion
                            );

                            return (
                              <div className="flex justify-center items-center gap-3 mt-3 bg-gray-50 p-3 rounded">
                                <button
                                  onClick={() =>
                                    actualizarPagina(
                                      vehiculo.id,
                                      seccion,
                                      Math.max(paginaActual - 1, 1)
                                    )
                                  }
                                  disabled={paginaActual === 1}
                                  className="flex items-center px-3 py-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors text-sm"
                                >
                                  ⬅️ Anterior
                                </button>

                                <div className="flex items-center space-x-2">
                                  <span className="text-sm px-3 py-1 bg-blue-50 border border-blue-200 rounded font-medium">
                                    Página {paginaActual} de {totalPaginas}
                                  </span>

                                  <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded">
                                    {total} {seccion}
                                  </span>

                                  {/* Indicador cuando todo está en una página */}
                                  {totalPaginas === 1 && total > 0 && (
                                    <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded">
                                      ✅ Todos en una página
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    actualizarPagina(
                                      vehiculo.id,
                                      seccion,
                                      paginaActual + 1
                                    )
                                  }
                                  disabled={paginaActual >= totalPaginas}
                                  className="flex items-center px-3 py-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors text-sm"
                                >
                                  Siguiente ➡️
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Lightbox global */}
          <Lightbox
            open={openLightbox}
            close={cerrarLightbox}
            slides={galeria}
          />

          {/* Paginador principal */}
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
