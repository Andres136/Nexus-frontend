import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Wrench, User, Building2, UserCheck, Settings, Calendar, Filter } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";

export default function MantenimientoCalendar({
  events = [],
  onDateClick = () => {},
  onEventClick = () => {},
  title = "Calendario de Mantenimientos",
  subtitle = "Programa y controla mantenimientos TIC",
  icon: IconComponent = Wrench,
  loading = false,
}) {
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const estados = [
    { key: "todos", label: "Todos", color: "bg-gray-400" },
    { key: "pendiente", label: "Pendiente", color: "bg-amber-400" },
    { key: "en_proceso", label: "En proceso", color: "bg-blue-400" },
    { key: "completado", label: "Completado", color: "bg-emerald-400" },
  ];

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: "#f59e0b",
      en_proceso: "#3b82f6",
      completado: "#10b981",
    };
    return colors[estado] || "#6b7280";
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { style: "bg-amber-100 text-amber-800 border-amber-200", label: "Pendiente" },
      en_proceso: { style: "bg-blue-100 text-blue-800 border-blue-200", label: "En proceso" },
      completado: { style: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Completado" },
    };
    return config[estado] || { style: "bg-gray-100 text-gray-800 border-gray-200", label: estado };
  };

  // Filtrar eventos
  const filteredEvents = filtroEstado === "todos"
    ? events
    : events.filter((e) => e.extendedProps?.estado === filtroEstado);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-6 py-6 text-white relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm ring-1 ring-white/20 shadow-lg">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <p className="text-sm text-indigo-200 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {subtitle}
              </p>
            </div>
          </div>

          {/* Contador de eventos */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
            <span className="text-3xl font-bold">{filteredEvents.length}</span>
            <span className="text-xs text-indigo-200 leading-tight">
              eventos<br />programados
            </span>
          </div>
        </div>

        {/* Filtros de estado */}
        <div className="relative flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/20">
          <Filter className="w-4 h-4 text-indigo-300 mr-1" />
          {estados.map((estado) => (
            <button
              key={estado.key}
              onClick={() => setFiltroEstado(estado.key)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 ease-out
                ${filtroEstado === estado.key
                  ? "bg-white text-indigo-700 shadow-lg scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${estado.color}`} />
              {estado.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendario */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-gray-50/80 to-white">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Cargando eventos...</span>
            </div>
          </div>
        ) : (
          <FullCalendar
            eventContent={(arg) => {
              const { usuario, sede, tipo, asignado_a, estado } = arg.event.extendedProps;
              const bgColor = getEstadoColor(estado);
              const badge = getEstadoBadge(estado);
                const getBgClass = (estado) => {
    const bg = {
      pendiente: "bg-amber-50",
      en_proceso: "bg-blue-50",
      completado: "bg-emerald-50",
    };
    return bg[estado] || "bg-gray-50";
  };

              return (
                <div
                  className={`group p-2.5 rounded-lg shadow-sm border-l-4 ${getBgClass(estado)}
                    hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                  style={{ borderLeftColor: bgColor }}
                >
                  <div className="font-semibold text-gray-800 text-xs mb-2 truncate group-hover:text-indigo-700 transition-colors">
                    {arg.event.title}
                  </div>

                  <div className="space-y-1.5">
                    {usuario && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{usuario}</span>
                      </div>
                    )}

                    {sede && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{sede}</span>
                      </div>
                    )}

                    {asignado_a && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <UserCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{asignado_a}</span>
                      </div>
                    )}

                    {tipo && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Settings className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="capitalize truncate">{tipo}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.style}`}
                    >
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
            events={filteredEvents}
            eventDisplay="block"
            dateClick={(info) => onDateClick(info.dateStr)}
            eventClick={(info) =>
              onEventClick({
                id: info.event.id,
                start: info.event.startStr,
                ...info.event.extendedProps,

              })
            }
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
            }}
            dayHeaderClassNames="text-gray-600 font-semibold text-sm py-3 uppercase"
            dayCellClassNames="hover:bg-indigo-50/60 transition-colors cursor-pointer"
            noEventsContent={
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay eventos programados</p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

MantenimientoCalendar.propTypes = {
  events: PropTypes.array,
  onDateClick: PropTypes.func,
  onEventClick: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
};