import Select from "react-select"
import { FaWhatsapp, FaPhone, FaEnvelope, FaRegSmile, FaFileInvoice, FaTimesCircle, FaCommentDots } from "react-icons/fa"
import { useClientes } from "../../hooks/useClientes";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function GestionarClientes({ onClose, clienteId }) {
  console.log("Cliente ID:", clienteId);
  const { registrarGestionCliente, error } = useClientes();
  const { user } = useAuth({ middleware: 'auth' });

  // 📌 Estados para almacenar los valores del contacto
  const [metodoContacto, setMetodoContacto] = useState(null);
  const [estadoCliente, setEstadoCliente] = useState(null);
  const [comentario, setComentario] = useState("");
  const [errors, setErrors] = useState({});

  // 📌 Opciones del Select de Métodos de Contacto
  const metodosContacto = [
    { value: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp className="text-green-500 w-5 h-5" /> },
    { value: "llamada", label: "Llamada", icon: <FaPhone className="text-blue-500 w-5 h-5" /> },
    { value: "email", label: "Email", icon: <FaEnvelope className="text-red-500 w-5 h-5" /> },
  ];

  // 📌 Opciones del Select de Estado del Cliente
  const estadosCliente = [
    { value: "interesado", label: "Interesado", icon: <FaRegSmile className="text-green-500 w-5 h-5" /> },
    { value: "cotizacion", label: "Cotización Enviada", icon: <FaFileInvoice className="text-blue-500 w-5 h-5" /> },
    { value: "no_interesado", label: "No Interesado", icon: <FaTimesCircle className="text-red-500 w-5 h-5" /> },
    { value: "visita", label: "Visita Realizada", icon: <FaRegSmile className="text-yellow-500 w-5 h-5" /> },
    { value: "orden_compra", label: "Generó Orden de Compra", icon: <FaFileInvoice className="text-green-500 w-5 h-5" /> },
    { value: "no_contesta", label: "No Contesta", icon: <FaTimesCircle className="text-red-500 w-5 h-5" /> },
    { value: "primer_contacto", label: "Primer Contacto", icon: <FaCommentDots className="text-blue-500 w-5 h-5" /> },
  ];

  // función para registrar la gestión
  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};

    if (!metodoContacto) newErrors.metodoContacto = "Método de contacto es requerido";
    if (!estadoCliente) newErrors.estadoCliente = "Estado del cliente es requerido";
    if (!comentario) newErrors.comentario = "Comentario es requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const gestion = {
      user_id: user.id,
      tipo_contacto: metodoContacto?.value,
      estado: estadoCliente?.value,
      comentario: comentario
    };

    console.log(gestion);
    await registrarGestionCliente(clienteId, gestion);
    onClose();
  };

  const formatOptionLabel = ({ label, icon }) => (
    <div className="flex items-center gap-2">
      {icon}
      {label}
    </div>
  );

  return (
    <>
      <div>
        <form action="" onSubmit={handleSubmit} className="p-4">
          {/* Select de Métodos de Contacto con Iconos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Método de Contacto</label>
            <Select
              options={metodosContacto}
              formatOptionLabel={formatOptionLabel}
              className="w-full"
              onChange={setMetodoContacto}
            />
            {errors.metodoContacto && <p className="text-red-500 text-sm">{errors.metodoContacto}</p>}
          </div>

          {/* Select de Estado del Cliente con Iconos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Estado del Cliente</label>
            <Select
              options={estadosCliente}
              formatOptionLabel={formatOptionLabel}
              className="w-full"
              onChange={setEstadoCliente}
            />
            {errors.estadoCliente && <p className="text-red-500 text-sm">{errors.estadoCliente}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              name="" id="" cols="30" rows="5" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
            {errors.comentario && <p className="text-red-500 text-sm">{errors.comentario}</p>}
          </div>

          <button className="w-full mt-4 bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
        </form>
      </div>
    </>
  )
}
