import { useState, useEffect } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export default function ReferenciasExcedidas() {
  const [referencias, setReferencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const navigate =useNavigate()

  useEffect(() => {
    const obtenerReferencias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("/api/referencias-excedidas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferencias(response.data.referencias_excedidas);
      } catch (error) {
        console.error(error);
        toast.error("Error al obtener referencias excedidas");
      } finally {
        setCargando(false);
      }
    };

    obtenerReferencias();
  }, []);

  return (
    <div className="my-6 px-4">
      <h3 className="text-lg font-bold mb-4 text-red-600">
        Resultados de Entregas Excedidas
      </h3>
      <button
  onClick={() => navigate(-1)} // 👈 vuelve a la ruta anterior
  className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
>
  ← Volver
</button>

      {cargando ? (
        <p className="text-sm text-gray-600">Cargando...</p>
      ) : referencias.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2"># OC</th>
                <th className="border px-4 py-2">Proveedor</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Descripción</th>
                <th className="border px-4 py-2">Solicitada</th>
                <th className="border px-4 py-2">Entregada</th>
                <th className="border px-4 py-2 text-red-600">Excedente</th>
              </tr>
            </thead>
            <tbody>
              {referencias.map((ref, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{ref.numero_orden}</td>
                  <td className="border px-4 py-2">{ref.proveedor}</td>
                  <td className="border px-4 py-2">
                    {new Date(ref.fecha_orden).toLocaleDateString("es-CO")}
                  </td>
                  <td className="border px-4 py-2">{ref.descripcion}</td>
                  <td className="border px-4 py-2">{ref.cantidad_solicitada}</td>
                  <td className="border px-4 py-2">{ref.cantidad_entregada}</td>
                  <td className="border px-4 py-2 font-bold text-red-600">
                    {ref.excedente}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-green-600">No hay referencias excedidas.</p>
      )}
    </div>
  );
}
