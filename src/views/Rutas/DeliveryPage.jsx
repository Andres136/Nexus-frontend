import { useState, useEffect } from "react";
import { deliveryEventsApi } from "../../services/api";
import Swal from "sweetalert2";
import DeliveryCalendar from "../../components/Rutas/DeliveryCalendar";
import DeliveryForm from "../../components/Rutas/DeliveryForm";
import { X } from "lucide-react";
import DeliveryRecordsPage from "./DeliveryRecordsPage";

export default function DeliveryPage() {
  const [events, setEvents] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
const [editEvent, setEditEvent] = useState(null);


const getEstadoColor = (estado) => {
  switch (estado) {
    case "pendiente":
      return { bg: "#f97316", border: "#c2410c" }; // naranja
    case "en_ruta":
      return { bg: "#3b82f6", border: "#1d4ed8" }; // azul
    case "completado":
      return { bg: "#22c55e", border: "#15803d" }; // verde
    case "cancelado":
      return { bg: "#ef4444", border: "#b91c1c" }; // rojo
    default:
      return { bg: "#6b7280", border: "#374151" }; // gris
  }
};

 const cargarEventos = async () => {
  try {
    const res = await deliveryEventsApi.getAll();
   //console.log("🚀  res:", res);
  
    const eventosBD = res.data.data;



const fullcalendarEvents = eventosBD.map(e => {
  const { bg, border } = getEstadoColor(e.estado);

  const otId = e?.orden?.orden_trabajo?.id ?? "N/A";
  const cliente =
    e?.orden?.orden_trabajo?.cliente?.nombre ?? "SIN CLIENTE";

  return {
    id: e.id,
    title: `OT ${otId} - ${cliente} - ${e.vehiculo.placa} ${e.usuario.name}`,
    date: e.fecha_entrega,
    start: `${e.fecha_entrega}T${e.hora}`,
    classNames: [`estado-${e.estado}`],
    backgroundColor: bg,
    borderColor: border,
    extendedProps: {
      fullData: e
    }
  };
});


    setEvents(fullcalendarEvents);

  } catch (e) {
    console.log("Error cargando eventos", e);
  }
};
const handleEventClick = (eventData) => {
   
  setEditEvent(eventData); // Cargar datos existentes
  setSelectedDate(eventData.fecha_entrega);
  setOpenForm(true);
};


  useEffect(() => {
    cargarEventos();
  }, []);

  const handleDateClick = (dateStr) => {
    setEditEvent(null); // Limpiar datos existentes
    setSelectedDate(dateStr);
    setOpenForm(true);
  };

  const handleSuccess = () => {
    cargarEventos();
    setOpenForm(false);
    Swal.fire("Éxito", "Entrega registrada", "success");
  };

  const closeModal = () => {
    setOpenForm(false);
    setEditEvent(null);
  };

  // ✅ Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (openForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openForm]);

  return (
    <div className="p-4">
      <DeliveryCalendar
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />

      {/* ✅ Modal mejorado */}
      {openForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          {/* Overlay - cierra el modal al hacer click fuera */}
          <div 
            className="absolute inset-0" 
            onClick={closeModal}
          ></div>

          {/* Contenedor del modal */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()} // ✅ Evita que se cierre al hacer click dentro
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Nueva Entrega</h2>
                <p className="text-sm text-gray-600 mt-1">Fecha seleccionada: {selectedDate}</p>
              </div>
              
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal - scrollable */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <DeliveryForm
                selectedDate={selectedDate}  
                 eventToEdit={editEvent}
                onSuccess={handleSuccess}
             
              />
            </div>

            {/* Footer del modal */}
    
          </div>
        </div>
      )}
      <DeliveryRecordsPage />
    </div>
  );
}