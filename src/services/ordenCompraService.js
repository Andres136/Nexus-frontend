import clienteAxios from "../config/axios";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchOrdenCompra = (id) =>
  clienteAxios.get(`/api/orden-compras/${id}/edit`, { headers: authHeaders() });

export const createOrdenCompra = (formData) =>
  clienteAxios.post("/api/orden-compras", formData, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
  });

export const updateOrdenCompra = (id, formData) =>
  clienteAxios.post(`/api/orden-compras/${id}?_method=PUT`, formData, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
  });

export const downloadOrdenPdf = (id) => {
  const link = document.createElement("a");
  link.href = `${import.meta.env.VITE_API_URL}/api/orden-compras/${encodeURIComponent(id)}/pdf`;
  link.setAttribute("download", `orden_compra_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
