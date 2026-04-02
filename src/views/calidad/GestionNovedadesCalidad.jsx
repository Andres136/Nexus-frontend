import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useNovedades } from "../../hooks/calidad/useNovedades";
import { useAuth } from "../../hooks/useAuth";
import { useRegisterHallazgoNovedad } from "../../hooks/calidad/useRegisterHallazgoNovedad";

import {
  FileText,
  AlertCircle,
  Save,
  PlusCircle,
  Calendar,
  User,
  Activity,
  Paperclip
} from "lucide-react";

export default function GestionNovedadesCalidad() {
  const { id } = useParams();
  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: "auth" });

  const {
    loading,
    error,
    obtenerNovedadById,
    actualizarNovedad,
    novedadSeleccionada,
  } = useNovedades();

  const {
    formData: formHallazgo,
    handleChange: handleChangeHallazgo,
    handleSubmit: handleSubmitHallazgo,
    handleUpdate: handleUpdateHallazgo,
    error: errorHallazgo,
  } = useRegisterHallazgoNovedad();

  const [hallazgosEdit, setHallazgosEdit] = useState([]);

  const [form, setForm] = useState({
    descripcion: "",
    estado: "ABIERTA",
    fecha_revision: "",
    fecha_terminado: "",
    responsable_id: null,
    soporte: null,
    fuentes: "",
    causa: "",
  });

  useEffect(() => {
    obtenerUsuariosAll();
    if (id) obtenerNovedadById(id);
  }, [id]);

  useEffect(() => {
    if (novedadSeleccionada) {
      setForm({
        descripcion: novedadSeleccionada.descripcion || "",
        estado: novedadSeleccionada.estado || "ABIERTA",
        fecha_revision: novedadSeleccionada.fecha_revision || "",
        fecha_terminado: novedadSeleccionada.fecha_terminado || "",
        responsable_id: novedadSeleccionada.responsable_id || null,
        soporte: null,
        fuentes: novedadSeleccionada.fuentes || "",
        causa: novedadSeleccionada.causa || ""
      });

      if (novedadSeleccionada.hallazgos) {
        setHallazgosEdit(novedadSeleccionada.hallazgos);
      }
    }
  }, [novedadSeleccionada]);

  const handleChangeNovedad = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmitNovedad = async (e) => {
    e.preventDefault();
    await actualizarNovedad(id, form);
  };

  const handleChangeHallazgoEdit = (id, campo, valor) => {
    setHallazgosEdit(prev =>
      prev.map(h => (h.id === id ? { ...h, [campo]: valor } : h))
    );
  };

  const handleGuardarHallazgoExistente = async (hallazgo) => {
    const response = await handleUpdateHallazgo(hallazgo.id, hallazgo);
    if (response) await obtenerNovedadById(id);
  };

  const handleSubmitNuevoHallazgo = async (e) => {
    e.preventDefault();
    await handleSubmitHallazgo({ ...formHallazgo, novedad_id: id });
    await obtenerNovedadById(id);
  };

  const optionsUsuarios = usuarios.map(u => ({
    value: u.id,
    label: u.name
  }));

  const responsableSeleccionado = optionsUsuarios.find(
    u => u.value === form.responsable_id
  );

  // Estilos comunes
  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    marginTop: "5px",
    transition: "border 0.2s",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "5px"
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "24px"
  };

