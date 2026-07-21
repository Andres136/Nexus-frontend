import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { contratacionCambioService } from "../../services/nominaService";
import { useGetTipoContrato } from "../../hooks/nomina/useGetTipoContrato";
import { useEmpresas } from "../../hooks/useEmpresas";
import { useGetSeguridadSocial } from "../../hooks/nomina/useGetSeguridadSocial";
import { showToast } from "../../helpers/utils/showToast";

const TIPOS_CAMBIO = [
  { value: "cambio_tipo_contrato", label: "Cambio de tipo de contrato" },
  { value: "cambio_empresa", label: "Cambio de empresa" },
  { value: "cambio_cargo", label: "Cambio de cargo" },
  { value: "cambio_entidades", label: "Cambio de entidades" },
  { value: "cambio_condiciones_economicas", label: "Condiciones económicas" },
  { value: "cambio_fechas", label: "Cambio de fechas" },
  { value: "otro", label: "Otro" },
];

const EMPTY_FORM = {
  tipo_cambio: "otro",
  fecha_cambio: new Date().toISOString().slice(0, 10),
  motivo: "",
  observaciones: "",
  datos_nuevos: {
    id_contrato: "",
    empresa_id: "",
    cargo: "",
    base_salario: "",
    no_salarial: "",
    auxilio_transporte: "",
    pago_frecuencia: "",
    inicio_contratacion: "",
    fin_contrato: "",
    eps_id: "",
    arl_id: "",
    fondo_pensiones_id: "",
    caja_penciones_id: "",
    fondo_cesantias_id: "",
    salario_integral: "",
    aplica_salud: "",
    aplica_pension: "",
    aplica_arl: "",
    aplica_sena: "",
    aplica_icbf: "",
    aplica_caja_compensacion: "",
  },
};

function nombreCompleto(usuario) {
  if (!usuario) return "—";
  return usuario.nombre_completo || [usuario.name, usuario.apellidos].filter(Boolean).join(" ") || "—";
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : "—";
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "—";
  return "$ " + Number(value).toLocaleString("es-CO");
}

