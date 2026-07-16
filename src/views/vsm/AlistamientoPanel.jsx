import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useAlistamientos } from "../../hooks/vsm/useAlistamiento";
import { useProducts } from "../../hooks/useProducts";
import { usersApi } from "../../services/api";
import { toast } from "react-toastify";
import { otAlistamientoService, vsmService } from "../../services/vsm";
import AlistamientosActivos from "../../components/vsm/AlistamientosActivos";
import {
  Package,
  Users,
  Play,
  ClipboardList,
  AlertCircle,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


export default function AlistamientoPanel() {
  const { loading } = useAlistamientos();
  const { user: authUser } = useAuth({ middleware: 'auth' });

  const [selectedOT, setSelectedOT] = useState(null);
  const [tipoOrigen, setTipoOrigen] = useState("OT");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const location = useLocation();

  const { products, isLoading: loadingProducts, isFetching: fetchingProducts } = useProducts({ search: productSearch });

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getUsers();
      setUsers(res.data);
    } catch (e) {
      console.log(e);
      toast.error("No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtra por sede del usuario autenticado en el render, sin bloquear la carga inicial
  const userOptions = useMemo(() => {
    const sedeId = authUser?.sede_id ? Number(authUser.sede_id) : null;
    const fuente = sedeId
      ? users.filter((u) => Number(u.sede_id) === sedeId)
      : users;
    return fuente.map((u) => ({ value: u.id, label: u.name }));
  }, [users, authUser?.sede_id]);

  // Obtener órdenes de trabajo para alistamiento
  useEffect(() => {
    const fetchOTs = async () => {
      try {
        const res = await otAlistamientoService.ordenesParaAlistamiento();
       // console.log("OTs para alistamiento:", res.data);
        setOrdenesTrabajo(res.data);
      } catch (e) {
        console.error(e);
        toast.error("No se pudieron cargar las órdenes de trabajo");
      }
    };

    fetchOTs();
  }, []);

  // INICIAR ALISTAMIENTO
  const iniciar = async () => {
    try {
      const payload = {
        tipo_origen: tipoOrigen,
        orden_trabajo_id: tipoOrigen === "OT" ? selectedOT?.value : null,
        productos: tipoOrigen === "LIBRE" ? selectedProducts.map(p => p.value) : undefined,
        usuarios: selectedUsers.map(u => u.value),
        cantidad: tipoOrigen === "LIBRE" ? 0 : selectedOT?.cantidad_programada,
        fecha: new Date().toISOString().split("T")[0],
      };

   // console.log("Payload enviado:", payload);

      const res = await vsmService.crearAlistamiento(payload);
  
      toast(res.data.message || "Alistamiento iniciado con éxito");
      // Limpiar formulario
      setSelectedOT(null);
      setSelectedProducts([]);
      setSelectedUsers([]);
      setErrors({});

    } catch (error) {
      console.error("❌ Error al iniciar alistamiento:", error);

      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        toast.error("Corrige los campos marcados");
        return;
      }

      toast.error("Error inesperado");
    }
  };

  // ✅ Estilos compactos para Select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '36px',
      fontSize: '14px',
      border: state.isFocused ? '1px solid #3b82f6' : '1px solid #d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
    placeholder: (base) => ({ ...base, color: '#6b7280' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe' }),
    multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontSize: '12px' }),
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* ✅ Header compacto */}
<div className="w-full min-w-0 max-w-full overflow-hidden bg-white shadow-sm border-b">
  <div className="w-full min-w-0 max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 box-border">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Panel de Alistamiento</h1>
          <p className="text-sm text-gray-600">Gestión VSM</p>
        </div>
      </div>

 {/* ENLACES DE NAVEGACIÓN */}
      <div className="flex w-full min-w-0 max-w-full items-center gap-5 overflow-x-auto overscroll-x-contain pb-2 lg:pb-0 lg:w-auto">
        
        {/* FLUJO VSM */}
        <Link
          to="/auth/crm/flujo-vsm"
          className={`text-sm font-medium transition-all whitespace-nowrap ${
            location.pathname === "/auth/crm/flujo-vsm"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Flujo VSM
        </Link>

        {/* PRONÓSTICO */}
        <Link
          to="/auth/crm/vsm/dashboard"
          className={`text-sm font-medium transition-all whitespace-nowrap ${
            location.pathname === "/auth/crm/vsm/dashboard"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pronóstico
        </Link>


        {/* AUDITORÍA DE ALISTAMIENTOS */}       
         <Link
          to="/auth/crm/vsm/auditoria"
          className={`text-sm font-medium transition-all whitespace-nowrap ${
            location.pathname === "/auth/crm/vsm/alistamientos-auditoria"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Auditoría de Alistamientos
        </Link>

        
        {/* PRODUCTIVIDAD INDIVIDUAL */}       
         <Link
          to="/auth/crm/vsm/productividad-individual"
          className={`text-sm font-medium transition-all whitespace-nowrap ${
            location.pathname === "/auth/crm/vsm/productividad-individual"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Productividad Individual
        </Link>

        {/* CONFIGURACIÓN VSM */}
        <Link
          to="/auth/crm/vsm/configuracion"
          className={`text-sm font-medium transition-all whitespace-nowrap ${
            location.pathname === "/auth/crm/vsm/configuracion"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Configuración VSM
        </Link>

      </div>

    </div>
  </div>
</div>

      <div className="container w-full min-w-0 max-w-full mx-auto px-2 sm:px-4 py-3 sm:py-6 box-border">
        
        {/* ✅ Formulario compacto */}
        <div className="bg-white rounded-xl shadow-sm border mb-4 sm:mb-6 overflow-visible">
          
          {/* Header del formulario */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-900">Nuevo Alistamiento</h2>
            </div>
          </div>

          {/* ✅ Grid compacto para formulario */}
          <div className="w-full min-w-0 p-3 sm:p-4 space-y-4 box-border">
            <div className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                ["OT", "Con orden de trabajo"],
                ["LIBRE", "Rendimiento libre"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTipoOrigen(value);
                    setErrors({});
                  }}
                  className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    tipoOrigen === value ? "bg-white text-blue-700 shadow-sm" : "text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Orden de Trabajo */}
            <div className="min-w-0 lg:col-span-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-3 h-3 text-blue-600" />
                {tipoOrigen === "OT" ? "Orden de Trabajo" : `Producto(s) (${selectedProducts.length})`}
              </label>

              {tipoOrigen === "OT" ? <Select
                placeholder="Seleccione OT..."
                options={ordenesTrabajo.map((ot) => ({
                  value: ot.id,
                  label: `OT #${ot.id} – ${ot.orden_compra?.cliente?.nombre}`,
                  ...ot,
                }))}
                onChange={setSelectedOT}
                value={selectedOT}
                styles={selectStyles}
                isClearable
              /> : <Select
                isMulti
                placeholder="Escribe para buscar producto(s)..."
                options={products.map((product) => ({
                  value: product.id,
                  label: `${product.code ? `${product.code} – ` : ""}${product.name}`,
                }))}
                onChange={setSelectedProducts}
                onInputChange={(value) => setProductSearch(value)}
                value={selectedProducts}
                styles={selectStyles}
                isSearchable
                isLoading={loadingProducts || fetchingProducts}
                noOptionsMessage={() => (loadingProducts ? "Cargando..." : "Sin resultados, prueba con otro término")}
                maxMenuHeight={150}
              />}

              {errors.orden_trabajo_id && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.orden_trabajo_id}</span>
                </div>
              )}
              {errors.productos && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.productos}</span>
                </div>
              )}

              {/* ✅ Info compacta de OT seleccionada */}
              {selectedOT && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {selectedOT.orden_compra?.cliente?.nombre || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOT.cantidad_programada || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Usuarios */}
            <div className="min-w-0 lg:col-span-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-3 h-3 text-purple-600" />
                Usuarios ({selectedUsers.length})
              </label>
              
              <Select
                isMulti
                options={userOptions}
                placeholder="Seleccione usuarios..."
                onChange={setSelectedUsers}
                value={selectedUsers}
                styles={selectStyles}
                maxMenuHeight={150}
              />

              {errors.usuarios && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.usuarios}</span>
                </div>
              )}
            </div>

            {/* Botón de acción */}
            <div className="lg:col-span-1 flex flex-col justify-end">
              <button
                className="w-full min-h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 sm:hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                onClick={iniciar}
                disabled={loading || selectedUsers.length === 0 || (tipoOrigen === "OT" ? !selectedOT : selectedProducts.length === 0)}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar
                  </>
                )}
              </button>

              {/* ✅ Estado compacto */}
              <div className="mt-2 text-center">
                {tipoOrigen === "OT" && !selectedOT && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Selecciona OT
                  </p>
                )}
                {tipoOrigen === "LIBRE" && selectedProducts.length === 0 && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Selecciona al menos un producto
                  </p>
                )}
                {((tipoOrigen === "OT" && selectedOT) || (tipoOrigen === "LIBRE" && selectedProducts.length > 0)) && selectedUsers.length === 0 && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Asigna usuarios
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ✅ Alistamientos activos compacto */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Alistamientos Activos</h2>
            </div>
          </div>
          
          <div className="p-4">
            <AlistamientosActivos />
          
          </div>
        </div>
      </div>
    </div>
  );
}
