import { Router } from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

/**
 * Todos los endpoints de analíticas requieren admin.
 * `periodo` admite: dia | semana | mes | anio
 * `desde`/`hasta` opcionales en YYYY-MM-DD acotan el rango.
 */

function mapaPeriodo(periodo) {
  switch (periodo) {
    case 'dia':   return { label: 'Día',   trunc: 'day' };
    case 'semana':return { label: 'Semana',trunc: 'week' };
    case 'mes':   return { label: 'Mes',   trunc: 'month' };
    case 'anio':  return { label: 'Año',   trunc: 'year' };
    default:      return null;
  }
}

// Literal SQL seguro: el valor sale de la whitelist anterior, nunca del usuario.
const TRUNC_LITERAL = { day: "'day'", week: "'week'", month: "'month'", year: "'year'" };

router.use(verificarToken);

// GET /api/analiticas/serie?periodo=mes&desde=&hasta=
//   → serie temporal de ingresos y ventas agrupada por el periodo
router.get('/serie', async (req, res) => {
  try {
    const m = mapaPeriodo(req.query.periodo);
    if (!m) return res.status(400).json({ error: 'periodo inválido (dia|semana|mes|anio)' });
    const params = [];
    let rango = '';
    if (req.query.desde) { params.push(req.query.desde); rango += ` AND fecha::date >= $${params.length}`; }
    if (req.query.hasta) { params.push(req.query.hasta); rango += ` AND fecha::date <= $${params.length}`; }

    // `trunc` sale de una whitelist (dia|semana|mes|anio), nunca del usuario → literal seguro.
    const { rows } = await query(
      `SELECT date_trunc(${TRUNC_LITERAL[m.trunc]}, fecha) AS bucket,
              COUNT(*)::int AS ventas,
              COALESCE(SUM(total),0)::numeric AS ingresos
       FROM ventas WHERE true ${rango}
       GROUP BY 1 ORDER BY 1`,
      params
    );
    const data = rows.map(r => ({
      bucket: r.bucket,
      etiqueta: etiquetar(r.bucket, m.trunc),
      ventas: r.ventas,
      ingresos: Number(r.ingresos),
    }));
    res.json({ periodo: m.label, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/analiticas/resumen?desde=&hasta=
//   → KPIs globales del rango (o de todo el historial si no hay rango)
router.get('/resumen', async (req, res) => {
  try {
    const params = [];
    let rango = '';
    if (req.query.desde) { params.push(req.query.desde); rango += ` AND fecha::date >= $${params.length}`; }
    if (req.query.hasta) { params.push(req.query.hasta); rango += ` AND fecha::date <= $${params.length}`; }

    const kpi = (await query(
      `SELECT COUNT(*)::int AS total_ventas,
              COALESCE(SUM(total),0)::numeric AS ingresos,
              COALESCE(SUM(cantidad),0)::numeric AS unidades,
              COALESCE(AVG(total),0)::numeric AS ticket_promedio
       FROM ventas WHERE true ${rango}`,
      params
    )).rows[0];

    const porDia = (await query(
      `SELECT to_char(fecha, 'YYYY-MM-DD') AS dia,
              COUNT(*)::int AS ventas,
              COALESCE(SUM(total),0)::numeric AS ingresos
       FROM ventas WHERE true ${rango}
       GROUP BY 1 ORDER BY 1 DESC LIMIT 14`,
      params
    )).rows;

    const topProductos = (await query(
      `SELECT nombre_producto,
              COUNT(*)::int AS ventas,
              SUM(cantidad)::numeric AS unidades,
              COALESCE(SUM(total),0)::numeric AS ingresos
       FROM ventas WHERE true ${rango}
       GROUP BY 1 ORDER BY ingresos DESC LIMIT 10`,
      params
    )).rows;

    res.json({
      total_ventas: kpi.total_ventas,
      ingresos: Number(kpi.ingresos),
      unidades: Number(kpi.unidades),
      ticket_promedio: Number(kpi.ticket_promedio),
      por_dia: porDia.map(r => ({ ...r, ingresos: Number(r.ingresos) })),
      top_productos: topProductos.map(r => ({ ...r, unidades: Number(r.unidades), ingresos: Number(r.ingresos) })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/analiticas/inventario
//   → estado del stock: valor en tienda, productos agotados, bajo stock
router.get('/inventario', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total_productos,
              COUNT(*) FILTER (WHERE stock <= 0)::int AS agotados,
              COUNT(*) FILTER (WHERE stock > 0 AND stock <= 10)::int AS bajo_stock,
              COALESCE(SUM(COALESCE(costo,0)::numeric * stock),0)::numeric AS valor_tienda,
              COALESCE(SUM(COALESCE(precio,0)::numeric * stock),0)::numeric AS valor_venta
       FROM productos WHERE activo`
    );
    const r = rows[0];
    res.json({
      total_productos: r.total_productos,
      agotados: r.agotados,
      bajo_stock: r.bajo_stock,
      valor_tienda: Number(r.valor_tienda),
      valor_venta: Number(r.valor_venta),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/analiticas/margen?desde=&hasta=
//   → ingresos vs costo de lo vendido (utilidad estimada por periodo)
router.get('/margen', async (req, res) => {
  try {
    const params = [];
    let rango = '';
    if (req.query.periodo) {
      const m = mapaPeriodo(req.query.periodo);
      if (!m) return res.status(400).json({ error: 'periodo inválido' });
    }
    if (req.query.desde) { params.push(req.query.desde); rango += ` AND v.fecha::date >= $${params.length}`; }
    if (req.query.hasta) { params.push(req.query.hasta); rango += ` AND v.fecha::date <= $${params.length}`; }

    const { rows } = await query(
      `SELECT COALESCE(SUM(v.total),0)::numeric AS ingresos,
              COALESCE(SUM(p.costo * v.cantidad),0)::numeric AS costo,
              COALESCE(SUM(v.total - p.costo * v.cantidad),0)::numeric AS utilidad
       FROM ventas v LEFT JOIN productos p ON p.id = v.producto_id
       WHERE true ${rango}`,
      params
    );
    const r = rows[0];
    const ingresos = Number(r.ingresos);
    const utilidad = Number(r.utilidad);
    res.json({
      ingresos,
      costo: Number(r.costo),
      utilidad,
      margen_pct: ingresos > 0 ? Number(((utilidad / ingresos) * 100).toFixed(1)) : 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper para etiquetar buckets
function etiquetar(d, trunc) {
  if (!d) return '';
  const fecha = new Date(d);
  const mes = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][fecha.getMonth()];
  if (trunc === 'year') return String(fecha.getFullYear());
  if (trunc === 'month') return `${mes} ${String(fecha.getFullYear()).slice(2)}`;
  if (trunc === 'week') {
    // Primera fecha de la semana ISO
    const w = new Date(d);
    const dia = w.toISOString().slice(0,10);
    return `Sem ${String(fecha.getFullYear())} · ${dia.slice(5)}`;
  }
  return fecha.toISOString().slice(8,10) + ' ' + mes;
}

export default router;
