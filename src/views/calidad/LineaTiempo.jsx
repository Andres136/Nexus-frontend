import  { useEffect, useState } from "react";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaTasks } from "react-icons/fa";
import clienteAxios from "../../config/axios";
import ResumenMensualTareas from "../../components/calidad/ResumenMensualTareas";


export default function LineaTiempo() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("api/linea-tiempo-tareas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTareas(response.data);
      } catch (error) {
        console.error("Error fetching tareas:", error);
      }
    };

    fetchTareas();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
    <h2 className="text-2xl font-bold mb-6">🕒 Línea de Tiempo de Tareas</h2>
    <VerticalTimeline>
      {tareas.map((tarea) => (
        <VerticalTimelineElement
          key={tarea.id}
          date={`Inicio: ${tarea.inicio} - Fin: ${tarea.fin}`}
          iconStyle={{
            background: tarea.vencida ? 'red' : '#00b894',
            color: '#fff'
          }}
          icon={<FaTasks />}
        >
          <h3 className="vertical-timeline-element-title">{tarea.nombre}</h3>
          <h4 className="vertical-timeline-element-subtitle">Asignado a: {tarea.usuario}</h4>
          <p>
            Estado: {tarea.estado === 2 ? "✅ Completada" : "⏳ Pendiente"}
          </p>
          {tarea.vencida && <p className="text-red-500 font-semibold">⚠️ Tarea vencida</p>}
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>

    <ResumenMensualTareas />
  </div>
  );
}
