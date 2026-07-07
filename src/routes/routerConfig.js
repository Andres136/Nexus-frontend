export const ROUTES_META = [
  { path: "/auth/procesos", permission: "/auth/procesos" },
  { path: "/auth/entregas", permission: "/auth/entregas" },
  { path: "/auth/crm/obtener-ordenes-compras", permission: "/auth/crm/obtener-ordenes-compras" },
  { path: "/auth/crm/requerimientos-compra", permission: "/auth/crm/requerimientos-compra" },
  { path: "/auth/crm/requerimientos-compra/:uuid", permission: "/auth/crm/requerimientos-compra" },
  { path: "/auth/crm/requerimientos-compra/gestion", permission: "/auth/crm/requerimientos-compra/gestion" },
  { path: "/auth/crm/requerimientos-compra/gestion/:uuid", permission: "/auth/crm/requerimientos-compra/gestion" },
  { path: "/auth/rendimiento", permission: "/auth/rendimiento" },
  { path: "/auth/tareas", permission: "/auth/tareas" },
  {path:"/auth/dashboard/indicadores", permission:"/auth/dashboard/indicadores"},
  { path: "/auth/crm/editar-compra/:id", permission: "/auth/crm/editar-compra/:id" },
  { path: "/admin/settings-permisos", permission: "/admin/settings-permisos" },
  //CRM
  { path: "/auth/crm", permission: "/auth/crm" },
  // Puedes ir agregando poco a poco
];
