import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

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
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  🧾 Historial del Cliente
                </Dialog.Title>

                {cliente ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">Datos del Cliente</h3>
                      <p>📧 <strong>Email:</strong> {cliente.email}</p>
                      <p>📞 <strong>Teléfono:</strong> {cliente.telefono}</p>
                      <p>🏠 <strong>Dirección:</strong> {cliente.direccion}</p>
                      <p>📌 <strong>NIT:</strong> {cliente.nit}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">Historial de Seguimientos</h3>
                      {cliente.seguimientos?.length > 0 ? (
                        <ul className="space-y-3">
                          {cliente.seguimientos.map((s) => (
                            <li key={s.id} className="bg-gray-100 p-3 rounded shadow">
                              <p><strong>👤 Por:</strong> {s.usuario?.name || "Desconocido"}</p>
                              <p><strong>📌 Tipo:</strong> {s.tipo_contacto}</p>
                              <p><strong>📅 Estado:</strong> {s.estado || "N/D"}</p>
                              <p><strong>📝 Comentario:</strong> {s.comentario}</p>
                              <p><strong>📆 Fecha:</strong> {formatearFecha(s.created_at)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No hay seguimientos registrados.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-4">Cargando información del cliente...</p>
                )}

                <div className="text-right mt-6">
                  <button
                    onClick={onClose}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
