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

import Marketing from "../views/comunicaciones/Marketing";
import DividirOcProveedor from "../views/crm/DividirOcProveedor";
import DeliveryPage from "../views/Rutas/DeliveryPage";
import MovimientoInventario from "../views/crm/MovimientoInventario";
import DynamicProtectedRoute from "./DynamicProtectedRoute";
import SettingPermissions from "../views/Roles/SettingPermissions";
import AlistamientoPanel from "../views/vsm/AlistamientoPanel";
import VsmFlowDashboard from "../components/vsm/VsmFlowDashboard";
import VsmDashboard from "../components/vsm/VsmDashboard";
import AlistamientosAuditoria from "../components/vsm/AlistamientosAuditoria";
import CrearProductos from "../components/crm/CrearProductos";
import ActualizarProducto from "../components/crm/ActualizarProducto";
import Responsabilidades from "../views/Responsabilidades";
import AsignarResponsabilidades from "../components/AsignarResponsabilidades";
import TrasladoBodegas from "../components/crm/Traslado-Bodegas/TrasladoBodegas";
import ObtenerTrasladosBodegas from "../components/crm/Traslado-Bodegas/ObtenerTrasladosBodegas";
import DetallesTraslados from "../components/crm/Traslado-Bodegas/DetallesTraslados";
import EditTrasladoBodega from "../components/crm/Traslado-Bodegas/EditTrasladoBodega";
import DashboardOrdenesAnual from "../components/calidad/DashboardOrdenesAnual";
import Registros from "../views/RegistroDiario/Registros";
import VerificacionDiaria from "../components/RegistroDiario/VerificacionDiaria";
import DashboardRegistroDiario from "../components/RegistroDiario/DashboardRegistroDiario";
import DashboardProcesosAnuales from "../components/RegistroDiario/DashboardProcesosAnuales";
import Asignaciones from "../views/tic/Asignaciones";

