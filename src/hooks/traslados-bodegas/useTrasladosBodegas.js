import { useState, useEffect } from 'react';
import { trasladosBodegaApi } from '../../services/trasladosBodegaService';
import { showToast } from '../../helpers/utils/showToast';

export function useTrasladosBodega() {
  const [data, setData] = useState([]);
  const [traslado, setTraslado] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: ''
  });

  /* =========================
     FETCH
  ========================== */
  const fetchTraslados = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await trasladosBodegaApi.getAll(filters);

      const paginated = res.data.data;

      setData(paginated.data);
      setPagination({
        current_page: paginated.current_page,
        last_page: paginated.last_page,
        per_page: paginated.per_page,
        total: paginated.total,
        links: paginated.links,
      });
    } catch (err) {
      console.error(err);
      setError('Error al cargar traslados');
      showToast('error', 'No se pudieron cargar los traslados');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     OBTENER POR ID
  ========================== */
const getTrasladoById = async (id) => {
  setLoading(true);
  setError(null);

  try {
    const res = await trasladosBodegaApi.getById(id);
   // console.log("Detalle del traslado:", res.data.data);
    setTraslado(res.data.data ?? res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    setError('Error al cargar traslado');
    showToast('error', 'No se pudo cargar el traslado');
    throw err;
  } finally {
    setLoading(false);
  }
};


  /* =========================
     CREAR
  ========================== */
  const crearTraslado = async (payload) => {
    setLoading(true);

    try {
      const res = await trasladosBodegaApi.create(payload);
      showToast('success', 'Traslado creado correctamente');
      fetchTraslados();
      return res.data;
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ?? 'Error al crear traslado'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };



  /* =========================
     APROBAR BODEGA
  ========================== */
  const aprobarPorBodega = async (id, aprueba, motivo = null) => {
    setLoading(true);

    try {
      await trasladosBodegaApi.aprobarBodega(id, aprueba, motivo);
      showToast(
        'success',
        aprueba
          ? 'Traslado aprobado por bodega'
          : 'Traslado rechazado'
      );
      fetchTraslados();
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ?? 'Error en aprobación'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     APROBAR INVENTARIO
  ========================== */
  const aprobarInventario = async (id) => {
    setLoading(true);

    try {
      await trasladosBodegaApi.aprobarInventario(id);
      showToast('success', 'Traslado aprobado por inventario');
      fetchTraslados();
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ??
          'No tiene permisos o stock insuficiente'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };


  /*====================
     ACTUALIZAR
  ========================== */
  const actualizarTraslado = async (id, payload) => {
    setLoading(true);

    try {
      const res = await trasladosBodegaApi.update(id, payload);
      showToast('success', 'Traslado actualizado correctamente');
      fetchTraslados();
      return res.data;
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ?? 'Error al actualizar traslado'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const getByEstado = (estado) =>
    data.filter(t => t.estado === estado);




  /* =========================
     EFFECT
  ========================== */
  useEffect(() => {
    fetchTraslados();
  }, [filters]);

  return {
    data,
    pagination,
    loading,
    error,
    traslado,
    getTrasladoById,
    actualizarTraslado,

    filters,
    setFilters,

    fetchTraslados,
    crearTraslado,
    aprobarPorBodega,
    aprobarInventario,

    getByEstado,
  };
}
