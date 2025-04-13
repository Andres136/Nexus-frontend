import { useQuery } from "@tanstack/react-query";
import clienteAxios from "../config/axios";

const fetchDashboard = async () => {
  const token = localStorage.getItem("token");
  const { data } = await clienteAxios.get("/api/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30000, // refresca cada 30 segundos automáticamente
  });
};
