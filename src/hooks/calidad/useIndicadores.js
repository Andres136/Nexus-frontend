// src/hooks/calidad/useIndicadores.js
import { useState } from "react";
import { toast } from "react-toastify";
import { indicadoresApi } from "../../services/api";

const initialForm = {
  nombre: "",
  formula: "",
  meta: "",
  frecuencia: "",
  descripcion: "",
  tipo_meta: "",
};

export function useIndicadores() {
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [indicadores, setIndicadores] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [paginacion, setPaginacion] = useState({
    last_page: 1,
    current_page: 1,
    total: 0,
    per_page: 10,
  });

  const fetchIndicadores = async (depId = "", page = 1, search = "") => {
    const res = await indicadoresApi.getIndicadoresDepartamento({
        
      departamento_id: depId,
      page,
      search,
    });
    console.log("Indicadores obtenidos:", res.data);
    setIndicadores(res.data.data || []);
    setPaginacion({
      last_page: res.data.last_page,
      current_page: res.data.current_page,
      total: res.data.total,
      per_page: res.data.per_page,
    });
  };

  const handleEdit = (indicador) => {
    setEditId(indicador.id);
    setFormData({
      nombre: indicador.nombre || "",
      formula: indicador.formula || "",
      meta: indicador.meta || "",
      frecuencia: indicador.frecuencia || "",
      descripcion: indicador.descripcion || "",
      tipo_meta: indicador.tipo_meta || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    if (errors[name]) {
      setErrors((s) => ({ ...s, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors({});
      let response;
      if (editId) {
        response = await indicadoresApi.update(editId, formData);
        setIndicadores((prev) =>
          prev.map((ind) => (ind.id === editId ? { ...ind, ...formData } : ind))
        );
        toast.success(response?.data?.message ?? "Indicador actualizado", {
          className: "bg-blue-400 text-white font-bold",
          progressClassName: "bg-blue-300",
        });
        setEditId(null);
      } else {
        response = await indicadoresApi.create(formData);
        toast.success(response?.data?.message ?? "Indicador creado", {
          className:
            "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
          progressClassName: "bg-green-400",
        });
      }
      setFormData(initialForm);
      await fetchIndicadores();
    } catch (err) {
      const { response } = err || {};
      if (response?.status === 422 && response.data?.errors) {
        setErrors(response.data.errors);
        toast.error("Revisa los campos del formulario");
      } else if (response?.status === 403) {
        toast.error(response.data?.message ?? "No autorizado");
      } else {
        toast.error("Error al crear el indicador");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
    setErrors({});
  };

  const err = (k) => errors?.[k]?.[0];

  return {
    formData,
    errors,
    editId,
    indicadores,
    setIndicadores,
    paginacion,
    handleEdit,
    handleChange,
    handleSubmit,
    handleCancelEdit,
    fetchIndicadores,
    err,
  };
}