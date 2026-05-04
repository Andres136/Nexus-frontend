import { useState } from "react";
import { useGetFacturasCompras } from "../../hooks/contabilidad/useGetFacturasCompras";

export default function ObtenerFacturas() {

    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        proveedor: '',
    });

    const [searchTerm, setSearchTerm] = useState('');

    // 🔥 Nuevo hook con paginación
    const {
        facturas,
        pagination,
        error,
        isLoading
    } = useGetFacturasCompras(page, searchTerm);

    return (
        <div>


            <input
                type="text"
                placeholder="Buscar por proveedor o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: "20px", padding: "5px", width: "300px" }}
            />
            <h1>Facturas de Compras</h1>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>Fecha de Emisión</th>
                        <th>Fecha de Vencimiento</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan="7">Cargando...</td>
                        </tr>
                    )}

                    {error && (
                        <tr>
                            <td colSpan="7">Error al cargar las facturas</td>
                        </tr>
                    )}

                    {!isLoading && facturas.length === 0 && (
                        <tr>
                            <td colSpan="7">No se encontraron facturas</td>
                        </tr>
                    )}

                    {facturas.map((factura) => (
                        <tr key={factura.id}>
                            <td>{factura.id}</td>
                            <td>{factura.proveedor?.nombre || "Sin proveedor"}</td>
                            <td>{factura.fecha_emision}</td>
                            <td>{factura.fecha_vencimiento}</td>
                            <td>{factura.total}</td>
                            <td>{factura.estados?.nombre || "Sin estado"}</td>
                            <td>
                                <button>Editar</button>
                                <button>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🔥 Paginación */}
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                >
                    Anterior
                </button>

                <span style={{ margin: "0 10px" }}>
                    Página {pagination.currentPage} de {pagination.lastPage}
                </span>

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.lastPage}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}