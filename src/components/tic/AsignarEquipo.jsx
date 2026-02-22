import React, { useEffect, useState } from 'react'
import { useAsignacionesEquipo } from '../../hooks/tic/useAsignacionesEquipo';
import { useSedes } from '../../hooks/useSedes';
import { useAuth } from '../../hooks/useAuth';

import { inventariosApi, productsApi } from '../../services/api';
import { useProducts } from '../../hooks/useProducts';
import { useEmpresas } from '../../hooks/useEmpresas';
import Select from 'react-select';import {
  Building2,
  Users,
  Calendar,
  Package,
  ClipboardList,
  Factory,
  Tag,
  FileText,
  CheckCircle
} from "lucide-react";


export default function AsignarEquipo() {
  const { formData, error, loading, handleChange, handleSubmit,setFormData, pdfUrl } = useAsignacionesEquipo();

  const { obtenerUsuariosAll, usuarios } = useAuth({ middleware: "auth" });
  const { sedes } = useSedes();
    const { empresas } = useEmpresas();
  const { categorias, categoriasLoading } = useProducts();
  const [productos, setProductos] = useState([]);


const cargarProductosFiltrados = async () => {
  try {
    const { data } = await inventariosApi.productosAsignadosUsuario({
      sede_id: formData.sede_id || undefined,
      categoria_id: formData.categoria_id || undefined,
      empresa_id: formData.empresa_id || undefined,
    });
   
 setProductos(data.data.original.data);
        console.log("Productos filtrados cargados:", data.data.original.data);
  } catch (error) {
    console.error(error);
  }
};


useEffect(() => {
  obtenerUsuariosAll();
}, []);

useEffect(() => {
  if (formData.categoria_id || formData.sede_id || formData.empresa_id) {
    cargarProductosFiltrados();
  }
}, [formData.categoria_id, formData.sede_id, formData.empresa_id]);



return (
  <div className="mx-auto w-full max-w-6xl px-4 py-8">
    <div className="rounded-2xl bg-white p-8 ">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            Asignar equipo
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registra la entrega formal de un equipo a un usuario.
          </p>
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            <FileText size={18} />
            Ver Acta PDF
          </a>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Sede */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 size={16} />
              Sede
            </label>
            <Select
              options={sedes.map((sede) => ({
                value: sede.id,
                label: sede.nombre,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  sede_id: option ? option.value : "",
                }))
              }
              placeholder="Selecciona una sede"
            />
            {error?.sede_id && (
              <p className="text-xs text-red-600">{error.sede_id[0]}</p>
            )}
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Factory size={16} />
              Empresa
            </label>
            <Select
              options={empresas.map((empresa) => ({
                value: empresa.id,
                label: empresa.nombre,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  empresa_id: option ? option.value : "",
                }))
              }
              placeholder="Selecciona una empresa"
            />
            {error?.empresa_id && (
              <p className="text-xs text-red-600">{error.empresa_id[0]}</p>
            )}
          </div>

          {/* Usuario */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} />
              Usuario
            </label>
            <Select
              options={usuarios.map((usuario) => ({
                value: usuario.id,
                label: usuario.name,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  usuario_asignacion_id: option ? option.value : "",
                }))
              }
              placeholder="Selecciona un usuario"
            />
            {error?.usuario_asignacion_id && (
              <p className="text-xs text-red-600">
                {error.usuario_asignacion_id[0]}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Tag size={16} />
              Categoría
            </label>
            <Select
              options={categorias.map((categoria) => ({
                value: categoria.id,
                label: categoria.nombre,
              }))}
              onChange={(option) =>
                setFormData({
                  ...formData,
                  categoria_id: option ? option.value : "",
                })
              }
              placeholder="Selecciona una categoría"
            />
          </div>

          {/* Producto */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} />
              Producto
            </label>
<Select
  options={productos.map((producto) => ({
    value: producto.producto_id,
    label: producto.nombre,
    descripcion: producto.descripcion,
  }))}

  value={
    productos
      .map((producto) => ({
        value: producto.producto_id,
        label: producto.nombre,
        descripcion: producto.descripcion,
      }))
      .find((opt) => opt.value === formData.producto_id) || null
  }

  formatOptionLabel={(option) => (
    <div className="flex flex-col">
      <span className="font-medium text-gray-800">
        {option.label}
      </span>
      {option.descripcion && (
        <span className="text-xs text-gray-500">
          {option.descripcion}
        </span>
      )}
    </div>
  )}

  onChange={(option) =>
    setFormData((prev) => ({
      ...prev,
      producto_id: option ? option.value : "",
    }))
  }

  placeholder="Selecciona un producto"
/>
            {error?.producto_id && (
              <p className="text-xs text-red-600">
                {error.producto_id[0]}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} />
              Fecha asignación
            </label>
            <input
              type="date"
              name="fecha_asignacion"
              value={formData.fecha_asignacion}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            {error?.fecha_asignacion && (
              <p className="text-xs text-red-600">
                {error.fecha_asignacion[0]}
              </p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText size={16} />
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="Escribe observaciones (opcional)"
          />
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            <CheckCircle size={18} />
            {loading ? "Asignando..." : "Asignar Equipo"}
          </button>
        </div>

      </form>
    </div>
  </div>
);
;

}
