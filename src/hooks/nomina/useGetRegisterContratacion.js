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
  tipo_salario: "personalizado",
  parametro_laboral_id: "",
  no_salarial: 0,
  base_salario: "",
  salario_integral: false,
  auxilio_transporte: "",
  pago_frecuencia: "",
  inicio_contratacion: "",
  dias_vacaciones_iniciales: 0,
  fin_contrato: "",
  status: true,
  eps_id: "",
  arl_id: "",
  fondo_pensiones_id: "",
  caja_penciones_id: "",
  fondo_cesantias_id: "",
  aplica_salud: true,
  aplica_pension: true,
  aplica_arl: true,
  aplica_sena: true,
  aplica_icbf: true,
  aplica_caja_compensacion: true,
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
        tipo_salario, parametro_laboral_id, no_salarial, base_salario, salario_integral, auxilio_transporte, pago_frecuencia,
        inicio_contratacion, dias_vacaciones_iniciales, fin_contrato, status, eps_id, arl_id,
        fondo_pensiones_id, caja_penciones_id, fondo_cesantias_id,
        aplica_salud, aplica_pension, aplica_arl, aplica_sena, aplica_icbf, aplica_caja_compensacion,
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
        tipo_salario: tipo_salario ?? "personalizado",
        parametro_laboral_id: parametro_laboral_id ?? "",
        no_salarial: no_salarial ?? 0,
        base_salario: base_salario ?? "",
        salario_integral: Boolean(salario_integral),
        auxilio_transporte: auxilio_transporte ?? "",
        pago_frecuencia: pago_frecuencia ?? "",
        inicio_contratacion: inicio_contratacion?.slice(0, 10) ?? "",
        dias_vacaciones_iniciales: dias_vacaciones_iniciales ?? 0,
        fin_contrato: fin_contrato?.slice(0, 10) ?? "",
        status: status ?? true,
        eps_id: eps_id ?? "",
        arl_id: arl_id ?? "",
        fondo_pensiones_id: fondo_pensiones_id ?? "",
        caja_penciones_id: caja_penciones_id ?? "",
        fondo_cesantias_id: fondo_cesantias_id ?? "",
        aplica_salud: aplica_salud ?? true,
        aplica_pension: aplica_pension ?? true,
        aplica_arl: aplica_arl ?? true,
        aplica_sena: aplica_sena ?? true,
        aplica_icbf: aplica_icbf ?? true,
        aplica_caja_compensacion: aplica_caja_compensacion ?? true,
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
        auxilio_transporte: normalizeMoneyValue(formData.auxilio_transporte) || 0,
        no_salarial: normalizeMoneyValue(formData.no_salarial) || 0,
        dias_vacaciones_iniciales: formData.dias_vacaciones_iniciales || 0,
        parametro_laboral_id: formData.parametro_laboral_id || null,
        tipo_salario: formData.tipo_salario || "personalizado",
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
     setFormData,
     handleChange,
      handleSubmit,
       fieldErrors,
        loading,
         isLoadingData };
};
