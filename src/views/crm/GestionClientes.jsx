import { useClientes } from "../../hooks/useClientes";
import * as XLSX from "xlsx";
import ClientesList from "./ClientesList";
import { useFormatoFecha } from "../../hooks/useFormatoFecha";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { 
  UserPlus, 
  Users, 
  ChevronDown, 
  FileSpreadsheet, 
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  X,
  Plus
} from "lucide-react";
import { showToast } from "../../helpers/utils/showToast";

export default function GestionClientes() {
  
  const [excelError, setExcelError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Estado del modal

  const normaliza = (txt) =>
    txt
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const handleExcelChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

      if (!rawRows.length) throw new Error("El archivo está vacío");

      const rows = rawRows.map(r => ({
        ...r,
        telefono: r.telefono ? String(r.telefono) : "",
        nit: r.nit ? String(r.nit) : "",
      }));

      const requeridos = ["nombre", "email", "telefono", "direccion", "nit"];
      const faltan = requeridos.filter((c) => !(c in rows[0]));
      if (faltan.length) throw new Error(`Faltan columnas: ${faltan.join(", ")}`);

      const token = localStorage.getItem("token");
      await clienteAxios.post(
        "/api/clientes/importar-excel",
        { clientes: rows },
        { headers: { Authorization: `Bearer ${token}` } }
      );

     showToast('success', 'Clientes importados correctamente');
      setExcelError("");
      setIsModalOpen(false); // ✅ Cerrar modal tras éxito
    } catch (err) {
      console.error(err);
      setExcelError(
        err?.response?.data?.message ?? err.message ?? "Error en la importación"
      );
    }
  };

  const {
    registrarCliente,
    nombreRef,
    emailRef,
    telefonoRef,
    direccionRef,
    nitRef,
    error,
  } = useClientes();


 

  // ✅ Función para manejar submit y cerrar modal
  const handleSubmit = async (e) => {
    const result = await registrarCliente(e);
    if (result) {
      setIsModalOpen(false); // Cerrar modal si el registro fue exitoso
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto space-y-6">
        
        {/* Header con botón de modal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                <p className="text-gray-600 text-sm">Administra tu cartera de clientes</p>
              </div>
            </div>
            
            {/* ✅ Botón para abrir modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lista de Clientes</h2>
                <p className="text-gray-600 text-sm">Gestiona tus clientes registrados</p>
              </div>
            </div>
          </div>
          
          <ClientesList />
        </div>

        {/* ✅ MODAL CON EL FORMULARIO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Registrar Cliente</h2>
                    <p className="text-gray-600 text-sm">Completa los datos del nuevo cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Formulario acordeón dentro del modal */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
               

                 
                    <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 bg-white">
                      
                      {/* Campos del formulario - MISMO DISEÑO */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        
                        <div className="space-y-2">
                          <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            Nombre
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre completo"
                            name="nombre"
                            id="nombre"
                            ref={nombreRef}
                            autoComplete="given-name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {error.nombre && (
                            <span className="text-red-500 text-xs">{error.nombre}</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Mail className="w-4 h-4 text-gray-500" />
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            name="email"
                            id="email"
                            ref={emailRef}
                            autoComplete="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {error.email && (
                            <span className="text-red-500 text-xs">{error.email}</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="telefono" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Phone className="w-4 h-4 text-gray-500" />
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            placeholder="Número de contacto"
                            name="telefono"
                            id="telefono"
                            ref={telefonoRef}
                            autoComplete="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {error.telefono && (
                            <span className="text-red-500 text-xs">{error.telefono}</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="direccion" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Dirección
                          </label>
                          <input
                            type="text"
                            placeholder="Dirección completa"
                            name="direccion"
                            id="direccion"
                            ref={direccionRef}
                            autoComplete="address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {error.direccion && (
                            <span className="text-red-500 text-xs">{error.direccion}</span>
                          )}
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                          <label htmlFor="nit" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Hash className="w-4 h-4 text-gray-500" />
                            NIT o Cédula
                          </label>
                          <input
                            type="text"
                            placeholder="Número de identificación"
                            name="nit"
                            id="nit"
                            ref={nitRef}
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {error.nit && <span className="text-red-500 text-xs">{error.nit}</span>}
                        </div>
                      </div>

                      {/* Importar Excel - MISMO DISEÑO */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                          <label className="text-sm font-medium text-blue-900">
                            Importar clientes desde Excel
                          </label>
                        </div>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleExcelChange}
                          className="block w-full text-sm text-gray-900
                                     file:mr-4 file:py-2 file:px-3
                                     file:rounded-lg file:border-0
                                     file:text-xs file:font-medium
                                     file:bg-blue-100 file:text-blue-700
                                     hover:file:bg-blue-200 transition-colors"
                        />
                        {excelError && (
                          <p className="text-red-600 text-xs mt-2 bg-red-50 p-2 rounded border border-red-200">
                            {excelError}
                          </p>
                        )}
                      </div>

                      {/* Botones del modal */}
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Guardar Cliente
                        </button>
                      </div>
                    </form>
                
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}