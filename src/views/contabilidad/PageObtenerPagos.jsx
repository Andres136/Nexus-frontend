import { useGetRegistroPagoFactura } from "../../hooks/contabilidad/useGetRegistroPagoFactura";

export default function PageObtenerPagos() {
    const { data, error, isLoading } = useGetRegistroPagoFactura();

    console.log("Data obtenida:", data);

    if (isLoading) {
        return (
            <div className="p-4 text-center">
                Cargando pagos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 text-center">
                Error al cargar pagos.
            </div>
        );
    }

    const facturas = data?.data?.data || [];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">
                Registro de Pagos de Facturas
            </h1>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2">Factura</th>
                            <th className="border p-2">Proveedor</th>
                            <th className="border p-2">Empresa</th>
                            <th className="border p-2">Fecha</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Saldo Pendiente</th>
                            <th className="border p-2">Pagos</th>
                        </tr>
                    </thead>

                    <tbody>
                        {facturas.map((factura) => (
                            <tr key={factura.id} className="hover:bg-gray-50">
                                <td className="border p-2">
                                    {factura.numero_factura}
                                </td>

                                <td className="border p-2">
                                    {factura.proveedor?.nombre || "N/A"}
                                </td>

                                <td className="border p-2">
                                    {factura.empresa?.nombre || "N/A"}
                                </td>

                                <td className="border p-2">
                                    {factura.fecha_emision}
                                </td>

                                <td className="border p-2">
                                    $
                                    {parseFloat(
                                        factura.total || 0
                                    ).toLocaleString()}
                                </td>

                                <td className="border p-2">
                                    $
                                    {parseFloat(
                                        factura.saldo_pendiente || 0
                                    ).toLocaleString()}
                                </td>

                                <td className="border p-2">
                                    {factura.pagos?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {factura.pagos.map((pago) => (
                                                <li
                                                    key={pago.id}
                                                    className="text-sm"
                                                >
                                                    {pago.fecha_pago} - $
                                                    {parseFloat(
                                                        pago.monto
                                                    ).toLocaleString()}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        "Sin pagos"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}