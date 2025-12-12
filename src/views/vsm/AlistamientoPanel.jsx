import { useEffect, useState } from "react";
import Select from "react-select";
import { useAlistamientos } from "../../hooks/vsm/useAlistamiento";
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
import { Link, useLocation,  } from "react-router-dom";


export default function AlistamientoPanel() {
  const { loading } = useAlistamientos();

  const [selectedOT, setSelectedOT] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
const location = useLocation();


  // Cargar usuarios para el Multiselect
  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(
        res.data.map((u) => ({
          value: u.id,
          label: `${u.name}`,
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        orden_trabajo_id: selectedOT?.value,
        producto_id: selectedOT?.producto_id,
        usuarios: selectedUsers.map(u => u.value),
        cantidad: selectedOT?.cantidad_programada,
        fecha: new Date().toISOString().split("T")[0],
      };

   //   console.log("Payload enviado:", payload);

      const res = await vsmService.crearAlistamiento(payload);

      toast(res.data.message || "Alistamiento iniciado con éxito");
      // Limpiar formulario
      setSelectedOT(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* ✅ Header compacto */}
<div className="bg-white shadow-sm border-b">
  <div className="max-w-6xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de Alistamiento</h1>
          <p className="text-sm text-gray-600">Gestión VSM</p>
        </div>
      </div>

 {/* ENLACES DE NAVEGACIÓN */}
      <div className="flex items-center gap-6">
        
        {/* FLUJO VSM */}
        <Link
          to="/auth/crm/flujo-vsm"
          className={`text-sm font-medium transition-all ${
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
          className={`text-sm font-medium transition-all ${
            location.pathname === "/auth/crm/vsm/dashboard"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pronóstico
        </Link>

      </div>

    </div>
  </div>
</div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* ✅ Formulario compacto */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          
          {/* Header del formulario */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-900">Nuevo Alistamiento</h2>
            </div>
          </div>

          {/* ✅ Grid compacto para formulario */}
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Orden de Trabajo */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-3 h-3 text-blue-600" />
                Orden de Trabajo
              </label>
              
              <Select
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
              />

              {errors.orden_trabajo_id && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.orden_trabajo_id}</span>
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
            <div className="lg:col-span-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-3 h-3 text-purple-600" />
                Usuarios ({selectedUsers.length})
              </label>
              
              <Select
                isMulti
                options={users}
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
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                onClick={iniciar}
                disabled={loading || !selectedOT || selectedUsers.length === 0}
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
                {!selectedOT && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Selecciona OT
                  </p>
                )}
                {selectedOT && selectedUsers.length === 0 && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Asigna usuarios
                  </p>
                )}
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