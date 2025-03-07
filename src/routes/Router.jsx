import { Route, Routes } from "react-router-dom";

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

export default function Router() {
  return (
    <Routes>
      {/* Ruta de Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas bajo AuthLayout */}
      <Route path="/auth" element={<AuthLyout />}>
        <Route path="procesos" element={<DepartamentosPage />} />
        <Route
          path="procesos/:departamentoId"
          element={<ProcesosDepartamento />}
        />
      </Route>

      <Route path="/auth/crm" element={<Crm />}>
        <Route path="/auth/crm/reuniones" element={<Reuniones />} />
        <Route path="/auth/crm/ordenes-compras" element={<OrdenCompraForm />} />

        <Route path="/auth/crm/cotizaciones" element={<Cotizaciones />} />
        <Route
          path="/auth/crm/gestion-clientes"
          element={<GestionClientes />}
        />
        <Route path="/auth/crm/reporte-inventarios" element={<Inventarios />} />
        <Route path="/auth/crm/notifyficaciones" element={<Notifycaciones />} />
        <Route path="/auth/crm/detalles-compras/:id" element={<DetallesOrdenesCompra />}    />
        <Route path="/auth/crm/ordenes-trabajo/:id" element={<DetallesOrdenTrabajo />} />
        <Route path="/auth/crm/kpis" element={<Kpi />} />
        <Route path="/auth/crm/pqrs" element={<Pqr />} />
        <Route path="/auth/crm/visita-cliente" element={<Visitas />} />
      </Route>

      {/* Rutas bajo AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<GestionUsers />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="errores" element={<Errores />} />
        <Route path="departamentos" element={<DepartatamentosUpdate />} />
      </Route>
    </Routes>
  );
}
