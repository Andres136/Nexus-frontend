import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, ChevronRight, ArrowLeft } from "lucide-react";
import { useEstadisticasProductoNoConforme } from "../../hooks/calidad/useEstadisticasProductoNoConforme";
import NexusLoader from "../NexusLoader";
import AccesoDenegado from "../AccesoDenegado";

// Paleta validada (ver skill dataviz): azul secuencial para magnitud,
// slots categóricos fijos 1-3 solo para el desglose por origen (identidad, no ranking).
const SEQUENTIAL_BLUE = "#2a78d6";
const CATEGORICAL = { cliente: "#2a78d6", proveedor: "#1baf7a", interno: "#eda100" };
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#898781";

const CardChart = ({ titulo, children, alto = 260 }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-sm font-semibold text-gray-700">{titulo}</h3>
    {children ? (
      <div style={{ width: "100%", height: alto }}>{children}</div>
    ) : (
      <div className="flex items-center justify-center text-xs text-gray-400" style={{ height: alto }}>
        Sin datos suficientes
      </div>
    )}
  </div>
);

CardChart.propTypes = {
  titulo: PropTypes.string.isRequired,
  children: PropTypes.node,
  alto: PropTypes.number,
};

const HorizontalBars = ({ data, dataKey, nameKey, alto }) => {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="0" horizontal={false} stroke={GRID_COLOR} />
        <XAxis type="number" allowDecimals={false} stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={130}
          stroke={AXIS_COLOR}
          tick={{ fontSize: 11 }}
        />
        <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }} />
        <Bar dataKey={dataKey} fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
};

HorizontalBars.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  dataKey: PropTypes.string.isRequired,
  nameKey: PropTypes.string.isRequired,
  alto: PropTypes.number.isRequired,
};

const StatTile = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function DashboardProductoNoConforme() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const { data, isLoading, error } = useEstadisticasProductoNoConforme({ anio });

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (error?.response?.status === 403) {
    return <AccesoDenegado mensaje="El dashboard de estadísticas es solo para el responsable del departamento o un administrador." />;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <BarChart3 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Estadísticas de No Conformidad</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Link to="/auth/crm/no-conformidades" className="hover:text-indigo-600 transition-colors">Productos No Conformes</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Dashboard</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <Link
            to="/auth/crm/no-conformidades"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al listado
          </Link>
        </div>
      </div>

      {isLoading && <NexusLoader text="Cargando estadísticas" />}
      {error && (
        <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          No se pudieron cargar las estadísticas.
        </p>
      )}

      {data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total reportados" value={data.resumen.total} />
            <StatTile label="Cantidad afectada" value={data.resumen.cantidad_afectada} />
            <StatTile label="Con análisis" value={data.resumen.con_analisis} />
            <StatTile label="Sin análisis" value={data.resumen.sin_analisis} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CardChart titulo="Reportes por mes" alto={260}>
              {data.por_mes?.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.por_mes} margin={{ left: -12 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="nombre_mes" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                    <Bar dataKey="total" name="Reportes" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardChart>

            <CardChart titulo="Distribución por origen" alto={260}>
              {data.por_origen?.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.por_origen} margin={{ left: -12 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="origen" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total" name="Reportes" radius={[4, 4, 0, 0]} barSize={40}>
                      {data.por_origen.map((entry) => (
                        <Cell key={entry.origen} fill={CATEGORICAL[entry.origen] || SEQUENTIAL_BLUE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardChart>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CardChart titulo="Top productos con más no conformidades">
              <HorizontalBars data={data.top_productos} dataKey="total" nameKey="producto" alto={260} />
            </CardChart>
            <CardChart titulo="Top clientes con más no conformidades">
              <HorizontalBars data={data.top_clientes} dataKey="total" nameKey="cliente" alto={260} />
            </CardChart>
            <CardChart titulo="Top proveedores con más no conformidades">
              <HorizontalBars data={data.top_proveedores} dataKey="total" nameKey="proveedor" alto={260} />
            </CardChart>
            <CardChart titulo="No conformidades por proceso">
              <HorizontalBars data={data.por_proceso} dataKey="total" nameKey="proceso" alto={260} />
            </CardChart>
            <CardChart titulo="Distribución por tipo de falla">
              <HorizontalBars data={data.por_tipo_falla} dataKey="total" nameKey="tipo_falla" alto={220} />
            </CardChart>
            <CardChart titulo="Distribución por estado">
              <HorizontalBars data={data.por_estado} dataKey="total" nameKey="estado" alto={220} />
            </CardChart>
          </div>
        </>
      )}
    </div>
  );
}
