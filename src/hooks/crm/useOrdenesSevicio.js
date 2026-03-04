import { useQuery } from "@tanstack/react-query"
import { ordenesServicioApi } from "../../services/api"


export const useOrdenesServicio = (filtros = {}) => {

  const obtenerOrdenes = async () => {

    const response = await ordenesServicioApi.getAll(filtros)

    return response.data.data
  }

  const query = useQuery({
    queryKey: ["ordenes-servicio", filtros],
    queryFn: obtenerOrdenes,
    keepPreviousData: true,
  })
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    fontSize: '13px',
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': { borderColor: '#3b82f6' }
  }),
  menu: (base) => ({ ...base, zIndex: 50, fontSize: '13px' }),
  placeholder: (base) => ({ ...base, color: '#9ca3af' })
}

const estadoConfig = {
  pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completada: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  en_proceso: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' }
}


  return {
    ordenes: query.data?.data || [],
    pagination: query.data,
    loading: query.isLoading,
    refetch: query.refetch,
    selectStyles,
    estadoConfig
  }
}