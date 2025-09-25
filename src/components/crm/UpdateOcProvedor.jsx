import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProducts } from "../../hooks/useProducts";
import { useEntregasProveedores } from "../../hooks/useEntregasProveedores";
import { useEmpresas } from "../../hooks/useEmpresas";
import Select from "react-select";
import { Trash2, Search, Plus } from "lucide-react";
import clienteAxios from "../../config/axios";

export default function UpdateOcProvedor() {
  const navigate = useNavigate();
  const { id } = useParams();
    const [search, setSearch] = useState("");
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const { proveedoresAll } = useEntregasProveedores();
  const { empresas } = useEmpresas();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const [selectorAbierto, setSelectorAbierto] = useState(null);

  const [formData, setFormData] = useState({
    proveedor_id: null,
    empresa_id: null,
    observaciones: "",
 
    detalles: [
      {
        item: 1,
        descripcion: "",
        cantidad_solicitada: 0,
        code: "",
        producto_id: null,
      }
    ],
  });

  // ✅ Cargar datos de la orden existente
  useEffect(() => {
    const cargarOrden = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem("token");
        const res = await clienteAxios.get(`/api/ordenes-compra-proveedor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Datos cargados:", res.data);
        
        // La respuesta puede tener diferentes estructuras
        const orden = res.data.orden || res.data;
        const detalles = orden.detalles || orden.productos || [];

        console.log("Detalles encontrados:", detalles);
        console.log("empresa_id formData:", formData.empresa_id, typeof formData.empresa_id);
console.log("empresas:", empresas);


        setFormData({
          proveedor_id: orden.proveedor_id,
          empresa_id: orden.empresa?.id || orden.empresa_id || null,
          observaciones: orden.observaciones || "",
          numero_orden: orden.numero_orden || "",
          detalles: detalles.length > 0 ? detalles.map((detalle, index) => ({
            id: detalle.id || null,
            item: index + 1,
            descripcion: detalle.descripcion || "",
            cantidad_solicitada: parseFloat(detalle.cantidad_solicitada) || 0,
            code: detalle.code || "",
            producto_id: detalle.producto_id || null,
          })) : [
            {
              item: 1,
              descripcion: "",
              cantidad_solicitada: 0,
              code: "",
              producto_id: null,
            }
          ]
        });

      } catch (error) {
        console.error("Error al cargar orden:", error);
        toast.error("Error al cargar los datos de la orden");
        navigate("/auth/crm/proveedores-ordenes-compra");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarOrden();
    }
  }, [id, navigate]);

  // ✅ Manejar cambios en inputs básicos
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Manejar cambios en detalles
  const handleDetalleChange = (index, field, value) => {
    if(field==='descripcion')return
    const nuevosDetalles = [...formData.detalles];
    nuevosDetalles[index][field] = 
      field === "cantidad_solicitada" ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  // ✅ Agregar nuevo item
  const agregarItem = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          item: prev.detalles.length + 1,
          descripcion: "",
          cantidad_solicitada: 0,
          code: "",
          producto_id: null,
        }
      ]
    }));
  };

  // ✅ Eliminar item
  const eliminarItem = (index) => {
    if (formData.detalles.length <= 1) {
      toast.warning("Debe mantener al menos un detalle");
      return;
    }

    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
    // Reordenar items
    const detallesReordenados = nuevosDetalles.map((detalle, i) => ({
      ...detalle,
      item: i + 1
    }));

    setFormData(prev => ({
      ...prev,
      detalles: detallesReordenados
    }));
  };

  // ✅ Seleccionar producto
  const seleccionarProducto = (index, option) => {
    const nuevosDetalles = [...formData.detalles];
    nuevosDetalles[index].producto_id = option.value;
    nuevosDetalles[index].code = option.code;
    nuevosDetalles[index].descripcion = option.description;
    
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
    
    setSelectorAbierto(null);
    setSearch("");
  };

  // ✅ Actualizar orden
  const actualizarOrden = async () => {
    setErrores({});
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      
      const dataToSend = {
        proveedor_id: formData.proveedor_id,
        empresa_id: formData.empresa_id,
        observaciones: formData.observaciones || "",
 
        detalles: formData.detalles.map((detalle, index) => ({
          item: index + 1,
          descripcion: detalle.descripcion,
          cantidad_solicitada: detalle.cantidad_solicitada,
          code: detalle.code,
          producto_id: detalle.producto_id,

        }))
      };

      console.log("Datos a enviar:", dataToSend);

      const response = await clienteAxios.put(
        `/api/ordenes-compra-proveedor/${id}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Orden actualizada correctamente");
      navigate(`/auth/crm/ordenes-proveedor-preview/${id}`);

    } catch (error) {
      console.error("Error al actualizar:", error.response?.data || error);
      
      if (error.response?.status === 422) {
        setErrores(error.response.data.errors);
        toast.error("Por favor corrija los errores en el formulario");
      } else {
        toast.error("Error al actualizar la orden");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando orden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Actualizar Orden de Compra
          </h2>
          <p className="text-gray-600">Numero de Orden: {formData.numero_orden}</p>
        </div>
        <Link
          to="/auth/crm/proveedores-ordenes-compra"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
        >
          ← Volver
        </Link>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Proveedor y Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Proveedor *
            </label>
            <Select
              options={proveedoresAll.map(p => ({
                value: p.id,
                label: p.nombre
              }))}
              value={proveedoresAll
                .map(p => ({ value: p.id, label: p.nombre }))
                .find(p => p.value === formData.proveedor_id)}
              onChange={(selected) =>
                handleInputChange('proveedor_id', selected?.value || null)
              }
              placeholder="Seleccionar proveedor..."
              isClearable
            />
            {errores.proveedor_id && (
              <p className="text-red-500 text-sm mt-1">{errores.proveedor_id[0]}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Empresa *
            </label>
            <Select
              options={empresas.map(e => ({
                value:Number(e.id),
                label: e.nombre
              }))}
              value={empresas
                .map(e => ({ value: e.id, label: e.nombre }))
                .find(e => e.value === Number(formData.empresa_id))}
              onChange={(selected) =>
                handleInputChange('empresa_id', selected?.value || null)
              }
              placeholder="Seleccionar empresa..."
              isClearable
            />
            {errores.empresa_id && (
              <p className="text-red-500 text-sm mt-1">{errores.empresa_id[0]}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows="3"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errores.observaciones ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Agregar alguna observación..."
            ></textarea>
            {errores.observaciones && (
              <p className="text-red-500 text-sm mt-1">{errores.observaciones[0]}</p>
            )}
          </div>
        </div>

   

        {/* Detalles */}
        <div>
       

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Acciones</th>
                  <th className="p-3 border text-left">Item</th>
                  <th className="p-3 border text-left">Buscar Producto</th>
                  <th className="p-3 border text-left">Código</th>
                  <th className="p-3 border text-left">Descripción</th>
                  <th className="p-3 border text-left">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {formData.detalles.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Acciones */}
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => eliminarItem(index)}
                        disabled={formData.detalles.length <= 1}
                        className="text-red-500 hover:text-red-700 p-1 disabled:text-gray-400"
                        title="Eliminar item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                    {/* Item */}
                    <td className="p-3 border text-center font-medium">
                      {detalle.item}
                    </td>
 {/* Selector de producto */}
              <td className="p-2 border">
                {selectorAbierto === index ? (
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-blue-500" />
                    <Select
                      autoFocus
                      isLoading={isLoading || isFetching}
                      options={products.map((p) => ({
                        value: p.id,
                        code: p.code,
                        description:
                          p.description || p.name || "Sin descripción",
                        label: `${p.code} - ${
                          p.description || p.name || "Sin descripción"
                        }`,
                      }))}
                      onInputChange={(value) => setSearch(value)}
                      onChange={(option) => {
                        seleccionarProducto(index, option);
                        setSelectorAbierto(null);
                      }}
                      placeholder="Buscar producto..."
                      noOptionsMessage={() =>
                        isEmpty
                          ? "No se encontraron productos"
                          : "Escribe para buscar"
                      }
                      className="min-w-[250px] flex-1"
                  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 👈 esto hace que se pinte encima
  }}
  menuPortalTarget={document.body} // 👈 renderiza el menú fuera del contenedor
                      
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectorAbierto(
                        selectorAbierto === index ? null : index
                      )
                    }
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    title="Seleccionar producto"
                  >
                    <Search size={18} />
                    <span className="text-sm">Buscar</span>
                  </button>
                )}
              </td>


                    {/* Código */}
                    <td className="p-3 border">
                      <input
                        type="text"
                        value={detalle.code || ""}
                        readOnly
                        className="w-full border rounded p-2 bg-gray-100 text-center"
                        placeholder="Auto"
                      />
                    </td>

                    {/* Descripción */}
                <td className="p-3 border">
  <input
    type="text"
    readOnly
    value={detalle.descripcion || ""}
    // ✅ ELIMINAR: onChange ya no es necesario
    className="w-full border rounded p-2 min-w-[200px] bg-gray-100 cursor-not-allowed"
    placeholder="Descripción automática del producto"
    title="La descripción se obtiene automáticamente al seleccionar el producto"
  />
  {errores[`detalles.${index}.descripcion`] && (
    <p className="text-red-500 text-xs mt-1">
      {errores[`detalles.${index}.descripcion`][0]}
    </p>
  )}
</td>

                    {/* Cantidad Solicitada */}
                    <td className="p-3 border">
                      <input
                        type="number"
                        value={detalle.cantidad_solicitada || 0}
                        onChange={(e) =>
                          handleDetalleChange(index, "cantidad_solicitada", e.target.value)
                        }
                        min="1"
                        step="1"
                        className="w-full border rounded p-2 text-center"
                      />
                      {errores[`detalles.${index}.cantidad_solicitada`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errores[`detalles.${index}.cantidad_solicitada`][0]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
                 <button
              onClick={agregarItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Item
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={actualizarOrden}
            disabled={guardando}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md transition flex items-center gap-2"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                💾 Actualizar Orden
              </>
            )}
          </button>

        

          <Link
            to={`/auth/crm/ordenes-proveedor-preview/${id}`}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition"
          >
            Cancelar
          </Link>
        </div>
      </div>


    </div>
  );
}