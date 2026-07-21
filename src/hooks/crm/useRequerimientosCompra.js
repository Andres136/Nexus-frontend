import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useProducts } from "../useProducts";
import {
  empresaApi,
  proveedoresApi,
  requerimientosCompraApi,
  sedesApi,
} from "../../services/api";

export const ESTADOS_REQUERIMIENTO_COMPRA = [
  { value: "", label: "Todos" },
  { value: "solicitado", label: "Solicitado" },
  { value: "en_analisis", label: "En analisis" },
  { value: "aprobado", label: "Aprobado" },
  { value: "oc_generada", label: "OC generada" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
];

export const PRIORIDADES_REQUERIMIENTO_COMPRA = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
];

export const estadoRequerimientoCompraStyles = {
  solicitado: "bg-blue-50 text-blue-700 border-blue-200",
  en_analisis: "bg-amber-50 text-amber-700 border-amber-200",
  aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  oc_generada: "bg-purple-50 text-purple-700 border-purple-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
  cancelado: "bg-gray-50 text-gray-700 border-gray-200",
};

export const emptyDetalleRequerimientoCompra = {
  producto_id: "",
  cantidad_solicitada: 1,
  costo_estimado: "",
  proveedor_sugerido_id: "",
  referencia_sugerida: "",
  observacion: "",
};

export const initialRequerimientoCompraForm = {
  bodega_id: "",
  prioridad: "normal",
  fecha_requerida: "",
  observacion: "",
  detalles: [{ ...emptyDetalleRequerimientoCompra }],
};

export const initialRequerimientoCompraFilters = {
  search: "",
  estado: "",
  sede_id: "",
  fecha_inicio: "",
  fecha_fin: "",
};

export function normalizarErrorRequerimientoCompra(error) {
  const errors = error?.response?.data?.errors;
  if (errors) {
    return Object.values(errors).flat().join("\n");
  }

  return error?.response?.data?.message || "No se pudo completar la accion.";
}

export function productoRequerimientoLabel(producto) {
  if (!producto) return "";
  const code = producto.code ? `${producto.code} - ` : "";
  return `${code}${producto.name || producto.description || `Producto #${producto.id}`}`;
}

export function formatRequerimientoDate(value) {
  if (!value) return "-";
  const [date] = String(value).split("T");
  const [year, month, day] = date.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function onlyFilledParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => Boolean(value)));
}

