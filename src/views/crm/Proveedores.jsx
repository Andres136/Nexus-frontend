import { useState,useEffect } from "react"    
import clienteAxios from "../../config/axios"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { Link } from "react-router-dom"
import Select from "react-select"

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
    }).then(async (result) => {setLastPage(1) // No hay paginación, así que siempre será 1
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
}
, [currentPage,search])
const opcionesFiltro = proveedoresFiltrados.map(p => ({ value: p.id, label: p.nombre }));

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Proveedores</h1>

       {/* 🔗 Botones de enlace arriba del formulario */}


       
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <Link
      to="/auth/crm/proveedores-ordenes-compra"
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
    >
      Registrar Orden de Compra
    </Link>
    <Link
      to="/auth/crm/ordenes-compra-proveedor"
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-center"
    >
      Ver Órdenes Registradas
    </Link>
    <Link
      to="/auth/crm/referencias-excedidas"
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-center"
    >
      Ver Referencias Excedidas
    </Link>

   {/* Filtros de reportes */}
<ModalRegistroProcesoBolsa />
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <div className="w-full sm:w-72">
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
      classNamePrefix="rs"  // evita conflictos de estilos
    />
  </div>

  <button
    onClick={descargarPendientes}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
  >
    Referencias Pendientes
  </button>

</div>



  </div>
  
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="nit"
            value={form.nit}
            onChange={handleChange}
            placeholder="NIT"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            placeholder="Correo Electrónico"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="ciudad"
            value={form.ciudad}
            onChange={handleChange}
            placeholder="Ciudad"
            className="border p-2 rounded"
          />
          <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Observaciones"
              className="border p-2 rounded col-span-1 md:col-span-2 h-24 resize-none" // Cambia el tamaño aquí
          ></textarea>
        </div>
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded mt-4">
          Guardar Proveedor
        </button>
      </form>

      <div className="mb-4">
        <input
          type="text"
      placeholder="Buscar por nombre o NIT"

          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => obtenerProveedores(1)}
          className="bg-gray-700 text-white px-4 py-2 rounded ml-2"
        >
          Buscar
        </button>
      </div>

       <div className="grid grid-cols-1 gap-4">
       <table className="   col-span-1 min-w-full bg-white border border-gray-300 text-sm">
            <thead>
                <tr>
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">NIT</th>
                <th className="border px-4 py-2">Teléfono</th>
                <th className="border px-4 py-2">Dirección</th>
                <th className="border px-4 py-2">Correo</th>
                <th className="border px-4 py-2">Ciudad</th>
                <th className="border px-4 py-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {proveedores.map((proveedor) => (
                <tr key={proveedor.id}>
                    <td className="border px-4 py-2">{proveedor.nombre}</td>
                    <td className="border px-4 py-2">{proveedor.nit}</td>
                    <td className="border px-4 py-2">{proveedor.telefono}</td>
                    <td className="border px-4 py-2">{proveedor.direccion}</td>
                    <td className="border px-4 py-2">{proveedor.correo}</td>
                    <td className="border px-4 py-2">{proveedor.ciudad}</td>
                    <td className="border px-4 py-2">
                    <div className="flex flex-col md:flex-row gap-2 justify-center">
  <button
    onClick={() => setForm(proveedor)}
    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm w-full md:w-auto"
  >
    Editar
  </button>
  <button
    onClick={() => handleEliminar(proveedor.id)}
    className="bg-red-500 text-white px-3 py-1 rounded text-sm w-full md:w-auto"
  >
    Eliminar
  </button>
</div>

                    </td>
                </tr>
                ))}
            </tbody>
        </table>
       </div>
       <div className="flex justify-between items-center mt-4">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
  >
    ← Anterior
  </button>

  <span className="text-gray-700 text-sm">
    Página {currentPage} de {lastPage}
  </span>

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
    disabled={currentPage === lastPage}
    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
  >
    Siguiente →
  </button>
</div>


      </div>
  )
}