const opcionesFuentes = [
  { value: "Auditoría Interna", label: "Auditoría Interna" },
  { value: "Auditoría Externa", label: "Auditoría Externa" },
  { value: "Cliente", label: "Cliente" },
  { value: "Proveedor", label: "Proveedor" },
  { value: "Inspección Interna", label: "Inspección Interna" },
  { value: "Control de Proceso", label: "Control de Proceso" },
  { value: "Queja", label: "Queja" },
  { value: "Revisión Gerencial", label: "Revisión Gerencial" },
  { value: "Indicadores", label: "Indicadores / KPIs" },
  { value: "Acción Correctiva", label: "Acción Correctiva" },
  { value: "Acción Preventiva", label: "Acción Preventiva" },
  { value: "Hallazgo SST", label: "Seguridad y Salud en el Trabajo (SST)" },
  { value: "Ambiental", label: "Gestión Ambiental" },
  { value: "Otro", label: "Otro" }
];
 
 
  return (
    <div style={{ padding: "40px 20px", maxWidth: "1100px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", color: "#1e293b", fontSize: "28px", fontWeight: "700" }}>
          <AlertCircle size={32} color="#2563eb" /> Gestión de Novedad 
          <span style={{ color: "#64748b", fontWeight: "400" }}>#{id}</span>
        </h1>
        <p style={{ color: "#64748b", marginTop: "4px" }}>Administre la información general y realice el seguimiento de hallazgos.</p>
      </header>

      {loading && <div style={{ textAlign: "center", padding: "20px", color: "#2563eb" }}>Cargando datos...</div>}
      {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{error}</div>}

      {/* --- INFORMACIÓN GENERAL --- */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} /> Información General
        </h2>

        <form onSubmit={handleSubmitNovedad} style={{ display: "grid", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Descripción de la Novedad</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChangeNovedad}
              placeholder="Detalle los hallazgos generales..."
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            />
          </div>
             
          <div>
            <label style={labelStyle}>Causa de la Novedad</label>
            <textarea
              name="causa"
              value={form.causa}
              onChange={handleChangeNovedad}
              placeholder="Detalle la causa de los hallazgos..."
    style={{ 
  ...inputStyle, 
  minHeight: "120px", 
  resize: "vertical",
  lineHeight: "1.6",
  padding: "12px",
  whiteSpace: "pre-wrap"
}}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}><User size={14}/> Responsable General</label>
              <div style={{ marginTop: "5px" }}>
                <Select
                  options={optionsUsuarios}
                  value={responsableSeleccionado}
                  onChange={(selected) => setForm(prev => ({ ...prev, responsable_id: selected?.value }))}
                  styles={{ control: (base) => ({ ...base, borderRadius: "8px", padding: "2px" }) }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}><Activity size={14}/> Estado Actual</label>
              <select name="estado" value={form.estado} onChange={handleChangeNovedad} style={inputStyle}>
                <option value="ABIERTA">ABIERTA</option>
                <option value="EN_PROCESO">EN PROCESO</option>
                <option value="CERRADA">CERRADA</option>
              </select>
            </div>
          </div>

          {/* --- FUENTES --- */}

<div>
  <label style={labelStyle}>Fuente de la Novedad</label>
  <Select
    options={opcionesFuentes}
    value={opcionesFuentes.find(f => f.value === form.fuentes)}
    onChange={(selected) => setForm(prev => ({ ...prev, fuentes: selected?.value }))}
    styles={{ control: (base) => ({ ...base, borderRadius: "8px", padding: "2px" }) }}
    placeholder="Seleccione la fuente"
  />
</div>
          

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}><Calendar size={14}/> Fecha Revisión</label>
              <input type="date" name="fecha_revision" value={form.fecha_revision} onChange={handleChangeNovedad} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Calendar size={14}/> Fecha Terminado</label>
              <input type="date" name="fecha_terminado" value={form.fecha_terminado} onChange={handleChangeNovedad} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Paperclip size={14}/> Soporte Técnico</label>
              <input type="file" name="soporte" onChange={handleChangeNovedad} style={{ ...inputStyle, padding: "7px" }} />
            </div>
          </div>

          <button style={{ 
            marginTop: "10px", padding: "12px 24px", background: "#2563eb", color: "#fff", 
            border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
            width: "fit-content", alignSelf: "end", transition: "background 0.2s"
          }} 
          onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
          onMouseOut={(e) => e.target.style.background = "#2563eb"}>
            Guardar Cambios Novedad
          </button>
        </form>
      </section>

      {/* --- LISTADO DE HALLAZGOS --- */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" }}>Hallazgos Vinculados</h2>

        <div style={{ display: "grid", gap: "16px" }}>
          {hallazgosEdit.length === 0 && <p style={{ color: "#64748b", fontStyle: "italic" }}>No se han registrado hallazgos específicos.</p>}
          {hallazgosEdit.map(h => (
            <div key={h.id} style={{ ...cardStyle, padding: "20px", marginBottom: "0", borderLeft: h.estado === 'CERRADA' ? "6px solid #16a34a" : "6px solid #f59e0b" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={18} color="#2563eb" /> Hallazgo <span style={{ color: "#64748b" }}>#{h.id}</span>
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px",
                  background: h.estado === "CERRADA" ? "#dcfce7" : h.estado === "EN_PROCESO" ? "#fef9c3" : "#fee2e2",
                  color: h.estado === "CERRADA" ? "#166534" : h.estado === "EN_PROCESO" ? "#854d0e" : "#991b1b"
                }}>
                  {h.estado}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={labelStyle}>Causa Identificada</label>
                  <textarea
                    value={h.causa}
                    onChange={(e) => handleChangeHallazgoEdit(h.id, "causa", e.target.value)}
                    style={{ ...inputStyle, minHeight: "80px" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Plan de Acción</label>
                  <textarea
                    value={h.plan_accion}
                    onChange={(e) => handleChangeHallazgoEdit(h.id, "plan_accion", e.target.value)}
                    style={{ ...inputStyle, minHeight: "80px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", alignItems: "end" }}>
                <div>
                  <label style={labelStyle}>Responsable</label>
                  <Select
                    options={optionsUsuarios}
                    value={optionsUsuarios.find(u => u.value === (h.responsable_id || h.responsable?.id))}
                    onChange={(selected) => handleChangeHallazgoEdit(h.id, "responsable_id", selected.value)}
                    styles={{ control: (base) => ({ ...base, borderRadius: "8px", marginTop: "5px" }) }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Revisión</label>
                  <input type="date" value={h.fecha_revision || ""} onChange={(e) => handleChangeHallazgoEdit(h.id, "fecha_revision", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cierre</label>
                  <input type="date" value={h.fecha_cierre || ""} onChange={(e) => handleChangeHallazgoEdit(h.id, "fecha_cierre", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                   <select value={h.estado} onChange={(e) => handleChangeHallazgoEdit(h.id, "estado", e.target.value)} style={inputStyle}>
                    <option value="ABIERTA">ABIERTA</option>
                    <option value="EN_PROCESO">EN PROCESO</option>
                    <option value="CERRADA">CERRADA</option>
                  </select>
                  <button
                    onClick={() => handleGuardarHallazgoExistente(h)}
                    style={{
                      marginTop: "5px", background: "#16a34a", color: "#fff", border: "none", 
                      padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center"
                    }}
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- NUEVO HALLAZGO --- */}
      <section style={{ ...cardStyle, background: "#eff6ff", borderColor: "#bfdbfe" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#1e40af" }}>
          <PlusCircle size={22} /> Registrar Nuevo Hallazgo
        </h3>

        <form onSubmit={handleSubmitNuevoHallazgo} style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Causa</label>
              <textarea name="causa" placeholder="Describa la causa raíz..." onChange={handleChangeHallazgo} style={{ ...inputStyle, minHeight: "80px" }} />
              {errorHallazgo?.causa && <span style={{ color: "#dc2626", fontSize: "12px" }}>{errorHallazgo.causa[0]}</span>}
            </div>
            <div>
              <label style={labelStyle}>Plan de Acción</label>
              <textarea name="plan_accion" placeholder="Estrategia a seguir..." onChange={handleChangeHallazgo} style={{ ...inputStyle, minHeight: "80px" }} />
              {errorHallazgo?.plan_accion && <span style={{ color: "#dc2626", fontSize: "12px" }}>{errorHallazgo.plan_accion[0]}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Responsable Asignado</label>
              <div style={{ marginTop: "5px" }}>
                <Select
                  options={optionsUsuarios}
                  onChange={(selected) => handleChangeHallazgo({ target: { name: "responsable_id", value: selected.value } })}
                  styles={{ control: (base) => ({ ...base, borderRadius: "8px" }) }}
                />
              </div>
              {errorHallazgo?.responsable_id && <span style={{ color: "#dc2626", fontSize: "12px" }}>{errorHallazgo.responsable_id[0]}</span>}
            </div>
            <div>
              <label style={labelStyle}>Fecha de Revisión</label>
              <input type="date" name="fecha_revision" onChange={handleChangeHallazgo} style={inputStyle} />
              {errorHallazgo?.fecha_revision && <span style={{ color: "#dc2626", fontSize: "12px" }}>{errorHallazgo.fecha_revision[0]}</span>}
            </div>
            <div>
              <label style={labelStyle}>Fecha de Cierre</label>
              <input type="date" name="fecha_cierre" onChange={handleChangeHallazgo} style={inputStyle} />
              {errorHallazgo?.fecha_cierre && <span style={{ color: "#dc2626", fontSize: "12px" }}>{errorHallazgo.fecha_cierre[0]}</span>}
            </div>
          </div>

          <button style={{ 
            background: "#2563eb", color: "#fff", padding: "12px 32px", border: "none", 
            borderRadius: "8px", fontWeight: "700", cursor: "pointer", alignSelf: "end", width: "fit-content"
          }}>
            Crear Hallazgo
          </button>
        </form>
      </section>
    </div>
  );
}