function normalizeProveedoresResponse(response) {
  const payload = response?.data;
  if (Array.isArray(payload?.proveedores)) return payload.proveedores;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeEmpresasResponse(response) {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeBodegasResponse(response) {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeSedesResponse(response) {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function useRequerimientosCompra({ modo = "mis" } = {}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(initialRequerimientoCompraFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialRequerimientoCompraFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialRequerimientoCompraForm);
  const [productSearch, setProductSearch] = useState("");
  const [ocForm, setOcForm] = useState({
    proveedor_id: "",
    empresa_id: "",
    bodega_id: "",
    fecha_entrega: "",
    observaciones: "",
  });

  const requerimientosQuery = useQuery({
    queryKey: ["requerimientos-compra", modo, page, appliedFilters],
    queryFn: async () => {
      const response = await requerimientosCompraApi.getAll({
        page,
        per_page: 12,
        ...(modo === "mis" ? { solo_mios: true } : {}),
        ...onlyFilledParams(appliedFilters),
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const catalogosQuery = useQuery({
    queryKey: ["requerimientos-compra-catalogos"],
    queryFn: async () => {
      const [bodegasRes, proveedoresRes, empresasRes, sedesRes] = await Promise.all([
        requerimientosCompraApi.getBodegasDisponibles(),
        proveedoresApi.getAll(),
        empresaApi.getAll(),
        sedesApi.getAll(),
      ]);

      return {
        bodegas: normalizeBodegasResponse(bodegasRes),
        proveedores: normalizeProveedoresResponse(proveedoresRes),
        empresas: normalizeEmpresasResponse(empresasRes),
        sedes: normalizeSedesResponse(sedesRes),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { products, isFetching: loadingProducts } = useProducts({
    search: productSearch,
    options: { enabled: showForm || Boolean(selected) },
  });

  const pagination = requerimientosQuery.data?.data ?? { current_page: 1, last_page: 1, data: [] };
  const rows = pagination.data ?? [];
  const puedeGestionar = Boolean(requerimientosQuery.data?.meta?.puede_gestionar);

  const resumen = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.estado] = (acc[item.estado] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  }, [rows]);

  const invalidateRequerimientos = async () => {
    await queryClient.invalidateQueries({ queryKey: ["requerimientos-compra"] });
  };

  const abrirDetalle = async (item) => {
    try {
      const response = await requerimientosCompraApi.getByUuid(item.uuid);
      const data = response.data?.data ?? null;
      setSelected(data);
      setOcForm((prev) => ({
        ...prev,
        bodega_id: data?.bodega_id || "",
        fecha_entrega: data?.fecha_requerida || "",
        observaciones: `Generada desde ${data?.codigo}`,
      }));
      return data;
    } catch (error) {
      Swal.fire("Detalle", normalizarErrorRequerimientoCompra(error), "error");
      return null;
    }
  };

  const refrescarSeleccion = async () => {
    if (!selected?.uuid) return null;
    const response = await requerimientosCompraApi.getByUuid(selected.uuid);
    const data = response.data?.data ?? null;
    setSelected(data);
    return data;
  };

  const crearMutation = useMutation({
    mutationFn: (payload) => requerimientosCompraApi.create(payload),
    onSuccess: async () => {
      Swal.fire("Creado", "Requerimiento enviado a compras.", "success");
      setForm(initialRequerimientoCompraForm);
      setShowForm(false);
      setPage(1);
      await invalidateRequerimientos();
    },
    onError: (error) => {
      Swal.fire("No se pudo crear", normalizarErrorRequerimientoCompra(error), "error");
    },
  });

  const analizarMutation = useMutation({
    mutationFn: ({ uuid, payload }) => requerimientosCompraApi.analizar(uuid, payload),
    onSuccess: async () => {
      await refrescarSeleccion();
      await invalidateRequerimientos();
      Swal.fire("Listo", "Requerimiento en analisis.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const aprobarMutation = useMutation({
    mutationFn: ({ uuid, payload }) => requerimientosCompraApi.aprobar(uuid, payload),
    onSuccess: async () => {
      await refrescarSeleccion();
      await invalidateRequerimientos();
      Swal.fire("Listo", "Requerimiento aprobado para compra.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const rechazarMutation = useMutation({
    mutationFn: ({ uuid, payload }) => requerimientosCompraApi.rechazar(uuid, payload),
    onSuccess: async () => {
      await refrescarSeleccion();
      await invalidateRequerimientos();
      Swal.fire("Listo", "Requerimiento rechazado.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const cancelarMutation = useMutation({
    mutationFn: ({ uuid, payload }) => requerimientosCompraApi.cancelar(uuid, payload),
    onSuccess: async () => {
      await refrescarSeleccion();
      await invalidateRequerimientos();
      Swal.fire("Listo", "Requerimiento cancelado.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const generarOrdenCompraMutation = useMutation({
    mutationFn: ({ uuid, payload }) => requerimientosCompraApi.generarOrdenCompra(uuid, payload),
    onSuccess: async () => {
      await refrescarSeleccion();
      await invalidateRequerimientos();
      Swal.fire("Listo", "Orden de compra generada.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const saving = [
    crearMutation,
    analizarMutation,
    aprobarMutation,
    rechazarMutation,
    cancelarMutation,
    generarOrdenCompraMutation,
  ].some((mutation) => mutation.isPending);

  const descargarPdf = async (item) => {
    try {
      const response = await requerimientosCompraApi.getPdf(item.uuid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `requerimiento_compra_${item.codigo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire("PDF", normalizarErrorRequerimientoCompra(error), "error");
    }
  };

  const aplicarFiltros = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const limpiarFiltros = () => {
    setFilters(initialRequerimientoCompraFilters);
    setAppliedFilters(initialRequerimientoCompraFilters);
    setPage(1);
  };

  const updateDetalle = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) =>
        i === index ? { ...detalle, [field]: value } : detalle
      ),
    }));
  };

  const addDetalle = () => {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { ...emptyDetalleRequerimientoCompra }],
    }));
  };

  const removeDetalle = (index) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.length === 1
        ? [{ ...emptyDetalleRequerimientoCompra }]
        : prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateFilterField = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const updateOcFormField = (field, value) => {
    setOcForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDetalleAprobado = (index, value) => {
    setSelected((prev) => ({
      ...prev,
      detalles: prev.detalles.map((item, itemIndex) =>
        itemIndex === index ? { ...item, cantidad_aprobada: value } : item
      ),
    }));
  };

  const crearRequerimiento = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      bodega_id: form.bodega_id || null,
      fecha_requerida: form.fecha_requerida || null,
      observacion: form.observacion || null,
      detalles: form.detalles.map((detalle) => ({
        producto_id: detalle.producto_id || null,
        cantidad_solicitada: Number(detalle.cantidad_solicitada),
        costo_estimado: detalle.costo_estimado === "" ? null : Number(detalle.costo_estimado),
        proveedor_sugerido_id: detalle.proveedor_sugerido_id || null,
        referencia_sugerida: detalle.referencia_sugerida || null,
        observacion: detalle.observacion || null,
      })),
    };

    crearMutation.mutate(payload);
  };

  const analizarSeleccionado = () => {
    if (!selected?.uuid) return;
    analizarMutation.mutate({
      uuid: selected.uuid,
      payload: { comentario: "Compras inicio el analisis." },
    });
  };

  const aprobarSeleccionado = () => {
    if (!selected?.uuid) return;
    const detalles = (selected?.detalles ?? []).map((detalle) => ({
      id: detalle.id,
      cantidad_aprobada: Number(detalle.cantidad_aprobada ?? detalle.cantidad_solicitada ?? 0),
    }));

    aprobarMutation.mutate({
      uuid: selected.uuid,
      payload: { detalles, comentario: "Aprobado desde compras." },
    });
  };

  const rechazarSeleccionado = async () => {
    if (!selected?.uuid) return;
    const result = await Swal.fire({
      title: "Motivo del rechazo",
      input: "textarea",
      inputPlaceholder: "Describe por que no se comprara este requerimiento",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => (!value ? "El motivo es obligatorio" : null),
    });

    if (!result.isConfirmed) return;
    rechazarMutation.mutate({ uuid: selected.uuid, payload: { motivo: result.value } });
  };

  const cancelarSeleccionado = async () => {
    if (!selected?.uuid) return;
    const result = await Swal.fire({
      title: "Cancelar requerimiento",
      input: "textarea",
      inputPlaceholder: "Motivo de cancelacion",
      showCancelButton: true,
      confirmButtonText: "Cancelar requerimiento",
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;
    cancelarMutation.mutate({
      uuid: selected.uuid,
      payload: { motivo: result.value || "Cancelado desde el modulo." },
    });
  };

  const generarOrdenCompra = (event) => {
    event.preventDefault();
    if (!selected?.uuid) return;

    generarOrdenCompraMutation.mutate({
      uuid: selected.uuid,
      payload: {
        proveedor_id: Number(ocForm.proveedor_id),
        empresa_id: Number(ocForm.empresa_id),
        bodega_id: ocForm.bodega_id || selected?.bodega_id || null,
        fecha_entrega: ocForm.fecha_entrega || null,
        observaciones: ocForm.observaciones || `Generada desde ${selected?.codigo}`,
      },
    });
  };

  return {
    filters,
    pagination,
    rows,
    loading: requerimientosQuery.isLoading || requerimientosQuery.isFetching,
    saving,
    selected,
    showForm,
    setShowForm,
    form,
    productSearch,
    setProductSearch,
    products,
    loadingProducts,
    bodegas: catalogosQuery.data?.bodegas ?? [],
    proveedores: catalogosQuery.data?.proveedores ?? [],
    empresas: catalogosQuery.data?.empresas ?? [],
    sedes: catalogosQuery.data?.sedes ?? [],
    puedeGestionar,
    ocForm,
    resumen,
    aplicarFiltros,
    limpiarFiltros,
    updateDetalle,
    updateFormField,
    updateFilterField,
    updateOcFormField,
    addDetalle,
    removeDetalle,
    updateDetalleAprobado,
    crearRequerimiento,
    abrirDetalle,
    descargarPdf,
    analizarSeleccionado,
    aprobarSeleccionado,
    rechazarSeleccionado,
    cancelarSeleccionado,
    generarOrdenCompra,
    refrescarListado: () => requerimientosQuery.refetch(),
    setPage,
  };
}
