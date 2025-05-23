// src/hooks/useDashboardMonthly.js
import { useQuery } from "@tanstack/react-query";
import clienteAxios from "../config/axios";

const fetchDashboardMonthly = async ({ queryKey }) => {
  // queryKey = ['dashboardMonthly', month, year]
  const [, month, year] = queryKey;
  const token = localStorage.getItem("token");
  const { data } = await clienteAxios.get(
    `/api/dashboard/monthly?month=${month}&year=${year}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useDashboardMonthly = (month, year) => {
  return useQuery({
    queryKey: ["dashboardMonthly", month, year],
    queryFn: fetchDashboardMonthly,
    // refrescar si quieres cada x segundos:
    refetchInterval: 60 * 1000, 
    keepPreviousData: true,
  });
};
