import Banner from "../../assets/TRANSPORTE.png"
import DashboardVehiculos from "../../components/crm/DashboardVehiculos"



export default function Vehiculos() {
  return (
   <>
    <div className="min-h-screen w-full  px-2 py-4">
      {/* Encabezado con imagen */}
      <div className="max-w-8xl mx-auto">
        <div className="relative h-52 w-full rounded-2xl overflow-hidden shadow-md mb-8">
          <img
            src={Banner}
            alt="Encabezado de flota"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-white text-3xl font-bold">
              Gestión de Flota Vehicular
            </h1>
          </div>
        </div>

        {/* Contenido principal aquí */}
        <div className=" p-6">
   <DashboardVehiculos />
        </div>
      </div>
    </div>
   </>
  )
}
