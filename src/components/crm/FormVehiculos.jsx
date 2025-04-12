import { useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function FormVehiculos() {
  const [error, setErrors] = useState({});
  const [form, setForm] = useState({
    id: "",
    placa: "",
    marca: "",
    modelo: "",
    tipo: "",
    anio: "",
    kilometraje_actual: "",
    estado: "",
    observaciones: "",
    foto: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...error, [name]: null }); // Limpiar el error del campo correspondiente
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("placa", form.placa);
      formData.append("marca", form.marca);
      formData.append("modelo", form.modelo);
      formData.append("tipo", form.tipo);
      formData.append("anio", form.anio);
      formData.append("kilometraje_actual", form.kilometraje_actual);
      formData.append("estado", form.estado);
      formData.append("observaciones", form.observaciones);
      if (form.foto) {
        formData.append("foto", form.foto);
      }
      const token = localStorage.getItem("token");
      const response = await clienteAxios.post("/api/vehiculos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Vehiculo registrado:", response.data);
      toast.success(response.data.message);
      // Limpiar el formulario después de enviar
      setForm({
        id: "",
        placa: "",
        marca: "",
        modelo: "",
        tipo: "",
        anio: "",
        kilometraje_actual: "",
        estado: "",
        observaciones: "",
        foto: "",
      });
      setErrors({}); // Limpiar errores
    } catch (error) {
      console.log(error.response.data);
      // Manejo de errores por campo
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al registrar vehículo:", error);
      }
    }
  };
  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg  p-6 mx-auto space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Registrar Nuevo Vehiculo
        </h2>
        <Link
          to="/auth/crm/vehiculos"
          className="inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
        >
          ← Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block font-medium" htmlFor="placa">
              Placa
            </label>
            <input
              id="placa"
              type="text"
              value={form.placa}
              onChange={handleChange}
              name="placa"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la placa del vehiculo"
            />
            {error.placa && (
              <p className="text-red-500 text-sm">{error.placa[0]}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium" htmlFor="marca">
              Marca
            </label>
            <input
              id="marca"
              type="text"
              value={form.marca}
              onChange={handleChange}
              name="marca"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese la marca del vehiculo"
            />
            {error.marca && (
              <p className="text-red-500 text-sm">{error.marca[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="modelo">
              Modelo
            </label>
            <input
              id="modelo"
              type="text"
              value={form.modelo}
              onChange={handleChange}
              name="modelo"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el modelo del vehiculo"
            />
            {error.modelo && (
              <p className="text-red-500 text-sm">{error.modelo[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="tipo">
              Tipo
            </label>
            <select
              name="tipo"
              id="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Seleccione el tipo de vehiculo</option>
              <option value="Camioneta">Camioneta</option>
              <option value="Camión">Camión</option>

              <option value="Motocicleta">Motocicleta</option>
              <option value="Auto">Auto</option>
            </select>
            {error.tipo && (
              <p className="text-red-500 text-sm">{error.tipo[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="anio">
              Modelo
            </label>
            <input
              id="anio"
              type="number"
              value={form.anio}
              onChange={handleChange}
              name="anio"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el modelo del vehiculo"
            />
            {error.anio && (
              <p className="text-red-500 text-sm">{error.anio[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="kilometraje_actual">
              Kilometraje Actual
            </label>
            <input
              id="kilometraje_actual"
              type="number"
              value={form.kilometraje_actual}
              onChange={handleChange}
              name="kilometraje_actual"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese el kilometraje actual del vehiculo"
            />
            {error.kilometraje_actual && (
              <p className="text-red-500 text-sm">
                {error.kilometraje_actual[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="estado">
              Estado
            </label>
            <select
              name="estado"
              id="estado"
              value={form.estado}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Seleccione el estado del vehiculo</option>
              <option value="Activo">Activo</option>
              <option value="En mantenimiento">En mantenimiento</option>

              <option value="Retirado">Retirado</option>
            </select>
            {error.estado && (
              <p className="text-red-500 text-sm">{error.estado[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium" htmlFor="observaciones">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              name="observaciones"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Ingrese observaciones adicionales"
            />
            {error.observaciones && (
              <p className="text-red-500 text-sm">{error.observaciones[0]}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium" htmlFor="foto">
              Foto
            </label>
            <input
              id="foto"
              type="file"
              onChange={handleChange}
              name="foto"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            {error.foto && (
              <p className="text-red-500 text-sm">{error.foto[0]}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          >
            Registrar Vehiculo
          </button>
        </div>
      </form>
    </div>
  );
}
