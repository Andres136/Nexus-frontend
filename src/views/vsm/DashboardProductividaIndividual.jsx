import { useState, useMemo } from "react"
import { useGetProductividadIndividual } from "../../hooks/vsm/UseGetProductividaIndividual"
import { useGetRendimientoPorPeriodo } from "../../hooks/vsm/useGetRendimientoPorPeriodo"
import { useSedes } from "../../hooks/useSedes"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts"

// ── constantes ────────────────────────────────────────────────────────────────

const PERIODOS = [
  { key: "diario",  label: "Diario" },
  { key: "semanal", label: "Semanal" },
  { key: "mensual", label: "Mensual" },
]

const ESTADO_COLORS = {
  BAJO:      "bg-red-100 text-red-700 border-red-300",
  NORMAL:    "bg-yellow-100 text-yellow-700 border-yellow-300",
  EFICIENTE: "bg-green-100 text-green-700 border-green-300",
}

// Paleta de colores para usuarios (hasta 10)
const USER_PALETTE = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
]

// ── tooltip personalizado para el chart de período ────────────────────────────

const TooltipPeriodo = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white p-3 rounded shadow text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-gray-700 border-b pb-1 mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ── tooltip usuario (gráfica de eficiencia) ───────────────────────────────────

const TooltipUsuario = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white p-2 rounded shadow text-xs">
      <p className="font-semibold">{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color }}>
          {e.name === "eficiencia_porcentaje" ? `Eficiencia: ${e.value}%` : `${e.name}: ${e.value}`}
        </p>
      ))}
    </div>
  )
}

// ── componente principal ──────────────────────────────────────────────────────

