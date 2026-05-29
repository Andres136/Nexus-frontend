import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, X } from "lucide-react";

const TIPOS = [
  { value: "texto",           label: "Respuesta libre" },
  { value: "escala",          label: "Escala 1 – 5" },
  { value: "opcion_multiple", label: "Opción múltiple" },
];

export default function PreguntaEditor({ pregunta, index, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pregunta.id ?? index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleField = (field, value) => onChange(index, { ...pregunta, [field]: value });

  const addOpcion = () =>
    handleField("opciones", [...(pregunta.opciones ?? []), ""]);

  const updateOpcion = (i, value) => {
    const opciones = [...(pregunta.opciones ?? [])];
    opciones[i] = value;
    handleField("opciones", opciones);
  };

  const removeOpcion = (i) =>
    handleField("opciones", (pregunta.opciones ?? []).filter((_, idx) => idx !== i));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
    >
      {/* ── Cabecera ── */}
      <div className="flex items-center gap-3">
        {/* Handle drag */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-gray-400 w-5 shrink-0">
          {index + 1}
        </span>

        {/* Texto de la pregunta */}
        <input
          type="text"
          value={pregunta.texto ?? ""}
          onChange={(e) => handleField("texto", e.target.value)}
          placeholder="Escribe la pregunta..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />

        {/* Tipo */}
        <select
          value={pregunta.tipo ?? "texto"}
          onChange={(e) => handleField("tipo", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Requerida */}
        <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={pregunta.requerida ?? true}
            onChange={(e) => handleField("requerida", e.target.checked)}
            className="accent-emerald-600 w-3.5 h-3.5"
          />
          Req.
        </label>

        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Opciones para opcion_multiple ── */}
      {pregunta.tipo === "opcion_multiple" && (
        <div className="pl-10 space-y-2">
          {(pregunta.opciones ?? []).map((op, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
              <input
                type="text"
                value={op}
                onChange={(e) => updateOpcion(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeOpcion(i)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOpcion}
            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar opción
          </button>
        </div>
      )}

      {/* ── Preview escala ── */}
      {pregunta.tipo === "escala" && (
        <div className="pl-10 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="w-8 h-8 rounded-full border-2 border-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-600"
            >
              {n}
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">El cliente elige un valor</span>
        </div>
      )}
    </div>
  );
}
