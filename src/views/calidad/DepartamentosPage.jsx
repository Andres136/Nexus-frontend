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

    {/* ENCABEZADO */}
    <div
      className="relative w-full h-48 md:h-60 bg-cover bg-center rounded-lg overflow-hidden"
      style={{ backgroundImage: `url(${img})` }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center">
          Mapa de Procesos
        </h1>
        <p className="text-lg md:text-xl font-light uppercase">
          SetasPlast · Global Business Group
        </p>
      </div>
    </div>

    {/* CONTENIDO */}
    <div className="mt-14 space-y-20">
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
          <div key={macroproceso.id}>

            {/* BANDA DEL TITULO */}
            <div className="text-center mb-6">
              <div className="inline-block border-2 border-dashed border-gray-400 px-8 py-2 rounded-md">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-700">
                  {macroproceso.nombre}
                </h2>
              </div>
            </div>

            {/* VISUAL SEGÚN TIPO */}
            {nombreMacro === "ESTRATEGICOS" && (
              <div className="flex flex-wrap justify-center gap-8">
                {departamentosOrdenados.map((departamento) => (
                  <Link
                    key={departamento.id}
                    to={`/auth/procesos/${departamento.id}`}
                    className="w-80 bg-b-green-200 border border-b-green-300 rounded-lg p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center"
                  >
                    <img src={departamento.icono} className="w-14 h-14 mb-2" />
                    <h3 className="uppercase font-bold text-gray-800 text-lg text-center">
                      {departamento.nombre}
                    </h3>
                  </Link>
                ))}
              </div>
            )}

            {nombreMacro === "MISIONALES" && (
              <div className="flex flex-wrap justify-center items-center gap-10 mt-6">

                {departamentosOrdenados.map((dep, index) => (
                  <Link
                    key={dep.id}
                    to={`/auth/procesos/${dep.id}`}
                    className={`
                      relative w-80 h-20 bg-b-green-200 text-gray-800 border border-b-green-300 p-4
                      shadow-lg flex items-center justify-center 
                      font-bold uppercase tracking-wide 
                      transition-all hover:-translate-y-1 hover:shadow-xl
                      ${index === 0 ? "rounded-l-xl arrow-right" : ""}
                      ${index === 1 ? "rounded-r-xl arrow-left" : ""}
                    `}
                  ><img src={dep.icono} className="w-8 h-8 absolute left-4" />
                    {dep.nombre}
                  </Link>
                ))}

              </div>
            )}

            {nombreMacro === "DE APOYO" && (
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {departamentosOrdenados.map((departamento) => (
                  <Link
                    key={departamento.id}
                    to={`/auth/procesos/${departamento.id}`}
                    className="w-48 bg-b-green-100 border border-b-green-300 rounded-lg p-4 shadow hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center"
                  >
                    <img src={departamento.icono} className="w-10 h-10 mb-2" />
                    <h3 className="uppercase font-bold text-gray-700 text-xs text-center">
                      {departamento.nombre}
                    </h3>
                  </Link>
                ))}
              </div>
            )}

          </div>
        );
      })}
    </div>
  </div>
);

}

export default DepartamentosPage;
