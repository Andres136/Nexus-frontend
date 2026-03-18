import { useGestionCartera } from "../../hooks/crm/useGestionCartera"

import Select from "react-select"
import CarteraEstadisticas from "../../components/crm/CarteraEstadisticas"


export default function GestionCartera() {

  const {
    registros,
    porcentajes,
    errors,
    loading,
    agregarRegistro,
    eliminarRegistro,
    handleChange,
    handlePorcentajeChange,
    handleSubmit,
  clientesTodos,
    usuarios,
    empresas,
  } = useGestionCartera()

  const clienteOptions = clientesTodos.map(c => ({
    value: c.id,
    label: c.nombre
  }))

  const usuarioOptions = usuarios.map(u => ({
    value: u.id,
    label: u.name
  }))

  return (
    <div className=" mt-6 bg-white border rounded-xl shadow">
<CarteraEstadisticas  />
      <div className="px-6 py-4 bg-blue-600 text-white text-center font-bold">
        Gestión de Cartera
      </div>


      <form onSubmit={handleSubmit} className="p-6">

        <div className="overflow-x-auto">

          <table className="w-full border text-sm">

            <thead className="bg-gray-100">
              <tr>

                <th className="p-2 border">Factura</th>
                 <th className="p-2 border">Empresa</th>
                <th className="p-2 border">Cliente</th>
                <th className="p-2 border">Comercial</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Días</th>
        
                <th className="p-2 border">Base</th>
           
                <th className="p-2 border">IVA</th>
                <th className="p-2 border">Rete Fuente</th>
                <th className="p-2 border">Rete ICA</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Obs</th>
                <th className="p-2 border">Acción</th>

              </tr>
            </thead>

            <tbody>

              {registros.map((registro, index) => {

                const selectedCliente =
                  clienteOptions.find(o => String(o.value) === String(registro.cliente_id)) || null

                const selectedUsuario =
                  usuarioOptions.find(o => String(o.value) === String(registro.user_comercial_id)) || null

                return (

                  <tr key={index} className="border">

                    {/* FACTURA */}
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="numero_factura"
                        value={registro.numero_factura}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border p-1 rounded"
                      />

                      {errors?.[`registros.${index}.numero_factura`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.numero_factura`]}
                        </p>}
                    </td>

                    {/* EMPRESA */}
                    <td className="p-2 border">
                    <Select
  options={empresas.map(e => ({ value: e.id, label: e.nombre }))}
  value={empresas.find(e => String(e.id) === String(registro.empresa_id)) ? { value: registro.empresa_id, label: empresas.find(e => String(e.id) === String(registro.empresa_id)).nombre } : null}
  onChange={(option) =>
    handleChange(index, {
      target: {
        name: "empresa_id",
        value: option?.value || ""
      }
    })
  }
  menuPortalTarget={document.body}
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
/>
                      {errors?.[`registros.${index}.empresa_id`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.empresa_id`]}
                        </p>}
                    </td>
                    {/* CLIENTE */}
                    <td className="p-2 border min-w-[200px]">
           <Select
  options={clienteOptions}
  value={selectedCliente}
  onChange={(option) =>
    handleChange(index, {
      target: {
        name: "cliente_id",
        value: option?.value || ""
      }
    })
  }
  menuPortalTarget={document.body}
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
/>
                      {errors?.[`registros.${index}.cliente_id`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.cliente_id`]}
                        </p>}
                    </td>

                    {/* COMERCIAL */}
                    <td className="p-2 border min-w-[200px]">
                    <Select
  options={usuarioOptions}
  value={selectedUsuario}
  onChange={(option) =>
    handleChange(index, {
      target: {
        name: "user_comercial_id",
        value: option?.value || ""
      }
    })
  }
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
  }}
/>
                      {errors?.[`registros.${index}.user_comercial_id`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.user_comercial_id`]}
                        </p>}
                    </td>

                    {/* FECHA */}
                    <td className="p-2 border">
                      <input
                        type="date"
                        name="fecha_factura"
                        value={registro.fecha_factura}
                        onChange={(e) => handleChange(index, e)}
                        className="border p-1"
                      />
                      {errors?.[`registros.${index}.fecha_factura`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.fecha_factura`]}
                        </p>}
                    </td>

                    {/* DIAS */}
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="dias_credito"
                        value={registro.dias_credito}
                        onChange={(e) => handleChange(index, e)}
                        className="border p-1 w-20"
                      />
                      {errors?.[`registros.${index}.dias_credito`] && 
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.dias_credito`]}
                        </p>}
                    </td>

                 

                    {/* BASE */}
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="base"
                        value={registro.base}
                        onChange={(e) => handleChange(index, e)}
                        className="border p-1"
                      />
                      {errors?.[`registros.${index}.base`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.base`]}
                        </p>}
                    </td>

                    {/* SALDO 
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="saldo_pendiente"
                        value={registro.saldo_pendiente}
                        onChange={(e) => handleChange(index, e)}
                        className="border p-1"
                      />
                      {errors?.[`registros.${index}.saldo_pendiente`] &&
                        <p className="text-red-500 text-xs">
                          {errors[`registros.${index}.saldo_pendiente`]}
                        </p>}
                    </td>*/}

                    {/* IVA */}
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="iva"
                        value={porcentajes.iva}
                        onChange={handlePorcentajeChange}
                        className="border p-1 w-16"
                      />
                      <div className="text-xs">
                        {registro.iva}
                      </div>
                    </td>

                    {/* RETE RENTA */}
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="rete_renta"
                        value={porcentajes.rete_renta}
                        onChange={handlePorcentajeChange}
                        className="border p-1 w-16"
                      />
                      <div className="text-xs">
                        {registro.rete_renta}
                      </div>
                    </td>

                    {/* RETE ICA */}
                    <td className="p-2 border">
                      <input
                        type="number"
                        name="rete_ica"
                        value={porcentajes.rete_ica}
                        onChange={handlePorcentajeChange}
                        className="border p-1 w-16"
                      />
                      <div className="text-xs">
                        {registro.rete_ica}
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className="p-2 border font-semibold">
                      {registro.valor_total}
                    </td>

                    {/* OBS */}
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="observaciones"
                        value={registro.observaciones}
                        onChange={(e) => handleChange(index, e)}
                        className="border p-1"
                      />
                    </td>

                    {/* ELIMINAR */}
                    <td className="p-2 border text-center">
                      {registros.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarRegistro(index)}
                          className="text-red-600"
                        >
                          X
                        </button>
                      )}
                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-6">

          <button
            type="button"
            onClick={agregarRegistro}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Agregar fila
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Guardando..." : "Guardar todos"}
          </button>

        </div>

      </form>
   
    </div>
  )
}