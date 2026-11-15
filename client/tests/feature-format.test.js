import test from 'node:test';
import assert from 'node:assert/strict';
import { formatOfertaFecha } from '../src/utils/offerDate.js';
import { formatCantidadComprada } from '../src/utils/purchaseFormat.js';

test('formatea fechas ISO con zona horaria de la API sin Invalid Date', () => {
  assert.equal(formatOfertaFecha('2026-11-05T06:00:00.000Z'), '5 de noviembre de 2026');
});

test('formatea fechas date-only y maneja fechas inválidas', () => {
  assert.equal(formatOfertaFecha('2026-12-31'), '31 de diciembre de 2026');
  assert.equal(formatOfertaFecha('no-es-fecha'), 'Fecha no disponible');
});

test('muestra cantidades a granel en kilos y gramos', () => {
  assert.equal(formatCantidadComprada(1500, 'gramos'), '1 kg 500 g');
  assert.equal(formatCantidadComprada(2000, 'gramos'), '2 kg');
});

test('nombra la unidad comprada y respeta singular/plural', () => {
  assert.equal(formatCantidadComprada(1, 'pieza', '', 'Alimento húmedo (sobre)'), '1 sobre');
  assert.equal(formatCantidadComprada(3, 'pieza', '', 'Alimento húmedo (sobre)'), '3 sobres');
  assert.equal(formatCantidadComprada(2, 'pieza'), '2 piezas');
});
