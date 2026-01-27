import { useEffect, useState } from "react";
import { responsabilidadesApi } from "../../services/Responsabilidades";


export function useResponsabilidades() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    per_page: 10,
    page: 1
  });

  const fetchResponsabilidades = async () => {
    setLoading(true);

    try {
      const response = await responsabilidadesApi.getAll(filters);

      setData(response.data.data);

      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsabilidades();
  }, [filters]);

  return {
    data,
    pagination,
    loading,
    filters,
    setFilters
  };
}