function cleanDatosNuevos(datos) {
  return Object.fromEntries(
    Object.entries(datos).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
}

export default function CambioContratoModal({ contrato, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const { tipoContratos } = useGetTipoContrato();
  const { empresas } = useEmpresas();
  const { seguridadSociales } = useGetSeguridadSocial({ params: { per_page: 500 } });

  const contratoId = contrato?.id;
  const tipoContratoLista = tipoContratos?.data ?? [];
  const empresasLista = Array.isArray(empresas) ? empresas : [];
  const seguridadLista = seguridadSociales?.data?.data ?? [];
  const entidadesPorTipo = (tipo) => seguridadLista.filter((item) => item.tipo === tipo);

  const { data: cambiosData, isLoading: loadingCambios } = useQuery({
    queryKey: ["contratacionCambios", contratoId],
    queryFn: async () => {
      const response = await contratacionCambioService.getCambios({ contratacion_id: contratoId, per_page: 20 });
      return response.data.data;
    },
    enabled: Boolean(contratoId),
  });

  useEffect(() => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
  }, [contratoId]);

  const cambios = cambiosData?.data ?? [];

  const resumenActual = useMemo(() => ([
    ["Empleado", nombreCompleto(contrato?.usuario)],
    ["Cargo", contrato?.cargo ?? "—"],
    ["Tipo contrato", contrato?.tipo_contrato?.nombre ?? contrato?.tipoContrato?.nombre ?? "—"],
    ["Empresa", contrato?.empresa?.nombre ?? "—"],
    ["Salario", formatMoney(contrato?.base_salario)],
    ["Inicio", formatDate(contrato?.inicio_contratacion)],
  ]), [contrato]);

  const mutation = useMutation({
    mutationFn: (payload) => contratacionCambioService.createCambio(payload),
    onSuccess: (response) => {
      showToast("success", response.data.message || "Cambio contractual registrado");
      queryClient.invalidateQueries({ queryKey: ["contratacionCambios", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["contrataciones"] });
      queryClient.invalidateQueries({ queryKey: ["contratacion", contrato?.uuid] });
      setForm(EMPTY_FORM);
      setFieldErrors({});
    },
    onError: (error) => {
      const data = error.response?.data;
      setFieldErrors(data?.errors ?? {});
      showToast("error", data?.message || "No se pudo registrar el cambio");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDatoChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      datos_nuevos: { ...prev.datos_nuevos, [name]: value },
    }));
  };

  const handleBooleanDatoChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      datos_nuevos: {
        ...prev.datos_nuevos,
        [name]: value === "" ? "" : value === "true",
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const datosNuevos = cleanDatosNuevos(form.datos_nuevos);

    if (Object.keys(datosNuevos).length === 0) {
      showToast("warning", "Indica al menos un dato nuevo del contrato");
      return;
    }

    mutation.mutate({
      contratacion_id: contratoId,
      tipo_cambio: form.tipo_cambio,
      fecha_cambio: form.fecha_cambio,
      motivo: form.motivo,
      observaciones: form.observaciones || null,
      datos_nuevos: datosNuevos,
    });
  };

  const inputClass = "h-9 w-full rounded-md border border-gray-300 px-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">Otro sí / cambio contractual</h2>
        <p className="text-xs text-gray-500 mt-0.5">Registra la modificación y conserva trazabilidad del contrato.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
        {resumenActual.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
            <p className="text-xs font-medium text-gray-700">{value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
            <select name="tipo_cambio" value={form.tipo_cambio} onChange={handleChange} className={inputClass}>
              {TIPOS_CAMBIO.map((tipo) => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
            <input type="date" name="fecha_cambio" value={form.fecha_cambio} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Frecuencia</label>
            <select name="pago_frecuencia" value={form.datos_nuevos.pago_frecuencia} onChange={handleDatoChange} className={inputClass}>
              <option value="">Sin cambio</option>
              <option value="15">Quincenal</option>
              <option value="30">Mensual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Motivo</label>
            <input name="motivo" value={form.motivo} onChange={handleChange} className={inputClass} />
            {fieldErrors.motivo && <p className="mt-1 text-xs text-red-500">{fieldErrors.motivo[0]}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Cargo nuevo</label>
            <input name="cargo" value={form.datos_nuevos.cargo} onChange={handleDatoChange} className={inputClass} placeholder="Sin cambio" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tipo contrato</label>
            <select name="id_contrato" value={form.datos_nuevos.id_contrato} onChange={handleDatoChange} className={inputClass}>
              <option value="">Sin cambio</option>
              {tipoContratoLista.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Empresa</label>
            <select name="empresa_id" value={form.datos_nuevos.empresa_id} onChange={handleDatoChange} className={inputClass}>
              <option value="">Sin cambio</option>
              {empresasLista.map((empresa) => <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fin contrato</label>
            <input type="date" name="fin_contrato" value={form.datos_nuevos.fin_contrato} onChange={handleDatoChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Salario base</label>
            <input type="number" min="0" name="base_salario" value={form.datos_nuevos.base_salario} onChange={handleDatoChange} className={inputClass} placeholder="Sin cambio" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Auxilio</label>
            <input type="number" min="0" name="auxilio_transporte" value={form.datos_nuevos.auxilio_transporte} onChange={handleDatoChange} className={inputClass} placeholder="Sin cambio" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Pago no salarial</label>
            <input type="number" min="0" name="no_salarial" value={form.datos_nuevos.no_salarial} onChange={handleDatoChange} className={inputClass} placeholder="Sin cambio" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["eps_id", "EPS", entidadesPorTipo("eps")],
            ["arl_id", "ARL", entidadesPorTipo("arl")],
            ["fondo_pensiones_id", "Fondo de pensiones", entidadesPorTipo("afp")],
            ["caja_penciones_id", "Caja de compensación", entidadesPorTipo("ccf")],
            ["fondo_cesantias_id", "Fondo de cesantías", entidadesPorTipo("cesantias")],
          ].map(([name, label, options]) => (
            <div key={name}>
              <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
              <select name={name} value={form.datos_nuevos[name]} onChange={handleDatoChange} className={inputClass}>
                <option value="">Sin cambio</option>
                {options.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Observaciones</label>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={2} className="w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {[
            ["salario_integral", "Salario integral"],
            ["aplica_salud", "Salud"],
            ["aplica_pension", "Pensión"],
            ["aplica_arl", "ARL"],
            ["aplica_sena", "SENA"],
            ["aplica_icbf", "ICBF"],
            ["aplica_caja_compensacion", "Caja"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
              <select
                name={name}
                value={form.datos_nuevos[name] === "" ? "" : String(form.datos_nuevos[name])}
                onChange={handleBooleanDatoChange}
                className={inputClass}
              >
                <option value="">Sin cambio</option>
                <option value="true">Aplica / Sí</option>
                <option value="false">No aplica / No</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            Cerrar
          </button>
          <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Registrar cambio
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Historial reciente</h3>
        {loadingCambios ? (
          <p className="text-xs text-gray-400">Cargando cambios...</p>
        ) : cambios.length === 0 ? (
          <p className="text-xs text-gray-400">Este contrato no tiene cambios registrados.</p>
        ) : (
          <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100">
            {cambios.map((cambio) => (
              <div key={cambio.uuid} className="border-b border-gray-100 px-3 py-2 last:border-b-0">
                <p className="text-xs font-semibold text-gray-700">{TIPOS_CAMBIO.find((tipo) => tipo.value === cambio.tipo_cambio)?.label ?? cambio.tipo_cambio}</p>
                <p className="text-[11px] text-gray-500">{formatDate(cambio.fecha_cambio)} · {cambio.motivo}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

CambioContratoModal.propTypes = {
  contrato: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
