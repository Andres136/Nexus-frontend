import { useState, useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import { showToast } from "../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";

export const useTrasladoInventario = () => {
  const { envioInternoOc, errors, setErrors, urlPDF } =
    useContext(ProductContext);

  const [formData, setFormData] = useState({
    empresa_id: "",
    sede_origen_id: "",
    sede_destino_id: "",
    ordenes_compra: [],
    notas: "",
    detalles: [
      {
        item: 1,
        orden_compra_id: "",
        product_id: "",
        descripcion: "",
        code_id: "",
        stock_total: 0,
        cantidad: "",
        bodegas: [{ bodega_id: "", cantidad: "" }],
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // ============================
  // MANEJO DE ERRORES
  // ============================

  const clearFieldError = (fieldPath) => {
    if (!errors[fieldPath]) return;

    const updatedErrors = { ...errors };
    delete updatedErrors[fieldPath];
    setErrors(updatedErrors);
  };

  const setFieldError = (fieldPath, message) => {
    setErrors((prev) => ({
      ...prev,
      [fieldPath]: message,
    }));
  };

  // ============================
  // DETALLES
  // ============================

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    const updatedDetalles = [...formData.detalles];
    updatedDetalles[index][name] = value;

    // Validación puntual cantidad
    if (name === "cantidad") {
      const cantidad = parseFloat(value) || 0;
      const stock = parseFloat(updatedDetalles[index].stock_total) || 0;

      if (cantidad > stock) {
        setFieldError(
          `detalles.${index}.cantidad`,
          `Stock insuficiente. Disponible: ${stock}`
        );
      } else {
        clearFieldError(`detalles.${index}.cantidad`);
      }
    }

    // Validaciones básicas
    if (value !== "") {
      clearFieldError(`detalles.${index}.${name}`);
    }

    setFormData({
      ...formData,
      detalles: updatedDetalles,
    });
  };

  // ============================
  // BODEGAS
  // ============================

  const handleBodegaChange = (detalleIndex, bodegaIndex, field, value) => {
    const updatedDetalles = [...formData.detalles];
    updatedDetalles[detalleIndex].bodegas[bodegaIndex][field] = value;

    if (value !== "") {
      clearFieldError(
        `detalles.${detalleIndex}.bodegas.${bodegaIndex}.${field}`
      );
    }

    setFormData({
      ...formData,
      detalles: updatedDetalles,
    });
  };

  const addBodega = (detalleIndex) => {
    const updatedDetalles = [...formData.detalles];

    updatedDetalles[detalleIndex].bodegas.push({
      bodega_id: "",
      cantidad: "",
    });

    setFormData({
      ...formData,
      detalles: updatedDetalles,
    });
  };

  const removeBodega = (detalleIndex, bodegaIndex) => {
    const updatedDetalles = [...formData.detalles];

    if (updatedDetalles[detalleIndex].bodegas.length > 1) {
      updatedDetalles[detalleIndex].bodegas =
        updatedDetalles[detalleIndex].bodegas.filter(
          (_, i) => i !== bodegaIndex
        );

      setFormData({
        ...formData,
        detalles: updatedDetalles,
      });
    }
  };

  // ============================
  // DETALLES CRUD
  // ============================

  const addDetalle = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          temp_id:crypto.randomUUID(), // ID temporal para manejo frontend
          item: formData.detalles.length + 1,
          orden_compra_id: "",
          product_id: "",
          descripcion: "",
          code_id: "",
          stock_total: 0,
          cantidad: "",
          bodegas: [{ bodega_id: "", cantidad: "" }],
        },
      ],
    });
  };

const removeDetalle = (index) => {
  if (formData.detalles.length > 1) {
    const updatedDetalles = formData.detalles
      .filter((_, i) => i !== index)
      .map((detalle, i) => ({
        ...detalle,
        item: i + 1,
      }));

    setFormData({
      ...formData,
      detalles: updatedDetalles,
    });
  }
};

  // ============================
  // CAMPOS PRINCIPALES
  // ============================

  const updateFormField = (field, value) => {
    clearFieldError(field);

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // ============================
  // RESET
  // ============================

  const resetForm = () => {
    setFormData({
      empresa_id: "",
      sede_origen_id: "",
      sede_destino_id: "",
      ordenes_compra: [],
      notas: "",
      detalles: [
        {
          temp_id:crypto.randomUUID(), // ID temporal para manejo frontend
          item: 1,
          orden_compra_id: "",
          product_id: "",
          descripcion: "",
          code_id: "",
          stock_total: 0,
          cantidad: "",
          bodegas: [{ bodega_id: "", cantidad: "" }],
        },
      ],
    });

    setErrors({});
  };

  // ============================
  // SUBMIT
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        detalles: formData.detalles.map((d, i) => ({
          ...d,
          item: i + 1,
        })),
      };

      const result = await envioInternoOc(payload);

      showToast(
        "success",
        result?.message ||
          "Traslado de inventario enviado con éxito."
      );

      queryClient.invalidateQueries(["trasladosInventario"]);

      resetForm();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(
        "❌ Error al enviar traslado de inventario:",
        error
      );

      // Errores backend Laravel
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};

        setErrors(backendErrors);

        const firstError =
          Object.values(backendErrors)[0]?.[0] ||
          "Hay errores en el formulario.";

        showToast("error", firstError);
      } else {
        showToast(
          "error",
          error.response?.data?.message ||
            "No se pudo procesar el traslado."
        );
      }

      return {
        success: false,
        error,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    urlPDF,

    handleChange,
    handleBodegaChange,
    addBodega,
    addDetalle,
    removeDetalle,
    removeBodega,
    updateFormField,
    resetForm,
    handleSubmit,
  };
};