import Modal from "../../components/calidad/Modal";
import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import ActualizarDepartamentos from "../../components/calidad/ActualizarDepartamentos";
import { useState } from "react";

export default function DepartamentosUpdate() {
    const { departamentos, macroprocesos } = useGestionProcesos();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartamentoId, setSelectedDepartamentoId] = useState(null);

    const handleOpenModal = (id) => {
        setSelectedDepartamentoId(id); // Almacenar el ID del departamento seleccionado
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Actualizar Departamentos</h1>

            {macroprocesos.map((macroproceso) => (
                <div key={macroproceso.id} className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">{macroproceso.nombre}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departamentos
                            .filter((dep) => dep.macroprocesos_id === macroproceso.id)
                            .map((departamento) => (
                                <div key={departamento.id} className="p-4 bg-white shadow rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900">{departamento.nombre}</h3>
                                    <img className="w-16 h-16 animate-bounce" src={departamento.icono} alt={departamento.nombre} />
                                    <p className="text-gray-600">{departamento.descripcion}</p>

                                    <button
                                        onClick={() => handleOpenModal(departamento.id)} 
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Actualizar Departamento
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {/* Modal para actualizar departamento */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedDepartamentoId && (
                    <ActualizarDepartamentos 
                        departamentoId={selectedDepartamentoId}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
