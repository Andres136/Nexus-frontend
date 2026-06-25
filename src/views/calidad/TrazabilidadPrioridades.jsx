import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPrioridadesVsm } from '../../hooks/calidad/useGetPrioridadesVsm';
import { useSedes } from '../../hooks/useSedes';
import { gestionOperativaService } from '../../services/calidaService';
import { showToast } from '../../helpers/utils/showToast';
import NexusLoader from '../../components/NexusLoader';

function PctBar({ valor }) {
  const clamped = Math.min(valor, 100);
  const color = valor >= 100 ? 'bg-green-500' : valor > 0 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${clamped}%` }} />
      </div>
      <span className={`text-[10px] font-bold w-9 text-right ${valor >= 100 ? 'text-green-600' : valor > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
        {valor}%
      </span>
    </div>
  );
}

export default function TrazabilidadPrioridades() {
  const navigate = useNavigate();
  const { sedes } = useSedes();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [pagina, setPagina] = useState(1);

  const { data, isLoading, refetch } = useGetPrioridadesVsm({
    sede_id: sedeId || undefined,
    solo_pendientes: soloPendientes ? 1 : undefined,
    search: search || undefined,
    page: pagina,
    per_page: 25,
  });

  const paginado    = data?.data     || [];
  const totalPaginas = data?.last_page ?? 1;
  const stats        = data?.stats    ?? { total: 0, pendientes: 0, completas: 0, kg_pendiente: 0 };

  const aplicarBusqueda = () => {
    setSearch(searchInput.trim());
    setPagina(1);
  };

  const descargar = async () => {
    try {
      const response = await gestionOperativaService.getPrioridadesActivas({
        sede_id: sedeId || undefined,
        solo_pendientes: soloPendientes ? 1 : undefined,
        search: search || undefined,
        per_page: 9999,
        page: 1,
      });
      const items = response.data.data;
      if (!items?.length) { showToast('error', 'No hay datos para descargar'); return; }

      const headers = ['OC', 'Cliente', 'OT', 'Sede', 'Fecha Entrega', 'Código', 'Producto',
        'Prioridad kg', 'Recibido kg', 'Pendiente kg', '% Cumpl.', 'Estado', 'OC Proveedor', 'Proveedor'];
      const filas = items.map(p => [
        p.oc_numero || `OC-${p.oc_id}`,
        p.cliente || '',
        p.orden_trabajo_id || '',
        p.sede || '',
        p.oc_fecha_entrega || '',
        p.codigo_producto || '',
        p.producto || '',
        p.cantidad_prioridad,
        p.cantidad_recibida,
        p.pendiente,
        `${p.pct_cumplimiento}%`,
        p.completa ? 'Completa' : 'Pendiente',
        p.oc_proveedor_numero || '',
        p.proveedor || '',
      ]);

      const csv = [headers, ...filas]
        .map(fila => fila.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trazabilidad-prioridades-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      showToast('error', 'Error al descargar');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Cabecera */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/auth/crm/control-operativo/dashboard')}
            className="mb-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver al dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Trazabilidad de Prioridades</h1>
          <p className="text-sm text-gray-500">Seguimiento de prioridades de compra registradas en sistema</p>
        </div>
        <button
          type="button"
          onClick={descargar}
          className="shrink-0 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
        >
          Descargar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Total</p>
        </div>
        <div className="rounded-xl bg-white border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{stats.pendientes}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Pendientes</p>
        </div>
        <div className="rounded-xl bg-white border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completas}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Completas</p>
        </div>
        <div className="rounded-xl bg-white border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">{Number(stats.kg_pendiente).toFixed(1)}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase mt-1">kg pendientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-white border p-4 shadow-sm">
        {/* Buscar producto */}
        <div className="flex flex-col gap-1 w-64">
          <label className="text-xs font-semibold text-gray-500">Buscar producto</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') aplicarBusqueda(); }}
              placeholder="Nombre o código..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={aplicarBusqueda}
              className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Sede */}
        <div className="flex flex-col gap-1 w-44">
          <label className="text-xs font-semibold text-gray-500">Sede</label>
          <select
            value={sedeId}
            onChange={e => { setSedeId(e.target.value); setPagina(1); }}
            className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todas</option>
            {sedes?.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        {/* Solo pendientes */}
        <div className="flex flex-col gap-1 justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={e => { setSoloPendientes(e.target.checked); setPagina(1); }}
              className="w-4 h-4 rounded accent-purple-600"
            />
            <span className="text-sm font-medium text-gray-700">Solo pendientes</span>
          </label>
        </div>

        {/* Refrescar */}
        <div className="flex flex-col gap-1 justify-end ml-auto">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="py-20 text-center"><NexusLoader /></div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">OC</th>
                  <th className="px-3 py-3 text-left font-semibold">OT</th>
                  <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-3 py-3 text-left font-semibold">Sede</th>
                  <th className="px-3 py-3 text-left font-semibold">F. Entrega</th>
                  <th className="px-3 py-3 text-left font-semibold">Código</th>
                  <th className="px-3 py-3 text-left font-semibold">Producto</th>
                  <th className="px-3 py-3 text-right font-semibold">Prioridad kg</th>
                  <th className="px-3 py-3 text-right font-semibold">Recibido kg</th>
                  <th className="px-3 py-3 text-right font-semibold">Pendiente kg</th>
                  <th className="px-3 py-3 font-semibold w-32">Cumplimiento</th>
                  <th className="px-3 py-3 text-left font-semibold">OC Proveedor</th>
                  <th className="px-3 py-3 text-left font-semibold">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginado.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-gray-400 text-sm">
                      {search ? `Sin resultados para "${search}"` : 'No hay prioridades registradas'}
                    </td>
                  </tr>
                ) : paginado.map(p => (
                  <tr key={p.origen_id} className={`hover:bg-gray-50 transition-colors ${p.completa ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                      {p.oc_numero || `OC-${p.oc_id}`}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {p.orden_trabajo_id ? `#${p.orden_trabajo_id}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 max-w-[130px] truncate">{p.cliente || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{p.sede || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{p.oc_fecha_entrega || '—'}</td>
                    <td className="px-3 py-2 font-mono text-gray-500">{p.codigo_producto || '—'}</td>
                    <td className="px-3 py-2 text-gray-800 max-w-[160px] truncate font-medium">{p.producto || '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-700">
                      {Number(p.cantidad_prioridad).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-green-700 font-semibold">
                      {Number(p.cantidad_recibida).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-red-500 font-semibold">
                      {Number(p.pendiente).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 w-32">
                      <PctBar valor={p.pct_cumplimiento} />
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {p.oc_proveedor_numero || '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-500 max-w-[120px] truncate">{p.proveedor || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50">
              <p className="text-xs text-gray-500">
                Página {data?.current_page ?? 1} de {totalPaginas} — {data?.total ?? 0} registros
              </p>
              <div className="flex gap-1">
                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}
                  className="rounded border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== n - 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, idx) => n === '...'
                    ? <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
                    : (
                      <button
                        key={n}
                        onClick={() => setPagina(n)}
                        className={`rounded border px-3 py-1.5 text-xs font-medium ${pagina === n ? 'bg-purple-600 text-white border-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {n}
                      </button>
                    )
                  )
                }
                <button
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(p => p + 1)}
                  className="rounded border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
