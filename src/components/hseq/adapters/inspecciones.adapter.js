// src/modules/hseq/adapters/inspecciones.adapter.js

export const mapInspeccionesToEvents = (inspecciones = []) => {
  return inspecciones.map(i => ({
    id: `insp-${i.id}`,
    title: i.tipo_inspeccion?.nombre || "Inspección",
    start: i.fecha,

    extendedProps: {
      usuario: i.responsable?.name || "N/A",   // 👈 AQUÍ
      sede: i.sede?.nombre || "N/A",
      tipo: i.tipo_inspeccion?.nombre || "Inspección",
      asignado_a: null, // 👈 no existe en tu modelo
      estado: i.estado || "pendiente",
      tipo_inspeccion_id: i.tipo_inspeccion_id,
      fullData: i, // 👈 para tener toda la info disponible al hacer click en el evento
    }
  }))
}