import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { formatCurrency } from "../../helpers";
import useSystem from "../../hooks/useSystem";

// Reutilizamos la lógica de cálculo
const FACTOR_PULGADA = 0.393701;
function calcularCampos(detalle) {
  const largo_cm  = parseFloat(detalle.largo_cm)  || 0;
  const ancho_cm  = parseFloat(detalle.ancho_cm)  || 0;
  const calibre   = parseFloat(detalle.calibre)   || 0;
  const cantidad  = parseFloat(detalle.cantidad)  || 0;
  const unitario  = parseFloat(detalle.valor_unitario) || 0;

  //Convertir metros a centimetros

  let peso_bolsa             = 0;
  let numero_bolsas          = 0;
  let cantidad_requerida_kg  = 0;
  let valor_total            = 0;

  if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
    const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
    const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);
    const resultado = Math.round((largoIn * anchoIn * 302) / 10);
    // Peso en gramos
    peso_bolsa = Math.ceil((resultado * calibre) / 1000);

    if (peso_bolsa > 0) {
      numero_bolsas = Math.max(1, Math.round(1000 / peso_bolsa));
      cantidad_requerida_kg = Math.ceil(cantidad * peso_bolsa) / 1000;
    }
  }

  valor_total = cantidad * unitario * 1.19; 

  return {
    peso_bolsa,
    numero_bolsas,
    cantidad_requerida_kg,
    valor_total
  };
}

// Función para crear un nuevo detalle "vacío"
function createNewItem() {
  return {
    id: null,            // Sin id para que el backend cree un nuevo detalle
    largo_cm: 0,
    ancho_cm: 0,
    calibre: 0,
    cantidad: 0,
    valor_unitario: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cliente_clb: 0,
    cantidad_requerida_kg: 0,
    descripcion: "",
    valor_total: 0,
  };
}

