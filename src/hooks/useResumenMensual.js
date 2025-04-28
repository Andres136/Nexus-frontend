import { useState, useEffect } from 'react';
import clienteAxios from '../config/axios';

export default function useResumenMensual(filtros) {
  const [resumen, setResumen] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

useEffect(() => {
    const obtenerDatos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const response = await clienteAxios.get('/api/tareas-resumen-mensual', { params: filtros, ...config });
            console.log('RESPUESTA COMPLETA:', response);

            const formateado = response.data.resumen.map((item) => ({
              mes: meses[item.mes - 1],
              pendientes: item.pendientes,
              completadas: item.completadas,
              total: item.total
            }));

            setResumen(formateado);
            setUsuarios(response.data.usuarios);
            setDepartamentos(response.data.departamentos);
            setError(null);
        } catch (err) {
            setError('No se pudo cargar el resumen');
            setResumen([]);
            setUsuarios([]);
            setDepartamentos([]);
        } finally {
            setCargando(false);
        }
    };

    obtenerDatos();
}, [filtros]);

  return { resumen, usuarios, departamentos, cargando, error };
}