import NovedadesCalidad from "../components/calidad/NovedadesCalidad";
import MantenimientoEquiposTic from "../components/tic/MantenimientoEquiposTic";
import ViewOrdenesOs from "../views/crm/ViewOrdenesOs/ViewOrdenesOs";
import ViewDetallesOrdenesOs from "../views/crm/ViewOrdenesOs/ViewDetallesOrdenesOs";
import RegistrarOs from "../components/crm/ordenesServicio/RegistrarOs";
import GestionCartera from "../views/crm/GestionCartera";
import ObtenerGestionCartera from "../components/crm/ObtenerGestionCartera";
import ViewHseq from "../views/hseq/ViewHseq";
import RegistroTipoInspecciones from "../components/hseq/RegistroTipoInspecciones";
import RegistrarPreguntasInspecciones from "../components/hseq/RegistrarPreguntasInspecciones";
import CalendarioInspecciones from "../components/hseq/CalendarioInspecciones";
import UpdateCartera from "../views/crm/UpdateCartera";
import TipoServicios from "../components/hseq/TipoServicios";
import TipoResiduos from "../components/hseq/TipoResiduos";
import RegistrarConsumoServicios from "../components/hseq/RegistrarConsumoServicios";
import RegistrarGeneracionResiduos from "../components/hseq/RegistrarGeneracionResiduos";
import DashboardConsumoServicios from "../components/hseq/DashBoardConsumoServicio";
import DashboardResiduos from "../components/hseq/DashboardResiduos";
import GestionNovedadesCalidad from "../views/calidad/GestionNovedadesCalidad";
import DashboardSemestral from "../components/calidad/DashboardSemestral";
import DashboardProductividaIndividual from "../views/vsm/DashboardProductividaIndividual";
import GestionarFacturaCartera from "../views/crm/GestionarFacturaCartera";
import GetHistorialGestionFacturaCartera from "../views/crm/GetHistorialGestionFacturaCartera";
import DashboardOperativo from "../views/calidad/DashboardOperativo";
import Contabilidad from "../views/contabilidad/Contabilidad";
import CreateImpuestos from "../components/contabilidad/CreateImpuestos";


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
           <Route
            path="responsabilidades"
            element={<DynamicProtectedRoute permission="/auth/responsabilidades">
              <Responsabilidades />
            </DynamicProtectedRoute>}
          />

          <Route
            path="asignar-responsabilidades"
            element={<DynamicProtectedRoute permission="/auth/asignar-responsabilidades">
              <AsignarResponsabilidades />
            </DynamicProtectedRoute>}
          />
          <Route path="traslado-bodegas" element={<DynamicProtectedRoute permission="/auth/traslado-bodegas">
              <TrasladoBodegas />
            </DynamicProtectedRoute>} />

          <Route path="obtener-traslados" element={<DynamicProtectedRoute permission="/auth/obtener-traslados">
              <ObtenerTrasladosBodegas   />
            </DynamicProtectedRoute>} />

          <Route
            path="detalles-traslado/:id"
            element={<DynamicProtectedRoute permission="/auth/detalles-traslado/:id">
              <DetallesTraslados />
            </DynamicProtectedRoute>}
          />
       <Route>
         <Route
           path="/auth/crm/estadisticas-ordenes"
           element={<DynamicProtectedRoute permission="/auth/crm/estadisticas-ordenes">
        <DashboardOrdenesAnual />
           </DynamicProtectedRoute>}
         />
       </Route>
          <Route
            path="editar-traslado/:id"
            element={<DynamicProtectedRoute permission="/auth/editar-traslado/:id">
              <EditTrasladoBodega />
            </DynamicProtectedRoute>}
          />

          <Route
            path="procesos"
            element={
              <DynamicProtectedRoute permission="/auth/procesos">
                <DepartamentosPage />
              </DynamicProtectedRoute>
            }
          />
{/*Rutas para control de calidad */}
         <Route path="/auth/control-calidad" element={<DynamicProtectedRoute permission="/auth/control-calidad">
           <Registros />
         </DynamicProtectedRoute>} />
         <Route path="/auth/registro-diario/verificacion" element={<DynamicProtectedRoute permission="/auth/registro-diario/verificacion">
           <VerificacionDiaria />
         </DynamicProtectedRoute>} />
         <Route path="/auth/registro-diario/dashboard" element={<DynamicProtectedRoute permission="/auth/registro-diario/dashboard">
           <DashboardRegistroDiario />
         </DynamicProtectedRoute>} />
         <Route path="/auth/registro-diario" element={<DynamicProtectedRoute permission="/auth/registro-diario">
           <DashboardProcesosAnuales/>
         </DynamicProtectedRoute>} />

         <Route path="/auth/novedades" element={<DynamicProtectedRoute permission="/auth/novedades">
           <NovedadesCalidad />
         </DynamicProtectedRoute>} />


         <Route path="/auth/gestion-calidad/:id" element={<DynamicProtectedRoute permission="/auth/gestion-calidad/:id">
           <GestionNovedadesCalidad />
         </DynamicProtectedRoute>} />

         <Route path="/auth/dashboard-semestral" element={<DynamicProtectedRoute permission="/auth/dashboard-semestral">
           <DashboardSemestral />
         </DynamicProtectedRoute>} />

         <Route path="/auth/crm/vsm/productividad-individual"
          element={<DynamicProtectedRoute permission="/auth/crm/vsm/productividad-individual">
            <DashboardProductividaIndividual />
          </DynamicProtectedRoute>}
         />

         <Route
          path="/auth/crm/control-operativo/dashboard"
          element={<DynamicProtectedRoute permission="/auth/crm/control-operativo/dashboard">
            <DashboardOperativo />
          </DynamicProtectedRoute>}
         />


