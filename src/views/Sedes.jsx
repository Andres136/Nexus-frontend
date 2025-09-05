
import { useState } from "react";
import { useSedes } from "../hooks/useSedes";

export default function Sedes() {
  const { sedes, registrarSede, actualizarSede, eliminarSede, loading, error } = useSedes();
  const [form, setForm] = useState({ nombre: "", direccion: "" });

  const submit = async (e) => {
    e.preventDefault();
    await registrarSede(form);      // actualiza estado local
    setForm({ nombre: "", direccion: "" });
  };

  return (
    <div>
      <h1>Sedes</h1>
      <form onSubmit={submit}>
        <input value={form.nombre} onChange={e=>setForm(f=>({...f, nombre:e.target.value}))} placeholder="Nombre" />
        <input value={form.direccion} onChange={e=>setForm(f=>({...f, direccion:e.target.value}))} placeholder="Dirección" />
        <button type="submit">Registrar</button>
      </form>

      {loading ? "Cargando..." : (
        <ul>
          {sedes.map(s => (
            <li key={s.id}>
              {s.nombre} — {s.direccion ?? "—"}
              <button onClick={()=>actualizarSede(s.id, { nombre: s.nombre + " (edit)" })}>Editar</button>
              <button onClick={()=>eliminarSede(s.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      {error && <pre className="text-red-600 text-sm">{JSON.stringify(error, null, 2)}</pre>}
    </div>
  );
}
