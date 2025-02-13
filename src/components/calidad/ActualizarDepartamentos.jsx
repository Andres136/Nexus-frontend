
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useEffect, useRef, useState } from "react";

import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function ActualizarDepartamentos({ onClose, departamentoId,  }) {
  const [errores, setErrores] = useState({});
 

  const nombreRef = useRef(null);
  const descripcionRef = useRef(null);
  const iconoRef = useRef(null);
  const macroprocesos_idRef = useRef(null);
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Cargar datos del departamento
  useEffect(() => {
    if (departamentoId) {
        console.log("Cargando datos para el departamento:", departamentoId); // Verifica en consola
        const token = localStorage.getItem("token");

        clienteAxios
            .get(`/api/departamentos/${departamentoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const dept = response.data;
                console.log("Datos recibidos:", dept); // Verifica en consola
                if (nombreRef.current) nombreRef.current.value = dept.nombre || "";
                if (descripcionRef.current) descripcionRef.current.value = dept.descripcion || "";
                if (macroprocesos_idRef.current) macroprocesos_idRef.current.value = dept.macroprocesos_id || "";
            })
            .catch((error) => {
                console.error("Error al cargar el departamento", error);
            });
    }
}, [departamentoId]); // 👈 Se ejecutará cada vez que `departamentoId` cambie

  // Obtener lista de macroprocesos
  useEffect(() => {
    const token = localStorage.getItem("token");
    clienteAxios
      .get("/api/macroprocesos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMacroprocesos(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar macroprocesos", error);
      });
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setCargando(true);

    const formData = new FormData();
    formData.append("nombre", nombreRef.current.value);
    formData.append("descripcion", descripcionRef.current.value);
    formData.append("macroprocesos_id", macroprocesos_idRef.current.value);
    if (iconoRef.current.files[0]) {
      formData.append("icono", iconoRef.current.files[0]);
    }
    formData.append("_method", "PUT"); // Laravel interpretará esto como un PUT

    const token = localStorage.getItem("token");
    try {
      await clienteAxios.post(`/api/departamentos/${departamentoId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Departamento actualizado correctamente");
    
      onClose();
    } catch (error) {
      if (error.response) {
        setErrores(error.response.data);
      }
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      <h2 className="text-lg font-semibold text-gray-700">Actualizar Departamento</h2>
      
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Departamento</label>
        <input 
          type="text" id="nombre" ref={nombreRef} placeholder="Ingrese un Departamento"
          className="mt-1 block w-full border-gray-300 rounded-md h-12" 
        />
        {errores.nombre && <small className="text-red-600">{errores.nombre}</small>}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea 
          id="descripcion" ref={descripcionRef} placeholder="Ingrese una Descripción"
          className="mt-1 block w-full border-gray-300 rounded-md h-24"
        ></textarea>
        {errores.descripcion && <small className="text-red-600">{errores.descripcion}</small>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Imagen</label>
        <input 
          type="file" id="icono" accept="image/*" ref={iconoRef}
          className="mt-1 block w-full border-gray-300 rounded-md h-12"
        />
        {errores.icono && <small className="text-red-600">{errores.icono}</small>}
      </div>

      <div>
        <label htmlFor="macroprocesos_id" className="block text-sm font-medium text-gray-700">Macroproceso</label>
        <select 
          id="macroprocesos_id" ref={macroprocesos_idRef}
          className="mt-1 block w-full border-gray-300 rounded-md h-12"
        >
          <option value="">Seleccione un Macroproceso</option>
          {macroprocesos.map((macroproceso) => (
            <option key={macroproceso.id} value={macroproceso.id}>
              {macroproceso.nombre}
            </option>
          ))}
        </select>
        {errores.macroprocesos_id && <small className="text-red-600">{errores.macroprocesos_id}</small>}
      </div>

      <button
        type="submit" disabled={cargando}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        {cargando ? "Actualizando..." : "Actualizar Departamento"}
      </button>
    </form>
  );
}

