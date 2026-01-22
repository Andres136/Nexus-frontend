import { useEffect, useState } from "react";
import useCotizacionItems from "../../hooks/useCotizacionItems";
import { calcularValores } from "../../hooks/useCotizacionItems";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { useClientes } from "../../hooks/useClientes";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select  from "react-select";

export default function CotizacionForm({modo}) {
  const {id} = useParams();
  const { clientesTodos } = useClientes();
  const [detallesCargados, setDetallesCargados] = useState([]);


  const [formData, setFormData] = useState({
    cliente_id: "",
    empresa: "setasplast",
    observaciones:  `❖ El precio ofertado es para pago a treinta (30) días calendario.

    ❖ Tiempo de Entrega: Quince (15) a veinte (20) días para el primer pedido, tres (03) a seis (06) días para los pedidos posteriores.
    
    ❖ Disponibilidad del Producto: Garantizamos la disponibilidad del producto.
    
    ❖ Las entregas en la ciudad de Bogotá las ofrecemos punto a punto. Para los municipios Girardot, Melgar, Ricaurte, Flandes, Viotá, Tocaima, Soacha, Funza, Madrid, Mosquera, Cali, Barranquilla, Soledad no tienen ningún recargo. Se realizan despachos a nivel nacional.
    
    ❖ Todos nuestros artículos tienen garantía por defectos de fabricación.
    
    ❖ Nuestros paquetes van rotulados con el nombre de la empresa, número de unidades del paquete, medida de la bolsa, color, calibre y código de barras.
    
    ❖ Para el caso de las bolsas marcadas es importante que el “Cirel” lo aporte el cliente. En caso de no tenerlos, se cotiza como valor adicional y los mismos son propiedad del cliente.
    
    ❖ Apoyando la mitigación del impacto ambiental, todos nuestros productos son fabricados a partir de materiales Biodegradables y 100% reciclables, certificados y respaldados con fichas técnicas.
    
   `,
    
    detalles: [],
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { rows, updateItem, addItem, removeItem, resetItems} = useCotizacionItems({
    errores,
    onChange: (detalles) => setFormData((prev) => ({ ...prev, detalles })),
    initialRows: detallesCargados,
    
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cliente_id" ? (value ? parseInt(value) : null) : value,
    });


  };
  useEffect(() => {
    if (modo === "edicion" && id) {
      const obtenerCotizacion = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await clienteAxios.get(`/api/cotizaciones/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const datos = response.data;
  
          setFormData({
              cliente_id: datos.cliente_id,
              empresa: datos.empresa,
              observaciones: datos.observaciones,
              detalles: datos.detalles, // para enviar
            });
            setDetallesCargados(
              datos.detalles.map((item, i) => {
                const valoresCalculados = calcularValores(item);
                return {
                  ...item,
                  ...valoresCalculados,
                  _uuid: crypto.randomUUID(),
                  itemNumber: i + 1,
                };
              })
            );
            
            
           
          
        } catch (error) {
          toast.error("Error al cargar la cotización");
        }
      };
  
      obtenerCotizacion();
    }
  }, [modo, id]);
  
  const resetFormulario = () => {
    setFormData({
      cliente_id: "",
      empresa: "setasplast",
      observaciones: `❖ El precio ofertado es para pago a treinta (30) días calendario.
  
  ❖ Tiempo de Entrega: Quince (15) a veinte (20) días para el primer pedido, tres (03) a seis (06) días para los pedidos posteriores.
  
  ❖ Disponibilidad del Producto: Garantizamos la disponibilidad del producto.
  
  ❖ Las entregas en la ciudad de Bogotá las ofrecemos punto a punto. Para los municipios Girardot, Melgar, Ricaurte, Flandes, Viotá, Tocaima, Soacha, Funza, Madrid, Mosquera, Cali, Barranquilla, Soledad no tienen ningún recargo. Se realizan despachos a nivel nacional.
  
  ❖ Todos nuestros artículos tienen garantía por defectos de fabricación.
  
  ❖ Nuestros paquetes van rotulados con el nombre de la empresa, número de unidades del paquete, medida de la bolsa, color, calibre y código de barras.
  
  ❖ Para el caso de las bolsas marcadas es importante que el “cliché” lo aporte el cliente. En caso de no tenerlos, se cotiza como valor adicional y los mismos son propiedad del cliente.
  
  ❖ Apoyando la mitigación del impacto ambiental, todos nuestros productos son fabricados a partir de materiales Biodegradables y 100% reciclables, certificados y respaldados con fichas técnicas.
  `,
      detalles: [],
    });
    setDetallesCargados([]);
    setErrores({});
    resetItems();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
   // console.log("Enviando formData:", formData);  // <— verifica aquí
    if (!formData.detalles.length) {
      toast.error("Debe ingresar al menos un ítem");
      return;
    }

    setLoading(true);
    try {
      const detallesLimpios = formData.detalles.map(({ _uuid, itemNumber, ...item }) => ({
        ...item,
        largo_cm: Number(item.largo_cm || 0),
        ancho_cm: Number(item.ancho_cm || 0),
        calibre: Number(item.calibre || 0),
        cantidad: Number(item.cantidad || 0),
        precio_total: Number(item.precio_total || 0),
        valor_unitario: Number(item.valor_unitario || 0),
        valor_paquete: Number(item.valor_paquete || 0),
        valor_total: Number(item.valor_total || 0),
        numero_bolsas: Number(item.numero_bolsas || 0),
        cantidad_requerida_kg: Number(item.cantidad_requerida_kg || 0),
      }));
      
      const token = localStorage.getItem("token");
         const response = modo === "edicion"
        ? await clienteAxios.put(`/api/cotizaciones/${id}`, {
            ...formData,
            detalles: detallesLimpios,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await clienteAxios.post("/api/cotizaciones", {
            ...formData,
            
            detalles: detallesLimpios,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
      const data = response.data;

      toast.success(
  modo === "edicion"
    ? "Cotización actualizada correctamente"
    : "Cotización creada correctamente"
);

// 👉 Redirigir
navigate("/auth/crm/mis-cotizaciones");

      //Limpiar formulario
      resetFormulario();

      const link = document.createElement("a");
      link.href = `${import.meta.env.VITE_API_URL}/api/cotizaciones/${data.cotizacion.id}/pdf`;
      link.setAttribute("download", `cotizacion_${data.cotizacion.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      if (error.response?.data?.errors) {
        console.log("Errores de validación:", error.response.data.errors);
        setErrores(error.response.data.errors);
        toast.error("Errores en el formulario, por favor revisa");
      } else {
        toast.error("Error al guardar la cotización");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalGeneral = rows.reduce((acc, item) => acc + item.valor_total, 0);
  // 1) Mapea tus clientes a { value, label }
  const opcionesClientes = clientesTodos.map(cliente => ({
    value: cliente.id,
    label: cliente.nombre,
  }));
  return (
    <div className="p-6 bg-white shadow rounded">
<div className="grid grid-cols-2 items-center">
<h1 className="text-2xl font-bold mb-4">
  {modo === "edicion" ? "Editar Cotización" : "Crear Cotización"}
</h1>


  <Link
    to="/auth/crm/mis-cotizaciones"
    className="justify-self-end inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm transition duration-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
    </svg>
    Mis Cotizaciones
  </Link>
</div>

      
      {/* CLIENTE */}
      <div>
        <label className="block font-semibold">Cliente:</label>
        <Select
          options={opcionesClientes}
          // 2) Busca la opción actual para mostrarla
          value={opcionesClientes.find(o => o.value === formData.cliente_id)}
          // 3) Cuando cambie, guarda el id
          onChange={opt =>
            setFormData(prev => ({
              ...prev,
              cliente_id: opt ? opt.value : "",
            }))
          }
          isClearable
          placeholder="Buscar o seleccionar cliente…"
          className="mt-1"
        />
        {errores.cliente_id && (
          <p className="text-red-600 text-sm">{errores.cliente_id}</p>
        )}
      </div>

      {/* EMPRESA */}
      <div>
        <label className="block font-semibold">Empresa:</label>
        <select
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          className="border rounded w-full p-2"
        >
          <option value="setasplast">Setasplast</option>
          <option value="global">Global</option>
        </select>
      </div>

      <h2 className="text-xl font-bold mt-4 mb-2">Crear Cotización</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Observaciones:</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            rows={10}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </div>
  <h3 className="font-bold mb-2">Detalles de la Cotización</h3>
        <div className="mt-4 ">
        <div className="grid grid-cols-1">
          <table className="w-full border text-sm col-span-1">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th>🛠</th>
                <th>#</th>
                <th>Ancho</th>
                <th>Largo</th>
                <th>Calibre</th>
                <th>Cliente Clb</th>
                <th>Peso Bolsa</th>
                <th># Bolsas</th>
                <th>$/Kg</th>
                <th>Descripción</th>
                <th>Unitario</th>
                <th>Cant.</th>
                <th>Precio Paquete</th>
                <th>Total (con IVA)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._uuid}>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(row._uuid)}
                      className="text-red-600"
                    >
                      🗑
                    </button>
                  </td>
                  <td>{row.itemNumber}</td>
                  <td>
                    <input
                      value={row.ancho_cm}
                      onChange={(e) => updateItem(row._uuid, "ancho_cm", e.target.value)}
                      className="border w-full"
                    />
                  </td>
                  <td>
                    <input
                      value={row.largo_cm}
                      onChange={(e) => updateItem(row._uuid, "largo_cm", e.target.value)}
                      className="border w-full"
                    />
                  </td>
                  <td>
                    <input
                      value={row.calibre}
                      onChange={(e) => updateItem(row._uuid, "calibre", e.target.value)}
                      className="border w-full"
                    />
                  </td>

                  <td>
                    <input
                      value={row.cliente_clb}
                      onChange={(e) => updateItem(row._uuid, "cliente_clb", e.target.value)}
                      className="border w-full"
                    />
                  </td>
                  <td className="text-center bg-gray-100">
                  {Number(row.peso_bolsa || 0).toFixed(2)}
                  </td>
                  <td className="text-center bg-gray-100">
                    {row.numero_bolsas}
                  </td>
                  <td>
                    <input
                      value={row.precio_total}
                      onChange={(e) =>
                        updateItem(row._uuid, "precio_total", Number(e.target.value || 0))
                      }
                      className="border w-full"
                    />
                  </td>
                  <td>
                    <input
                      className="border w-full uppercase"
                      type="text"
                      value={row.descripcion}
                      onChange={(e) =>
                        updateItem(row._uuid, "descripcion", e.target.value)
                      }
                    />
                  </td>
                  <td>
  <input
    className={`border w-full text-right ${row.fueCalculadoUnitario ? "bg-gray-100" : ""}`}
    value={row.valor_unitario}
    type="number"
    step="0.01"
    min={0}
    onChange={(e) =>
      updateItem(row._uuid, "valor_unitario", e.target.value)
    }
    readOnly={row.fueCalculadoUnitario}
/>
</td>

                  <td>
                    <input
                      type="number"
                      value={row.cantidad}
                      onChange={(e) => updateItem(row._uuid, "cantidad", e.target.value)}
                      className="border w-full"
                    />
                  </td>
                  <td className="text-indigo-700 text-right bg-gray-100">
                    {row.valor_paquete.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-green-600 font-bold text-right bg-gray-100">
                  ${Number(row.valor_total).toLocaleString("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
})}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={11} className="text-right pr-4">
                  Total General:
                </td>
                <td className="text-green-700 text-right">
                  {totalGeneral.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table></div>

          <button
  type="button"
  onClick={addItem}
  className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
>
  ➕ Agregar Ítem
</button>

        </div>

        <button
  type="submit"
  className="bg-green-600 text-white px-4 py-2 rounded"
  disabled={loading}
>
  {loading
    ? modo === "edicion" ? "Actualizando..." : "Guardando..."
    : modo === "edicion" ? "Actualizar Cotización" : "Guardar Cotización"}
</button>

      </form>
    </div>
  );
}
