const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 mt-10 mb-10 p-6 relative">
        {/* Header del Modal */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
            ✖
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="mt-2 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
