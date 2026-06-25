import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departamentosApi, usersApi } from "../../services/api";
import { ticService, ticketService } from "../../services/ticService";
import { showToast } from "../../helpers/utils/showToast";

const EMPTY_FORM = {
  user_asignado_id: "",
  asignacion_id: "",
  producto_id: "",
  departamento_id: "",
  descripcion: "",
  prioridad: "media",
  fecha_entrega: "",
  hora_entrega: "",
  archivos: [],
};

function toFormData(data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "asignacion_id") return;
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item !== null && item !== undefined && item !== "") {
            formData.append(`${key}[${index}]`, item);
          }
        });
        return;
      }

      formData.append(key, typeof value === "boolean" ? Number(value) : value);
    }
  });

  return formData;
}

export function useTickets(currentUserId = null) {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    estado: "",
    prioridad: "",
    per_page: 10,
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(null);
  const [commentForm, setCommentForm] = useState({ comentario: "", soportes: [], link: "", cerrar: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const activeDepartamentoId = editForm?.departamento_id || form.departamento_id;
  const activeAsignacionesUserId = editForm ? editForm.user_asignado_id : currentUserId;

  const ticketsQuery = useQuery({
    queryKey: ["tic-tickets", filters],
    queryFn: async () => {
      const response = await ticketService.getAll(filters);
      return response.data?.data;
    },
    keepPreviousData: true,
  });

  const usuariosDepartamentoQuery = useQuery({
    queryKey: ["tic-ticket-usuarios-departamento", activeDepartamentoId],
    queryFn: async () => {
      try {
        const response = await usersApi.getByDepartamento(activeDepartamentoId);
        return response.data?.data ?? response.data ?? [];
      } catch (error) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: Boolean(activeDepartamentoId),
  });

  const departamentosQuery = useQuery({
    queryKey: ["tic-ticket-departamentos"],
    queryFn: async () => {
      const response = await departamentosApi.getAll();
      return response.data?.data ?? response.data ?? [];
    },
  });

  const detalleQuery = useQuery({
    queryKey: ["tic-ticket", selectedTicketId],
    queryFn: async () => {
      const response = await ticketService.getById(selectedTicketId);
      return response.data?.data ?? null;
    },
    enabled: Boolean(selectedTicketId),
  });

  const asignacionesUsuarioQuery = useQuery({
    queryKey: ["tic-asignaciones-usuario", activeAsignacionesUserId],
    queryFn: async () => {
      const response = await ticService.getAsignacionesByUsuario(activeAsignacionesUserId);
      return response.data?.data ?? [];
    },
    enabled: Boolean(activeAsignacionesUserId),
  });

  const asignacionesUsuario = asignacionesUsuarioQuery.data ?? [];

  const updateTicketForm = (setter) => (name, value) => {
    if (name === "departamento_id") {
      setter((prev) => ({
        ...prev,
        departamento_id: value,
        user_asignado_id: "",
        asignacion_id: "",
        producto_id: "",
      }));
      return;
    }

    if (name === "user_asignado_id") {
      setter((prev) => ({
        ...prev,
        user_asignado_id: value,
        asignacion_id: "",
        producto_id: "",
      }));
      return;
    }

    if (name === "asignacion_id") {
      const asignacion = asignacionesUsuario.find((item) => String(item.id) === String(value));
      setter((prev) => ({
        ...prev,
        asignacion_id: value,
        producto_id: asignacion?.producto_id ?? "",
      }));
      return;
    }

    setter((prev) => ({ ...prev, [name]: value }));
  };

  const updateForm = updateTicketForm(setForm);
  const updateEditForm = updateTicketForm(setEditForm);

  const invalidateTickets = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tic-tickets"] });
    await queryClient.invalidateQueries({ queryKey: ["navbar-tickets-asignados"] });
    if (selectedTicketId) {
      await queryClient.invalidateQueries({ queryKey: ["tic-ticket", selectedTicketId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload) => ticketService.create(toFormData(payload)),
    onSuccess: async (response) => {
      showToast("success", response.data?.message || "Ticket creado correctamente");
      setForm(EMPTY_FORM);
      setFieldErrors({});
      await queryClient.invalidateQueries({ queryKey: ["tic-tickets"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) setFieldErrors(errors);
      showToast("error", error.response?.data?.message || "No se pudo crear el ticket");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ ticketId, payload }) => ticketService.update(ticketId, toFormData(payload)),
    onSuccess: async (response) => {
      showToast("success", response.data?.message || "Ticket actualizado correctamente");
      setEditForm(null);
      setEditFieldErrors({});
      await invalidateTickets();
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) setEditFieldErrors(errors);
      showToast("error", error.response?.data?.message || "No se pudo actualizar el ticket");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, estado }) => ticketService.changeStatus(ticketId, { estado }),
    onSuccess: async (response) => {
      showToast("success", response.data?.message || "Estado actualizado");
      await invalidateTickets();
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo actualizar el estado");
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ ticketId, payload }) => ticketService.addHistory(ticketId, toFormData(payload)),
    onSuccess: async (response) => {
      showToast("success", response.data?.message || "Comentario agregado");
      setCommentForm({ comentario: "", soportes: [], link: "", cerrar: false });
      await invalidateTickets();
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo agregar el comentario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ticketId) => ticketService.delete(ticketId),
    onSuccess: async () => {
      showToast("success", "Ticket eliminado correctamente");
      setSelectedTicketId(null);
      await queryClient.invalidateQueries({ queryKey: ["tic-tickets"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo eliminar el ticket");
    },
  });

  const crearTicket = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    try {
      await createMutation.mutateAsync(form);
      return true;
    } catch {
      return false;
    }
  };

  const iniciarEdicion = (ticket) => {
    setEditFieldErrors({});
    setEditForm({
      user_asignado_id: ticket?.user_asignado_id ?? "",
      asignacion_id: "",
      producto_id: ticket?.producto_id ?? "",
      departamento_id: ticket?.departamento_id ?? "",
      descripcion: ticket?.descripcion ?? "",
      prioridad: ticket?.prioridad ?? "media",
      fecha_entrega: ticket?.fecha_entrega ?? "",
      hora_entrega: ticket?.hora_entrega?.slice(0, 5) ?? "",
      archivos: [],
    });
  };

  const cancelarEdicion = () => {
    setEditForm(null);
    setEditFieldErrors({});
  };

  const editarTicket = async (event) => {
    event.preventDefault();
    if (!selectedTicketId || !editForm) return false;

    setEditFieldErrors({});
    try {
      await updateMutation.mutateAsync({ ticketId: selectedTicketId, payload: editForm });
      return true;
    } catch {
      return false;
    }
  };

  const cargarDetalle = (ticketId) => {
    setSelectedTicketId(ticketId);
  };

  const cambiarEstado = (ticketId, estado) => {
    statusMutation.mutate({ ticketId, estado });
  };

  const agregarComentario = (event) => {
    event.preventDefault();
    if (!selectedTicketId) return;
    commentMutation.mutate({ ticketId: selectedTicketId, payload: commentForm });
  };

  const eliminarTicket = (ticketId) => {
    deleteMutation.mutate(ticketId);
  };

  const loading = ticketsQuery.isLoading || departamentosQuery.isLoading;
  const saving = createMutation.isPending;
  const updating = updateMutation.isPending;

  return {
    tickets: ticketsQuery.data?.data ?? [],
    pagination: ticketsQuery.data ?? null,
    selectedTicket: detalleQuery.data ?? null,
    filters,
    setFilters,
    form,
    updateForm,
    editForm,
    updateEditForm,
    editFieldErrors,
    commentForm,
    setCommentForm,
    usuarios: usuariosDepartamentoQuery.data ?? [],
    departamentos: departamentosQuery.data ?? [],
    asignacionesUsuario,
    loading,
    saving,
    fieldErrors,
    cargarTickets: () => queryClient.invalidateQueries({ queryKey: ["tic-tickets"] }),
    cargarDetalle,
    crearTicket,
    iniciarEdicion,
    cancelarEdicion,
    editarTicket,
    cambiarEstado,
    agregarComentario,
    eliminarTicket,
    isDetalleLoading: detalleQuery.isFetching,
    isUsuariosLoading: usuariosDepartamentoQuery.isFetching,
    isAsignacionesLoading: asignacionesUsuarioQuery.isFetching,
    isMutating: useMemo(
      () => updating || statusMutation.isPending || commentMutation.isPending || deleteMutation.isPending,
      [updating, statusMutation.isPending, commentMutation.isPending, deleteMutation.isPending]
    ),
    updating,
  };
}
