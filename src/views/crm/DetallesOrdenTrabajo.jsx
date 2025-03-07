import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import useOrdenesTrabajo from "../../hooks/useOrdenesTrabajo";
import { formatCurrency } from "../../helpers";

/** Factor para convertir cm a pulgadas */
const FACTOR_PULGADA = 0.393701;

/**
 * Dado un detalle con { largo_cm, ancho_cm, calibre, cantidad, valor_unitario },
 * calculamos:
 * - peso_bolsa,
 * - numero_bolsas,
 * - cantidad_requerida_kg
 * - valor_total (por ejemplo, con IVA 1.19)
 */
function calcularCampos(detalle) {
  const largo_cm      = parseFloat(detalle.largo_cm)      || 0;
  const ancho_cm      = parseFloat(detalle.ancho_cm)      || 0;
  const calibre       = parseFloat(detalle.calibre)       || 0;
  const faltantes      = parseFloat(detalle.faltantes)      || 0;


  let peso_bolsa            = 0;
  let numero_bolsas         = 0;
  let cantidad_requerida_kg = 0;

  if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
    const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
    const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);

    // Fórmula base (ajusta si tu cálculo varía)
    const resultado = Math.round((largoIn * anchoIn * 302) / 10);
    peso_bolsa = Math.ceil((resultado * calibre) / 1000); // en gramos

    if (peso_bolsa > 0) {
      numero_bolsas = Math.max(1, Math.round(1000 / peso_bolsa));
      cantidad_requerida_kg = Math.ceil(faltantes * peso_bolsa) / 1000;
    }
  }

  // Ejemplo de cálculo con IVA 1.19
  

  return { peso_bolsa, numero_bolsas, cantidad_requerida_kg };
}

