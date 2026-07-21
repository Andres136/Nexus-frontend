import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetKioscos } from "./useGetKioscos";
import { kioskoDeviceService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

export function usePageKioscos() {
  const queryClient = useQueryClient();

  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const params = useMemo(
    () => ({ search: search || undefined, page, per_page: 10 }),
    [search, page]
  );

  const { kioscos, isLoading } = useGetKioscos(params);
  const lista = kioscos?.data?.data ?? [];
  const meta  = kioscos?.data ?? null;

  const refreshKioscos = useCallback(
    () => queryClient.invalidateQueries(["kioscos"]),
    [queryClient]
  );

  const openCreate = useCallback(() => { setSelectedUuid(null); setModalOpen(true); }, []);
  const openEdit   = useCallback((uuid) => { setSelectedUuid(uuid); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setSelectedUuid(null); }, []);
  const handleSearch = useCallback((e) => { setSearch(e.target.value); setPage(1); }, []);

  const copyActivationLink = useCallback(async (item) => {
    if (item.status === "active") {
      const confirmed = window.confirm(
        `¿Generar un nuevo link de activación para ${item.name}? Esto cerrará la activación actual de ese kiosko y deberá activarse de nuevo en el dispositivo.`
      );
      if (!confirmed) return;
    }

    setLoadingAction(`link-${item.uuid}`);
    try {
      const response = await kioskoDeviceService.generateActivationLink(item.uuid);
      const activationUrl = response.data?.data?.activation_url;
      const url = activationUrl?.startsWith("http")
        ? activationUrl
        : `${window.location.origin}${activationUrl}`;
      await navigator.clipboard.writeText(url);
      showToast("success", item.status === "active"
        ? "Nuevo link de reactivación copiado"
        : "Link de activación copiado"
      );
      refreshKioscos();
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo generar el link");
    } finally {
      setLoadingAction(null);
    }
  }, [refreshKioscos]);

  const toggleActive = useCallback(async (item) => {
    setLoadingAction(`status-${item.uuid}`);
    try {
      const isActive = item.status === "active";
      const response = isActive
        ? await kioskoDeviceService.deactivateKiosco(item.uuid)
        : await kioskoDeviceService.activateKioscoAdmin(item.uuid);
      showToast("success", response.data?.message || "Estado actualizado");
      refreshKioscos();
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo actualizar el estado");
    } finally {
      setLoadingAction(null);
    }
  }, [refreshKioscos]);

  const revokeKiosco = useCallback(async (item) => {
    if (!window.confirm(`¿Revocar el acceso de ${item.name}? El dispositivo deberá activarse de nuevo.`)) return;
    setLoadingAction(`revoke-${item.uuid}`);
    try {
      const response = await kioskoDeviceService.revokeKiosco(item.uuid);
      showToast("success", response.data?.message || "Kiosko revocado");
      refreshKioscos();
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo revocar el kiosko");
    } finally {
      setLoadingAction(null);
    }
  }, [refreshKioscos]);

  return {
    search,
    page,
    setPage,
    modalOpen,
    selectedUuid,
    loadingAction,
    lista,
    meta,
    isLoading,
    openCreate,
    openEdit,
    closeModal,
    handleSearch,
    copyActivationLink,
    toggleActive,
    revokeKiosco,
  };
}
