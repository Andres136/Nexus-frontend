import PageContratos from "../views/nomina/PageContratos";
import PageSeguridadSocial from "../views/nomina/PageSeguridadSocial";
import PageTipoContrato from "../views/nomina/PageTipoContrato";
import PageDescuentos from "../views/nomina/PageDescuentos";
import PageJornadaLaboral from "../views/nomina/PageJornadaLaboral";
import PageIncapacidades from "../views/nomina/PageIncapacidades";
import PageValores from "../views/nomina/PageValores";
import PageTipoRegistros from "../views/nomina/PageTipoRegistros";


export default function NominaLayout() {
  return (
    <div>
      <PageTipoContrato />
      <PageSeguridadSocial />
      <PageContratos />
      <PageDescuentos />
      <PageJornadaLaboral />
      <PageIncapacidades />
      <PageValores />
      <PageTipoRegistros />
    </div>
  )
}
