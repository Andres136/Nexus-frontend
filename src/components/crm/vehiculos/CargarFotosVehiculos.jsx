import { useParams } from "react-router-dom";
import FormFotosVehiculo from "../FormFotosVehiculo";


export default function CargaFotosVehiculo() {
  const { id } = useParams();
console.log("ID del vehículo:", id);
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Fotos del Vehículo</h2>
      <FormFotosVehiculo vehiculoId={id} />
    </div>
  );
}
