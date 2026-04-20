import { useCallback, useState, useEffect } from "react";
import OrdenCompraMultiItem from "../../components/crm/OrdenCompraMultiItem";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useClientes } from "../../hooks/useClientes";
import { useAuth } from "../../hooks/useAuth";
import { Link, useParams } from "react-router-dom";
import Select from 'react-select';
import { useEmpresas } from "../../hooks/useEmpresas";

export default function OrdenCompraForm({ modo }) {
  const { id } = useParams();
  const { empresas} = useEmpresas();
  const [errores, setErrores] = useState({});
  const [erroresDetalles, setErroresDetalles] = useState({});
  const { clientesTodos } = useClientes();
  const [guardando, setGuardando] = useState(false);
  const [mostrarModalObservaciones, setMostrarModalObservaciones] = useState(false);
  const [observacionDetectada, setObservacionDetectada] = useState(false);
  const { user } = useAuth({ middleware: "auth" });

  const [formData, setFormData] = useState({
    fecha_entrega: "",
    cliente_id: "",
    ubicacion_entrega: "",
    observaciones: "",
    cliente_documento: null,
    empresa_id: "",
    detalles: [],
  });

  // ✅ Toda la lógica permanece igual
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "observaciones" && value.trim() !== "" && !observacionDetectada) {
      setMostrarModalObservaciones(true);
      setObservacionDetectada(true);
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });




  };

  const handleDetallesChange = useCallback((detallesActualizados) => {
    setFormData((prevData) => ({
      ...prevData,
      detalles: detallesActualizados,
    }));
  }, []);
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setFormData(prev => ({
    ...prev,
    cliente_documento: file, // NO path
  }));
};

  useEffect(() => {
    if (modo === "edicion" && id) {
      const obtenerOrden = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await clienteAxios.get(`/api/orden-compras/${id}/edit`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const datos = response.data;

          setFormData({


          //Cliente_documento_path: datos.cliente_documento_path,


            fecha_entrega: datos.fecha_entrega,
            cliente_id: datos.cliente_id,
            ubicacion_entrega: datos.ubicacion_entrega,
            observaciones: datos.observaciones,
            cliente_documento: datos.cliente_documento,
            empresa_id: datos.empresa_id,
            detalles: datos.detalles.map(detalle => ({
              id: detalle.id,
              product_id: detalle.product_id,
              largo_cm: detalle.largo_cm,
              ancho_cm: detalle.ancho_cm,
              calibre: detalle.calibre,
              cantidad: detalle.cantidad,
              cantidad_enviada: detalle.cantidad_enviada,
              faltantes: detalle.faltantes,
              valor_unitario: detalle.valor_unitario,
              peso_bolsa: detalle.peso_bolsa,
              numero_bolsas: detalle.numero_bolsas,
              cliente_clb: detalle.cliente_clb,
              cantidad_requerida_kg: detalle.cantidad_requerida_kg,
              descripcion: detalle.descripcion,
              observaciones: detalle.observaciones,
              tipo_embalaje: detalle.tipo_embalaje,
              codigo_embalaje: detalle.codigo_embalaje,
              valor_total: detalle.valor_total,
            })),
          });
        } catch (error) {
          console.error("Error al obtener la orden:", error);
          toast.error("Error al cargar la orden para editar.");
        }
      };

      obtenerOrden();
    }
  }, [modo, id]);

