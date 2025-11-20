import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarDays, Truck, Clock, Plus } from "lucide-react";

export default function DeliveryCalendar({ events, onDateClick, onEventClick }) {
  
  return (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* ✅ Header responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 lg:px-6 py-3 lg:py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="bg-white/20 p-1.5 lg:p-2 rounded-lg">
              <CalendarDays className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">Calendario de Entregas</h2>
              <p className="text-blue-100 text-xs lg:text-sm hidden sm:block">
                Gestiona y programa tus entregas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold">{events?.length || 0}</div>
              <div className="text-xs text-blue-200">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Leyenda responsive */}
      <div className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm">
          <span className="text-gray-600 font-medium">Estados:</span>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
            <span className="text-gray-700">Pendiente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Proceso</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Completado</span>
          </div>
        </div>
      </div>

      {/* ✅ Calendario con estilos responsivos */}
      <div className="p-3 lg:p-6">
        <style jsx global>{`
          /* Reset y base */
          .fc {
            font-family: 'Inter', system-ui, sans-serif;
          }
          
          /* Toolbar responsive */
          .fc-toolbar {
            margin-bottom: 1rem !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          
          .fc-toolbar-chunk {
            display: flex !important;
            align-items: center !important;
            gap: 0.5rem !important;
          }
          
          .fc-toolbar-title {
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            color: #1f2937 !important;
          }
          
          @media (min-width: 768px) {
            .fc-toolbar-title {
              font-size: 1.5rem !important;
            }
          }
          
          /* Botones responsive */
          .fc-button {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            font-weight: 500 !important;
            font-size: 0.75rem !important;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
            transition: all 0.2s ease !important;
          }
          
          @media (min-width: 768px) {
            .fc-button {
              padding: 8px 16px !important;
              font-size: 0.875rem !important;
              border-radius: 8px !important;
            }
          }
          
          .fc-button:hover {
            background: linear-gradient(135deg, #2563eb, #1e40af) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
          }
          
          .fc-button:disabled {
            background: #e5e7eb !important;
            color: #9ca3af !important;
            transform: none !important;
            box-shadow: none !important;
          }
          
          /* ✅ Días responsive - Altura dinámica */
          .fc-daygrid-day {
            transition: background-color 0.2s ease !important;
            min-height: 80px !important;
            position: relative !important;
          }
          
          @media (min-width: 640px) {
            .fc-daygrid-day {
              min-height: 100px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .fc-daygrid-day {
              min-height: 120px !important;
            }
          }
          
          .fc-daygrid-day:hover {
            background-color: #f8fafc !important;
            cursor: pointer;
          }
          
          .fc-daygrid-day:hover::after {
            content: '+';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            z-index: 10;
            opacity: 0.9;
          }
          
          /* Números de días */
          .fc-daygrid-day-number {
            color: #374151 !important;
            font-weight: 500 !important;
            padding: 2px 4px !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
            font-size: 0.75rem !important;
          }
          
          @media (min-width: 768px) {
            .fc-daygrid-day-number {
              padding: 4px 8px !important;
              border-radius: 6px !important;
              font-size: 0.875rem !important;
            }
          }
          
          .fc-day-today .fc-daygrid-day-number {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
            color: white !important;
            font-weight: 700 !important;
          }
          
          .fc-daygrid-day-number:hover {
            background-color: #e0f2fe !important;
            color: #0369a1 !important;
          }
          
          /* ✅ Eventos responsive - Tamaños más pequeños */
          .fc-event {
            border: none !important;
            border-radius: 3px !important;
            padding: 1px 2px !important;
            margin: 0.5px !important;
            font-size: 0.5rem !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
            display: block !important;
            line-height: 1 !important;
            overflow: hidden !important;
            height: auto !important;
            min-height: 12px !important;
          }
          
          @media (min-width: 640px) {
            .fc-event {
              padding: 1px 3px !important;
              margin: 0.5px !important;
              font-size: 0.6rem !important;
              border-radius: 4px !important;
              min-height: 14px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .fc-event {
              padding: 2px 4px !important;
              margin: 1px !important;
              font-size: 0.65rem !important;
              border-radius: 5px !important;
              min-height: 16px !important;
            }
          }
          
          .fc-event:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15) !important;
            z-index: 999 !important;
          }
          
          /* Colores de eventos */
          .fc-event {
            background: linear-gradient(135deg, #fb923c, #f97316) !important;
            color: white !important;
          }
          
          .fc-event[title*="proceso"] {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          }
          
          .fc-event[title*="completad"] {
            background: linear-gradient(135deg, #10b981, #059669) !important;
          }
          
          .fc-event[title*="cancelad"] {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          }
          
          /* Headers responsive */
          .fc-col-header-cell {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
            font-weight: 600 !important;
            color: #475569 !important;
            border-color: #e2e8f0 !important;
            padding: 6px 2px !important;
            font-size: 0.65rem !important;
          }
          
          @media (min-width: 640px) {
            .fc-col-header-cell {
              padding: 8px 4px !important;
              font-size: 0.75rem !important;
            }
          }
          
          @media (min-width: 1024px) {
            .fc-col-header-cell {
              padding: 12px 8px !important;
              font-size: 0.875rem !important;
            }
          }
          
          /* Grid responsive */
          .fc-scrollgrid {
            border-color: #e2e8f0 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }
          
          @media (min-width: 1024px) {
            .fc-scrollgrid {
              border-radius: 12px !important;
            }
          }
          
          /* ✅ Frames responsive - Altura dinámica */
          .fc-daygrid-day-frame {
            min-height: 80px !important;
          }
          
          @media (min-width: 640px) {
            .fc-daygrid-day-frame {
              min-height: 100px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .fc-daygrid-day-frame {
              min-height: 120px !important;
            }
          }
          
          /* ✅ Ocultar botón "más" completamente */
          .fc-daygrid-more-link {
            display: none !important;
          }
          
          /* ✅ Contenedor de eventos - Permitir desbordamiento */
          .fc-daygrid-day-events {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          
          .fc-daygrid-event-harness {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Títulos de eventos */
          .fc-event-title {
            display: block !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          
          .fc-event-main {
            display: block !important;
            width: 100% !important;
          }
          
          /* ✅ Asegurar que todos los eventos se muestren */
          .fc-daygrid-day-bottom {
            display: none !important;
          }
            /* Pendiente */
.fc-event.estado-pendiente {
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  color: white !important;
}

/* En ruta */
.fc-event.estado-en_ruta {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white !important;
}

/* Completado */
.fc-event.estado-completado {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
}

/* Cancelado */
.fc-event.estado-cancelado {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
}

        `}</style>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          firstDay={1}
          height="auto"
          aspectRatio={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1.2}
          events={events}
          dateClick={(info) => onDateClick(info.dateStr)}
          eventClick={(info) => {
            const evento = info.event.extendedProps.fullData;
            onEventClick(evento);
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: typeof window !== 'undefined' && window.innerWidth < 640 ? "" : "dayGridMonth",
          }}
          buttonText={{
            today: typeof window !== 'undefined' && window.innerWidth < 640 ? "Hoy" : "Hoy",
            month: "Mes",
          }}
          // ✅ Configuraciones para mostrar todos los eventos
          dayMaxEvents={false}
          dayMaxEventRows={false}
          moreLinkClick={false}
          eventMaxStack={0}
          moreLinkText=""
          dayHeaderFormat={{ 
            weekday: typeof window !== 'undefined' && window.innerWidth < 640 ? 'narrow' : 'short' 
          }}
          eventDisplay="block"
        />
      </div>

      {/* ✅ Footer responsive */}
      <div className="px-4 lg:px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs lg:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Toca una fecha para crear entrega</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Toca un evento para editarlo</span>
          </div>
        </div>
      </div>
    </div>
  );
}