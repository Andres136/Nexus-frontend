import { useQuery } from "@tanstack/react-query";
import ObtenerOrdenesCompra from "../../components/crm/ObtenerOrdenesCompra";
import ClienteAxios from "../../config/axios";
import { Link } from "react-router-dom";


export default function Notificaciones() {


    // Función para obtener notificaciones
    const fetchNotificaciones = async () => {
        const token = localStorage.getItem("token");

        const response = await ClienteAxios.get("api/notificaciones", {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data; // Aseguramos que devolvemos los datos correctamente
    };

    // Uso de useQuery correctamente
    const { data, isLoading, error } = useQuery({
        queryKey: ["notificaciones"],
        queryFn: fetchNotificaciones,
    });

    console.log(data); // Ver qué datos llegan en consola
    console.log(error)

    return (
        <>
   

          
   <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">🔔 Notificaciones</h2>
            
            {data?.notificaciones?.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                           
                                <th className="py-3 px-6 text-left">Mensaje</th>
                                <th className="py-3 px-6 text-left">Cliente</th>
                                <th className="py-3 px-6 text-left">Fecha de Entrega</th>
                                <th className="py-3 px-6 text-left">Ubicación</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {data.notificaciones.map((noti) => (
                                <tr key={noti.id} className="border-b border-gray-200 hover:bg-gray-100">
                         
                                    <td className="py-3 px-6">{noti.data.mensaje}</td>
                                    <td className="py-3 px-6">{noti.data.cliente || "N/A"}</td>
                                    <td className="py-3 px-6">{new Date(noti.data.fecha_entrega).toLocaleDateString()}</td>
                                    <td className="py-3 px-6">{noti.data.ubicacion_entrega || "No especificado"}</td>
                                    <td className="py-3 px-6 text-center">
                                        <Link to={`/crm/reporte-inventarios`}
                                            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"

                                        >
                                            Ver Órdenes
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">No tienes notificaciones.</p>
            )}
        </div>
            <ObtenerOrdenesCompra />
        </>
    );
}
