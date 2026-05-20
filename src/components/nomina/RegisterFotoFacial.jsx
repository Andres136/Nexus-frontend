import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Loader2, Upload, X, UserCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { fotoFacialService } from "../../services/nominaService";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";
import { showToast } from "../../helpers/utils/showToast";

const STORAGE_URL = import.meta.env.VITE_API_URL + "/storage/";

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
      {children}
    </p>
  );
}
SectionTitle.propTypes = { children: PropTypes.node };

export default function RegisterFotoFacial({ uuid = null, defaultUsersId = null, onClose }) {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);

  const [usersId, setUsersId]           = useState(defaultUsersId ?? "");
  const [file, setFile]                 = useState(null);
  const [preview, setPreview]           = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [loading, setLoading]           = useState(false);
  const [loadingData, setLoadingData]   = useState(false);

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const isEdit = !!uuid;

  useEffect(() => {
    if (!uuid) {
      setUsersId(defaultUsersId ?? "");
      setFile(null); setPreview(null);
      setCurrentPhoto(null); setFieldErrors({});
      return;
    }
    setLoadingData(true);
    fotoFacialService.getFotoByUuid(uuid)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setUsersId(d.users_id ?? "");
        setCurrentPhoto(d.photo ? STORAGE_URL + d.photo : null);
      })
      .catch(() => showToast("error", "Error al cargar la foto"))
      .finally(() => setLoadingData(false));
  }, [uuid]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.append("users_id", usersId);
      if (file) fd.append("photo", file);

      const res = isEdit
        ? await fotoFacialService.updateFoto(uuid, fd)
        : await fotoFacialService.createFoto(fd);

      showToast("success", res.data.message || (isEdit ? "Actualizada" : "Registrada"));
      queryClient.invalidateQueries(["fotosFaciales"]);
      onClose?.();
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const inputErr = (field) =>
    fieldErrors[field] && (
      <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors[field][0]}</p>
    );

  const inputBase = (field) =>
    `block w-full h-[34px] px-2.5 rounded-md border text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    }`;

  if (isEdit && loadingData) {
    return (
      <div className="space-y-3 animate-pulse p-1">
        <div className="h-4 bg-gray-200 rounded w-40" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
      </div>
    );
  }

  const displayImage = preview || currentPhoto;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {isEdit ? "Actualizar Foto Facial" : "Registrar Foto Facial"}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {isEdit ? "Cambia la foto del empleado para el kiosko." : "Sube la foto facial del empleado para reconocimiento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Empleado */}
        <div className="space-y-3">
          <SectionTitle>Empleado</SectionTitle>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Empleado <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Select
              options={empleados}
              value={empleados.find((e) => e.value === Number(usersId)) ?? null}
              onChange={(opt) => setUsersId(opt ? opt.value : "")}
              placeholder={loadingEmpleados ? "Cargando..." : "Seleccionar empleado..."}
              noOptionsMessage={() => "Sin resultados"}
              isDisabled={isEdit}
              isLoading={loadingEmpleados}
              classNamePrefix="rs"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "34px",
                  height: "34px",
                  fontSize: "0.8125rem",
                  borderColor: fieldErrors.users_id ? "#f87171" : state.isFocused ? "#6366f1" : "#d1d5db",
                  backgroundColor: fieldErrors.users_id ? "#fff1f2" : base.backgroundColor,
                  boxShadow: state.isFocused ? "0 0 0 2px #6366f133" : "none",
                  "&:hover": { borderColor: state.isFocused ? "#6366f1" : "#9ca3af" },
                }),
                valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                indicatorsContainer: (base) => ({ ...base, height: "34px" }),
                option: (base, state) => ({
                  ...base,
                  fontSize: "0.8125rem",
                  backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#eef2ff" : "white",
                  color: state.isSelected ? "white" : "#374151",
                }),
              }}
            />
            {inputErr("users_id")}
          </div>
        </div>

        {/* Foto */}
        <div className="space-y-3">
          <SectionTitle>Foto Facial</SectionTitle>

          {/* Vista previa */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <img src={displayImage} alt="preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <UserCircle2 className="h-14 w-14 text-gray-300" />
              )}
            </div>

            {preview && (
              <button type="button" onClick={clearFile}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                <X className="h-3.5 w-3.5" /> Quitar foto seleccionada
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEdit ? "Nueva foto (opcional)" : "Archivo"} <span className="text-red-500 ml-0.5">{!isEdit && "*"}</span>
            </label>
            <label className={`flex items-center gap-2 px-3 h-[34px] rounded-md border cursor-pointer text-[0.8125rem] transition-colors ${
              fieldErrors.photo ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:bg-gray-50"
            }`}>
              <Upload className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 truncate">
                {file ? file.name : "Seleccionar imagen (jpg, png — máx. 5 MB)"}
              </span>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png"
                onChange={handleFile} className="hidden" />
            </label>
            {inputErr("photo")}
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

RegisterFotoFacial.propTypes = {
  uuid:           PropTypes.string,
  defaultUsersId: PropTypes.number,
  onClose:        PropTypes.func,
};