{/*Fin de Rutas para control de calidad */}

         {/*Rutas para TIC */}
         <Route path="/auth/tic" element={<DynamicProtectedRoute permission="/auth/tic">
           <Asignaciones />
         </DynamicProtectedRoute>} />

          <Route
            path="marketing"
            element={
              <DynamicProtectedRoute permission="/auth/marketing">
                <Marketing />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/tic/mantenimientos"
            element={
              <DynamicProtectedRoute permission="/auth/tic/mantenimientos">
                <MantenimientoEquiposTic />
              </DynamicProtectedRoute>
            }
          />
         {/* Fin de Rutas para TIC */}
          <Route
            path="entregas"
            element={
              <DynamicProtectedRoute permission="/auth/entregas">
                <DeliveryPage />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="procesos/:departamentoId"
            element={
              <DynamicProtectedRoute permission="/procesos/:departamentoId">
                <ProcesosDepartamento />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="rendimiento"
            element={
              <DynamicProtectedRoute permission="/auth/rendimiento">
                <Tareas />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/tareas"
            element={
              <DynamicProtectedRoute permission="/auth/tareas">
                <Tareas />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="dashboard/indicadores"
            element={
              <DynamicProtectedRoute permission="/auth/dashboard/indicadores">
                <DashboardIndicadores />
              </DynamicProtectedRoute>
            }
          />
          <Route path="novedades" element={<Errores />} />
          <Route path="departamentos" element={<DepartatamentosUpdate />} />
          <Route path="indicadores" element={<Indicadores />} />
        </Route>

        <Route path="/auth/crm" element={<Crm />}>
          <Route
            path="ordenes-trabajo"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-trabajo">
                <ObtenerOrdenesTrabajo />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="crear-ordenes-compras"
            element={
              <DynamicProtectedRoute permission="/auth/crm/crear-ordenes-compras">
                <OrdenCompraForm />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="obtener-ordenes-compras"
            element={
              <DynamicProtectedRoute permission="/auth/crm/obtener-ordenes-compras">
                <ObtenerOrdenesCompra />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="vehiculos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/vehiculos">
                <Vehiculos />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/vehiculos-register"
            element={
              <DynamicProtectedRoute permission="/auth/crm/vehiculos-register">
                <FormVehiculos />
              </DynamicProtectedRoute>
            }
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
            element={
              <DynamicProtectedRoute permission="/auth/crm/editar-compra/:id">
                <OrdenCompraForm modo="edicion" />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="gestion-clientes"
            element={
              <DynamicProtectedRoute permission="/auth/crm/gestion-clientes">
                <GestionClientes />
              </DynamicProtectedRoute>
            }
          />
          <Route path="reporte-inventarios" element={<Inventarios />} />

          <Route
            path="detalles-compras/:id"
            element={
              <DynamicProtectedRoute permission="/auth/crm/detalles-compras/:id">
                <DetallesOrdenesCompra />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="ordenes-trabajo/:id"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-trabajo/:id">
                <DetallesOrdenTrabajo />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="kpis"
            element={
              <DynamicProtectedRoute permission="/auth/crm/kpis">
                <Kpi />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="pqrs"
            element={
              <DynamicProtectedRoute permission="/auth/crm/pqrs">
                <Pqr />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="ordenes-facturar"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-facturar">
                <OrdenesFacturar />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="registrar-documentacion"
            element={
              <DynamicProtectedRoute permission="/auth/crm/registrar-documentacion">
                <RegistroDocumentacion />
              </DynamicProtectedRoute>
            }
          />
          <Route path="ordenes-faltantes" element={<OrdenesFaltantes />} />
          <Route
            path="proveedores"
            element={
              <DynamicProtectedRoute permission="/auth/crm/proveedores">
                <Proveedores />
              </DynamicProtectedRoute>
            }
          />


          {/* Rutas para Ordenes a proveedores */}

          <Route
            path="/auth/crm/ordenes-servicio-proveedor/create"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-servicio-proveedor/create">
                <RegistrarOs />
              </DynamicProtectedRoute>
            }
          />
          

         <Route
            path="/auth/crm/ordenes-servicio-proveedor"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-servicio-proveedor">
                <ViewOrdenesOs />
              </DynamicProtectedRoute>
            }
          />
        <Route
            path="/auth/crm/ordenes-servicio-proveedor/:id"
            element={
              <DynamicProtectedRoute permission="/auth/crm/ordenes-servicio-proveedor/:id">
               <RegistrarOs />
              </DynamicProtectedRoute>
            }
          />
          
          {/* Fin de Rutas para Ordenes a proveedores */}

       
          {/* Rutas para  gestion de cartera */}   

          <Route
            path="/auth/crm/cartera-clientes"
            element={
              <DynamicProtectedRoute permission="/auth/crm/cartera-clientes">
                <ObtenerGestionCartera/>
              </DynamicProtectedRoute>
            }
          />
  
  <Route
            path="/auth/crm/registrar-cartera"
            element={
              <DynamicProtectedRoute permission="/auth/crm/registrar-cartera">
                <GestionCartera />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/editar-cartera/:id"
            element={
              <DynamicProtectedRoute permission="/auth/crm/editar-cartera/:id">
                <UpdateCartera modo="editar" />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/gestion-cartera/:id"
            element={
              <DynamicProtectedRoute permission="/auth/crm/gestion-cartera/:id">
                <GestionarFacturaCartera/>
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/historial-gestion-factura"
            element={
              <DynamicProtectedRoute permission="/auth/crm/historial-gestion-factura">
                <GetHistorialGestionFacturaCartera />
              </DynamicProtectedRoute>
            }
          />
          
           
          {/*  Fin Rutas para  gestion de cartera */}  
            {/*   Rutas para  HSEQ */} 
            <Route
            path="/auth/crm/hseq/inspecciones"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/inspecciones">
                <ViewHseq />
              </DynamicProtectedRoute>
            }
          />


          <Route
            path="/auth/crm/hseq/tipos-inspeccion"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/tipos-inspeccion">
                <RegistroTipoInspecciones />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/preguntas"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/preguntas">
                <RegistrarPreguntasInspecciones />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/registro-inspeccion"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/registro-inspeccion">
                <CalendarioInspecciones />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/tipo-servicios"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/tipo-servicios">
                <TipoServicios />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/tipo-residuos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/tipo-residuos">
                <TipoResiduos />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/consumo-servicios"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/consumo-servicios">
                <RegistrarConsumoServicios />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/hseq/generacion-residuos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/generacion-residuos">
                <RegistrarGeneracionResiduos />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/hseq/dashboard-consumo-servicios"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/dashboard-consumo-servicios">
                <DashboardConsumoServicios />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/hseq/dashboard-generacion-residuos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/hseq/dashboard-generacion-residuos">
                <DashboardResiduos/>
              </DynamicProtectedRoute>
            }
          />



           {/*   Fin Rutas para  HSEQ */} 



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
          <Route
            path="/auth/crm/ordenes-proveedor/dividir-orden/:id"
            element={<DividirOcProveedor />}
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
            path="/auth/crm/crear-productos"
            element={<DynamicProtectedRoute permission="/auth/crm/crear-productos">
              <CrearProductos />
            </DynamicProtectedRoute>}
          />


          {/* Rutas para Contabilidad */}
            <Route
            path="/auth/crm/contabilidad"
            element={
              <DynamicProtectedRoute permission="/auth/crm/contabilidad">
                <Contabilidad />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/impuestos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/impuestos">
                <CreateImpuestos />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/actualizar-producto/:id"
            element={<DynamicProtectedRoute permission="/auth/crm/actualizar-producto/:id">
              <ActualizarProducto />
            </DynamicProtectedRoute>}
          />
          <Route
            path="/auth/crm/movimientos-stock"
            element={<MovimientoInventario />}
          />
          <Route
            path="/auth/crm/conductores/:conductorId/revisiones"
            element={<RevisionesPage />}
          />
          <Route
            path="/auth/crm/alistamientos"
            element={
              <DynamicProtectedRoute permission="/auth/crm/alistamientos">
                <AlistamientoPanel />
              </DynamicProtectedRoute>
            }
          />
          <Route
            path="/auth/crm/flujo-vsm"
            element={
              <DynamicProtectedRoute permission="/auth/crm/flujo-vsm">
                <VsmFlowDashboard />
              </DynamicProtectedRoute>
            }
          />

          <Route
            path="/auth/crm/vsm/dashboard"
            element={
              <DynamicProtectedRoute permission="/auth/crm/vsm/dashboard">
                <VsmDashboard />
              </DynamicProtectedRoute>
            }
          />


          <Route
            path="/auth/crm/vsm/auditoria"
            element={
              <DynamicProtectedRoute permission="/auth/crm/vsm/auditoria">
                <AlistamientosAuditoria/>
              </DynamicProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* 🔹 Rutas para Administradores (AdminLayout) */}
      <Route element={<ProtectedRoute allowedRoles={[1]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<GestionUsers />} />
          <Route
            path="settings-permisos"
            element={
              <DynamicProtectedRoute permission="/admin/settings-permisos">
                <SettingPermissions />
              </DynamicProtectedRoute>
            }
          />
          <Route path="sedes" element={<Sedes />} />
          <Route path="rendimiento" element={<KpiTareas />} />
      
        
          <Route path="departamentos" element={<DepartatamentosUpdate />} />
          <Route path="indicadores" element={<Indicadores />} />
          <Route
            path="dashboard/indicadores"
            element={<DashboardIndicadores />}
          />
          <Route path="empresas" element={<Empresas />} />
          <Route path="bodegas" element={<Bodegas />} />
        </Route>
      </Route>

      {/* 🔹 Redirección si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
