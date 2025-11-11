import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import GestionUsers from "../views/GestionUsers";

import AuthLyout from "../layouts/AuthLyout";
import Login from "../views/Login";

import DepartamentosPage from "../views/calidad/DepartamentosPage";
import ProcesosDepartamento from "../components/calidad/ProcesosDepartamento";
import Tareas from "../views/calidad/Tareas";
import Errores from "../views/calidad/Errores";
import DepartatamentosUpdate from "../views/calidad/DepartatamentosUpdate";
import Crm from "../views/crm/Crm";
import GestionClientes from "../views/crm/GestionClientes";
import Inventarios from "../views/crm/Inventarios";
import Notifycaciones from "../views/crm/Notifycaciones";
import Kpi from "../views/crm/Kpi";
import Pqr from "../views/crm/Pqr";

import OrdenCompraForm from "../views/crm/OrdenCompraForm";
import DetallesOrdenesCompra from "../views/crm/DetallesOrdenesCompra";
import DetallesOrdenTrabajo from "../views/crm/DetallesOrdenTrabajo";
import ObtenerOrdenesCompra from "../components/crm/ObtenerOrdenesCompra";
import ObtenerOrdenesTrabajo from "../views/crm/ObtenerOrdenesTrabajo";
import OrdenesFacturar from "../views/crm/OrdenesFacturar";
import RegistroDocumentacion from "../views/crm/RegistroDocumentacion";
import Vehiculos from "../views/crm/Vehiculos";
import FormVehiculos from "../components/crm/FormVehiculos";
import DocumentosVehiculos from "../components/crm/DocumentosVehiculos";
import MantenimientosVehiculos from "../components/crm/MantenimientosVehiculos";
import InspecionVehiculos from "../components/crm/InspecionVehiculos";
import ListarVehiculos from "../components/crm/ListarVehiculos";
import EditarVehiculo from "../components/crm/EditarVehiculo";
import Proveedores from "../views/crm/Proveedores";
import FormOrdenesProveedores from "../views/crm/FormOrdenesProveedores";
import ObtenerOrdenesProveedores from "../views/crm/ObtenerOrdenesProveedores";

import RegistrarEntregaProveedor from "../views/crm/RegistrarEntregaProveedor";
import KpiTareas from "../components/calidad/KpiTareas";
import CotizacionForm from "../views/crm/CotizacionForm";
import MisOrdenesComerciales from "../views/crm/MisOrdenesComerciales";
import MisCotizaciones from "../views/crm/MisCotizaciones";
import ReferenciasExcedidas from "../views/crm/ReferenciasExcedidas";
import CargaFotosVehiculo from "../components/crm/vehiculos/CargarFotosVehiculos";
import Conductores from "../components/Conductores";
import ObtenerDatosConductores from "../components/crm/ObtenerDatosConductores";
import RevisionesPage from "../views/crm/RevisionesPage";
import Sedes from "../views/Sedes";
import Indicadores from "../views/calidad/Indicadores";
import RegisterValorIndicador from "../views/calidad/RegisterValorIndicador";
import DashboardIndicadores from "../views/calidad/DashboardIndicadores";
import Empresas from "../components/Empresas";
import VistaPrevia from "../components/crm/VistaPrevia";
import UpdateOcProvedor from "../components/crm/UpdateOcProvedor";
import Bodegas from "../components/Bodegas";
import OrdenesCompraClient from "../components/auditoria/OrdenesCompraClient";
import RegistrarInventario from "../views/crm/RegistrarInventario";
import TrasladoInventario from "../views/crm/TrasladoInventario";

import OrdenesFaltantes from "../views/crm/OrdenesFaltantes";
import PlantillaEditor from "../views/comunicaciones/PlantillaEditor";
import Marketing from "../views/comunicaciones/Marketing";



