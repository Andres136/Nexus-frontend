import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { MessageSquare } from "lucide-react";

const COLORES = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

// ─── Escala 1-5 ──────────────────────────────────────────────────────────────
function GraficaEscala({ datos, total }) {
  const data = Object.entries(datos.distribucion ?? {}).map(([valor, cantidad]) => ({
    valor: `★ ${valor}`,
    cantidad,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{datos.promedio ?? 0}</p>
          <p className="text-xs text-gray-400">promedio</p>
        </div>
        <div className="flex-1 h-px bg-gray-100" />
        <p className="text-xs text-gray-400">{total} respuesta{total !== 1 ? "s" : ""}</p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="valor" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => [v, "Respuestas"]}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORES[i % COLORES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Opción múltiple ──────────────────────────────────────────────────────────
function GraficaOpciones({ datos, total }) {
  const data = Object.entries(datos.conteo ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 text-right">{total} respuesta{total !== 1 ? "s" : ""}</p>
      <div className="flex gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [v, name]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Leyenda manual */}
        <ul className="flex-1 space-y-2 justify-center flex flex-col">
          {data.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORES[i % COLORES.length] }}
              />
              <span className="text-gray-700 truncate flex-1">{item.name}</span>
              <span className="font-semibold text-gray-900 shrink-0">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Respuesta libre ──────────────────────────────────────────────────────────
function ListaTextos({ datos, total }) {
  const respuestas = datos.respuestas ?? [];

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">{total} respuesta{total !== 1 ? "s" : ""}</p>
      {respuestas.length === 0 && (
        <p className="text-sm text-gray-400 italic">Sin respuestas aún</p>
      )}
      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {respuestas.map((r, i) => (
          <li
            key={i}
            className="flex gap-3 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700"
          >
            <MessageSquare className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GraficaResultados({ pregunta }) {
  const { texto, tipo, total, datos } = pregunta;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{texto}</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full shrink-0">
          {tipo === "escala" ? "Escala" : tipo === "opcion_multiple" ? "Opción múltiple" : "Texto libre"}
        </span>
      </div>

      {/* Gráfica según tipo */}
      {tipo === "escala"           && <GraficaEscala   datos={datos} total={total} />}
      {tipo === "opcion_multiple"  && <GraficaOpciones datos={datos} total={total} />}
      {tipo === "texto"            && <ListaTextos     datos={datos} total={total} />}
    </div>
  );
}
