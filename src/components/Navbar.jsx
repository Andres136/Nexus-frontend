import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { departamentosApi, notificacionesApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  Home,
  FolderKanban,
  ListChecks,
  Bell,
  Building2,
  BarChart2,

  ChevronDown,

  Megaphone,
  TruckIcon,
  LogOutIcon,
  User2Icon,
 
  Monitor,
  ShieldCheck,
  Wallet,
  Settings,
  PackageX,
  TicketCheck,
  CalendarDays,
  Gauge,

} from "lucide-react";

const TRADUCCIONES_NOTIFICACION = {
  NotifyAdminUserLoggedIn: "Inicio de sesión",
  TicketAsignadoNotification: "Ticket asignado",
  TicketCerradoNotification: "Ticket cerrado",
  OrdenTrabajoCreada: "Orden de trabajo creada",
  OrdenTrabajoGeneradaParaCreador: "Orden de trabajo generada",
  OrdenTrabajoListaParcial: "Orden con productos listos parcialmente",
  TareaVencidaNotificacion: "Tarea vencida",
  NuevaTareaAsignada: "Nueva tarea asignada",
  ContactoNotificacion: "Nuevo contacto recibido",
  OrdenCompraNotificacion: "Nueva orden de compra",
  OrdenCompraNotificacionMejorada: "Nueva orden de compra",
  OrdenesPorVencerNotificacion: "Órdenes por vencer",
  PqrNotifycaciones: "Nuevo mensaje de PQR",
  FacturaCarteraNotification: "Factura de cartera",
  CarteraClienteAlCrearOcNotification: "Cliente con cartera pendiente",
  AlistamientoIniciadoCarteraNotificacion: "Alistamiento con cartera pendiente",
  NotificacionTrasladoCreado: "Traslado creado",
  TrasladoActualizadoNotification: "Traslado actualizado",
  TrasladoPendienteBodegaNotificacion: "Traslado pendiente en bodega",
};

const nombreCortoTipo = (type) => type?.split("\\").pop();

const traducirTipoNotificacion = (type) => {
  const corto = nombreCortoTipo(type);
  return TRADUCCIONES_NOTIFICACION[corto] || corto || "Notificación";
};

