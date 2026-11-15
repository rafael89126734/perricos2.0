import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Receipt, DollarSign, Package, Percent } from 'lucide-react';
import { api, fmtMXN } from '../../api.js';

const COLORES = ['#18271F', '#879276', '#D99A9B', '#E4C98A', '#5B7A68', '#C9858A'];

const PERIODOS = [
  { id: 'dia', label: 'Por día' },
  { id: 'semana', label: 'Por semana' },
  { id: 'mes', label: 'Por mes' },
  { id: 'anio', label: 'Por año' },
];

function TooltipGrafica({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bosque)] text-[var(--marfil)] rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }}>
          {p.name}: {p.dataKey === 'ingresos' ? fmtMXN(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function KpiCard({ icon, label, valor, sub, color }) {
  return (
    <div className="card p-6 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[var(--tinta-suave)]">{label}</p>
          <p className="font-display text-3xl mt-2" style={{ color: color || 'var(--bosque)' }}>{valor}</p>
          {sub && <p className="text-xs text-[var(--tinta-suave)] mt-1">{sub}</p>}
        </div>
        <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: (color || '#18271F') + '1A', color: color || 'var(--bosque)' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnaliticasTab({ modo = 'completo' }) {
  const [periodo, setPeriodo] = useState('mes');
  const [serie, setSerie] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [inventario, setInventario] = useState(null);
  const [margen, setMargen] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [s, r, inv, mg] = await Promise.all([
        api.getSerie(periodo),
        api.getResumen(),
        api.getInventario(),
        api.getMargen(),
      ]);
      setSerie(s.data || []);
      setResumen(r);
      setInventario(inv);
      setMargen(mg);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => { cargar(); }, [cargar]);

  // Datos para gráfico de pastel (top productos)
  const pastel = (resumen?.top_productos || []).slice(0, 6).map((p) => ({
    name: p.nombre_producto.length > 22 ? p.nombre_producto.slice(0, 22) + '…' : p.nombre_producto,
    value: Number(p.ingresos),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">
            {modo === 'resumen' ? 'Resumen general' : 'Analíticas de ventas'}
          </h2>
          <p className="text-sm text-[var(--tinta-suave)]">Ventas agrupadas por periodo</p>
        </div>

        {/* Selector de periodo: día / semana / mes / año */}
        <div className="flex gap-1.5 bg-white border border-[#DDD5C4] p-1.5 rounded-full shadow-sm">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.12em] font-bold transition-all ${
                periodo === p.id ? 'bg-[var(--bosque)] text-[var(--marfil)]' : 'text-[var(--tinta-suave)] hover:bg-[var(--marfil-2)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign size={20} />} label="Ingresos totales" valor={fmtMXN(resumen?.ingresos)} color="#18271F" />
        <KpiCard icon={<Receipt size={20} />} label="Ventas" valor={resumen?.total_ventas ?? 0} sub={`${resumen?.unidades ?? 0} unidades`} color="#879276" />
        <KpiCard icon={<TrendingUp size={20} />} label="Ticket promedio" valor={fmtMXN(resumen?.ticket_promedio)} color="#D99A9B" />
        <KpiCard icon={<Percent size={20} />} label="Margen estimado" valor={`${margen?.margen_pct ?? 0}%`} sub={fmtMXN(margen?.utilidad)} color="#B08A3E" />
      </div>

      {/* Inventario rápido */}
      {inventario && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={<Package size={20} />} label="Productos activos" valor={inventario.total_productos} />
          <KpiCard icon={<Package size={20} />} label="Agotados" valor={inventario.agotados} color="#C0392B" />
          <KpiCard icon={<Package size={20} />} label="Bajo stock (≤10)" valor={inventario.bajo_stock} color="#B08A3E" />
          <KpiCard icon={<DollarSign size={20} />} label="Valor en tienda (venta)" valor={fmtMXN(inventario.valor_venta)} />
        </div>
      )}

      {/* Gráfica principal de ingresos por periodo */}
      <div className="card p-6 md:p-8 bg-white">
        <h3 className="font-display text-xl text-[var(--bosque)] mb-1">
          Ingresos {PERIODOS.find((p) => p.id === periodo)?.label.toLowerCase()}
        </h3>
        <p className="text-xs text-[var(--tinta-suave)] mb-6">Serie histórica agrupada por {PERIODOS.find((p) => p.id === periodo)?.label.toLowerCase()}</p>

        {cargando ? (
          <p className="text-center py-16 text-[var(--tinta-suave)]">Cargando gráfica…</p>
        ) : serie.length === 0 ? (
          <p className="text-center py-16 text-[var(--tinta-suave)]">Aún no hay ventas registradas. Registra ventas en la pestaña Ventas.</p>
        ) : (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18271F" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#18271F" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1D5" vertical={false} />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: '#6B6A60' }} axisLine={{ stroke: '#E7E1D5' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6A60' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)} />
                <Tooltip content={<TooltipGrafica />} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#18271F" strokeWidth={2.5}
                  fill="url(#gradIng)" dot={{ r: 3, fill: '#18271F' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Dos columnas: barras de ventas + pastel top productos */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="card p-6 md:p-8 bg-white lg:col-span-3">
          <h3 className="font-display text-xl text-[var(--bosque)] mb-6">Número de ventas por periodo</h3>
          {serie.length === 0 ? (
            <p className="text-center py-14 text-[var(--tinta-suave)]">Sin datos aún.</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E1D5" vertical={false} />
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: '#6B6A60' }} axisLine={{ stroke: '#E7E1D5' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6A60' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipGrafica />} />
                  <Bar dataKey="ventas" name="Ventas" fill="#879276" radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-6 md:p-8 bg-white lg:col-span-2">
          <h3 className="font-display text-xl text-[var(--bosque)] mb-6">Top productos (ingresos)</h3>
          {pastel.length === 0 ? (
            <p className="text-center py-14 text-[var(--tinta-suave)]">Sin datos aún.</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pastel} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {pastel.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                  </Pie>
                  <Tooltip content={<TooltipGrafica />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tabla top productos */}
      {resumen?.top_productos?.length > 0 && (
        <div className="card bg-white overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F0EBE0]">
            <h3 className="font-display text-xl text-[var(--bosque)]">Productos más vendidos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-[var(--marfil-2)] text-left text-[11px] uppercase tracking-[0.14em] text-[var(--tinta-suave)]">
                  <th className="px-6 py-3.5 font-bold">Producto</th>
                  <th className="px-6 py-3.5 font-bold">Ventas</th>
                  <th className="px-6 py-3.5 font-bold">Unidades</th>
                  <th className="px-6 py-3.5 font-bold">Ingresos</th>
                  <th className="px-6 py-3.5 font-bold w-40">Participación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE0]">
                {resumen.top_productos.map((p, i) => {
                  const pct = resumen.ingresos > 0 ? (p.ingresos / resumen.ingresos) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-[var(--marfil)]/60">
                      <td className="px-6 py-3.5 font-semibold text-[var(--bosque)]">{p.nombre_producto}</td>
                      <td className="px-6 py-3.5">{p.ventas}</td>
                      <td className="px-6 py-3.5">{Number(p.unidades)}</td>
                      <td className="px-6 py-3.5 font-semibold">{fmtMXN(p.ingresos)}</td>
                      <td className="px-6 py-3.5">
                        <div className="w-full bg-[var(--marfil-2)] h-2.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--salvia)]" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