export default function DashboardProductividaIndividual() {
  const [tipoPeriodo, setTipoPeriodo] = useState("diario")
  const [filters, setFilters]         = useState({ sede_id: null, fecha_inicio: "", fecha_fin: "" })

  const { sedes } = useSedes()

  const { data: usuarios = [], isLoading: loadingUsuarios } =
    useGetProductividadIndividual(filters)

  const {
    periodos, metaHora, metaDiaria, metaSemanal, metaMensual,
    horasDiarias, horasSemanales, isLoading: loadingPeriodos,
  } = useGetRendimientoPorPeriodo({ ...filters, tipo_periodo: tipoPeriodo })

  const handleChange = (e) => {
    const value = e.target.value === "" ? null : e.target.value
    setFilters((prev) => ({ ...prev, [e.target.name]: value }))
  }

  // KPIs del período completo (datos de usuario agregado)
  const totalProduccion    = useMemo(() => usuarios.reduce((a, i) => a + i.produccion_total, 0), [usuarios])
  const promedioEficiencia = useMemo(() =>
    usuarios.length
      ? (usuarios.reduce((a, i) => a + i.eficiencia_porcentaje, 0) / usuarios.length).toFixed(1)
      : 0,
    [usuarios]
  )

  // Meta según período seleccionado
  const metaPeriodo = tipoPeriodo === "diario" ? metaDiaria
    : tipoPeriodo === "semanal" ? metaSemanal
    : metaMensual

  // Lista de usuarios únicos con su color asignado (orden de aparición)
  const allUsers = useMemo(() => {
    const map = new Map()
    periodos.forEach((p) =>
      p.usuarios.forEach((u) => {
        if (!map.has(u.usuario_id)) map.set(u.usuario_id, u.nombre)
      })
    )
    return [...map.entries()].map(([id, nombre], i) => ({
      id,
      nombre,
      color: USER_PALETTE[i % USER_PALETTE.length],
    }))
  }, [periodos])

  // Datos planos para recharts: { label, meta, [userId]: rendimiento, ... }
  const periodChartData = useMemo(() =>
    periodos.map((p) => ({
      label: p.label,
      meta:  p.meta,
      ...Object.fromEntries(p.usuarios.map((u) => [u.usuario_id, u.rendimiento])),
    })),
    [periodos]
  )

  const barSize = Math.max(6, Math.floor(40 / Math.max(allUsers.length, 1)))

  const isLoading = loadingUsuarios || loadingPeriodos

  return (
    <div className="p-6 space-y-6">

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Sede</label>
          <select name="sede_id" onChange={handleChange} className="border p-2 rounded min-w-[180px] text-sm">
            <option value="">Todas las sedes</option>
            {sedes?.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Desde</label>
          <input type="date" name="fecha_inicio" onChange={handleChange} className="border p-2 rounded text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Hasta</label>
          <input type="date" name="fecha_fin" onChange={handleChange} className="border p-2 rounded text-sm" />
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          <span className="ml-3 text-gray-600">Cargando productividad...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* KPI CARDS — metas de referencia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white shadow p-3 rounded flex flex-col items-center">
              <span className="text-gray-500 text-xs">Meta / hora</span>
              <span className="text-2xl font-bold text-gray-700">{metaHora.toLocaleString()}</span>
              <span className="text-xs text-gray-400">u/h</span>
            </div>
            <div className="bg-white shadow p-3 rounded flex flex-col items-center">
              <span className="text-gray-500 text-xs">Meta diaria</span>
              <span className="text-2xl font-bold text-blue-600">{metaDiaria.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{horasDiarias}h × {metaHora} u/h</span>
            </div>
            <div className="bg-white shadow p-3 rounded flex flex-col items-center">
              <span className="text-gray-500 text-xs">Meta semanal</span>
              <span className="text-2xl font-bold text-indigo-600">{metaSemanal.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{horasSemanales}h × {metaHora} u/h</span>
            </div>
            <div className="bg-white shadow p-3 rounded flex flex-col items-center">
              <span className="text-gray-500 text-xs">Meta mensual</span>
              <span className="text-2xl font-bold text-purple-600">{metaMensual.toLocaleString()}</span>
              <span className="text-xs text-gray-400">~4.33 sem × meta semanal</span>
            </div>
          </div>

          {/* TOGGLE DE PERÍODO */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-500 font-medium">Rendimiento:</span>
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setTipoPeriodo(p.key)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                  tipoPeriodo === p.key
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
            {metaPeriodo > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                meta {tipoPeriodo}: <strong>{metaPeriodo.toLocaleString()}</strong> u
              </span>
            )}
          </div>

          {/* GRÁFICA RENDIMIENTO POR PERÍODO Y POR USUARIO */}
          {periodChartData.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-400 text-sm">
              No hay producción registrada para el período seleccionado.
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="mb-1 font-semibold text-gray-800">
                Rendimiento por usuario — vista {PERIODOS.find((p) => p.key === tipoPeriodo)?.label.toLowerCase()}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                % de cumplimiento vs meta {tipoPeriodo} ({metaPeriodo.toLocaleString()} u).
                Verde ≥ 100% · Amarillo ≥ 80% · Rojo &lt; 80%
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={periodChartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  barCategoryGap="20%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, "dataMax + 15"]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<TooltipPeriodo />} />
                  <Legend
                    formatter={(value) => allUsers.find((u) => String(u.id) === String(value))?.nombre ?? value}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="5 3"
                    label={{ value: "100%", position: "insideTopRight", fontSize: 10, fill: "#16a34a" }} />
                  <ReferenceLine y={80} stroke="#ca8a04" strokeDasharray="5 3"
                    label={{ value: "80%", position: "insideTopRight", fontSize: 10, fill: "#ca8a04" }} />

                  {allUsers.map((u) => (
                    <Bar
                      key={u.id}
                      dataKey={u.id}
                      name={u.nombre}
                      fill={u.color}
                      barSize={barSize}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* DETALLE POR USUARIO — período completo */}
          {usuarios.length > 0 && (
            <>
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Eficiencia real — período completo
              </h3>

              {/* GRÁFICA EFICIENCIA POR USUARIO */}
              <div className="bg-white p-4 rounded shadow">
                <p className="text-xs text-gray-400 mb-2">
                  Basada en producción real / horas trabajadas (excluye pausas).
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={usuarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" tick={{ fontSize: 11 }} />
                    <Tooltip content={<TooltipUsuario />} />
                    <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="5 3" />
                    <ReferenceLine y={80}  stroke="#ca8a04" strokeDasharray="5 3" />
                    <Bar dataKey="eficiencia_porcentaje" name="Eficiencia" barSize={22} radius={[3, 3, 0, 0]}>
                      {usuarios.map((e) => {
                        const v = e.eficiencia_porcentaje
                        const fill = v >= 100 ? "#22c55e" : v >= 80 ? "#eab308" : "#ef4444"
                        return <rect key={e.usuario_id} fill={fill} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* TABLA */}
              <div className="bg-white rounded shadow p-4 overflow-x-auto">
                <p className="text-xs text-gray-500 mb-2">
                  {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                  Producción total: <strong>{totalProduccion.toLocaleString()}</strong> &nbsp;·&nbsp;
                  Eficiencia promedio: <strong>{promedioEficiencia}%</strong>
                </p>
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs">
                      <th className="py-2 text-left">Usuario</th>
                      <th className="py-2">Producción</th>
                      <th className="py-2">Horas</th>
                      <th className="py-2">u/hora real</th>
                      <th className="py-2">Eficiencia</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((item) => (
                      <tr key={item.usuario_id} className="border-t hover:bg-gray-50">
                        <td className="py-2 text-left">{item.nombre}</td>
                        <td className="py-2">{item.produccion_total.toLocaleString()}</td>
                        <td className="py-2">{item.horas}</td>
                        <td className="py-2">{item.bolsas_por_hora}</td>
                        <td className="py-2 font-semibold">{item.eficiencia_porcentaje}%</td>
                        <td className="py-2">
                          <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${ESTADO_COLORS[item.estado] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* SIN DATOS */}
          {usuarios.length === 0 && periodChartData.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              No hay registros finalizados para el período seleccionado.
            </div>
          )}
        </>
      )}

    </div>
  )
}
