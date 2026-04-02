import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { otAlistamientoService, vsmService } from "../../services/vsm";

export function useAlistamientos() {
  const [alistamiento, setAlistamiento] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otAlistamiento, setOtAlistamiento] = useState([]);

  // --------------------------------------------------------------------
  // 1️⃣ CREAR ALISTAMIENTO (permite múltiples usuarios)
  // --------------------------------------------------------------------
  const crearAlistamiento = useCallback(async (data) => {
    try {
      setLoading(true);

      /**
       * data esperado:
       * {
       *   orden_trabajo_id,
       *   producto_id,
       *   usuarios: [1,3,7],
       *   cantidad
       * }
       */

      const res = await vsmService.crearAlistamiento(data);

      setAlistamiento(res.data);
      toast.success("Alistamiento iniciado");

      return res.data;

    } catch (error) {
      console.log(error);
      toast.error("Error al crear alistamiento");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // 2️⃣ PAUSAR ALISTADOR
  // --------------------------------------------------------------------
  const pausar = useCallback(async (id, razon) => {
    try {
      setLoading(true);

      const res = await vsmService.pausarAlistamiento(id, razon);
      toast.info("Alistamiento pausado");

      // 🔥 ACTUALIZAR EL ESTADO LOCAL
      setAlistamiento((prev) =>
        prev?.id === id ? res.data : prev
      );

      return res.data;

    } catch (error) {
      console.error(error);
      toast.error("No se pudo pausar");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // 3️⃣ REANUDAR
  // --------------------------------------------------------------------
  const reanudar = useCallback(async (id) => {
    try {
      setLoading(true);

      const res = await vsmService.reanudarAlistamiento(id);
      toast.success("Alistamiento reanudado");

      // 🔥 Actualizar estado local
      setAlistamiento((prev) =>
        prev?.id === id ? res.data : prev
      );

      return res.data;

    } catch (error) {
      console.log(error);
      console.error(error);
      toast.error("No se pudo reanudar");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // 4️⃣ FINALIZAR ALISTAMIENTO
  // --------------------------------------------------------------------
  const finalizar = useCallback(async (id) => {
    try {
      setLoading(true);

      const res = await vsmService.finalizarAlistamiento(id);
 

      // 🔥 Actualizar estado local
      setAlistamiento((prev) =>
        prev?.id === id ? res.data : prev
      );

      return res.data;

    } catch (error) {
      console.error(error);
      toast.error("No se pudo finalizar");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // 5️⃣ OBTENER HISTORIAL
  // --------------------------------------------------------------------
  const obtenerHistorial = useCallback(async (id) => {
    try {
      setLoading(true);

      const res = await vsmService.obtenerHistorial(id);
      setHistorial(res.data);

      return res.data;

    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el historial");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------
  // 6️⃣ ORDENES DE TRABAJO DISPONIBLES PARA ALISTAMIENTO
  // --------------------------------------------------------------------
  const obtenerOtAlistamiento = useCallback(async () => {
    try {
      setLoading(true);

      const res = await otAlistamientoService.ordenesParaAlistamiento();
      setOtAlistamiento(res.data);

      return res.data;

    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar las órdenes de trabajo");
      throw error;

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerOtAlistamiento();
  }, [obtenerOtAlistamiento]);

  return {
    alistamiento,
    historial,
    loading,

    crearAlistamiento,
    pausar,
    reanudar,
    finalizar,
    obtenerHistorial,

    otAlistamiento,
  };
}
