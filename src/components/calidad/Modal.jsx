const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
       <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          ×
        </button>

        {/* Contenido dinámico */}
        <div className="mt-2 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
