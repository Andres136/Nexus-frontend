import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import clienteAxios from "../../config/axios";

export default function GraficaClientes() {
  const [datosGrafica, setDatosGrafica] = useState([]);

  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const response = await clienteAxios.get("/api/seguimientos"); // Ruta correcta de la API
        console.log("Datos recibidos:", response.data); // Verificar qué llega

        const data = response.data.map((item) => ({
          usuario: item.nombre,// Acceder correctamente al nombre
          cantidad: item.total, // Cantidad de clientes gestionados
        }));

        setDatosGrafica(data);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };

    obtenerEstadisticas();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">Clientes Gestionados por Usuario</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="usuario" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#4CAF50" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

