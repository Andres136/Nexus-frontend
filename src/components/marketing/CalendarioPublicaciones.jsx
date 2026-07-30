import { useState } from "react";
import Swal from "sweetalert2";
import { Megaphone } from "lucide-react";

import MantenimientoCalendar from "../tic/MantenimientoCalendar";
import { useGetPublicaciones } from "../../hooks/marketing/useGetPublicaciones";
import { useRegistrarPublicacion } from "../../hooks/marketing/useRegistrarPublicacion";
import { useCatalogosMarketing } from "../../hooks/marketing/useCatalogosMarketing";
import { usePublicacionDetalle } from "../../hooks/marketing/usePublicacionDetalle";
import { mapPublicacionesToEvents } from "./adapters/publicaciones.adapter";
import {
  ESTADOS_FILTRO,
  ESTADO_COLORES,
  ESTADO_BADGES,
  ESTADO_BG_CLASES,
} from "./constants/publicaciones.constants";
import PublicacionFormModal from "./PublicacionFormModal";
import PublicacionDetalleModal from "./PublicacionDetalleModal";

const preguntarNombre = (title, inputPlaceholder) =>
  Swal.fire({
    title,
    input: "text",
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: "Crear",
    cancelButtonText: "Cancelar",
  }).then((res) => res.value);

export default function CalendarioPublicaciones() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState(null); // create | view

  const { data: publicaciones, isLoading } = useGetPublicaciones();
  const { redesSociales, tiposPost, crearRedSocial, crearTipoPost } = useCatalogosMarketing();

  const {
    formData,
    handleChange,
    handleSubmit,
    handleUpdateEstado,
    handleUpdateCampos,
    handleDelete,
    loading,
    error,
  } = useRegistrarPublicacion();

  const detalle = usePublicacionDetalle({ handleUpdateCampos, handleUpdateEstado, handleDelete });

  const events = mapPublicacionesToEvents(publicaciones || []);

  const handleDateClick = (date) => {
    handleChange({ target: { name: "fecha", value: date } });
    setModalView("create");
    setModalOpen(true);
  };

  const handleEventClick = (data) => {
    detalle.abrir(data);
    setModalView("view");
    setModalOpen(true);
  };

  const handleNuevaRedSocial = async () => {
    const nombre = await preguntarNombre("Nueva red social", "Ej: Pinterest");
    if (!nombre) return;
    const creada = await crearRedSocial(nombre);
    if (creada) handleChange({ target: { name: "red_social_id", value: creada.id } });
  };

  const handleNuevoTipoPost = async () => {
    const nombre = await preguntarNombre("Nuevo tipo de post", "Ej: Encuesta");
    if (!nombre) return;
    const creado = await crearTipoPost(nombre);
    if (creado) handleChange({ target: { name: "tipo_post_id", value: creado.id } });
  };

  const onSubmitCreate = async (e) => {
    const ok = await handleSubmit(e);
    if (ok) setModalOpen(false);
  };

  const onEliminar = async () => {
    const eliminado = await detalle.eliminar();
    if (eliminado) setModalOpen(false);
  };

  return (
    <div>
      <MantenimientoCalendar
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        title="Cronograma de Publicaciones"
        subtitle="Planeación de contenido en redes sociales"
        icon={Megaphone}
        loading={isLoading}
        estadosFiltro={ESTADOS_FILTRO}
        estadoColores={ESTADO_COLORES}
        estadoBadges={ESTADO_BADGES}
        estadoBgClases={ESTADO_BG_CLASES}
        variant="light"
      />

      {modalOpen && modalView === "create" && (
        <PublicacionFormModal
          formData={formData}
          handleChange={handleChange}
          onSubmit={onSubmitCreate}
          onCancel={() => setModalOpen(false)}
          loading={loading}
          error={error}
          redesSociales={redesSociales}
          tiposPost={tiposPost}
          onNuevaRedSocial={handleNuevaRedSocial}
          onNuevoTipoPost={handleNuevoTipoPost}
        />
      )}

      {modalOpen && modalView === "view" && detalle.selectedPublicacion && (
        <PublicacionDetalleModal
          publicacion={detalle.selectedPublicacion}
          linkInput={detalle.linkInput}
          setLinkInput={detalle.setLinkInput}
          descripcionInput={detalle.descripcionInput}
          setDescripcionInput={detalle.setDescripcionInput}
          copiado={detalle.copiado}
          guardandoLink={detalle.guardandoLink}
          guardandoDescripcion={detalle.guardandoDescripcion}
          onCopiarLink={detalle.copiarLink}
          onGuardarLink={detalle.guardarLink}
          onGuardarDescripcion={detalle.guardarDescripcion}
          onCambiarEstado={detalle.cambiarEstado}
          onEliminar={onEliminar}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
