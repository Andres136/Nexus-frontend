import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Wrench } from "lucide-react";

export default function MantenimientoCalendar({
  events = [],
  onDateClick = () => {},
  onEventClick = () => {}
}) 



{

    
  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">
              Calendario de Mantenimientos
            </h2>
            <p className="text-sm text-indigo-100">
              Programa y controla mantenimientos TIC
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <FullCalendar

        eventContent={(arg) => {
  const { usuario, sede, tipo,asignado_a} = arg.event.extendedProps;

  return (
    <div className="text-xs leading-tight">
      <div className="font-semibold">{arg.event.title}</div>
      <div>👤 {usuario}</div>
      <div>🏢 {sede}</div>
            {asignado_a && (
        <div className="text-[11px] opacity-80">
         Asignado a 👤 {asignado_a}
        </div>
      )}
      <div className="italic capitalize">{tipo}</div>
    </div>
  );
}}


          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          firstDay={1}
          height="auto"
          events={events}
          dateClick={(info) => onDateClick(info.dateStr)}
       eventClick={(info) =>
  onEventClick({
    id: info.event.id,
    start: info.event.startStr,
    ...info.event.extendedProps
  })
}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth"
          }}
        />
      </div>
    </div>
  );
}