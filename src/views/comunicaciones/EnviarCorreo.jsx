import { useState, useEffect } from "react";
import { Loader2, Send, Mail, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import { plantillasApi } from "../../services/api";
import { useClientes } from "../../hooks/useClientes";

export default function EnviarCorreo() {
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState("");
  const [destinatarios, setDestinatarios] = useState([]);
  const [asunto, setAsunto] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Hook que trae todos los clientes
  const { clientesTodos } = useClientes();

  useEffect(() => {
    obtenerPlantillas();
  }, []);

  const obtenerPlantillas = async () => {
    try {
      const { data } = await plantillasApi.getAll();
      setPlantillas(data);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  // ✅ Verificar carga de clientes
    const clientesOptions = clientesTodos.map((cliente) => ({
      value: cliente.email,
      label: `${cliente.nombre} (${cliente.email})`,
      nombre: cliente.nombre,
      email: cliente.email,
    }));

  const agregarCliente = (cliente) => {
    if (!cliente) return;
    if (destinatarios.some((d) => d.email === cliente.email)) {
      Swal.fire("Atención", "Este cliente ya fue agregado.", "info");
      return;
    }
    setDestinatarios([...destinatarios, { nombre: cliente.nombre, email: cliente.email }]);
  };

  const actualizarDestinatario = (index, campo, valor) => {
    const copia = [...destinatarios];
    copia[index][campo] = valor;
    setDestinatarios(copia);
  };

  const eliminarDestinatario = (index) => {
    setDestinatarios(destinatarios.filter((_, i) => i !== index));
  };

  const enviarCorreos = async () => {
    if (!selectedPlantilla || destinatarios.length === 0 || !asunto.trim()) {
      Swal.fire("Campos incompletos", "Por favor completa todos los campos.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        destinatarios: destinatarios.reduce((acc, d) => {
          if (d.email) acc[d.email] = d.nombre || "";
          return acc;
        }, {}),
        asunto,
      };

      const { data } = await plantillasApi.enviarEmail(selectedPlantilla, payload);

      Swal.fire({
        icon: "success",
        title: "Correos enviados",
        text: `${data.enviados.length} correos enviados exitosamente.`,
      });
      setDestinatarios([]);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No fue posible enviar los correos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
        <Mail className="text-green-600" /> Envío de Comunicados
      </h2>

      {/* ✅ Selección de plantilla */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Seleccionar plantilla
        </label>
        <select
          value={selectedPlantilla}
          onChange={(e) => setSelectedPlantilla(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600"
        >
          <option value="">-- Selecciona una plantilla --</option>
          {plantillas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Asunto */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Asunto del correo</label>
        <input
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Comunicado institucional SetasPlast"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* ✅ Selector de cliente */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-600">
            Buscar y agregar cliente
          </label>
          <UserPlus className="text-green-600" />
        </div>
        <Select
          options={clientesOptions}
          onChange={agregarCliente}
          placeholder="Buscar o seleccionar cliente..."
          isClearable
        />
      </div>

      {/* ✅ Lista de destinatarios */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Clientes agregados</h3>
        {destinatarios.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No hay clientes agregados aún.</p>
        ) : (
          destinatarios.map((d, i) => (
            <div key={i} className="flex gap-3 mb-2">
              <input
                type="text"
                placeholder="Nombre"
                value={d.nombre}
                onChange={(e) => actualizarDestinatario(i, "nombre", e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={d.email}
                onChange={(e) => actualizarDestinatario(i, "email", e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={() => eliminarDestinatario(i)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ Botón enviar */}
      <div className="text-right">
        <button
          onClick={enviarCorreos}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2 ${
            isLoading ? "bg-gray-400" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          {isLoading ? "Enviando..." : "Enviar Correos"}
        </button>
      </div>
    </div>
  );
}