export default function DetallesOrdenesCompra() {
  const { id } = useParams();
  const { ordenesCompra } = useSystem();

  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  // Encontrar la orden de compra en tu store/hook
  const ordenSeleccionada = ordenesCompra?.data
    ? ordenesCompra.data.find((orden) => orden.id === parseInt(id))
    : null;

    useEffect(() => {
      if (ordenSeleccionada) {
        // Para cada detalle del backend, calculamos sus campos y asignamos el número de ítem
        const detallesCalculados = ordenesCompra
          .data
          .find((orden) => orden.id === parseInt(id))
          .detalles.map((det, index) => {
            return {
              ...det,
              observaciones: ` ${index + 1}`,
              ...calcularCampos(det)
            };
          });
    
        setDetalles(detallesCalculados);
      }
    }, [ordenesCompra, id, ordenSeleccionada]);
    
  // 2. Manejar cambio de input en cada fila
  const handleChangeDetalle = (index, field, value) => {
    const newDetalles = [...detalles];
    // Actualizamos el campo modificado
    newDetalles[index][field] = value;

    // Recalculamos con la función "calcularCampos"
    const recalculados = calcularCampos(newDetalles[index]);

    // Insertamos los valores calculados en el objeto
    newDetalles[index] = {
      ...newDetalles[index],
      ...recalculados,
    };

    setDetalles(newDetalles);
  };

  const agregarItem = () => {
    const newItem = createNewItem();
    // Calculamos los campos (aunque estén en 0) y asignamos observaciones con el número consecutivo
    const calculados = calcularCampos(newItem);
    const itemConNumero = { 
      ...newItem, 
      ...calculados,
      observaciones: `${detalles.length + 1}` 
    };
    setDetalles([...detalles, itemConNumero]);
  };
  

  // 4. Lógica para eliminar un item
  const eliminarItem = (index) => {
    const newDetalles = [...detalles];
    newDetalles.splice(index, 1);
    setDetalles(newDetalles);
  };

  // 5. Enviar datos al backend
  const handleGenerarOrdenTrabajo = async () => {
    if (!ordenSeleccionada) {
      toast.error("No se encontró la orden de compra");
      return;
    }
    try {
      setLoading(true);
      setErrores({});
      

      const token = localStorage.getItem("token");

      const response = await clienteAxios.post(
        `/api/orden-trabajo/${ordenSeleccionada.id}`,
        {
          observaciones,
          detalles: detalles.map((det) => ({
            // Si det.id existe, actualiza; si es null, crea nuevo
            id: det.id,
            largo_cm: det.largo_cm,
            ancho_cm: det.ancho_cm,
            calibre: det.calibre,
            cliente_clb: det.cliente_clb,
            descripcion: det.descripcion,
            cantidad: det.cantidad,
            cantidad_requerida_kg: det.cantidad_requerida_kg,
            valor_unitario: det.valor_unitario,
            valor_total: det.valor_total,
            observaciones: det.observaciones,
            // Otras propiedades si manejas "cantidad_enviada", etc.
            // ...
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Orden de Trabajo generada con éxito");
      // Limpieza o redirección si lo deseas
      // setDetalles([]);
      // setObservaciones("");

    } catch (error) {
      if (error.response && error.response.data) {
        setErrores(error.response.data.errors || {});
      } else {
        toast.error("Ocurrió un error al generar la orden de trabajo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  text-gray-900 p-6">

  <div className="grid grid-cols-2 gap-4">


      <div className=" col-span-2 flex items-center justify-between gap-4 mb-4">
        <div className="">
             <h1 className="text-2xl font-semibold">
          Detalles {ordenSeleccionada ? `Cliente ${ordenSeleccionada?.cliente?.nombre}` : ""}
        </h1>
        <p className="text-gray-500 font-extrabold">
          Fecha de Entrega: {ordenSeleccionada?.fecha_entrega || "No disponible"}
        </p>
        <p className="text-gray-500 font-extrabold">
          Asesor Comercial: {ordenSeleccionada?.user?.name || "No disponible"}
        </p>
      
        </div>
       <Link
          to="/auth/crm/obtener-ordenes-compras"
          className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Regresar
        </Link>
      </div>
      <div className="col-span-2">

      {/* Si no hay orden */}
      {!ordenSeleccionada ? (
        <p className="text-red-500 text-lg font-semibold">
          No se encontró la orden de compra con ID {id}
        </p>
      ) : (
        <>
          {/* Tabla de detalles */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full min-w-[900px] border border-gray-300">
              <thead className="bg-gray-800 text-white text-sm">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">Acciones</th>
                  <th className="border border-gray-300 px-2 py-1">Item</th>
                 <th className="border border-gray-300 px-2 py-1">Ancho cm</th>
                 <th className="border border-gray-300 px-2 py-1">Largo cm</th>  
                  <th className="border border-gray-300 px-2 py-1">Calibre</th>
                  <th className="border border-gray-300 px-2 py-1">Peso Bolsa</th>
                  <th className="border border-gray-300 px-2 py-1"># Bolsas</th>
                  <th className="border border-gray-300 px-2 py-1">Cliente Clb</th>
                  <th className="border border-gray-300 px-2 py-1">Cant Req. (Kg)</th>
                  <th className="border border-gray-300 px-2 py-1">Descripción</th>
                  <th className="border border-gray-300 px-2 py-1">Cantidad</th>
                  <th className="border border-gray-300 px-2 py-1">Valor Unitario</th>
                  <th className="border border-gray-300 px-2 py-1">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 py-1">
                      <button
                        onClick={() => eliminarItem(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <input
                        type="text"
                        value={detalle.observaciones}
                        onChange={(e) =>
                          handleChangeDetalle(index, "observaciones", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
              
                    {/* Ancho */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={detalle.ancho_cm}
                        onChange={(e) =>
                          handleChangeDetalle(index, "ancho_cm", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />      {/* Largo */}
          
                    </td>          <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={detalle.largo_cm}
                        onChange={(e) =>
                          handleChangeDetalle(index, "largo_cm", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Calibre */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={detalle.calibre}
                        onChange={(e) =>
                          handleChangeDetalle(index, "calibre", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Peso Bolsa */}
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {detalle.peso_bolsa?.toFixed(2)}
                    </td>
                    {/* # Bolsas */}
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {detalle.numero_bolsas || 0}
                    </td>
                    {/* Cliente Clb */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={detalle.cliente_clb}
                        onChange={(e) =>
                          handleChangeDetalle(index, "cliente_clb", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Cant Req. (Kg) */}
                    <td className="border border-gray-300 px-2 py-1 text-center">
                    <input type="number"
                    value={detalle.cantidad_requerida_kg.toFixed(2)}    
                    onChange={(e)=>
                      handleChangeDetalle(index, "cantidad_requerida_kg", e.target.value)
                    } />
                    </td>
                    {/* Descripción */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={detalle.descripcion}
                        onChange={(e) =>
                          handleChangeDetalle(index, "descripcion", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Cantidad */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) =>
                          handleChangeDetalle(index, "cantidad", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Valor Unitario */}
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={detalle.valor_unitario}
                        onChange={(e) =>
                          handleChangeDetalle(index, "valor_unitario", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-1"
                      />
                    </td>
                    {/* Valor Total */}
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {formatCurrency(detalle.valor_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón para agregar item */}
          <button
            onClick={agregarItem}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-green-800 mb-4"
          >
            Agregar Ítem
          </button>

          {/* Observaciones para la OT */}
          <div className="mb-4">
            <textarea
              className="w-full border border-gray-300 rounded p-2"
              rows={4}
              placeholder="Observaciones de la Orden de Trabajo"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
            {errores.observaciones && (
              <p className="text-red-500 text-sm">{errores.observaciones}</p>
            )}
          </div>

          {/* Botón Generar Orden de Trabajo */}
          <button
            onClick={handleGenerarOrdenTrabajo}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Generando..." : "Generar Orden de Trabajo"}
          </button>
        </>
      )}

      </div>
       

  </div>


    </div>
  );
}
