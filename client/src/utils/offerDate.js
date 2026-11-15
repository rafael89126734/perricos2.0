export function formatOfertaFecha(value) {
  if (value === null || value === undefined || String(value).trim() === '') return 'Fecha no disponible';
  const raw = String(value).trim();
  const datePart = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const parsed = datePart ? new Date(`${datePart}T12:00:00`) : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return 'Fecha no disponible';
  return parsed.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
