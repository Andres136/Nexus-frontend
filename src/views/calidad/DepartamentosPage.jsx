import { useAuth } from "../../hooks/useAuth";
import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import { Link } from "react-router-dom";
import img from "../../assets/sig.png"

function DepartamentosPage() {
  const { macroprocesos, departamentos } = useGestionProcesos();
  const { user } = useAuth({ middleware: "auth" });

  // Función para verificar acceso
  const tieneAcceso = (departamentoId) => {
    return user?.role_id === 1 || user?.role_id === 2 || user?.departamento_id === departamentoId;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
    <div className="relative w-full h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
    <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center">Gestión de Procesos</h1>
          <p className="text-lg md:text-xl font-light">Explora y gestiona los procesos organizacionales</p>
        </div>
    </div>

      <div className="grid grid-cols-1 gap-12">
        {macroprocesos.map((macroproceso) => (
          <div key={macroproceso.id} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center uppercase border-b-4 border-gray-300 pb-2">
              {macroproceso.nombre}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {departamentos
                .filter((dep) => dep.macroprocesos_id === macroproceso.id)
                .map((departamento) => {
                  const autorizado = tieneAcceso(departamento.id);

                  return autorizado ? (
                    <Link key={departamento.id} to={`/auth/procesos/${departamento.id}`}>
                      <div className="p-6 bg-white shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col items-center border border-gray-200">
                        <img
                          className="w-20 h-20 mb-4 transition-all duration-300 hover:scale-110"
                          src={departamento.icono}
                          alt={departamento.nombre}
                        />
                        <h3 className="text-lg font-semibold text-gray-800 text-center">
                          {departamento.nombre}
                        </h3>
                        <p className="text-gray-600 text-sm text-center mt-2">{departamento.descripcion}</p>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={departamento.id}
                      className="p-6 bg-gray-200 shadow-md rounded-lg flex flex-col items-center border border-gray-300"
                    >
                      <img className="w-20 h-20 mb-4" src={departamento.icono} alt={departamento.nombre} />
                      <h3 className="text-lg font-semibold text-gray-600 text-center">{departamento.nombre}</h3>
                      <p className="text-gray-500 text-sm text-center mt-2">{departamento.descripcion}</p>
                      <p className="text-red-500 text-sm font-medium mt-3 bg-red-100 px-3 py-1 rounded-lg">
                        Acceso restringido
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepartamentosPage;

