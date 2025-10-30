import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import { Link } from "react-router-dom";
import img from "../../assets/sig.png";

function DepartamentosPage() {
  const { macroprocesos, departamentos } = useGestionProcesos();

  const ordenMacroprocesos = ["ESTRATEGICOS", "MISIONALES", "DE APOYO"];

  const ordenDepartamentos = {
    ESTRATEGICOS: ["GERENCIA GENERAL", "HSEQ"],
    MISIONALES: ["COMERCIAL", "OPERACIÓN"],
    "DE APOYO": [
      "CONTABLE",
      "TECNOLOGÍA",
      "MARKETING Y COMUNICACIONES",
      "ADMINISTRATIVO Y TALENTO HUMANO",
      "JURÍDICA",
      "COMPRAS"
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div
        className="relative w-full h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center uppercase">
            Gestión de Procesos
          </h1>
          <p className="text-lg md:text-xl font-light uppercase">
            Explora y gestiona los procesos organizacionales
          </p>
        </div>
      </div>

      {/* Contenido ordenado */}
      <div className="grid grid-cols-1 gap-12">
        {ordenMacroprocesos.map((nombreMacro) => {
          const macroproceso = macroprocesos.find(
            (m) => m.nombre.toUpperCase() === nombreMacro
          );
          if (!macroproceso) return null;

          const departamentosOrdenados = departamentos
            .filter((dep) => dep.macroprocesos_id === macroproceso.id)
            .sort(
              (a, b) =>
                ordenDepartamentos[nombreMacro].indexOf(a.nombre.toUpperCase()) -
                ordenDepartamentos[nombreMacro].indexOf(b.nombre.toUpperCase())
            );

          return (
            <div key={macroproceso.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center uppercase border-b-4 border-gray-300 pb-2 uppercase">
                {macroproceso.nombre}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {departamentosOrdenados.map((departamento) => (
                  <Link
                    key={departamento.id}
                    to={`/auth/procesos/${departamento.id}`}
                    className="p-6 bg-white shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col items-center border border-gray-200"
                  >
                    <img
                      className="w-20 h-20 mb-4 transition-all duration-300 hover:scale-110 uppercase"
                      src={departamento.icono}
                      alt={departamento.nombre}
                    />
                    <h3 className="text-lg font-semibold text-gray-800 text-center uppercase">
                      {departamento.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm text-center mt-2">
                      {departamento.descripcion}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DepartamentosPage;
