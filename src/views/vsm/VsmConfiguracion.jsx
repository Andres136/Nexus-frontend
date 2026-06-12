import { useState } from "react"
import {
  useVsmConfiguracionVigente,
  useVsmConfiguracionHistorial,
  useCrearVsmConfiguracion,
  useActualizarVsmConfiguracion,
  useEliminarVsmConfiguracion,
  useRestaurarVsmConfiguracion,
} from "../../hooks/vsm/useVsmConfiguracion"

const FORM_VACIO = { meta_unidades_hora: "", descripcion: "", horas_semanales: "" }

export default function VsmConfiguracion() {
  const [form, setForm]           = useState(FORM_VACIO)
  const [editando, setEditando]   = useState(null)   // registro siendo editado
  const [error, setError]         = useState("")
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const { config, isLoading: loadingVigente }       = useVsmConfiguracionVigente()
  const { historial, isLoading: loadingHistorial }  = useVsmConfiguracionHistorial()
  const crearMutation      = useCrearVsmConfiguracion()
  const actualizarMutation = useActualizarVsmConfiguracion()
  const eliminarMutation   = useEliminarVsmConfiguracion()
  const restaurarMutation  = useRestaurarVsmConfiguracion()

  // ── helpers ──────────────────────────────────────────────────
  const limpiar = () => {
    setForm(FORM_VACIO)
    setEditando(null)
    setError("")
  }

  const abrirEdicion = (item) => {
    setEditando(item)
    setForm({ meta_unidades_hora: item.meta_unidades_hora, descripcion: item.descripcion ?? "",horas_semanales: item.horas_semanales ?? "" })
    setError("")
  }

  const validar = () => {
    const meta = parseFloat(form.meta_unidades_hora)
    if (!meta || meta <= 0) { setError("Ingresa una meta válida mayor a 0."); return false }
    return true
  }

  // ── submit crear / editar ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!validar()) return

    const payload = {
      meta_unidades_hora: parseFloat(form.meta_unidades_hora),
      descripcion: form.descripcion || null,
      horas_semanales: form.horas_semanales ? parseFloat(form.horas_semanales) : null,
    }

    if (editando) {
      actualizarMutation.mutate(
        { id: editando.id, data: payload },
        { onSuccess: limpiar, onError: (err) => setError(err?.response?.data?.message ?? "Error al actualizar.") }
      )
    } else {
      crearMutation.mutate(
        payload,
        { onSuccess: limpiar, onError: (err) => setError(err?.response?.data?.message ?? "Error al guardar.") }
      )
    }
  }

  // ── eliminar ──────────────────────────────────────────────────
  const handleEliminar = () => {
    if (!confirmEliminar) return
    eliminarMutation.mutate(confirmEliminar.id, {
      onSuccess: () => setConfirmEliminar(null),
      onError: (err) => {
        setError(err?.response?.data?.message ?? "Error al eliminar.")
        setConfirmEliminar(null)
      },
    })
  }

  const isPending = crearMutation.isPending || actualizarMutation.isPending

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">

      {/* META VIGENTE */}
      <div className="bg-white rounded shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Meta de eficiencia vigente</h2>
        {loadingVigente ? (
          <span className="text-gray-400 text-sm">Cargando...</span>
        ) : config ? (
          <div className="flex items-end gap-6">
            <div>
              <span className="text-4xl font-bold text-green-600">{config.meta_unidades_hora}</span>
              <span className="ml-2 text-gray-500 text-sm">unidades / hora</span>
            </div>
            <div className="text-xs text-gray-400 mb-1 space-y-0.5">
              {config.descripcion && <p>{config.descripcion}</p>}
              <p>Definida por {config.creado_por ?? "sistema"} — {config.creado_en}</p>
            </div>
          </div>
        ) : (
          <p className="text-yellow-600 text-sm">
            Sin configuración. El sistema usa el valor por defecto (705.88 u/h).
          </p>
        )}
      </div>

      {/* FORMULARIO CREAR / EDITAR */}
      <div className="bg-white rounded shadow p-5">
        <h2 className="text-lg font-semibold mb-4">
          {editando ? `Editando meta #${editando.id}` : "Definir nueva meta"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Unidades / hora</label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Ej: 750"
                value={form.meta_unidades_hora}
                onChange={(e) => setForm({ ...form, meta_unidades_hora: e.target.value })}
                className="border rounded p-2 w-40 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700">Descripción (opcional)</label>
              <input
                type="text"
                maxLength={255}
                placeholder="Ej: Meta temporada alta julio 2026"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700">Horas semanales (opcional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 40"
                value={form.horas_semanales}
                onChange={(e) => setForm({ ...form, horas_semanales: e.target.value })}
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editando ? "Actualizar" : "Guardar meta"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={limpiar}
                className="px-5 py-2 rounded border text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Historial de metas</h2>
        {loadingHistorial ? (
          <span className="text-gray-400 text-sm">Cargando...</span>
        ) : historial.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin registros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3">Meta (u/h)</th>
                  <th className="py-2 pr-3">Descripción</th>
                  <th className="py-2 pr-3">Horas semanales</th>
                  <th className="py-2 pr-3">Definida por</th>

                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.id} className="border-t align-middle">
                    <td className="py-2 pr-3 font-semibold">{item.meta_unidades_hora}</td>
                    <td className="py-2 pr-3 text-gray-500">{item.descripcion ?? "—"}</td>
                    <td className="py-2 pr-3">{item.horas_semanales ?? "—"}</td>
                    <td className="py-2 pr-3">{item.creado_por ?? "sistema"}</td>
                    <td className="py-2 pr-3 text-gray-400 whitespace-nowrap">{item.creado_en}</td>
                    <td className="py-2 pr-3">
                      {item.activo ? (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-300">
                          Vigente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs border border-gray-200">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap space-x-3">
                      <button
                        onClick={() => abrirEdicion(item)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      {!item.activo && (
                        <>
                          <button
                            onClick={() => restaurarMutation.mutate(item.id)}
                            disabled={restaurarMutation.isPending}
                            className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => setConfirmEliminar(item)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold text-gray-800">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600">
              ¿Eliminar la meta de{" "}
              <strong>{confirmEliminar.meta_unidades_hora} u/h</strong>
              {confirmEliminar.descripcion ? ` — "${confirmEliminar.descripcion}"` : ""}?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminarMutation.isPending}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
              >
                {eliminarMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
