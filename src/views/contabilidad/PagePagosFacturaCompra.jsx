import { useGetRegistroPagoFactura } from "../../hooks/contabilidad/useGetRegistroPagoFactura";


export default function PagePagosFacturaCompra() {
    
    const { data, error, isLoading } = useGetRegistroPagoFactura();
    console.log("Data obtenida en PagePagosFacturaCompra:", data);
  return (
    <div>PagePagosFacturaCompra</div>
  )
}
