import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { contratacionService } from "../../services/nominaService";

const EMPTY_FORM = {
  id_contrato: "",
  users_id: "",
  empresa_id: "",
  centro_costo: "",
  tipo_documento: "CC",
  numero_documento: "",
  correo: "",
  cargo: "",
  no_salarial: 0,
  base_salario: "",
  salario_integral: false,
  auxilio_transporte: "",
  pago_frecuencia: "",
  inicio_contratacion: "",
  fin_contrato: "",
  status: true,
  eps_id: "",
  arl_id: "",
  fondo_pensiones_id: "",
  caja_penciones_id: "",
};

function normalizeMoneyValue(value) {
  if (value === null || value === undefined || value === "") return value;
  const text = String(value).replace(/[^\d,.-]/g, "");
  if (text.includes(",")) return text.replace(/\./g, "").replace(",", ".");
  if ((text.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(text)) {
    return text.replace(/\./g, "");
  }
  return text;
}

const useGetContratacionById = (uuid) => {
  return useQuery({
    queryKey: ["contratacion", uuid],
    queryFn: async () => {
      const response = await contratacionService.getContratoById(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetRegisterContratacion = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { data: contratacion, isLoading: isLoadingData } = useGetContratacionById(uuid);

  useEffect(() => {
    if (contratacion?.data) {
      const {
        id_contrato, users_id, empresa_id, centro_costo, tipo_documento, numero_documento, correo, cargo,
        no_salarial, base_salario, salario_integral, auxilio_transporte, pago_frecuencia,
        inicio_contratacion, fin_contrato, status, eps_id, arl_id,
        fondo_pensiones_id, caja_penciones_id,
      } = contratacion.data;
      setFormData({
        id_contrato: id_contrato ?? "",
        users_id: users_id ?? "",
        empresa_id: empresa_id ?? "",
        centro_costo: centro_costo ?? "",
        tipo_documento: tipo_documento ?? "CC",
        numero_documento: numero_documento ?? "",
        correo: correo ?? "",
        cargo: cargo ?? "",
        no_salarial: no_salarial ?? 0,
        base_salario: base_salario ?? "",
        salario_integral: Boolean(salario_integral),
        auxilio_transporte: auxilio_transporte ?? "",
        pago_frecuencia: pago_frecuencia ?? "",
        inicio_contratacion: inicio_contratacion?.slice(0, 10) ?? "",
        fin_contrato: fin_contrato?.slice(0, 10) ?? "",
        status: status ?? true,
        eps_id: eps_id ?? "",
        arl_id: arl_id ?? "",
        fondo_pensiones_id: fondo_pensiones_id ?? "",
        caja_penciones_id: caja_penciones_id ?? "",
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [contratacion, uuid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const payload = {
        ...formData,
        base_salario: normalizeMoneyValue(formData.base_salario),
        auxilio_transporte: normalizeMoneyValue(formData.auxilio_transporte),
        no_salarial: normalizeMoneyValue(formData.no_salarial),
      };
      const response = uuid
        ? await contratacionService.updateContrato(uuid, payload)
        : await contratacionService.createContrato(payload);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["contratacion"]);
      if (!uuid) setFormData(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      console.error("Error al guardar la contratación:", err);
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return { formData,
     handleChange,
      handleSubmit,
       fieldErrors,
        loading,
         isLoadingData };
};
