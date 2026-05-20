import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { kioskoDeviceService } from "../../services/nominaService";
import { useGetTipoRegistros } from "../../hooks/nomina/useGetTipoRegistros";
import { useSedes } from "../../hooks/useSedes";
import { showToast } from "../../helpers/utils/showToast";

const EMPTY = {
  sede_id: "",
  bodega_id: "",
  name: "",
  code: "",
  ip_adres: "",
  descripcion: "",
  tipo_registros_id: "",
};

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
      {children}
    </p>
  );
}
SectionTitle.propTypes = { children: PropTypes.node };

export default function RegisterKiosko({ uuid = null, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData]   = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]     = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const { tipoRegistros } = useGetTipoRegistros();
  const { sedes, bodegas } = useSedes();

  const tipoRegistroLista = tipoRegistros?.data?.data ?? tipoRegistros?.data ?? [];
  const sedesLista   = Array.isArray(sedes)   ? sedes   : [];
  const bodegasLista = Array.isArray(bodegas) ? bodegas : [];

  const isEdit = !!uuid;

  useEffect(() => {
    if (!uuid) { setFormData(EMPTY); setFieldErrors({}); return; }
    setLoadingData(true);
    kioskoDeviceService.getKioscoByUuid(uuid)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setFormData({
          sede_id:           d.sede_id           ?? "",
          bodega_id:         d.bodega_id         ?? "",
          name:              d.name              ?? "",
          code:              d.code              ?? "",
          ip_adres:          d.ip_adres          ?? "",
          descripcion:       d.descripcion       ?? "",
          tipo_registros_id: d.tipo_registros_id ?? "",
        });
      })
      .catch(() => showToast("error", "Error al cargar el kiosko"))
      .finally(() => setLoadingData(false));
  }, [uuid]);

  const inputClass = (field) =>
    `block w-full h-[34px] px-2.5 rounded-md border text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    }`;

  const lbl = (text, required) => (
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const err = (field) =>
    fieldErrors[field] && (
      <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors[field][0]}</p>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const res = isEdit
        ? await kioskoDeviceService.updateKiosco(uuid, formData)
        : await kioskoDeviceService.createKiosco(formData);
      showToast("success", res.data.message || (isEdit ? "Actualizado" : "Registrado"));
      queryClient.invalidateQueries(["kioscos"]);
      if (!isEdit) setFormData(EMPTY);
      onClose?.();
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loadingData) {
    return (
      <div className="space-y-3 animate-pulse p-1">
        <div className="h-4 bg-gray-200 rounded w-40" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {isEdit ? "Editar Kiosko" : "Nuevo Kiosko"}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {isEdit ? "Modifica los datos del dispositivo." : "Registra un nuevo dispositivo kiosko."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Identificación */}
        <div className="space-y-3">
          <SectionTitle>Identificación</SectionTitle>

          <div className="grid grid-cols-2 gap-3">
            <div>
              {lbl("Nombre", true)}
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Kiosko Principal" className={inputClass("name")} />
              {err("name")}
            </div>
            <div>
              {lbl("Código", true)}
              <input type="text" name="code" value={formData.code} onChange={handleChange}
                placeholder="KS-001" className={inputClass("code")} />
              {err("code")}
            </div>
          </div>

          <div>
            {lbl("Dirección IP", true)}
            <input type="text" name="ip_adres" value={formData.ip_adres} onChange={handleChange}
              placeholder="192.168.1.100" className={inputClass("ip_adres")} />
            {err("ip_adres")}
          </div>

          <div>
            {lbl("Descripción")}
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
              rows={2} placeholder="Descripción opcional..."
              className="block w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            {err("descripcion")}
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-3">
          <SectionTitle>Ubicación</SectionTitle>

          <div className="grid grid-cols-2 gap-3">
            <div>
              {lbl("Sede", true)}
              <select name="sede_id" value={formData.sede_id} onChange={handleChange} className={inputClass("sede_id")}>
                <option value="">Seleccionar...</option>
                {sedesLista.map((s) => <option key={s.id} value={s.id}>{s.nombre ?? s.name}</option>)}
              </select>
              {err("sede_id")}
            </div>
            <div>
              {lbl("Bodega", true)}
              <select name="bodega_id" value={formData.bodega_id} onChange={handleChange} className={inputClass("bodega_id")}>
                <option value="">Seleccionar...</option>
                {bodegasLista.map((b) => <option key={b.id} value={b.id}>{b.nombre ?? b.name}</option>)}
              </select>
              {err("bodega_id")}
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="space-y-3">
          <SectionTitle>Configuración</SectionTitle>
          <div>
            {lbl("Tipo de registro", true)}
            <select name="tipo_registros_id" value={formData.tipo_registros_id} onChange={handleChange}
              className={inputClass("tipo_registros_id")}>
              <option value="">Seleccionar...</option>
              {tipoRegistroLista.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {err("tipo_registros_id")}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-1">
          {onClose && (
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />{isEdit ? "Actualizando..." : "Guardando..."}</>
            ) : isEdit ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

RegisterKiosko.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