// Convierte la url absoluta guardada en `data.url` en una ruta interna
// navegable con react-router (evita un refresh completo de página).
const rutaInterna = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departamento, setDepartamento] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false); // ✅ Solo agregué este estado
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const { logout, user } = useAuth({ middleware: "auth" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null); // ✅ Solo agregué esta ref

  const notificacionesQuery = useQuery({
    queryKey: ["navbar-notificaciones", user?.id],
    queryFn: async () => {
      const response = await notificacionesApi.getAll();
      return {
        notificaciones: response.data?.notificaciones ?? [],
        total: response.data?.total_no_leidas ?? 0,
      };
    },
    enabled: Boolean(user?.id),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const notificaciones = notificacionesQuery.data?.notificaciones ?? [];
  const totalNoLeidas = notificacionesQuery.data?.total ?? 0;

  useEffect(() => {
    const fetchDepartamento = async () => {
      try {
        const res = await departamentosApi.getById(user.departamento_id);
        setDepartamento(res.data);
      } catch (error) {
        console.error("Error fetching departamento:", error);
      }
    };
    if (user?.departamento_id) fetchDepartamento();
  }, [user?.departamento_id]);

  const isResponsable = departamento?.responsable_id === user?.id;

  const navLinks = [
    { name: "Inicio", to: "/", icon: Home, allowedRoles: [1,10,11] },
    { name: "Procesos", to: "/auth/procesos", icon: FolderKanban, alwaysVisible: true },
    { name: "Entregas ", to: "/auth/entregas", icon: TruckIcon, alwaysVisible: true },
    { name: "Capacitaciones", to: "/auth/capacitaciones", icon: CalendarDays, alwaysVisible: true },
    { name: "CRM", to: "/auth/crm", icon: Building2, alwaysVisible: true },
    {name: "KPIS", to: "dashboard/indicadores", icon: Building2, alwaysVisible: true },
    {name: "Portal Empleado", to: "/auth/crm/nomina/portal-empleado", icon: User2Icon, alwaysVisible: true },
    { name: "Indicadores", to: "indicadores", icon: BarChart2, allowedRoles: [1,2], onlyIfResponsable: true },
    {
      name: "Home",
      icon: Home,
      alwaysVisible: true,
      hasSubmenu: true,
      submenu: [
       { name: "Marketing", to: "/auth/marketing", icon: Megaphone, allowedRoles: [1, 2, 10, 11] },
        { name: "No Conformidades", to: "/auth/control-calidad", icon: Bell, allowedRoles: [1, 2, 10, 11] },
        { name: "Tareas", to: "/auth/tareas", icon: ListChecks, allowedRoles: [1,2, 10,11] },
        {name: "Settings", to: "/admin/settings-permisos", icon: Settings, allowedRoles: [1] },
        {name: "Responsabilidades", to: "/auth/responsabilidades", icon: User2Icon, allowedRoles: [1] },
        {name: "TIC", to: "/auth/tic", icon: Monitor, allowedRoles: [1, 2] },
        {name: "Tickets", to: "/auth/tic/tickets", icon: TicketCheck, allowedRoles: [1, 2, 3, 4, 5, 6, 7, 8, 9] },

     
        {name: "Cartera", to: "/auth/crm/cartera-clientes", icon: Wallet, alwaysVisible: true },
        {name: "HSEQ", to: "/auth/crm/hseq/inspecciones", icon: ShieldCheck, alwaysVisible: true },
        {name: "Producto No Conforme", to: "/auth/crm/no-conformidades", icon: PackageX, alwaysVisible: true },
        {name: "Contabilidad", to: "/auth/crm/contabilidad", icon: Wallet, alwaysVisible: true },

        {name: "Nomina", to: "/auth/crm/nomina", icon: Wallet, alwaysVisible: true },
          

      ],
    },
  ];

  const filteredNavLinks = navLinks.filter((link) => {
    if (link.alwaysVisible) return true;
    if (link.onlyIfResponsable) return isResponsable;
    return !link.allowedRoles || link.allowedRoles.includes(user?.role_id);
  });

  // ✅ Solo modifiqué este useEffect para incluir userMenuRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abrirNotificacion = async (noti) => {
    setShowNotifPanel(false);
    setOpenUserMenu(false);
    setIsSidebarOpen(false);

    try {
      await notificacionesApi.marcarLeida(noti.id);
      queryClient.invalidateQueries({ queryKey: ["navbar-notificaciones", user?.id] });
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }

    const destino = rutaInterna(noti.data?.url);
    if (destino) navigate(destino);
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasLeidas();
      queryClient.invalidateQueries({ queryKey: ["navbar-notificaciones", user?.id] });
    } catch (error) {
      console.error("Error al marcar notificaciones como leídas:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Menú móvil */}
        <button
          className="lg:hidden text-gray-300 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Logo */}
        <h1 className="text-left leading-tight">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-wide hover:text-green-400 transition">
            Nexus
          </Link>
        </h1>

        <button
          type="button"
          onClick={() => setShowNotifPanel(true)}
          className="relative rounded-lg p-2 text-gray-200 transition hover:bg-gray-800 hover:text-green-400 lg:hidden"
          aria-label="Ver notificaciones"
        >
          <Bell className="h-5 w-5" />
          {totalNoLeidas > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {totalNoLeidas > 99 ? "99+" : totalNoLeidas}
            </span>
          )}
        </button>

        {/* Menú escritorio */}
        <div ref={menuRef} className="hidden lg:flex items-center space-x-6">
          {filteredNavLinks.map((link) =>
            link.hasSubmenu ? (
              <div key={link.name} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                  className="flex items-center space-x-1 hover:text-green-400 transition-colors"
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

             {openMenu === link.name && (
  <div
    className="absolute right-0 top-full mt-2 grid grid-cols-3 gap-2 bg-gray-800 border border-gray-700
               rounded-lg shadow-xl w-[420px] p-3 transition-all duration-200 ease-in-out z-50"
  >
                    {link.submenu.map((sub) => (
                 <Link
  key={sub.name}
  to={sub.to}
  onClick={() => setOpenMenu(null)}
  className="flex flex-col items-center justify-center p-4 rounded-lg
             bg-gray-900 hover:bg-gray-700 transition-all text-gray-200 hover:text-green-400"
>
  {sub.icon && <sub.icon className="w-6 h-6 mb-2" />}
  <span className="text-sm font-medium text-center">{sub.name}</span>
</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.to}
                className="flex items-center space-x-1 hover:text-green-400 transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.name}</span>
              </Link>
            )
          )}

          <button
            type="button"
            onClick={() => setShowNotifPanel(true)}
            className="relative rounded-lg p-2 text-gray-200 transition hover:bg-gray-800 hover:text-green-400"
            aria-label="Ver notificaciones"
          >
            <Bell className="h-5 w-5" />
            {totalNoLeidas > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                {totalNoLeidas > 99 ? "99+" : totalNoLeidas}
              </span>
            )}
          </button>
          
          {/* ✅ Solo reemplacé esta sección del usuario y botón */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
            >
              <span className="font-medium">👤 {user?.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-48 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300">Conectado como:</p>
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                </div>
                <Link
                  to="/auth/mi-dia"
                  onClick={() => setOpenUserMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <ListChecks className="w-4 h-4" />
                  Mi día
                </Link>
                {user?.role_id === 1 && (
                  <Link
                    to="/auth/admin/productividad"
                    onClick={() => setOpenUserMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Gauge className="w-4 h-4" />
                    Productividad del equipo
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setOpenUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-gray-700 hover:text-red-200 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar móvil - SIN CAMBIOS */}
      <div className={`lg:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <ul className="flex flex-col space-y-2 mt-4 bg-gray-900 rounded p-4 shadow-lg">
          {filteredNavLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.to || "#"}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-white"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>

              {link.hasSubmenu && (
                <ul className="ml-6 mt-1 space-y-1">
                  {link.submenu.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        to={sub.to}
                        onClick={() => setIsSidebarOpen(false)}
                        className="block text-sm text-gray-300 hover:text-green-400"
                      >
                        • {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="px-4 py-2 text-green-300 font-medium">👤 {user?.name}</li>
          <li>
            <button
              type="button"
              onClick={() => {
                setShowNotifPanel(true);
                setIsSidebarOpen(false);
              }}
              className="flex w-full items-center justify-between rounded px-4 py-2 text-left text-white hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </span>
              {totalNoLeidas > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {totalNoLeidas}
                </span>
              )}
            </button>
          </li>
          <li>
            <Link
              to="/auth/mi-dia"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2 rounded px-4 py-2 text-white hover:bg-gray-700"
            >
              <ListChecks className="h-4 w-4" />
              Mi día
            </Link>
          </li>
          {user?.role_id === 1 && (
            <li>
              <Link
                to="/auth/admin/productividad"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 rounded px-4 py-2 text-white hover:bg-gray-700"
              >
                <Gauge className="h-4 w-4" />
                Productividad del equipo
              </Link>
            </li>
          )}
          <li>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>

      {showNotifPanel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 text-gray-900">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Notificaciones</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {totalNoLeidas > 0
                    ? `Tienes ${totalNoLeidas} notificación${totalNoLeidas === 1 ? "" : "es"} sin leer`
                    : "No tienes notificaciones nuevas"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifPanel(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar notificaciones"
              >
                ×
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto px-5 py-4">
              {notificaciones.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Aquí verás avisos de tickets asignados, facturas de cartera por vencer/vencidas, tareas y más.
                </p>
              ) : (
                <div className="space-y-3">
                  {notificaciones.map((noti) => (
                    <button
                      key={noti.id}
                      type="button"
                      onClick={() => abrirNotificacion(noti)}
                      className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {traducirTipoNotificacion(noti.type)}
                      </p>
                      <p className="mt-1 text-sm text-gray-800">
                        {noti.data?.mensaje ?? "Nueva notificación"}
                      </p>
                      {nombreCortoTipo(noti.type) === "FacturaCarteraNotification" && (
                        <p className="mt-1 text-xs text-gray-600">
                          Factura <span className="font-semibold">{noti.data?.numero_factura}</span>
                          {noti.data?.cliente && (
                            <>
                              {" "}— Cliente: <span className="font-semibold">{noti.data.cliente}</span>
                            </>
                          )}
                        </p>
                      )}
                      {(noti.data?.orden_trabajo_id || noti.data?.orden_compra_id) && (
                        <p className="mt-1 text-xs text-gray-600">
                          {noti.data?.orden_compra_id && <>OC #{noti.data.orden_compra_id}</>}
                          {noti.data?.orden_trabajo_id && (
                            <>
                              {noti.data?.orden_compra_id ? " — " : ""}OT #{noti.data.orden_trabajo_id}
                            </>
                          )}
                          {noti.data?.cliente && (
                            <>
                              {" "}— Cliente: <span className="font-semibold">{noti.data.cliente}</span>
                            </>
                          )}
                          {noti.data?.fecha_entrega && (
                            <>
                              {" "}— Entrega:{" "}
                              {new Date(noti.data.fecha_entrega).toLocaleDateString("es-CO")}
                            </>
                          )}
                        </p>
                      )}
                      {!noti.data?.orden_trabajo_id &&
                        !noti.data?.orden_compra_id &&
                        nombreCortoTipo(noti.type) !== "FacturaCarteraNotification" &&
                        noti.data?.cliente && (
                          <p className="mt-1 text-xs text-gray-600">
                            Cliente: <span className="font-semibold">{noti.data.cliente}</span>
                          </p>
                        )}
                      {noti.data?.facturas_vencidas?.length > 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          🚨 Vencidas: {noti.data.facturas_vencidas.join(", ")}
                          {typeof noti.data?.total_vencido === "number" && (
                            <> — ${noti.data.total_vencido.toLocaleString("es-CO")}</>
                          )}
                        </p>
                      )}
                      {noti.data?.facturas_proximas?.length > 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          ⚠️ Próximas a vencer: {noti.data.facturas_proximas.join(", ")}
                          {typeof noti.data?.total_proximo === "number" && (
                            <> — ${noti.data.total_proximo.toLocaleString("es-CO")}</>
                          )}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(noti.created_at).toLocaleString("es-CO")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowNotifPanel(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              {totalNoLeidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasLeidas}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
