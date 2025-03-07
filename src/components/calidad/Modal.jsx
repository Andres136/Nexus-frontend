

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-10 flex items-start justify-center z-50 pt-10">
  <div className="bg-white rounded-lg shadow-lg w-full sm:w-96 md:w-[500px] lg:w-[600px] p-6">
    {/* Header del Modal */}
    <div className="flex justify-between items-center border-b pb-3">
   
      <button onClick={onClose} className="text-gray-500 hover:text-red-500">
        ✖
      </button>
    </div>

    {/* Contenido Dinámico */}
    <div className="mt-4">{children}</div>
  </div>
</div>

  );
};

export default Modal;