export default function DetallesOrdenTrabajo() {
  // 1. Hooks en orden fijo, sin returns antes
  const { id } = useParams();
  const { ordenesTrabajo } = useOrdenesTrabajo();

  const [errores, setErrores] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado inicial vacío (array), para no romper el .map
  const [detalles, setDetalles] = useState([]);

  // 2. Buscar la OT según el ID, ya que es un simple lookup
  const orden = ordenesTrabajo?.data?.find((o) => o.id === parseInt(id));

  // 3. useEffect para setear detalles cuando tengamos la orden
  useEffect(() => {
    // Si no hay orden o no hay orden_compra, no hacemos nada todavía
    if (!orden || !orden.orden_compra) return;

    // Asegurarnos de que 'detalles' sea un array
    const arrayDetalles = Array.isArray(orden.orden_compra.detalles)
      ? orden.orden_compra.detalles
      : [];

    // Mapear y calcular
    const detallesCalculados = arrayDetalles
      .map((detalle) => {
        if (!detalle) return null; // por si viniera algo null
        const calc = calcularCampos(detalle);
        return {
          ...detalle,
          // Campos del backend
          cantidadEnviada: detalle.cantidad_enviada || 0,
          faltantes: detalle.faltantes || 0,

          // Campos calculados
          peso_bolsa: calc.peso_bolsa,
          numero_bolsas: calc.numero_bolsas,
          cantidad_requerida_kg: calc.cantidad_requerida_kg,
         

          // Campo temporal para la UI, no para la BD
          faltantesTemporal: undefined,
        };
      })
      // Filtramos los nulos (si algo devolvió null)
      .filter(Boolean);

    setDetalles(detallesCalculados);
    setObservaciones(orden.observaciones || "");
  }, [orden]);

  // 4. Si la orden no existe o no hay 'orden_compra', salimos:
  // (Ojo: se hace DESPUÉS de los hooks)
  if (!orden) {
    return <p>Cargando orden o no se encontró la orden.</p>;
  }
  if (!orden.orden_compra) {
    return <p>La orden no contiene una orden de compra.</p>;
  }

  // 5. Manejo de cambios en los campos que recalculan o actualizan
  const handleChangeDetalle = (index, field, value) => {
    setDetalles((prev) => {
      const nuevos = [...prev];
      // Si por cualquier razón 'nuevos[index]' no existe, salimos
      if (!nuevos[index]) return nuevos;

      nuevos[index][field] = value;

      // Recalcular si cambia algo que afecte el peso/valor
      if (["largo_cm", "ancho_cm", "calibre", "cantidad", "valor_unitario"].includes(field)) {
        const calc = calcularCampos(nuevos[index]);
        nuevos[index] = {
          ...nuevos[index],
          ...calc, // Reinserta { peso_bolsa, numero_bolsas, cantidad_requerida_kg, valor_total }
        };
      }

      // CantidadEnviada => calculamos faltantesTemporal
      if (field === "cantidadEnviada") {
        const cantidadEnviada = parseInt(value) || 0;
        const cantidadRequerida = parseFloat(nuevos[index].faltantes) || 0;
        const faltantesCalc = Math.max(cantidadRequerida - cantidadEnviada, 0);
        nuevos[index].faltantesTemporal = faltantesCalc;
      }

      return nuevos;
    });
  };

  // 6. Función para guardar la orden de trabajo en el backend
  const handleGuardarOrden = async () => {
    try {
      setLoading(true);
      setErrores({});

      const token = localStorage.getItem("token");
      const ordenCompraId = orden.orden_compra.id; // Ajusta según tu ruta

      // Armamos payload para el backend
      const payload = {
        observaciones,
        detalles: detalles.map((det) => ({
          id: det.id, // si el backend lo requiere para update
          largo_cm: det.largo_cm,
          ancho_cm: det.ancho_cm,
          calibre: det.calibre,
          cantidad: det.cantidad,
          valor_unitario: det.valor_unitario,
          descripcion: det.descripcion || "",
          cantidad_enviada: det.cantidadEnviada,
          observaciones: det.observaciones || "",
        })),
      };

      const response = await clienteAxios.post(
        `/api/orden-trabajo/${ordenCompraId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Orden de Trabajo actualizada");

      // Si la respuesta trae la OT con detalles actualizados, refrescamos
      if (response.data.ordenTrabajo?.detalles) {
        const nuevosDetalles = response.data.ordenTrabajo.detalles
          .map((bdDet) => {
            if (!bdDet) return null;
            const calc = calcularCampos(bdDet);
            return {
              ...bdDet,
              cantidadEnviada: bdDet.cantidad_enviada || 0,
              faltantes: bdDet.faltantes || 0,
              faltantesTemporal: undefined,
              ...calc,
            };
          })
          .filter(Boolean);

        setDetalles(nuevosDetalles);
      }
    } catch (error) {
      if (error.response && error.response.data?.errors) {
        setErrores(error.response.data.errors);
      } else {
        toast.error("Ocurrió un error al guardar la Orden de Trabajo");
      }
    } finally {
      setLoading(false);
    }
  };

  // 7. Render final
  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Orden de Trabajo #{orden.id} - {orden.cliente?.nombre}
        </h2>
        <Link 
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-green-700"
          to="/auth/crm/reporte-inventarios"
        >
          Regresar
        </Link>
      </div>

      <p className="text-gray-600">Fecha de Entrega: {orden.fecha_entrega}</p>
      <p className="text-gray-600">Generado por: {orden.user?.name}</p>

      <h3 className="text-xl font-semibold mt-6">Detalles</h3>
      <table className="w-full border border-gray-300 rounded-lg mt-2">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            <th className="px-4 py-2 text-left">Largo cm</th>
            <th className="px-4 py-2 text-left">Ancho cm</th>
            <th className="px-4 py-2 text-left">Calibre</th>
            <th className="px-4 py-2 text-left">Peso Bolsa</th>
            <th className="px-4 py-2 text-left"># Bolsas</th>
            <th className="px-4 py-2 text-left">Cant. Req. (Kg)</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-left">Cantidad</th>
            <th className="px-4 py-2 text-left">Cant. Enviada</th>
            <th className="px-4 py-2 text-left">Faltantes</th>
            <th className="px-4 py-2 text-left">Valor Unit.</th>
            <th className="px-4 py-2 text-left">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {(detalles || []).map((detalle, index) => {
            if (!detalle) return null; // Evitar fallos
            return (
              <tr key={detalle.id ?? `new-${index}`} className="border-t border-gray-300">
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-1 w-20"
                    value={detalle.largo_cm}
                    onChange={(e) => handleChangeDetalle(index, "largo_cm", e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-1 w-20"
                    value={detalle.ancho_cm}
                    onChange={(e) => handleChangeDetalle(index, "ancho_cm", e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-1 w-20"
                    value={detalle.calibre}
                    onChange={(e) => handleChangeDetalle(index, "calibre", e.target.value)}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  {detalle.peso_bolsa || 0}
                </td>
                <td className="px-4 py-2 text-center">
                  {detalle.numero_bolsas || 0}
                </td>
                <td className="px-4 py-2 text-center">
                  {detalle.cantidad_requerida_kg?.toFixed(2) || 0}
                </td>
                <td className="px-4 py-2">
                {detalle.descripcion}
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-1 w-20"
                    value={detalle.cantidad}
                    onChange={(e) => handleChangeDetalle(index, "cantidad", e.target.value)}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-1 w-20"
                    value={detalle.cantidadEnviada}
                    onChange={(e) => handleChangeDetalle(index, "cantidadEnviada", e.target.value)}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  {detalle.faltantesTemporal !== undefined
                    ? detalle.faltantesTemporal
                    : detalle.faltantes}
                </td>
                <td 
                className="px-4 py-2 text-center">
                {formatCurrency (detalle.valor_unitario)}
                </td>
                <td className="px-4 py-2 text-center">
                  {formatCurrency(detalle.valor_total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Observaciones */}
      <div className="mt-4">
        <textarea
          className="w-full border border-gray-300 px-2 py-1 rounded"
          rows={3}
          placeholder="Observaciones generales para la orden de trabajo"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
        {errores.observaciones && (
          <p className="text-red-500 text-sm">{errores.observaciones}</p>
        )}
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
        onClick={handleGuardarOrden}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar Cambios"}
      </button>
    </div>
  );
}
