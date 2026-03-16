import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Wrench, User, Building2, UserCheck, Settings } from "lucide-react";

export default function MantenimientoCalendar({
  events = [],
  onDateClick = () => {},
  onEventClick = () => {}
}) {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#f59e0b";
      case "en_proceso":
        return "#3b82f6";
      case "completado":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      pendiente: "bg-amber-100 text-amber-800 border-amber-300",
      en_proceso: "bg-blue-100 text-blue-800 border-blue-300",
      completado: "bg-emerald-100 text-emerald-800 border-emerald-300"
    };
    const labels = {
      pendiente: "Pendiente",
      en_proceso: "En proceso",
      completado: "Completado"
    };
    return { style: styles[estado] || "bg-gray-100 text-gray-800", label: labels[estado] || estado };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Calendario de Mantenimientos
            </h2>
            <p className="text-sm text-indigo-200 mt-1">
              Programa y controla mantenimientos TIC
            </p>
          </div>
        </div>

        {/* Leyenda de estados */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-indigo-100">Pendiente</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            <span className="text-indigo-100">En proceso</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-indigo-100">Completado</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50/50">
        <FullCalendar
          eventContent={(arg) => {
            const { usuario, sede, tipo, asignado_a, estado } = arg.event.extendedProps;
            const bgColor = getEstadoColor(estado);
            const badge = getEstadoBadge(estado);

            return (
              <div
                className="p-2 rounded-lg shadow-sm border-l-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderLeftColor: bgColor }}
              >
                <div className="font-semibold text-gray-800 text-xs mb-1.5 truncate">
                  {arg.event.title}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{usuario}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{sede}</span>
                  </div>

                  {asignado_a && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <UserCheck className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{asignado_a}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Settings className="w-3 h-3 text-gray-400" />
                    <span className="capitalize">{tipo}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          }}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          firstDay={1}
          height="auto"
          events={events}
          eventDisplay="block"
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
          dayHeaderClassNames="text-gray-600 font-semibold text-sm py-3"
          dayCellClassNames="hover:bg-indigo-50/50 transition-colors"
        />
      </div>
    </div>
  );
}