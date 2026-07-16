import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import useResumenDashboard from "../../hooks/crm/useResumenDashboard";
import { useResumenSemanalMes } from "../../hooks/crm/useResumenSemanalMes";

// Métricas con lectura semanal con sentido (sin metas/cumplimiento/cartera,
// que son montos y porcentajes pensados a nivel mensual).
const METRICAS_SEMANALES = ["gestiones", "cotizaciones", "ordenes", "clientes_con_orden", "valor_ventas"];

function mesAnterior(mesStr) {
  if (!mesStr) return "";
  const [y, m] = mesStr.split("-").map(Number);
  const fecha = new Date(y, m - 2, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

function variacion(actual, anterior) {
  if (!anterior) return null;
  const cambio = ((actual - anterior) / anterior) * 100;
  return { texto: `${cambio > 0 ? "↑" : cambio < 0 ? "↓" : "→"} ${Math.abs(cambio).toFixed(1)}%`, positivo: cambio >= 0 };
}

// ─── Paleta de métricas ────────────────────────────────────────────────────
const metrics = [
  { key: "gestiones",          name: "Gestiones",           color: "#6366f1" },
  { key: "cotizaciones",       name: "Cotizaciones",        color: "#22d3ee" },
  { key: "ordenes",            name: "Órdenes",             color: "#f59e0b" },
  { key: "clientes_con_orden", name: "Clientes con Orden",  color: "#f43f5e" },
  { key: "valor_ventas",       name: "Ventas (M)",          color: "#10b981" },
  { key: "meta_mes", name: "Meta del Mes", color: "#0ea5e9" }, // ← azul más visible
  { key: "meta_individual",    name: "Meta Individual",     color: "#1e293b" },
  { key: "cumplimiento_pct",   name: "Cumplimiento (%)",    color: "#84cc16" },

{ key: "conversion_trimestral_pct", name: "Conversión Trimestral (%)",    color: "#8b5cf6" },
  { key: "fidelizacion_pct",   name: "Fidelización (%)",   color: "#38bdf8" },
  { key: "cartera_pct_gestion",name: "Gestión Cartera (%)", color: "#a78bfa" },
];

// ─── KPI cards mostradas arriba del gráfico ───────────────────────────────
const kpiKeys = [
  { key: "valor_ventas",     label: "Total Ventas",      prefix: "$", suffix: "" },
  { key: "ordenes",          label: "Órdenes",           prefix: "",  suffix: "" },
  { key: "cumplimiento_pct", label: "Cumplimiento",      prefix: "",  suffix: "%" },
  { key: "gestiones",        label: "Gestiones",         prefix: "",  suffix: "" },
  { key: "meta_mes",          label: "Meta del Mes",     prefix: "$", suffix: "" },
];

// ─── Tooltip personalizado ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: "14px 18px",
      minWidth: 200,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 4 }}>
          <span style={{ color: p.fill, fontSize: 12 }}>{p.name}</span>
          <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>
            {p.name.includes("%")
              ? `${Number(p.value).toFixed(2)}%`
              : p.name.includes("Ventas") || p.name.includes("Meta")
              ? `$${Number(p.value).toLocaleString("es-CO")}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────
export default function ResumenDashboard() {
  const { data = [], isLoading, error } = useResumenDashboard();
//console.log("Datos del dashboard:", data);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [vista, setVista] = useState("mensual"); // "mensual" | "semanal"
  const [activeMetrics, setActiveMetrics] = useState(
    metrics.map((m) => m.key)
  );

  const months = useMemo(
    () => Array.from(new Set(data.map((i) => i.mes))).sort(),
    [data]
  );

  useEffect(() => {
    if (months.length && !selectedMonth)
      setSelectedMonth(months[months.length - 1]);
  }, [months, selectedMonth]);

  const chartData = useMemo(
    () => (!selectedMonth ? [] : data.filter((i) => i.mes === selectedMonth)),
    [data, selectedMonth]
  );

  const chartDataAnterior = useMemo(
    () => data.filter((i) => i.mes === mesAnterior(selectedMonth)),
    [data, selectedMonth]
  );

  const { semanas, isLoading: loadingSemanas } = useResumenSemanalMes({
    mes: vista === "semanal" ? selectedMonth : undefined,
  });

  // KPI totales del mes seleccionado (y del mes anterior, para la variación)
  const totalesPorGrupo = (grupo) =>
    kpiKeys.map(({ key, label, prefix, suffix }) => {
      const total = grupo.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
      const avg   = grupo.length ? total / grupo.length : 0;
      const isAvg = key === "cumplimiento_pct";
      const val   = isAvg ? avg : total;
      return { label, prefix, suffix, value: val, key };
    });

  const kpiTotals = useMemo(() => totalesPorGrupo(chartData), [chartData]);
  const kpiTotalesAnterior = useMemo(() => totalesPorGrupo(chartDataAnterior), [chartDataAnterior]);

  const toggleMetric = (key) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ── Formato mes legible ──
  const formatMes = (m) => {
    if (!m) return "";
    const [y, mo] = m.split("-");
    const names = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${names[parseInt(mo, 10) - 1]} ${y}`;
  };

  if (isLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:"#64748b", fontSize:15 }}>
      <span style={{ marginRight:10 }}>⏳</span> Cargando dashboard...
    </div>
  );

  if (error) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:"#f43f5e", fontSize:15 }}>
      <span style={{ marginRight:10 }}>⚠️</span> Error al cargar dashboard
    </div>
  );

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "32px 24px",
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
          CRM · Comercial
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Comparativo por Usuario
        </h2>
        {/* NUEVO */}
  <div style={{
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#eef2ff",
    color: "#4338ca",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  }}>
    📊 Trimestre: {chartData?.[0]?.trimestre || "N/A"}
  </div>
      </div>

      {/* ── Selector de mes ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Mes:</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
                background: selectedMonth === m ? "#6366f1" : "#e2e8f0",
                color: selectedMonth === m ? "#fff" : "#475569",
                boxShadow: selectedMonth === m ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
              }}
            >
              {formatMes(m)}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 13, color: "#475569", fontWeight: 500, marginLeft: 12 }}>Vista:</span>
        <div style={{ display: "flex", gap: 4, background: "#e2e8f0", borderRadius: 20, padding: 3 }}>
          {[{ key: "mensual", label: "Mensual" }, { key: "semanal", label: "Semanal" }].map((v) => (
            <button
              key={v.key}
              onClick={() => setVista(v.key)}
              style={{
                padding: "5px 14px",
                borderRadius: 18,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: vista === v.key ? "#fff" : "transparent",
                color: vista === v.key ? "#4338ca" : "#64748b",
                boxShadow: vista === v.key ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpiTotals.map(({ label, prefix, suffix, value, key }, i) => {
          const metric = metrics.find((m) => m.key === key);
          const varMes = variacion(value, kpiTotalesAnterior[i]?.value);
          return (
            <div key={key} style={{
              background: "#fff",
              borderRadius: 14,
              padding: "18px 22px",
              borderLeft: `4px solid ${metric?.color ?? "#6366f1"}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                {label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {prefix}
                {key === "valor_ventas"
                  ? Number(value).toLocaleString("es-CO")
                  : key === "cumplimiento_pct"
                  ? `${Number(value).toFixed(1)}${suffix}`
                  : Math.round(value)}
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: varMes ? (varMes.positivo ? "#16a34a" : "#dc2626") : "#cbd5e1" }}>
                {varMes ? `${varMes.texto} vs mes anterior` : "Sin dato del mes anterior"}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Toggle métricas ── */}
      <div style={{
        background: "#fff",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginRight: 4 }}>MÉTRICAS:</span>
        {metrics
          .filter((m) => vista === "mensual" || METRICAS_SEMANALES.includes(m.key))
          .map((m) => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: `1.5px solid ${m.color}`,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              transition: "all 0.15s",
              background: activeMetrics.includes(m.key) ? m.color : "transparent",
              color: activeMetrics.includes(m.key) ? "#fff" : m.color,
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* ── Gráfico ── */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 16px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        {vista === "semanal" ? (
          loadingSemanas ? (
            <div style={{ textAlign:"center", color:"#94a3b8", padding: 40 }}>
              Cargando semanas...
            </div>
          ) : semanas.length === 0 ? (
            <div style={{ textAlign:"center", color:"#94a3b8", padding: 40 }}>
              Sin datos para este mes
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={semanas} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16, color: "#64748b" }} />
                {metrics
                  .filter((m) => METRICAS_SEMANALES.includes(m.key) && activeMetrics.includes(m.key))
                  .map((m) => (
                    <Line
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      name={m.name}
                      stroke={m.color}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          )
        ) : chartData.length === 0 ? (
          <div style={{ textAlign:"center", color:"#94a3b8", padding: 40 }}>
            Sin datos para este mes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
            >
              <XAxis
                dataKey="usuario"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 16, color: "#64748b" }}
              />
              {metrics
                .filter((m) => activeMetrics.includes(m.key))
                .map((m) => (
                  <Bar
                    key={m.key}
                    dataKey={m.key}
                    name={m.name}
                    fill={m.color}
                    barSize={16}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Tabla resumen (solo vista mensual: es por vendedor) ── */}
      {vista === "mensual" && chartData.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 16,
          marginTop: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Detalle — {formatMes(selectedMonth)}
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Ventas</th>
                  <th style={thStyle}>Meta del Mes</th>
                  <th style={thStyle}>Meta Ind.</th>
                  <th style={thStyle}>Cumplimiento</th>
                  <th style={thStyle}>Órdenes</th>
                  <th style={thStyle}>Gestiones</th>
                  <th style={thStyle}>Fidelización</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={row.user_id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={tdStyle}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: "50%",
                        background: "#6366f1", color: "#fff",
                        fontSize: 11, fontWeight: 700, marginRight: 8,
                      }}>
                        {row.usuario?.charAt(0).toUpperCase()}
                      </div>
                      {row.usuario}
                    </td>
                    <td style={tdStyle}>${Number(row.valor_ventas).toLocaleString("es-CO")}</td>
                    <td style={tdStyle}>${Number(row.meta_mes).toLocaleString("es-CO")}</td>
                    <td style={tdStyle}>${Number(row.meta_individual).toLocaleString("es-CO")}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: row.cumplimiento_pct >= 100 ? "#dcfce7" : row.cumplimiento_pct >= 50 ? "#fef9c3" : "#fee2e2",
                        color: row.cumplimiento_pct >= 100 ? "#15803d" : row.cumplimiento_pct >= 50 ? "#854d0e" : "#b91c1c",
                      }}>
                        {Number(row.cumplimiento_pct).toFixed(1)}%
                      </span>
                    </td>
                    <td style={tdStyle}>{row.ordenes}</td>
                    <td style={tdStyle}>{row.gestiones}</td>
                    <td style={tdStyle}>{Number(row.fidelizacion_pct).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 16px",
  color: "#334155",
  borderTop: "1px solid #f1f5f9",
  whiteSpace: "nowrap",
};