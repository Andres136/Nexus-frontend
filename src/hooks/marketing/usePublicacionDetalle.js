import { useState } from "react";
import Swal from "sweetalert2";

const getRealId = (publicacion) => publicacion.id.replace("pub-", "");

export const usePublicacionDetalle = ({ handleUpdateCampos, handleUpdateEstado, handleDelete }) => {
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  const [descripcionInput, setDescripcionInput] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [guardandoLink, setGuardandoLink] = useState(false);
  const [guardandoDescripcion, setGuardandoDescripcion] = useState(false);

  const abrir = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setLinkInput(publicacion.link || "");
    setDescripcionInput(publicacion.descripcion || "");
    setCopiado(false);
  };

  const copiarLink = async (link) => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const guardarLink = async () => {
    setGuardandoLink(true);
    const ok = await handleUpdateCampos(getRealId(selectedPublicacion), { link: linkInput });
    setGuardandoLink(false);
    if (ok) setSelectedPublicacion((prev) => ({ ...prev, link: linkInput }));
  };

  const guardarDescripcion = async () => {
    setGuardandoDescripcion(true);
    const ok = await handleUpdateCampos(getRealId(selectedPublicacion), { descripcion: descripcionInput });
    setGuardandoDescripcion(false);
    if (ok) setSelectedPublicacion((prev) => ({ ...prev, descripcion: descripcionInput }));
  };

  const cambiarEstado = async (nuevoEstado) => {
    await handleUpdateEstado(getRealId(selectedPublicacion), nuevoEstado);
    setSelectedPublicacion((prev) => ({ ...prev, estado: nuevoEstado }));
  };

  const eliminar = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return false;

    await handleDelete(getRealId(selectedPublicacion));
    return true;
  };

  return {
    selectedPublicacion,
    linkInput,
    setLinkInput,
    descripcionInput,
    setDescripcionInput,
    copiado,
    guardandoLink,
    guardandoDescripcion,
    abrir,
    copiarLink,
    guardarLink,
    guardarDescripcion,
    cambiarEstado,
    eliminar,
  };
};
