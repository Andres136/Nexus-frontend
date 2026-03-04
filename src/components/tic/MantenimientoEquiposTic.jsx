import { useState, useEffect } from "react";
import { useMantenimientoEquiposTic } from "../../hooks/tic/useMantenimientoEquiposTic";
import MantenimientoCalendar from "../../components/tic/MantenimientoCalendar";
import { X, Calendar, Wrench, Divide } from "lucide-react";
import { useSedes } from "../../hooks/useSedes";
import { useAuth } from "../../hooks/useAuth";
import { useEmpresas } from "../../hooks/useEmpresas";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { inventariosApi } from "../../services/api";
import ListarMantenimientosEquipos from "./ListarMantenimientosEquipos";

export default function MantenimientoEquiposTic() {

    const {
        formData,
        setFormData,
        mantenimientos,
        handleSubmit,
        obtenerMantenimientos,
        error,
    } = useMantenimientoEquiposTic();

    const [mostrarModal, setMostrarModal] = useState(false);
    const { empresas } = useEmpresas();
    const { categorias} = useProducts();
    const [productos, setProductos] = useState([]);
    const { obtenerUsuariosAll} = useAuth({ middleware: "auth" });
    const { sedes } = useSedes();


    const cargarProductosFiltrados = async () => {
        try {
            const { data } = await inventariosApi.productosAsignadosUsuario({
                sede_id: formData.sede_id || undefined,
                categoria_id: formData.categoria_id || undefined,
                empresa_id: formData.empresa_id || undefined,
            });
  // console.log("🚀  Productos filtrados:", data.data.original.data);
            setProductos(data.data.original.data);
         //   console.log("Productos filtrados cargados:", data.data.original.data);
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

const eventos = mantenimientos;
    useEffect(() => {
        obtenerMantenimientos();
    }, []);


const handleFormSubmit = async (e) => {
  e.preventDefault();
  await handleSubmit(e);

  if (!error) {
    setMostrarModal(false);
  }
};

    return (
        <div className="p-6 space-y-6">

            <MantenimientoCalendar
                events={eventos}
                onDateClick={(fecha) => {
                    setFormData((prev) => ({
                        ...prev,
                        fecha_programada: fecha
                    }));
                    setMostrarModal(true);
                }}
onEventClick={(data) => {
  setFormData({
    producto_id: data.producto_id || "",
    sede_id: data.sede_id || "",
    empresa_id: data.empresa_id || "",
    tipo: data.tipo || "",
    fecha_programada: data.start || "",
    estado: data.estado || "pendiente",
    costo: data.costo || "",
  });

  setMostrarModal(true);
}}
            />

            {/* Modal Mejorado */}
          {/* Modal Mejorado */}
{mostrarModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg">
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mantenimiento</h2>
            <p className="text-xs text-gray-500">Programa un nuevo mantenimiento</p>
          </div>
        </div>
        <button
          onClick={() => setMostrarModal(false)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-5">

        {/* Row 1: Empresa y Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
            <Select
              value={formData.empresa_id ? empresas.find(e => e.id === formData.empresa_id) ? { value: formData.empresa_id, label: empresas.find(e => e.id === formData.empresa_id)?.nombre } : null : null}
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
              placeholder="Selecciona empresa"
              isClearable
              className="text-sm"
            />
            {error?.empresa_id && (
              <p className="text-xs text-red-600 mt-1">{error.empresa_id[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <Select
              value={formData.categoria_id ? categorias.find(c => c.id === formData.categoria_id) ? { value: formData.categoria_id, label: categorias.find(c => c.id === formData.categoria_id)?.nombre } : null : null}
              options={categorias.map((categoria) => ({
                value: categoria.id,
                label: categoria.nombre,
              }))}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  categoria_id: option ? option.value : "",
                }))
              }
              placeholder="Selecciona categoría"
              isClearable
              className="text-sm"
            />
            {error?.categoria_id && (
              <p className="text-xs text-red-600 mt-1">{error.categoria_id[0]}</p>
            )}
          </div>
        </div>

        {/* Row 2: Producto y Sede */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
  <Select
  options={productos.map((producto) => ({
    value: producto.producto_id,
    label: producto.nombre,
    descripcion: producto.descripcion,
    asignado: producto.asignado_a
  }))}

  value={
    formData.producto_id
      ? {
          value: formData.producto_id,
          label: productos.find(p => p.producto_id === formData.producto_id)?.nombre
        }
      : null
  }

  onChange={(option) =>
    setFormData((prev) => ({
      ...prev,
      producto_id: option ? option.value : ""
    }))
  }

  placeholder="Selecciona producto"

  formatOptionLabel={(option) => (
    <div className="flex flex-col text-sm">
      <span className="font-medium">{option.label}</span>
      <span className="text-xs text-gray-500">
        {option.descripcion} — {option.asignado}
      </span>
    </div>
  )}

  menuPortalTarget={document.body}

  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
  }}
/>
            {error?.producto_id && (
              <p className="text-xs text-red-600 mt-1">{error.producto_id[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
            <Select
              value={formData.sede_id ? sedes.find(s => s.id === formData.sede_id) ? { value: formData.sede_id, label: sedes.find(s => s.id === formData.sede_id)?.nombre } : null : null}
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
              placeholder="Selecciona sede"
              isClearable
              className="text-sm"
            />
          </div>
        </div>

        {/* Row 3: Tipo y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Mantenimiento</label>
            <select
              value={formData.tipo || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tipo: e.target.value,
                }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona tipo</option>
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="backup">Backup</option>
              <option value="fisico">Fisico</option>
            </select>
            {error?.tipo && (
              <p className="text-xs text-red-600 mt-1">{error.tipo[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Fecha Programada
            </label>
            <input
              type="date"
              value={formData.fecha_programada || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fecha_programada: e.target.value
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {error?.fecha_programada && (
              <p className="text-xs text-red-600 mt-1">{error.fecha_programada[0]}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setMostrarModal(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  </div>
)}

<ListarMantenimientosEquipos />

        </div>
    );
}