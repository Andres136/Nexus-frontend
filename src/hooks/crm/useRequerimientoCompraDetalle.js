import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useProducts } from "../useProducts";
import {
  empresaApi,
  proveedoresApi,
  requerimientosCompraApi,
} from "../../services/api";
import {
  emptyDetalleRequerimientoCompra,
  initialRequerimientoCompraForm,
  normalizarErrorRequerimientoCompra,
} from "./useRequerimientosCompra";

function normalizeList(response, key) {
  const payload = response?.data;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function toDateInput(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

function formFromRequerimiento(requerimiento) {
  if (!requerimiento) return initialRequerimientoCompraForm;

  return {
    bodega_id: requerimiento.bodega_id || "",
    prioridad: requerimiento.prioridad || "normal",
    fecha_requerida: toDateInput(requerimiento.fecha_requerida),
    observacion: requerimiento.observacion || "",
    detalles: (requerimiento.detalles?.length ? requerimiento.detalles : [{ ...emptyDetalleRequerimientoCompra }]).map((detalle) => ({
      producto_id: detalle.producto_id || "",
      cantidad_solicitada: detalle.cantidad_solicitada ?? 1,
      cantidad_aprobada: detalle.cantidad_aprobada ?? "",
      costo_estimado: detalle.costo_estimado ?? "",
      proveedor_sugerido_id: detalle.proveedor_sugerido_id || "",
      referencia_sugerida: detalle.referencia_sugerida || "",
      observacion: detalle.observacion || "",
    })),
  };
}

export function useRequerimientoCompraDetalle({ modo = "mis" } = {}) {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(initialRequerimientoCompraForm);
  const [productSearch, setProductSearch] = useState("");
  const [ocForm, setOcForm] = useState({
    proveedor_id: "",
    empresa_id: "",
    bodega_id: "",
    fecha_entrega: "",
    observaciones: "",
  });

  const detalleQuery = useQuery({
    queryKey: ["requerimiento-compra-detalle", uuid],
    queryFn: async () => {
      const response = await requerimientosCompraApi.getByUuid(uuid);
      return response.data;
    },
    enabled: Boolean(uuid),
  });

  const catalogosQuery = useQuery({
    queryKey: ["requerimiento-compra-detalle-catalogos"],
    queryFn: async () => {
      const [bodegasRes, proveedoresRes, empresasRes] = await Promise.all([
        requerimientosCompraApi.getBodegasDisponibles(),
        proveedoresApi.getAll(),
        empresaApi.getAll(),
      ]);

      return {
        bodegas: normalizeList(bodegasRes, "data"),
        proveedores: normalizeList(proveedoresRes, "proveedores"),
        empresas: normalizeList(empresasRes, "data"),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const requerimiento = detalleQuery.data?.data ?? null;
  const puedeGestionar = Boolean(detalleQuery.data?.meta?.puede_gestionar);
  const esGestion = modo === "gestion";
  const puedeEditar = esGestion
    && puedeGestionar
    && ["solicitado", "en_analisis", "aprobado"].includes(requerimiento?.estado);

  const { products, isFetching: loadingProducts } = useProducts({
    search: productSearch,
    options: { enabled: editMode },
  });

  useEffect(() => {
    if (!requerimiento) return;
    setEditForm(formFromRequerimiento(requerimiento));
    setOcForm((prev) => ({
      ...prev,
      bodega_id: requerimiento.bodega_id || "",
      fecha_entrega: toDateInput(requerimiento.fecha_requerida),
      observaciones: `Generada desde ${requerimiento.codigo}`,
    }));
  }, [requerimiento]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["requerimiento-compra-detalle", uuid] });
    await queryClient.invalidateQueries({ queryKey: ["requerimientos-compra"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => requerimientosCompraApi.update(uuid, payload),
    onSuccess: async () => {
      await invalidate();
      setEditMode(false);
      Swal.fire("Actualizado", "Requerimiento actualizado correctamente.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, payload }) => action(uuid, payload),
    onSuccess: async (_, variables) => {
      await invalidate();
      Swal.fire("Listo", variables.message, "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const generarOrdenCompraMutation = useMutation({
    mutationFn: (payload) => requerimientosCompraApi.generarOrdenCompra(uuid, payload),
    onSuccess: async () => {
      await invalidate();
      Swal.fire("Listo", "Orden de compra generada.", "success");
    },
    onError: (error) => Swal.fire("Error", normalizarErrorRequerimientoCompra(error), "error"),
  });

  const saving = updateMutation.isPending || actionMutation.isPending || generarOrdenCompraMutation.isPending;

  const volver = () => {
    navigate(esGestion ? "/auth/crm/requerimientos-compra/gestion" : "/auth/crm/requerimientos-compra");
  };

  const updateFormField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDetalle = (index, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) =>
        i === index ? { ...detalle, [field]: value } : detalle
      ),
    }));
  };

  const addDetalle = () => {
    setEditForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { ...emptyDetalleRequerimientoCompra }],
    }));
  };

  const removeDetalle = (index) => {
    setEditForm((prev) => ({
      ...prev,
      detalles: prev.detalles.length === 1
        ? [{ ...emptyDetalleRequerimientoCompra }]
        : prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const guardarEdicion = (event) => {
    event.preventDefault();
    const payload = {
      ...editForm,
      bodega_id: editForm.bodega_id || null,
      fecha_requerida: editForm.fecha_requerida || null,
      observacion: editForm.observacion || null,
      detalles: editForm.detalles.map((detalle) => ({
        producto_id: detalle.producto_id || null,
        cantidad_solicitada: Number(detalle.cantidad_solicitada),
        cantidad_aprobada: detalle.cantidad_aprobada === "" ? null : Number(detalle.cantidad_aprobada),
        costo_estimado: detalle.costo_estimado === "" ? null : Number(detalle.costo_estimado),
        proveedor_sugerido_id: detalle.proveedor_sugerido_id || null,
        referencia_sugerida: detalle.referencia_sugerida || null,
        observacion: detalle.observacion || null,
      })),
    };

    updateMutation.mutate(payload);
  };

  const analizar = () => {
    actionMutation.mutate({
      action: requerimientosCompraApi.analizar,
      payload: { comentario: "Compras inicio el analisis." },
      message: "Requerimiento en analisis.",
    });
  };

  const aprobar = () => {
    const detalles = (requerimiento?.detalles ?? []).map((detalle) => ({
      id: detalle.id,
      cantidad_aprobada: Number(detalle.cantidad_aprobada ?? detalle.cantidad_solicitada ?? 0),
    }));

    actionMutation.mutate({
      action: requerimientosCompraApi.aprobar,
      payload: { detalles, comentario: "Aprobado desde compras." },
      message: "Requerimiento aprobado para compra.",
    });
  };

  const rechazar = async () => {
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
    actionMutation.mutate({
      action: requerimientosCompraApi.rechazar,
      payload: { motivo: result.value },
      message: "Requerimiento rechazado.",
    });
  };

  const generarOrdenCompra = (event) => {
    event.preventDefault();
    generarOrdenCompraMutation.mutate({
      proveedor_id: Number(ocForm.proveedor_id),
      empresa_id: Number(ocForm.empresa_id),
      bodega_id: ocForm.bodega_id || requerimiento?.bodega_id || null,
      fecha_entrega: ocForm.fecha_entrega || null,
      observaciones: ocForm.observaciones || `Generada desde ${requerimiento?.codigo}`,
    });
  };

  const updateOcField = (field, value) => {
    setOcForm((prev) => ({ ...prev, [field]: value }));
  };

  const descargarPdf = async () => {
    try {
      const response = await requerimientosCompraApi.getPdf(uuid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `requerimiento_compra_${requerimiento.codigo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire("PDF", normalizarErrorRequerimientoCompra(error), "error");
    }
  };

  const canApprove = useMemo(
    () => esGestion && puedeGestionar && ["solicitado", "en_analisis"].includes(requerimiento?.estado),
    [esGestion, puedeGestionar, requerimiento?.estado]
  );

  return {
    uuid,
    requerimiento,
    loading: detalleQuery.isLoading,
    saving,
    esGestion,
    puedeGestionar,
    puedeEditar,
    canApprove,
    editMode,
    setEditMode,
    editForm,
    productSearch,
    setProductSearch,
    products,
    loadingProducts,
    bodegas: catalogosQuery.data?.bodegas ?? [],
    proveedores: catalogosQuery.data?.proveedores ?? [],
    empresas: catalogosQuery.data?.empresas ?? [],
    ocForm,
    updateOcField,
    volver,
    updateFormField,
    updateDetalle,
    addDetalle,
    removeDetalle,
    guardarEdicion,
    analizar,
    aprobar,
    rechazar,
    generarOrdenCompra,
    descargarPdf,
  };
}
