import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { departamentosApi } from "../services/api";
import { ticketService } from "../services/ticService";
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

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departamento, setDepartamento] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false); // ✅ Solo agregué este estado
  const [showTicketModal, setShowTicketModal] = useState(false);
  const { logout, user } = useAuth({ middleware: "auth" });
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null); // ✅ Solo agregué esta ref

  const ticketsAsignadosQuery = useQuery({
    queryKey: ["navbar-tickets-asignados", user?.id],
    queryFn: async () => {
      const response = await ticketService.getAssignedSummary();
      return response.data?.data ?? { total: 0, tickets: [] };
    },
    enabled: Boolean(user?.id),
    refetchInterval: 60000,
  });

  const ticketsAsignados = ticketsAsignadosQuery.data?.tickets ?? [];
  const totalTicketsAsignados = ticketsAsignadosQuery.data?.total ?? 0;
  const latestTicketId = ticketsAsignados[0]?.id ?? "none";

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

  useEffect(() => {
    if (!user?.id || totalTicketsAsignados === 0) return;

    const storageKey = `tickets-asignados-aviso-${user.id}-${latestTicketId}-${totalTicketsAsignados}`;
    if (sessionStorage.getItem(storageKey)) return;

    setShowTicketModal(true);
    sessionStorage.setItem(storageKey, "true");
  }, [latestTicketId, totalTicketsAsignados, user?.id]);

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
        { name: "Novedades", to: "/auth/control-calidad", icon: Bell, allowedRoles: [1, 2, 10, 11] },
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

  const abrirTickets = () => {
    setShowTicketModal(false);
    setOpenUserMenu(false);
    setIsSidebarOpen(false);
    navigate("/auth/tic/tickets");
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
          onClick={() => setShowTicketModal(true)}
          className="relative rounded-lg p-2 text-gray-200 transition hover:bg-gray-800 hover:text-green-400 lg:hidden"
          aria-label="Ver tickets asignados"
        >
          <Bell className="h-5 w-5" />
          {totalTicketsAsignados > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {totalTicketsAsignados > 99 ? "99+" : totalTicketsAsignados}
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
            onClick={() => setShowTicketModal(true)}
            className="relative rounded-lg p-2 text-gray-200 transition hover:bg-gray-800 hover:text-green-400"
            aria-label="Ver tickets asignados"
          >
            <Bell className="h-5 w-5" />
            {totalTicketsAsignados > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                {totalTicketsAsignados > 99 ? "99+" : totalTicketsAsignados}
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
                setShowTicketModal(true);
                setIsSidebarOpen(false);
              }}
              className="flex w-full items-center justify-between rounded px-4 py-2 text-left text-white hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Tickets asignados
              </span>
              {totalTicketsAsignados > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {totalTicketsAsignados}
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

      {showTicketModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 text-gray-900">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tickets TIC</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {totalTicketsAsignados > 0
                    ? `Tienes ${totalTicketsAsignados} ticket${totalTicketsAsignados === 1 ? "" : "s"} asignado${
                        totalTicketsAsignados === 1 ? "" : "s"
                      }`
                    : "No tienes tickets asignados abiertos"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar aviso de tickets"
              >
                ×
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto px-5 py-4">
              {totalTicketsAsignados === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Cuando te asignen un ticket pendiente o en proceso, aparecerá aquí.
                </p>
              ) : (
                <div className="space-y-3">
                  {ticketsAsignados.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={abrirTickets}
                      className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">Ticket #{ticket.id}</p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {ticket.estado?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{ticket.descripcion}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        Solicitante: {ticket.solicitante?.name ?? "Sin solicitante"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              {totalTicketsAsignados > 0 && (
                <button
                  type="button"
                  onClick={abrirTickets}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Ver tickets
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
