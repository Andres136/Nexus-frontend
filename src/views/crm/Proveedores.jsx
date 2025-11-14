import { useState, useEffect } from "react"
import clienteAxios from "../../config/axios"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { Link } from "react-router-dom"
import Select from "react-select"
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download,
  ShoppingCart,
  Eye,
  AlertTriangle,
  Filter,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react"

import ModalRegistroProcesoBolsa from "../../components/crm/ModalRegistroProcesoBolsa"

export default function Proveedores() {
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    telefono: "",
    direccion: "",
    correo: "",
    ciudad: "",
    observaciones: "",
  })

  // estados
  const [proveedorFiltro, setProveedorFiltro] = useState(""); // '' = todos
  const [proveedores, setProveedores] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const obtenerProveedores = async (page = 1) => {
    const token = localStorage.getItem("token")
    try {
      const response = await clienteAxios.get("/api/proveedores", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          search,
        },
      })
      setProveedores(response.data.proveedores.data)
      setCurrentPage(response.data.proveedores.current_page)
      setLastPage(response.data.proveedores.last_page)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      if (form.id) {
        const response = await clienteAxios.put(`/api/proveedores/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success(response.data.message)
      } else {
        const response = await clienteAxios.post("/api/proveedores", form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log(response.data)
        toast.success(response.data.message)
      }

      setForm({
        nombre: "",
        nit: "",
        telefono: "",
        direccion: "",
        correo: "",
        ciudad: "",
        observaciones: "",
      })

      obtenerProveedores()
    } catch (error) {
      if (error.response && error.response.status === 422) {
        toast.error("Error de validación")
      } else {
        toast.error("Error al guardar proveedor")
      }
    }
  }

  const descargarPendientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        "/api/entregas/items-pendientes/pdf",
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          params: {
            proveedor_id: proveedorFiltro || undefined, // si '' no lo envía
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "items_pendientes.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.info("No hay ítems pendientes para el filtro seleccionado.");
      } else {
        console.error(error);
        toast.error("Error al descargar PDF");
      }
    }
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      setLastPage(1) // No hay paginación, así que siempre será 1
      if (result.isConfirmed) {
        const token = localStorage.getItem("token")
        try {
          const response = await clienteAxios.delete(`/api/proveedores/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          toast.success(response.data.message)
          obtenerProveedores()
        } catch (error) {
          toast.error("Error al eliminar proveedor")
        }
      }
    })
  }

  //Cargar todos los proveedores al iniciar sin paginación
  useEffect(() => {
    const fetchProveedores = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await clienteAxios.get("/api/proveedores-all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // data.proveedores es un array
        setProveedoresFiltrados(Array.isArray(data.proveedores) ? data.proveedores : []);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        toast.error("Error al cargar proveedores");
        setProveedoresFiltrados([]); // fallback seguro
      }
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    obtenerProveedores(currentPage)
  }, [currentPage, search])

  const opcionesFiltro = proveedoresFiltrados.map(p => ({ value: p.id, label: p.nombre }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Proveedores</h1>
              <p className="text-gray-600">Administra y controla tu red de proveedores</p>
            </div>
          </div>

          {/* ✅ Enlaces de navegación mejorados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link
              to="/auth/crm/proveedores-ordenes-compra"
              className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">Nueva Orden</span>
              </div>
              <p className="text-green-100 text-sm mt-1">Registrar orden de compra</p>
            </Link>

            <Link
              to="/auth/crm/ordenes-compra-proveedor"
              className="group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">Ver Órdenes</span>
              </div>
              <p className="text-indigo-100 text-sm mt-1">Órdenes registradas</p>
            </Link>

            <Link
              to="/auth/crm/referencias-faltantes"
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Referencias</span>
              </div>
              <p className="text-orange-100 text-sm mt-1">Referencias faltantes</p>
            </Link>

            <div className="flex items-center justify-center">
              <ModalRegistroProcesoBolsa />
            </div>
          </div>

          {/* ✅ Filtros mejorados */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-700">Filtros y Reportes</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-sm">
                <Select
                  options={opcionesFiltro}
                  value={
                    proveedorFiltro
                      ? opcionesFiltro.find(o => o.value === Number(proveedorFiltro))
                      : null
                  }
                  onChange={(opt) => setProveedorFiltro(opt?.value ? String(opt.value) : "")}
                  isClearable
                  placeholder="Filtrar por proveedor…"
                  classNamePrefix="rs"
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      minHeight: '44px'
                    })
                  }}
                />
              </div>

              <button
                onClick={descargarPendientes}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 font-medium shadow-lg"
              >
                <Download className="w-4 h-4" />
                Referencias Pendientes
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Formulario mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {form.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Nombre del Proveedor
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingresa el nombre"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* NIT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  NIT
                </label>
                <input
                  type="text"
                  name="nit"
                  value={form.nit}
                  onChange={handleChange}
                  placeholder="Número de identificación"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Número de contacto"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Dirección física"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="email@empresa.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ciudad de ubicación"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder="Información adicional del proveedor..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                {form.id ? 'Actualizar' : 'Guardar'} Proveedor
              </button>
            </div>
          </form>
        </div>

        {/* ✅ Búsqueda mejorada */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o NIT"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={() => obtenerProveedores(1)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 font-medium shadow-lg"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>

        {/* ✅ Tabla mejorada */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Proveedores</h3>
            <p className="text-sm text-gray-600">Total: {proveedores.length} proveedores</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{proveedor.nombre}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {proveedor.nit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {proveedor.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {proveedor.telefono}
                          </div>
                        )}
                        {proveedor.correo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {proveedor.correo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {proveedor.direccion && (
                          <div className="text-sm text-gray-600 flex items-start gap-2">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{proveedor.direccion}</span>
                          </div>
                        )}
                        {proveedor.ciudad && (
                          <div className="text-sm text-gray-500">{proveedor.ciudad}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setForm(proveedor)}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                          title="Editar proveedor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(proveedor.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Paginación mejorada */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                ← Anterior
              </button>

              <div className="bg-white px-4 py-2 rounded-lg border border-gray-300">
                <span className="text-gray-700 font-medium">
                  Página {currentPage} de {lastPage}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}