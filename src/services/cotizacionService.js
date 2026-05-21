import clienteAxios from "../config/axios";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchCotizacion = (id) =>
  clienteAxios.get(`/api/cotizaciones/${id}`, { headers: authHeaders() });

export const createCotizacion = (data) =>
  clienteAxios.post("/api/cotizaciones", data, { headers: authHeaders() });

export const updateCotizacion = (id, data) =>
  clienteAxios.put(`/api/cotizaciones/${id}`, data, { headers: authHeaders() });

export const downloadCotizacionPdf = (id) => {
  const link = document.createElement("a");
  link.href = `${import.meta.env.VITE_API_URL}/api/cotizaciones/${encodeURIComponent(id)}/pdf`;
  link.setAttribute("download", `cotizacion_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
