import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Calendar, 
  MessageSquare,
  Tag,
  Clock
} from "lucide-react";

export default function ModalClienteHistorial({ isOpen, onClose, cliente, formatearFecha }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        Historial del Cliente
                      </Dialog.Title>
                      <p className="text-gray-600 text-sm">{cliente?.nombre || 'Cliente'}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  {cliente ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Datos del Cliente */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          Información del Cliente
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{cliente.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Teléfono:</span>
                            <span className="text-gray-600">{cliente.telefono}</span>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="font-medium text-gray-700">Dirección:</span>
                            <span className="text-gray-600">{cliente.direccion}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">NIT:</span>
                            <span className="text-gray-600">{cliente.nit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Historial de Seguimientos */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-600" />
                            Historial de Seguimientos
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {cliente.seguimientos?.length || 0} registros
                          </span>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {cliente.seguimientos?.length > 0 ? (
                            <div className="space-y-3">
                              {cliente.seguimientos.map((s) => (
                                <div key={s.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {s.usuario?.name || "Usuario desconocido"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatearFecha(s.created_at)}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-600">Tipo:</span>
                                        <span className="text-xs font-medium text-gray-900">
                                          {s.tipo_contacto}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-600">Estado:</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          s.estado === 'completado' 
                                            ? 'bg-green-100 text-green-800' 
                                            : s.estado === 'pendiente'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {s.estado || "N/D"}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {s.comentario && (
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="w-3 h-3 text-gray-500 mt-1" />
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {s.comentario}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No hay seguimientos registrados</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Cargando información del cliente...</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cerrar
                    </button>
                  </div>
                </div>
                
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}