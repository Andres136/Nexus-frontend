export const mapPublicacionesToEvents = (publicaciones = []) => {
  return publicaciones.map((p) => ({
    id: `pub-${p.id}`,
    title: p.titulo,
    start: p.fecha,

    extendedProps: {
      usuario: p.responsable?.name || "N/A",
      red: p.red_social?.nombre || "N/A",
      sede: p.red_social?.nombre || "N/A", // reutiliza el slot de meta del calendario compartido
      tipo: p.tipo_post?.nombre || "N/A",
      estado: p.estado || "programado",
      link: p.link || "",
      descripcion: p.descripcion || "",
      red_social_id: p.red_social_id,
      tipo_post_id: p.tipo_post_id,
      fullData: p,
    },
  }));
};
