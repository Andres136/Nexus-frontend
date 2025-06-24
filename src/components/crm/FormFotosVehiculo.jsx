import { useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function FormFotosVehiculo({ vehiculoId }) {
    console.log("vehiculoId", vehiculoId);
  const [fotos, setFotos] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFotos(e.target.files);
  };



  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (let i = 0; i < fotos.length; i++) {
      formData.append("fotos[]", fotos[i]);
    }

    try {
      const token = localStorage.getItem("token");
      await clienteAxios.post(`/api/vehiculos/${vehiculoId}/fotos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Fotos cargadas correctamente");
      setFotos([]);
    } catch (error) {
      console.log(error);
      setError("Error al subir las fotos");
      toast.error("Error al subir las fotos");
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded shadow">
      <h3 className="text-xl font-bold mb-4">Agregar Fotos al Vehículo</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="fotos"
          multiple
          onChange={handleFileChange}
          className="border border-gray-300 rounded p-2 mb-4 w-full"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Subir Fotos
        </button>
      </form>
    </div>
  );
}
