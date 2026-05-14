import PageContratos from "../views/nomina/PageContratos";
import PageSeguridadSocial from "../views/nomina/PageSeguridadSocial";
import PageTipoContrato from "../views/nomina/PageTipoContrato";
import PageDescuentos from "../views/nomina/PageDescuentos";


export default function NominaLayout() {
  return (
    <div>
      <PageTipoContrato />
      <PageSeguridadSocial />
      <PageContratos />
      <PageDescuentos />
    </div>
  )
}
