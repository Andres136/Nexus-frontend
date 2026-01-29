import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarDays, Truck,  Plus,Warehouse, } from "lucide-react";
import { Link } from "react-router-dom";

export default function DeliveryCalendar({ events, onDateClick, onEventClick }) {
  
  return (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">


<nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/auth/traslado-bodegas"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              <Warehouse className="w-4 h-4 mr-2" />
              Traslado de bodegas
            </Link>
          </li>
              {/* ✅ Header responsive 
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
              <Link 
                to="/responsabilidades" 
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                Responsabilidades
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-sm font-medium text-indigo-600">
                Asignar Responsabilidades
              </span>
            </div>
          </li>*/}
        </ol>
      </nav>

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