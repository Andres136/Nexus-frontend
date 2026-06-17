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
  FileText,
  X,
  PieChart
} from "lucide-react"

import ModalRegistroProcesoBolsa from "../../components/crm/ModalRegistroProcesoBolsa"

export default function Proveedores() {
  const formInicial = {
    nombre: "",
    nit: "",
    telefono: "",
    direccion: "",
    correo: "",
    ciudad: "",
    observaciones: "",
  }

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
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState("");
  const [fechaFinFiltro, setFechaFinFiltro] = useState("");
  const [proveedores, setProveedores] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [errores, setErrores] = useState({});
  const [modalProveedorOpen, setModalProveedorOpen] = useState(false);

  const abrirModalCrear = () => {
    setForm(formInicial)
    setErrores({})
    setModalProveedorOpen(true)
  }

  const abrirModalEditar = (proveedor) => {
    setForm(proveedor)
    setErrores({})
    setModalProveedorOpen(true)
  }

  const cerrarModalProveedor = () => {
    setModalProveedorOpen(false)
    setForm(formInicial)
    setErrores({})
  }

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

      cerrarModalProveedor()

      obtenerProveedores()
    } catch (error) {
      console.log(error)
      if (error.response && error.response.status === 422) {
        setErrores(error.response.data.errors || {})
      } else {
        toast.error("Error al guardar proveedor")
      }
    }
  }

  const descargarPendientes = async () => {
    const token = localStorage.getItem("token");

    if (fechaInicioFiltro && fechaFinFiltro && fechaInicioFiltro > fechaFinFiltro) {
      toast.error("La fecha inicial no puede ser mayor a la fecha final");
      return;
    }

    try {
      const response = await clienteAxios.get(
        "/api/entregas/items-pendientes/pdf",
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          params: {
            proveedor_id: proveedorFiltro || undefined, // si '' no lo envía
            fecha_inicio: fechaInicioFiltro || undefined,
            fecha_fin: fechaFinFiltro || undefined,
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const rango = fechaInicioFiltro || fechaFinFiltro
        ? `_${fechaInicioFiltro || "inicio"}_${fechaFinFiltro || "fin"}`
        : "";
      link.href = url;
      link.download = `items_pendientes${rango}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error("No hay entregas pendientes para los filtros seleccionados");
      } else if (error?.response?.status === 400) {
        toast.error("Hay demasiados datos. Filtra por proveedor o reduce el rango de fechas");
      } else if (error?.response?.status === 422) {
        toast.error("Revisa el rango de fechas seleccionado");
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
      <div className="grid grid-cols-1">
      <div className="container mx-auto px-4 py-8">
        {/* ✅ Header mejorado */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
  {/* Header simple */}
  <div className="flex items-center gap-3 mb-6">
    <div className="bg-blue-600 p-2 rounded-lg">
      <Building2 className="w-6 h-6 text-white" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h1>
      <p className="text-gray-600 text-sm">Administra y controla tu red de proveedores</p>
    </div>
  </div>

  {/* Enlaces simplificados */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    <Link
      to="/auth/crm/proveedores-ordenes-compra"
      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
    >
      <ShoppingCart className="w-4 h-4" />
      <div>
        <div className="font-medium text-sm">Nueva Orden</div>
        <div className="text-xs text-green-600">Registrar orden</div>
      </div>
    </Link>

    <Link
      to="/auth/crm/ordenes-compra-proveedor"
      className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
    >
      <Eye className="w-4 h-4" />
      <div>
        <div className="font-medium text-sm">Ver Órdenes</div>
        <div className="text-xs text-blue-600">Órdenes registradas</div>
      </div>
    </Link>

    <Link
      to="/auth/crm/referencias-faltantes"
      className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 transition-colors"
    >
      <AlertTriangle className="w-4 h-4" />
      <div>
        <div className="font-medium text-sm">Referencias</div>
        <div className="text-xs text-orange-600">Faltantes</div>
      </div>
    </Link>
   <Link
  to="/auth/crm/estadisticas-ordenes"
  className="flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg border border-teal-200 transition-colors"
>
  <PieChart className="w-4 h-4" />
  <div>
    <div className="font-medium text-sm">Estadísticas</div>
    <div className="text-xs text-teal-600">Órdenes</div>
  </div>
</Link>

   <Link
      to="/auth/crm/ordenes-servicio-proveedor"
      className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
    >
      <Eye className="w-4 h-4" />
      <div>
        <div className="font-medium text-sm">Ver Órdenes de Servicio</div>
        <div className="text-xs text-red-600">Órdenes de Servicio</div>
      </div>
    </Link>

    {/* Eliminé el link duplicado y lo reemplacé con el modal */}
    <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <ModalRegistroProcesoBolsa />
    </div>
  </div>

  {/* Filtros simplificados */}
  <div className="border-t border-gray-200 pt-4">
    <div className="flex items-center gap-2 mb-3">
      <Filter className="w-4 h-4 text-gray-500" />
      <h3 className="font-medium text-gray-700 text-sm">Filtros</h3>
    </div>
    
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto_auto] lg:items-end">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Proveedor
        </label>
        <Select
          options={opcionesFiltro}
          value={
            proveedorFiltro
              ? opcionesFiltro.find(o => o.value === Number(proveedorFiltro))
              : null
          }
          onChange={(opt) => setProveedorFiltro(opt?.value ? String(opt.value) : "")}
          isClearable
          placeholder="Filtrar proveedor..."
          classNamePrefix="rs"
          styles={{
            control: (base) => ({
              ...base,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              minHeight: '38px',
              fontSize: '14px'
            })
          }}
        />
      </div>

      <div>
        <label htmlFor="fecha_inicio_pdf" className="mb-1 block text-xs font-medium text-gray-600">
          Fecha inicial
        </label>
        <input
          id="fecha_inicio_pdf"
          type="date"
          value={fechaInicioFiltro}
          onChange={(e) => setFechaInicioFiltro(e.target.value)}
          max={fechaFinFiltro || undefined}
          className="h-[38px] w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="fecha_fin_pdf" className="mb-1 block text-xs font-medium text-gray-600">
          Fecha final
        </label>
        <input
          id="fecha_fin_pdf"
          type="date"
          value={fechaFinFiltro}
          onChange={(e) => setFechaFinFiltro(e.target.value)}
          min={fechaInicioFiltro || undefined}
          className="h-[38px] w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setProveedorFiltro("");
          setFechaInicioFiltro("");
          setFechaFinFiltro("");
        }}
        className="flex h-[38px] items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Limpiar
      </button>

      <button
        onClick={descargarPendientes}
        className="flex h-[38px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Download className="w-4 h-4" />
        Descargar PDF
      </button>
    </div>
  </div>
</div>

        {/* ✅ Búsqueda mejorada */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
       <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 items-center">
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
            <button
              onClick={abrirModalCrear}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 font-medium shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Proveedor
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
                          onClick={() => abrirModalEditar(proveedor)}
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

      {modalProveedorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModalProveedor()
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {form.id ? "Editar Proveedor" : "Nuevo Proveedor"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {form.id ? "Actualiza la información del proveedor" : "Completa los datos para crear el proveedor"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarModalProveedor}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    Nombre del Proveedor
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ingresa el nombre"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  {errores.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errores.nombre[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="nit" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    NIT
                  </label>
                  <input
                    id="nit"
                    type="text"
                    name="nit"
                    value={form.nit}
                    onChange={handleChange}
                    placeholder="Número de identificación"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  {errores.nit && (
                    <p className="text-red-500 text-sm mt-1">{errores.nit[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Número de contacto"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errores.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errores.telefono[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="direccion" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Dirección física"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errores.direccion && (
                    <p className="text-red-500 text-sm mt-1">{errores.direccion[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="correo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Correo Electrónico
                  </label>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="email@empresa.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errores.correo && (
                    <p className="text-red-500 text-sm mt-1">{errores.correo[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="ciudad" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ciudad de ubicación"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <label htmlFor="observaciones" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    placeholder="Información adicional del proveedor..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModalProveedor}
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  {form.id ? "Actualizar" : "Guardar"} Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
