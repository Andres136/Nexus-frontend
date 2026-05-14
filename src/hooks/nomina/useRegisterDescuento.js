import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { descuentoService } from "../../services/nominaService";
import { useGetDescuentoById } from "./useGetDescuentoById";

const EMPTY_FORM = {
  user_id: "",
  concepto_descuento: "",
  monto: "",
  numero_cuotas: "",
  frecuencia_pago: "",
  inicio: "",
  status: true,
};

export const useRegisterDescuento = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { descuento, isLoading: isLoadingData } = useGetDescuentoById(uuid);

  useEffect(() => {
    if (descuento?.data) {
      const { user_id, concepto_descuento, monto, numero_cuotas, frecuencia_pago, inicio, status } =
        descuento.data;
      setFormData({
        user_id: user_id ?? "",
        concepto_descuento: concepto_descuento ?? "",
        monto: monto ?? "",
        numero_cuotas: numero_cuotas ?? "",
        frecuencia_pago: frecuencia_pago ?? "",
        inicio: inicio?.slice(0, 10) ?? "",
        status: status ?? true,
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [descuento, uuid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const response = uuid
        ? await descuentoService.updateDescuento(uuid, formData)
        : await descuentoService.createDescuento(formData);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["descuentos"]);
      if (!uuid) setFormData(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData };
};
