import { useEffect, useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { facturasService } from "../../services/contabilidadService";
import { useGetByIdFacturas } from "../calidad/useGetByIdFacturas";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

const ESTADO_INICIAL = {
  factura: {
    proveedor_id: null,
    empresa_id: null,
    sede_id: null,
    estado_id: null,
    forma_pago_id: null,
    numero_factura: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    total: "",
    subtotal: "",
    observaciones: "",
    numero_factura_proveedor: "",
  },
  ordenes_compra_proveedor_ids: [],
  detalles: [],
  pagos: [],
  gastos: [],
  impuestos: [],
};

const mapDataToState = (data) => ({
  factura: {
    proveedor_id: data.proveedor_id ?? null,
    empresa_id: data.empresa_id ?? null,
    sede_id: data.sede_id ?? null,
    estado_id: data.estado_id ?? null,
    forma_pago_id: data.forma_pago_id ?? null,
    numero_factura: data.numero_factura ?? "",
    fecha_emision: data.fecha_emision ?? "",
    fecha_vencimiento: data.fecha_vencimiento ?? "",
    total: data.total ?? "",
    subtotal: data.subtotal ?? "",
    observaciones: data.observaciones ?? "",
    numero_factura_proveedor: data.numero_factura_proveedor ?? "",
  },
  ordenes_compra_proveedor_ids: (data.ordenes_compra_proveedor ?? []).map((orden) => orden.id),
  detalles: (data.detalles ?? []).map((d) => ({
    id: d.id,
    producto_id: d.producto_id ?? null,
    orden_compra_proveedor_detalle_id: d.orden_compra_proveedor_detalle_id ?? null,
    puck_id: d.puck_id ?? null,
    cantidad: d.cantidad ?? 1,
    precio_unitario: d.precio_unitario ?? 0,
    impuestos: (d.impuestos ?? []).map((i) => ({
      impuesto_id: i.impuesto_id ?? i.pivot?.impuesto_id ?? i.id,
      monto: i.monto ?? i.pivot?.monto ?? 0,
    })),
  })),
  pagos: data.pagos ?? [],
  gastos: data.gastos ?? [],
  impuestos: (data.impuestos ?? []).map((i) => ({
    impuesto_id: i.impuesto_id ?? i.pivot?.impuesto_id ?? i.id,
    monto: i.monto ?? i.pivot?.monto ?? 0,
  })),
});

export const useRegisterFacturaCompras = ({ id = null, modo = "creacion" } = {}) => {
  const queryClient = useQueryClient();
  const [factura, setFactura] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [diasCredito, setDiasCredito] = useState("");

  // React-query se encarga del fetch — solo corre cuando hay id
  const { data: facturaExistente, isLoading: isLoadingFactura } = useGetByIdFacturas(
    modo === "edicion" ? id : null
  );

  // Cuando llegan los datos del servidor, poblar el form
  useEffect(() => {
    if (!facturaExistente) return;

    setFactura(mapDataToState(facturaExistente));

    const { fecha_emision, fecha_vencimiento } = facturaExistente;
    if (fecha_emision && fecha_vencimiento) {
      const diff = Math.round(
        (new Date(`${fecha_vencimiento}T00:00:00`) - new Date(`${fecha_emision}T00:00:00`)) /
          86400000
      );
      if (diff >= 0) setDiasCredito(String(diff));
    }
  }, [facturaExistente]);

  const handleFacturaChange = (e) => {
    const { name, value } = e.target;
    if (name === "ordenes_compra_proveedor_ids") {
      setFactura((prev) => ({ ...prev, ordenes_compra_proveedor_ids: value }));
      return;
    }
    if (name === "impuestos") {
      setFactura((prev) => ({ ...prev, impuestos: value }));
      return;
    }
    setFactura((prev) => ({
      ...prev,
      factura: { ...prev.factura, [name]: value },
    }));
  };

  const addDetalle = () => {
    setFactura((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { producto_id: null, puck_id: null, cantidad: 1, precio_unitario: 0, impuestos: [] },
      ],
    }));
  };

  const updateDetalle = (index, field, value) => {
    setFactura((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  };

  const removeDetalle = (index) => {
    setFactura((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const replaceDetalles = (detalles) => {
    setFactura((prev) => ({
      ...prev,
      detalles,
    }));
  };

  const handleSubmitFactura = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        factura: factura.factura,
        ordenes_compra_proveedor_ids: factura.ordenes_compra_proveedor_ids,
        detalles: factura.detalles,
        pagos: factura.pagos,
        gastos: factura.gastos,
        impuestos: factura.impuestos,
      };

      let response;
      if (modo === "edicion") {
        response = await facturasService.updateFactura(id, payload);
        showToast("success", response.data.message || "Factura actualizada exitosamente");
      } else {
        response = await facturasService.createFactura(payload);
        setPdfUrl(response.data.data.pdf_url);
        showToast("success", response.data.message || "Factura registrada exitosamente");
        setFactura(ESTADO_INICIAL);
        setDiasCredito("");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setError(err.response.data.errors);
        showToast("error", "Errores de validación");
      } else {
        setError({ general: ["Ocurrió un error al procesar la factura"] });
        showToast("error", "Ocurrió un error al procesar la factura");
      }
    } finally {
      setLoading(false);
    }
  };


  //Anular factura: con Swal para confirmar, luego llamada a servicio y manejo de respuesta


const anularFactura = async (facturaId) => {
    const result = await Swal.fire({
        title: "¿Anular factura?",
        text: "Esta acción cambiará el estado de la factura y no podrá revertirse fácilmente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
        setLoading(true);
        setError(null);

        Swal.fire({
            title: "Anulando factura...",
            text: "Por favor espera",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await facturasService.deleteFactura(facturaId);

        Swal.fire({
            title: "Factura anulada",
            text:
                response.data.message ||
                "La factura fue anulada exitosamente.",
            icon: "success",
            confirmButtonColor: "#2563eb",
        });

        showToast(
            "success",
            response.data.message ||
                "Factura anulada exitosamente"
        );
        queryClient.invalidateQueries({ queryKey: ["facturasCompras"] });
        queryClient.invalidateQueries({ queryKey: ["registro-pago-factura"] });

    } catch (err) {
        console.error(err);

        const backendMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Ocurrió un error al anular la factura.";

        setError({
            general: [backendMessage],
        });

        Swal.fire({
            title: "Error",
            text: backendMessage,
            icon: "error",
            confirmButtonColor: "#d33",
        });

        showToast("error", backendMessage);

    } finally {
        setLoading(false);
    }
};

const eliminarFacturaDefinitivamente = async (facturaId) => {
    const result = await Swal.fire({
        title: "¿Eliminar definitivamente?",
        html: "Esta acción eliminará la factura, sus detalles y pagos.<br><strong>No se puede deshacer.</strong>",
        icon: "error",
        input: "text",
        inputPlaceholder: "Escribe ELIMINAR para confirmar",
        showCancelButton: true,
        confirmButtonColor: "#991b1b",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Eliminar definitivamente",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        focusCancel: true,
        preConfirm: (value) => {
            if (value !== "ELIMINAR") {
                Swal.showValidationMessage("Debes escribir ELIMINAR para confirmar.");
                return false;
            }

            return true;
        },
    });

    if (!result.isConfirmed) return;

    try {
        setLoading(true);
        setError(null);

        const response = await facturasService.deleteFacturaDefinitivamente(facturaId);

        await Swal.fire({
            title: "Factura eliminada",
            text: response.data.message || "La factura fue eliminada definitivamente.",
            icon: "success",
            confirmButtonColor: "#2563eb",
        });

        queryClient.invalidateQueries({ queryKey: ["facturasCompras"] });
        queryClient.invalidateQueries({ queryKey: ["registro-pago-factura"] });
    } catch (err) {
        const backendMessage =
            err.response?.data?.message ||
            "No fue posible eliminar definitivamente la factura.";

        setError({ general: [backendMessage] });

        Swal.fire({
            title: "Error",
            text: backendMessage,
            icon: "error",
            confirmButtonColor: "#d33",
        });
    } finally {
        setLoading(false);
    }
};

  return {
    factura,
    setFactura,
    pdfUrl,
    diasCredito,
    setDiasCredito,
    handleFacturaChange,
    addDetalle,
    updateDetalle,
    removeDetalle,
    replaceDetalles,
    handleSubmitFactura,
    loading: loading || isLoadingFactura,
    error,
    anularFactura,
    eliminarFacturaDefinitivamente,
  };
};
