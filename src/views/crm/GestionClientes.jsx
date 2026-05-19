import { useClientes } from "../../hooks/useClientes";
import * as XLSX from "xlsx";
import ClientesList from "./ClientesList";
import { useState } from "react";
import clienteAxios from "../../config/axios";
import {
  UserPlus,
  Users,
  FileSpreadsheet,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  X,
  Plus,
} from "lucide-react";
import { showToast } from "../../helpers/utils/showToast";

export default function GestionClientes() {
  const [excelError, setExcelError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    registrarCliente,
    nombreRef,
    emailRef,
    telefonoRef,
    direccionRef,
    nitRef,
    error,
  } = useClientes();

  const normaliza = (txt) =>
    txt.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
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
      const rows = rawRows.map((r) => ({
        ...r,
        telefono: r.telefono ? String(r.telefono) : "",
        nit: r.nit ? String(r.nit) : "",
      }));
      const requeridos = ["nombre", "email", "telefono", "direccion", "nit"];
      const faltan = requeridos.filter((c) => !(normaliza(c) in rows[0]));
      if (faltan.length) throw new Error(`Faltan columnas: ${faltan.join(", ")}`);
      const token = localStorage.getItem("token");
      await clienteAxios.post(
        "/api/clientes/importar-excel",
        { clientes: rows },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("success", "Clientes importados correctamente");
      setExcelError("");
      setIsModalOpen(false);
    } catch (err) {
      setExcelError(err?.response?.data?.message ?? err.message ?? "Error en la importación");
    }
  };

  const handleSubmit = async (e) => {
    const result = await registrarCliente(e);
    if (result) setIsModalOpen(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
  <div className="grid grid-cols-1">
      {/* ── Encabezado ── */}


      {/* ── Lista ── */}
   <div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
    {/* Izquierda: icono + título */}
    <div className="flex items-center gap-3">
      <div className="bg-gray-100 p-1.5 rounded-lg">
        <Users className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">Lista de Clientes</h2>
        <p className="text-gray-400 text-xs">Gestiona tus clientes registrados</p>
      </div>
    </div>

    {/* Derecha: botón acción */}
    <button
      onClick={() => setIsModalOpen(true)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm shrink-0"
    >
      <Plus className="w-4 h-4" />
      Nuevo Cliente
    </button>
  </div>
  <ClientesList />
</div>

      {/* ── Modal: Nuevo Cliente ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Cabecera modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Registrar Cliente</h2>
                  <p className="text-gray-400 text-xs">Completa los datos del nuevo cliente</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <User className="w-3.5 h-3.5" /> Nombre
                  </label>
                  <input type="text" id="nombre" name="nombre" ref={nombreRef}
                    placeholder="Nombre completo" autoComplete="given-name" className={inputClass} />
                  {error.nombre && <p className="text-red-500 text-xs">{error.nombre}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input type="email" id="email" name="email" ref={emailRef}
                    placeholder="correo@ejemplo.com" autoComplete="email" className={inputClass} />
                  {error.email && <p className="text-red-500 text-xs">{error.email}</p>}
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Phone className="w-3.5 h-3.5" /> Teléfono
                  </label>
                  <input type="tel" id="telefono" name="telefono" ref={telefonoRef}
                    placeholder="Número de contacto" autoComplete="tel" className={inputClass} />
                  {error.telefono && <p className="text-red-500 text-xs">{error.telefono}</p>}
                </div>

                {/* Dirección */}
                <div className="space-y-1.5">
                  <label htmlFor="direccion" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <MapPin className="w-3.5 h-3.5" /> Dirección
                  </label>
                  <input type="text" id="direccion" name="direccion" ref={direccionRef}
                    placeholder="Dirección completa" autoComplete="street-address" className={inputClass} />
                  {error.direccion && <p className="text-red-500 text-xs">{error.direccion}</p>}
                </div>

                {/* NIT — ocupa ambas columnas */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="nit" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Hash className="w-3.5 h-3.5" /> NIT o Cédula
                  </label>
                  <input type="text" id="nit" name="nit" ref={nitRef}
                    placeholder="Número de identificación" autoComplete="off" className={inputClass} />
                  {error.nit && <p className="text-red-500 text-xs">{error.nit}</p>}
                </div>
              </div>

              {/* Importar Excel */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-medium text-blue-800">Importar clientes desde Excel</span>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelChange}
                  className="block w-full text-xs text-gray-700
                    file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0
                    file:text-xs file:font-medium file:bg-blue-100 file:text-blue-700
                    hover:file:bg-blue-200 transition-colors"
                />
                {excelError && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-1.5">
                    {excelError}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
</div>
    </div>
  );
}
