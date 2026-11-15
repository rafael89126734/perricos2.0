export function formatCantidadComprada(cantidad, tipo, presentacion = '', descripcion = '') {
  const valor = Number(cantidad || 0);
  if (tipo === 'gramos') {
    const kg = Math.floor(valor / 1000);
    const g = Math.round(valor % 1000);
    if (!kg) return `${g} g`;
    return g ? `${kg} kg ${g} g` : `${kg} kg`;
  }

  const detalle = `${presentacion} ${descripcion}`.toLocaleLowerCase('es-MX');
  const unidades = [
    [/\bsobres?\b/, 'sobre', 'sobres'],
    [/\bcostales?\b/, 'costal', 'costales'],
    [/\bsacos?\b/, 'saco', 'sacos'],
    [/\bbolsas?\b/, 'bolsa', 'bolsas'],
    [/\blatas?\b/, 'lata', 'latas'],
    [/\bpaquetes?\b/, 'paquete', 'paquetes'],
  ];
  const unidad = unidades.find(([regex]) => regex.test(detalle));
  const etiqueta = unidad ? (valor === 1 ? unidad[1] : unidad[2]) : (valor === 1 ? 'pieza' : 'piezas');
  return `${valor} ${etiqueta}`;
}