export default function Router() {
  return (
    <Routes>
      {/* 🔹 Ruta de Login (Accesible para todos) */}
      <Route path="/" element={<Login />} />

      {/* 🔹 Rutas bajo AuthLayout (Procesos y CRM) */}
      <Route
        element={<ProtectedRoute allowedRoles={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />}
      >
        <Route path="/auth" element={<AuthLyout />}>
          <Route path="procesos" element={<DepartamentosPage />} />
          <Route
            path="procesos/:departamentoId"
            element={<ProcesosDepartamento />}
          />
          <Route path="rendimiento" element={<KpiTareas />} />
          <Route path="tareas" element={<Tareas />} />
          <Route
            path="dashboard/indicadores"
            element={<DashboardIndicadores />}
          />
          <Route path="novedades" element={<Errores />} />
          <Route path="departamentos" element={<DepartatamentosUpdate />} />
          <Route path="indicadores" element={<Indicadores />} />
        </Route>

        <Route path="/auth/crm" element={<Crm />}>
          <Route path="ordenes-trabajo" element={<ObtenerOrdenesTrabajo />} />
          <Route path="crear-ordenes-compras" element={<OrdenCompraForm />} />
          <Route
            path="obtener-ordenes-compras"
            element={<ObtenerOrdenesCompra />}
          />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route
            path="/auth/crm/vehiculos-register"
            element={<FormVehiculos />}
          />
          <Route
            path="/auth/crm/vehiculos-documentos"
            element={<DocumentosVehiculos />}
          />
          <Route
            path="/auth/crm/vehiculos-mantenimientos"
            element={<MantenimientosVehiculos />}
          />
          <Route
            path="/auth/crm/vehiculos-inspecciones"
            element={<InspecionVehiculos />}
          />
          <Route path="/auth/crm/vehiculos-all" element={<ListarVehiculos />} />
          <Route
            path="/auth/crm/vehiculos/:id/editar"
            element={<EditarVehiculo />}
          />
          <Route path="indicadores" element={<Indicadores />} />
          <Route
            path="registrar-valor-indicador"
            element={<RegisterValorIndicador />}
          />

          <Route
            path="/auth/crm/editar-compra/:id"
            element={<OrdenCompraForm modo="edicion" />}
          />

          <Route path="gestion-clientes" element={<GestionClientes />} />
          <Route path="reporte-inventarios" element={<Inventarios />} />
          <Route path="notificaciones" element={<Notifycaciones />} />
          <Route
            path="detalles-compras/:id"
            element={<DetallesOrdenesCompra />}
          />
          <Route
            path="ordenes-trabajo/:id"
            element={<DetallesOrdenTrabajo />}
          />
          <Route path="kpis" element={<Kpi />} />
          <Route path="pqrs" element={<Pqr />} />
          <Route path="ordenes-facturar" element={<OrdenesFacturar />} />
          <Route
            path="registrar-documentacion"
            element={<RegistroDocumentacion />}
          />
          <Route path="ordenes-faltantes" element={<OrdenesFaltantes/>} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route
            path="proveedores-ordenes-compra"
            element={<FormOrdenesProveedores />}
          />
          <Route
            path="ordenes-compra-proveedor"
            element={<ObtenerOrdenesProveedores />}
          />
          <Route
            path="/auth/crm/ordenes-proveedor-entregas/:id/registrar-entrega"
            element={<RegistrarEntregaProveedor />}
          />
          <Route
            path="/auth/crm/ordenes-proveedor-entregas/:id/editar"
            element={<RegistrarEntregaProveedor modo="editar" />}
          />
          <Route
            path="/auth/crm/ordenes-proveedor-preview/:id"
            element={<VistaPrevia />}
          />
          <Route
            path="/auth/crm/oc-provedor-update/:id"
            element={<UpdateOcProvedor />}
          />

          <Route path="cotizaciones" element={<CotizacionForm />} />
          <Route path="mis-ordenes" element={<MisOrdenesComerciales />} />
          <Route path="mis-cotizaciones" element={<MisCotizaciones />} />
          <Route
            path="/auth/crm/editar-cotizacion/:id"
            element={<CotizacionForm modo="edicion" />}
          />
          <Route
            path="/auth/crm/referencias-faltantes"
            element={<ReferenciasExcedidas />}
          />
          <Route
            path="/auth/crm/vehiculos/:id/fotos"
            element={<CargaFotosVehiculo />}
          />
          <Route
            path="/auth/crm/conductores"
            element={<ObtenerDatosConductores />}
          />
          <Route
            path="/auth/crm/crear-datos-conductores"
            element={<Conductores />}
          />
          <Route
            path="/auth/crm/ordenes-compra-auditor"
            element={<OrdenesCompraClient />}
          />
          <Route
            path="/auth/crm/registrar-inventario"
            element={<RegistrarInventario />}
          />
          <Route
            path="/auth/crm/traslado-inventario"
            element={<TrasladoInventario />}
          />
          <Route
            path="/auth/crm/conductores/:conductorId/revisiones"
            element={<RevisionesPage />}
          />
        </Route>
      </Route>

      {/* 🔹 Rutas para Administradores (AdminLayout) */}
      <Route element={<ProtectedRoute allowedRoles={[1]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<GestionUsers />} />

          <Route path="sedes" element={<Sedes />} />
          <Route path="rendimiento" element={<KpiTareas />} />
          <Route path="tareas" element={<Tareas />} />
          <Route path="novedades" element={<Errores />} />
          <Route path="departamentos" element={<DepartatamentosUpdate />} />
          <Route path="indicadores" element={<Indicadores />} />
          <Route
            path="dashboard/indicadores"
            element={<DashboardIndicadores />}
          />
          <Route path="empresas" element={<Empresas />} />
          <Route path="bodegas" element={<Bodegas />} />

          <Route path="marketing" element={<Marketing />} />
        </Route>
      </Route>

      {/* 🔹 Redirección si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
