import { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { formatCurrency } from "../../helpers";
import useSystem from "../../hooks/useSystem";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { calcularCamposBolsa } from "../../helpers/utils/calculoBolsa";


// Función para crear un nuevo detalle "vacío"
function createNewItem() {
  return {
    id: null,// Sin id para que el backend cree un nuevo detalle
    product_id: null,  
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
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [forzarEntregaParcial, setForzarEntregaParcial] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

      const { products, isLoading,isError, isEmpty, isFetching } = useProducts({search: searchTerm});



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
              ...calcularCamposBolsa(det)
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
   const recalculados = calcularCamposBolsa(newDetalles[index]);

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
    const calculados = calcularCamposBolsa(newItem);
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
         
          sede_id: parseInt(sedeId), 
          observaciones,
          forzar_entrega_parcial: forzarEntregaParcial, // << ESTE CAMPO NUEVO
          detalles: detalles.map((det) => ({
            // Si det.id existe, actualiza; si es null, crea nuevo
            id: det.id,
            product_id: det.product_id,
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
      console.error("Error al generar la orden de trabajo:", error);
  if (error.response && error.response.data) {
  const data = error.response.data;

  if (data.errors) {
    // Caso típico de Laravel con "errors"
    setErrores(data.errors);
  } else if (data.error) {
    // Caso donde viene un solo "error"
    setErrores({ sede_id: data.error });
  }
} else {
  toast.error("Ocurrió un error al generar la orden de trabajo");
}

    } finally {
      setLoading(false);
    }
  };
 
  
  // Cargar sedes al montar
  useEffect(() => {
    const obtenerSedes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("/api/sedes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSedes(response.data);
      } catch (error) {
        toast.error("Error al cargar las sedes", error);
      }
    };
  
    obtenerSedes();
  }, []);
 

  return (
    <div className="min-h-screen  text-gray-900 p-6">
<div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-4">

{/* Cliente */}
<h2 className="text-2xl font-semibold mb-4">
  {ordenSeleccionada ? (
    <>
      Detalles de la Orden de Compra #{ordenSeleccionada.id} -{" "}
      {ordenSeleccionada.cliente?.nombre || "Cliente desconocido"}
    </>
  ) : (
    "Detalles de la Orden de Compra"
  )}
</h2>


<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  
  {/* Fecha de entrega */}
  <div className="bg-gray-50 rounded-md p-2 flex items-center gap-2 md:col-span-1">
    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <p className="text-xs font-medium text-gray-600">Fecha de Entrega</p>
      <p className="text-sm font-semibold text-gray-900">
        {ordenSeleccionada?.fecha_entrega || "No disponible"}
      </p>
    </div>
  </div>

  {/* Asesor Comercial */}
  <div className="bg-gray-50 rounded-md p-2 flex items-center gap-2 md:col-span-1">
    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <div>
      <p className="text-xs font-medium text-gray-600">Asesor Comercial</p>
      <p className="text-sm font-semibold text-gray-900">
        {ordenSeleccionada?.user?.name || "No disponible"}
      </p>
    </div>
  </div>

  {/* Dirección de entrega */}
  <div className="bg-gray-50 rounded-md p-2 flex items-start gap-2 md:col-span-1">
    <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center mt-0.5">
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <div>
      <p className="text-xs font-medium text-gray-600">Dirección de Entrega</p>
      <p className="text-sm font-semibold text-gray-900">
        {ordenSeleccionada?.ubicacion_entrega || "No disponible"}
      </p>
    </div>
  </div>

  {/* Observaciones */}
  <div className="bg-gray-50 rounded-md p-2 flex items-start gap-2 md:col-span-1">
    <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mt-0.5">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 012 2v2m-4-4v2m-4-2v2m-4-2v2m0 4v2m4-2v2m4-2v2m4-2v2" />
      </svg>
    </div>
    <div>
      <p className="text-xs font-medium text-gray-600">Observaciones</p>
      <p className="text-sm font-semibold text-gray-900">
        {ordenSeleccionada?.observaciones || "No disponible"}
      </p>
    </div>
  </div>
</div>

</div>

  <div className="grid grid-cols-2 gap-4">


    
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
                  <th className="border border-gray-300 px-2 py-1">Producto</th>
                 <th className="border border-gray-300 px-2 py-1">Ancho cm</th>
                 <th className="border border-gray-300 px-2 py-1">Largo cm</th>  
                  <th className="border border-gray-300 px-2 py-1">Calibre</th>
                  <th className="border border-gray-300 px-2 py-1">Peso Bolsa</th>
                  <th className="border border-gray-300 px-2 py-1"># Bolsas</th>
                  <th className="border border-gray-300 px-2 py-1">Cliente Clb</th>
                  <th className="border border-gray-300 px-2 py-1"> (Kg)</th>
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
                    <td className="border border-gray-300 px-2 py-1">
<Select
  options={products.map((product) => ({
    value: product.id,
    label: `${product.code || product.code_id || 'Sin código'} - ${product.name || 'Sin nombre'} - ${product.description || 'Sin descripción'}`,
  }))}

  value={(() => {
    const product = products.find((p) => p.id === detalle.product_id);
    if (product) {
      // ✅ Si el producto está en la lista actual
      return {
        value: product.id,
        label: `${product.code || product.code_id || 'Sin código'} - ${product.name || 'Sin nombre'}`,
      };
    } else if (detalle.product) {
      // ✅ Si el detalle ya trae el producto desde el backend (relación cargada)
      return {
        value: detalle.product.id,
        label: `${detalle.product.code || 'Sin código'} - ${detalle.product.name || 'Sin nombre'}`,
      };
    } else if (detalle.product_id) {
      // ✅ Si solo hay ID, mantenerlo visible temporalmente
      return {
        value: detalle.product_id,
        label: `ID ${detalle.product_id} (sin datos)`,
        isInvalid: true,
      };
    }
    return null;
  })()}

  onChange={(selected) => {
    const productId = selected ? selected.value : null;
    handleChangeDetalle(index, "product_id", productId);
  }}

  onInputChange={(inputValue) => setSearchTerm(inputValue)}
  isLoading={isLoading}
  isClearable
  placeholder="Buscar producto..."
  noOptionsMessage={() => {
    if (isLoading) return "Cargando productos...";
    if (isError) return "Error al cargar productos";
    if (isEmpty) return "No se encontraron productos";
    return "Escribe para buscar";
  }}
  className="min-w-[220px]"
  menuPortalTarget={document.body}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, { data }) => ({
      ...base,
      minHeight: '32px',
      fontSize: '14px',
      borderColor: data?.isInvalid ? '#dc2626' : base.borderColor,
    }),
    singleValue: (base, { data }) => ({
      ...base,
      color: data?.isInvalid ? '#dc2626' : base.color,
    }),
  }}
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

{/* Selección de sede y entregas parciales */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  {/* Selección de sede */}
  <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
    <label className="block text-xs font-medium text-gray-600 mb-1">
      Selecciona la sede
    </label>
    <select
      className={`w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
        errores.sede_id ? "border-red-500" : "border-gray-300"
      }`}
      value={sedeId}
      onChange={(e) => setSedeId(e.target.value)}
    >
      <option value="">-- Selecciona una sede --</option>
      {sedes.map((sede) => (
        <option key={sede.id} value={sede.id}>
          {sede.nombre}
        </option>
      ))}
    </select>
    {errores.sede_id && (
      <p className="text-red-500 text-xs mt-1">
        {Array.isArray(errores.sede_id) ? errores.sede_id[0] : errores.sede_id}
      </p>
    )}
  </div>

  {/* Checkbox de entregas parciales */}
  <div className="bg-gray-50 rounded-md p-3 border border-gray-200 flex items-center">
    <input
      type="checkbox"
      id="entregasParciales"
      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
      checked={forzarEntregaParcial}
      onChange={(e) => setForzarEntregaParcial(e.target.checked)}
    />
    <label
      htmlFor="entregasParciales"
      className="ml-2 text-sm text-gray-700 font-medium cursor-pointer"
    >
      Cliente requiere entregas parciales
    </label>
  </div>
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
