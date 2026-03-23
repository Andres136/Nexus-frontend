import { useState } from "react";
import { useRegistrodeInspecciones } from "../../hooks/hseq/useRegistrodeInspecciones";
import { useGetInspecciones } from "../../hooks/hseq/useGetInspecciones";
import MantenimientoCalendar from "../tic/MantenimientoCalendar";
import { useSedes } from "../../hooks/useSedes";
import { useGetTipoInspecciones } from "../../hooks/hseq/useGetTipoInspecciones";
import { mapInspeccionesToEvents } from "./adapters/inspecciones.adapter";
import EjecutarInspeccion from "./EjecutarInspeccion";
import Select from "react-select";

export default function CalendarioInspecciones() {

  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState(null); // create | execute
  const [selectedInspeccion, setSelectedInspeccion] = useState(null);

  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
  } = useRegistrodeInspecciones();

  const { data } = useGetInspecciones();
  const { sedes } = useSedes();
  const { data: tiposInspecciones } = useGetTipoInspecciones();

  const events = mapInspeccionesToEvents(data || []);

  // 👉 click en fecha (crear)
  const handleDateClick = (date) => {
    handleChange({
      target: {
        name: "fecha",
        value: date,
      },
    });

    setModalView("create");
    setModalOpen(true);
  };

  // 👉 click en evento (ver / ejecutar)
  const handleEventClick = (data) => {
    setSelectedInspeccion(data);
    setModalView("execute");
    setModalOpen(true);
  };

  return (
    <div>
      <MantenimientoCalendar
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick} // 🔥 NUEVO
        title="Calendario de Inspecciones"
        subtitle="Gestión de inspecciones HSEQ"
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          {/* 🟢 CREAR INSPECCIÓN */}
          {modalView === "create" && (
            <form
              onSubmit={(e) => {
                handleSubmit(e);
                if (!error) setModalOpen(false);
              }}
              className="bg-white p-6 rounded-lg w-96"
            >
              <h2 className="font-bold mb-4">
                Nueva Inspección - {formData.fecha}
              </h2>

              <Select
                name="sede_id"
                options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
                placeholder="Selecciona una sede"
                onChange={(option) =>
                  handleChange({
                    target: { name: "sede_id", value: option ? option.value : "" },
                  })
                }
                className="mb-3"
              />

              <Select
                name="tipo_inspeccion_id"
                options={(tiposInspecciones || []).map((t) => ({
                  value: t.id,
                  label: t.nombre,
                }))}
                placeholder="Selecciona un tipo de inspección"
                onChange={(option) =>
                  handleChange({
                    target: {
                      name: "tipo_inspeccion_id",
                      value: option ? option.value : "",
                    },
                  })
                }
                className="mb-3"
              />

              <textarea
                name="observaciones"
                placeholder="Observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                className="w-full border p-2 mb-3 rounded"
                rows={3}
              />

              {error && (
                <p className="text-red-500 text-sm mb-3">
                  {JSON.stringify(error)}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          )}

          {/* 🔵 VER / EJECUTAR INSPECCIÓN */}
          {modalView === "execute" && selectedInspeccion && (
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="font-bold mb-4">
                {selectedInspeccion.tipo}
              </h2>

              <p className="text-sm mb-2">
                📅 {selectedInspeccion.start}
              </p>

              <p className="text-sm mb-2">
                📍 {selectedInspeccion.sede}
              </p>

              <p className="text-sm mb-4">
                👤 {selectedInspeccion.usuario}
              </p>

              

              {/* 🔥 SOLO SI ESTÁ PENDIENTE */}
              {selectedInspeccion.estado === "pendiente" && (
                <button
                  className="w-full bg-green-600 text-white py-2 rounded mb-2"
                  onClick={() => {
                    setModalView("form");
                  }}
                >
                  Ejecutar inspección
                </button>
              )}

              <button
                className="w-full border py-2 rounded"
                onClick={() => setModalOpen(false)}
              >
                Cerrar
              </button>
          </div>


          )}

    

   
    {modalView === "form" && selectedInspeccion && (
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <EjecutarInspeccion inspeccion={selectedInspeccion} />

        <button
          className="w-full mt-4 border py-2 rounded"
          onClick={() => setModalOpen(false)}
        >
          Cerrar
        </button>
      </div>
    )}


          
        </div>

        
      )}
                 
  
    </div>
  );
}