const enviarOrden = async () => {
  setErrores({});
  setErroresDetalles({});
  setGuardando(true);

  try {
    const token = localStorage.getItem("token");

    const data = new FormData();

    data.append("fecha_entrega", formData.fecha_entrega);
    data.append("cliente_id", formData.cliente_id);
    data.append("ubicacion_entrega", formData.ubicacion_entrega);
    data.append("observaciones", formData.observaciones);
    data.append("empresa_id", formData.empresa_id);

    // 🔥 ARCHIVO (ESTO ES LO CLAVE)
    if (formData.cliente_documento) {
      data.append("cliente_documento", formData.cliente_documento);
    }

//Filtrar  product_id null en detalles


// Normalizar detalles
const detallesNormalizados = formData.detalles.map(detalle => ({
  ...detalle,
  product_id:
    detalle.product_id === "" || detalle.product_id === undefined
      ? null
      : detalle.product_id,
}));

// Enviar solo valores reales
detallesNormalizados.forEach((detalle, i) => {
  Object.entries(detalle).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      data.append(`detalles[${i}][${key}]`, value);
    }
  });
});


    const response =
      modo === "edicion"
        ? await clienteAxios.post(
            `/api/orden-compras/${id}?_method=PUT`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          )
        : await clienteAxios.post("/api/orden-compras", data, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

    toast.success(response.data.message); 

    
    // Descargar el PDF automáticamente después de guardar/actualizar
    const pdfLink = document.createElement('a');
    pdfLink.href = `${import.meta.env.VITE_API_URL}/api/orden-compras/${response.data.orden_compra.id}/pdf`;
    pdfLink.setAttribute('download', `orden_compra_${response.data.orden_compra.id}.pdf`);
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);
    setErrores({});
    setErroresDetalles({})
    //Limpiar el formulario o redirigir según sea necesario     
    if (modo !== "edicion") {
      setFormData({
        fecha_entrega: "",
        cliente_id: "",
        ubicacion_entrega: "",
        observaciones: "",
        cliente_documento: null,
        empresa_id: "",
        detalles: [],
      });
    }

  } catch (error) {
    console.error(error);

    if (error.response?.data?.errors) {
      setErrores(error.response.data.errors);
    } else {
      toast.error("Error al enviar la orden");
    }
  }

  setGuardando(false);
};

  const opcionesClientes = clientesTodos.map(c => ({
    value: c.id,
    label: c.nombre
  }));


  return (
    <div className="grid grid-cols-1 mx-auto p-3 bg-white">
  
      {/* ✅ Modal compacto */}
      {mostrarModalObservaciones && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Observaciones</h3>
                <p className="text-sm text-gray-600">
                  Incluye detalles adicionales como horarios, condiciones especiales o compromisos acordados.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setMostrarModalObservaciones(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Header compacto */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {modo === "edicion" ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {modo === "edicion" ? "Modifica los detalles de la orden" : "Completa la información requerida"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/auth/crm/mis-ordenes"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Mis Órdenes
          </Link>
          <Link
            to="/auth/crm/cotizaciones"
            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Cotizaciones
          </Link>
        </div>
      </div>

      {/* ✅ Formulario compacto */}
      <div className="space-y-6">
        
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errores.fecha_entrega && (
              <p className="text-sm text-red-600 mt-1">{errores.fecha_entrega}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <Select
              options={opcionesClientes}
              value={opcionesClientes.find(o => o.value === formData.cliente_id) || null}
              onChange={opt => {
                setFormData(f => ({ ...f, cliente_id: opt ? opt.value : '' }));
              }}
              isClearable
              placeholder="Seleccionar cliente..."
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                  '&:hover': { borderColor: '#3b82f6' }
                }),
              }}
            />
            {errores.cliente_id && (
              <p className="text-sm text-red-600 mt-1">{errores.cliente_id}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación de Entrega
            </label>
            <input
              type="text"
              name="ubicacion_entrega"
              placeholder="Dirección completa y número de contacto"
              value={formData.ubicacion_entrega}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errores.ubicacion_entrega && (
              <p className="text-sm text-red-600 mt-1">{errores.ubicacion_entrega}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden de Compra del Cliente (Archivo)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls.xlsx"
              name="cliente_documento"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-50 file:text-gray-700"
            />
            {errores.cliente_documento && (
              <p className="text-sm text-red-600 mt-1">{errores.cliente_documento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
         <Select
              options={empresas.map(e => ({ value: e.id, label: e.nombre }))}
              value={empresas
                .map(e => ({ value: e.id, label: e.nombre }))
                .find(o => o.value === formData.empresa_id) || null}
              onChange={opt => {
                setFormData(f => ({ ...f, empresa_id: opt ? opt.value : '' }));
              }}
              isClearable
              placeholder="Seleccionar empresa..."
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                  '&:hover': { borderColor: '#3b82f6' }
                }),
              }}
            />
            {errores.empresa_id && (
              <p className="text-sm text-red-600 mt-1">{errores.empresa_id}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              placeholder="Información adicional sobre la orden..."
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errores.observaciones && (
              <p className="text-sm text-red-600 mt-1">{errores.observaciones}</p>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 rounded-lg p-4">
        
          <OrdenCompraMultiItem
            onDetallesChange={handleDetallesChange}
            errores={erroresDetalles}
            value={formData.detalles}
          />
        </div>

    {/* Botones */}
<div className="flex justify-end gap-3 pt-4 border-t">
  
  {/* Botón Actualizar */}
  {modo === "edicion" && (
    <button
      onClick={enviarOrden}
      disabled={guardando}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors"
    >
      {guardando ? "Actualizando..." : "Actualizar Orden"}
    </button>
  )}

  {/* Botón Guardar */}
  {modo !== "edicion" && (
    <button
      onClick={enviarOrden}
      disabled={guardando}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
    >
      {guardando ? "Guardando..." : "Guardar Orden"}
    </button>
  )}

  {/* Botón Descargar PDF */}
  {modo === "edicion" && id && (
    <button
      type="button"
      onClick={() => {
        const link = document.createElement('a');
        link.href = `${import.meta.env.VITE_API_URL}/api/orden-compras/${encodeURIComponent(id)}/pdf`;
        link.setAttribute('download', `orden_compra_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }}
      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
    >
      Descargar PDF
    </button>
  )}
</div>
      </div>
    </div>
  );
}