import PropTypes from "prop-types";
import FacturaCompras from "../../components/contabilidad/FacturaCompras";

PageCreateFacturas.propTypes = {
  modo: PropTypes.oneOf(["creacion", "edicion"]),
};

export default function PageCreateFacturas({ modo = "creacion" }) {
  return (
    <div>
      <FacturaCompras modo={modo} />
    </div>
  );
}
