import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import useResumenDashboard from "../../hooks/crm/useResumenDashboard";

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
  { key: "conversion_pct",     name: "Conversión (%)",      color: "#fb923c" },
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

  const [selectedMonth, setSelectedMonth] = useState("");
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

  // KPI totales del mes seleccionado
  const kpiTotals = useMemo(() => {
    return kpiKeys.map(({ key, label, prefix, suffix }) => {
      const total = chartData.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
      const avg   = chartData.length ? total / chartData.length : 0;
      const isAvg = key === "cumplimiento_pct";
      const val   = isAvg ? avg : total;
      return { label, prefix, suffix, value: val, key };
    });
  }, [chartData]);

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
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpiTotals.map(({ label, prefix, suffix, value, key }) => {
          const metric = metrics.find((m) => m.key === key);
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
        {metrics.map((m) => (
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
        {chartData.length === 0 ? (
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

      {/* ── Tabla resumen ── */}
      {chartData.length > 0 && (
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