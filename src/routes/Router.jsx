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

import Reuniones from "../views/crm/Reuniones";
import Cotizaciones from "../views/crm/Cotizaciones";
import GestionClientes from "../views/crm/GestionClientes";
import Inventarios from "../views/crm/Inventarios";
import Notifycaciones from "../views/crm/Notifycaciones";
import Kpi from "../views/crm/Kpi";
import Pqr from "../views/crm/Pqr";
import Visitas from "../views/crm/Visitas";
import OrdenCompraForm from "../views/crm/OrdenCompraForm";
import DetallesOrdenesCompra from "../views/crm/DetallesOrdenesCompra";
import DetallesOrdenTrabajo from "../views/crm/DetallesOrdenTrabajo";
import ObtenerOrdenesCompra from "../components/crm/ObtenerOrdenesCompra";

export default function Router() {
  return (
    <Routes>
    {/* 🔹 Ruta de Login (Accesible para todos) */}
    <Route path="/" element={<Login />} />
  
    {/* 🔹 Rutas bajo AuthLayout (Procesos y CRM) */}
    <Route element={<ProtectedRoute allowedRoles={[1,2, 3, 4, 5, 6, 7, 8]} />}>
      <Route path="/auth" element={<AuthLyout />}>
        <Route path="procesos" element={<DepartamentosPage />} />
        <Route path="procesos/:departamentoId" element={<ProcesosDepartamento />} />
      </Route>
  
      <Route path="/auth/crm" element={<Crm />}>
        <Route path="reuniones" element={<Reuniones />} />
        <Route path="crear-ordenes-compras" element={<OrdenCompraForm />} />
        <Route path="obtener-ordenes-compras" element={<ObtenerOrdenesCompra />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
        <Route path="gestion-clientes" element={<GestionClientes />} />
        <Route path="reporte-inventarios" element={<Inventarios />} />
        <Route path="notificaciones" element={<Notifycaciones />} />
        <Route path="detalles-compras/:id" element={<DetallesOrdenesCompra />} />
        <Route path="ordenes-trabajo/:id" element={<DetallesOrdenTrabajo />} />
        <Route path="kpis" element={<Kpi />} />
        <Route path="pqrs" element={<Pqr />} />
        <Route path="visita-cliente" element={<Visitas />} />
      </Route>
    </Route>
  
    {/* 🔹 Rutas para Administradores (AdminLayout) */}
    <Route element={<ProtectedRoute allowedRoles={[1]} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<GestionUsers />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="errores" element={<Errores />} />
        <Route path="departamentos" element={<DepartatamentosUpdate />} />
      </Route>
    </Route>
  
    {/* 🔹 Redirección si la ruta no existe */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  
  );
}
