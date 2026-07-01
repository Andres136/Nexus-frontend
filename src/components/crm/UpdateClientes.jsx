import { useEffect, useState } from "react";
import { useClientes } from "../../hooks/useClientes";

import clienteAxios from "../../config/axios";
import { useAuth } from "../../hooks/useAuth";

export default function UpdateClientes({ onClose, clienteId }) {
  const { actualizarCliente, clientes } = useClientes();
  const { obtenerUsuarios, users,user } = useAuth({ middleware: "auth" });

  const [clienteEditado, setClienteEditado] = useState({
    user_id: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    nit: "",
  });
  //Cargar Datos del cliente
  useEffect(() => {
    const cliente = clientes.find((cliente) => cliente.id === clienteId);
    if (cliente) {
      setClienteEditado(cliente);
    }
  }, [clienteId, clientes]);

  //Manejar Cambios en el formulario
  const handleChange = (e) => {
    setClienteEditado({
      ...clienteEditado,
      [e.target.name]: e.target.value,
    });
  };

  //Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    await actualizarCliente(clienteId, clienteEditado);
    onClose();
  };

  //Funcion para obtener los datos del cliente por ID (en caso de que no se encuentre en la lista paginada)

  const obtenerClientePorId = async (clienteId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get(`/api/clientes/${clienteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Asegúrate de que esta respuesta tenga la estructura esperada
    } catch (error) {
      console.error("Error al obtener el cliente por ID", error);
      return null;
    }
  };

  useEffect(() => {
    // Buscar el cliente en la lista paginada
    let cliente = clientes.find((cliente) => cliente.id === clienteId);
    if (!cliente) {
      // Si no se encuentra, obtenerlo por ID
      obtenerClientePorId(clienteId).then((cliente) => {
        if (cliente) {
          setClienteEditado(cliente);
        }
      });
    }
  }, [clienteId, clientes]);


  // Obtener usuarios para el select
  
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    clienteAxios.get("/api/usuarios-comerciales") // Asegúrate de que esta ruta esté bien
      .then(response => setUsuarios(response.data))
      .catch(error => console.error("Error al cargar usuarios:", error));
  }, []);

  useEffect(() => {
    obtenerUsuarios();
  }, []);
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Editar Cliente</h2>


      {(user.role_id===1 || user.role_id ===4 || user.role_id ===7) &&(  <div className="mb-4">
        <label htmlFor="id" className="block text-sm font-medium text-gray-700">
          {" "}
          Acesor Asignado
        </label>
        <select
          name="user_id"
          id="user_id"
          value={clienteEditado.user_id}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
        >
          <option value="">--Asignar Acesor--</option>
          {usuarios.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>)}
    

      <div className="mb-4">
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre
        </label>
        <input
          type="text"
          placeholder="Nombre"
          name="nombre"
          id="nombre"
          value={clienteEditado.nombre}
          onChange={handleChange}
          autoComplete="given-name"
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          placeholder="Email"
          name="email"
          id="email"
          value={clienteEditado.email}
          onChange={handleChange}
          autoComplete="given-name"
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="telefono"
          className="block text-sm font-medium text-gray-700"
        >
          Teléfono
        </label>
        <input
          type="tel"
          placeholder="Teléfono"
          name="telefono"
          id="telefono"
          value={clienteEditado.telefono}
          onChange={handleChange}
          autoComplete="tel"
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="direccion"
          className="block text-sm font-medium text-gray-700"
        >
          Dirección
        </label>
        <input
          type="text"
          placeholder="Dirección"
          name="direccion"
          id="direccion"
          value={clienteEditado.direccion}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          autoComplete="address"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="nit"
          className="block text-sm font-medium text-gray-700"
        >
          Nit o Cedula
        </label>

        <input
          type="text"
          placeholder="Nit"
          name="nit"
          id="nit"
          value={clienteEditado.nit}
          onChange={handleChange}
          autoComplete="address"
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
        />
      </div>

      <button className="w-full bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        <span>Guardar</span>
      </button>
    </form>
  );
}
