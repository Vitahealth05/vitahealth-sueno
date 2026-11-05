/**
 * @file Pruebas unitarias del modelo de sueño, las estadísticas y el repositorio.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularRacha, filtrarPorFechas, resumirSemana, ultimosSieteDias } from '../src/modelo/estadisticas.js';
import { calcularDuracion, crearRegistro, validarMeta, validarRegistro } from '../src/modelo/sueno.js';
import { RepositorioSueno } from '../src/servicios/repositorioSueno.js';
import { duracionTexto, esFechaValida, minutosAHora, sumarDias } from '../src/utilidades/fechas.js';

const HOY = '2026-11-04';
const VALIDOS = { fecha: HOY, horaAcostarse: '22:30', horaLevantarse: '06:30', calidad: 4, nota: '' };
const noche = (fecha, duracionMinutos, calidad = 4) => ({ id: fecha, fecha, duracionMinutos, calidad });

test('calcula la duración cuando la noche cruza la medianoche', () => {
  assert.equal(calcularDuracion('22:30', '06:30'), 480);
});

test('calcula la duración cuando se acuesta después de medianoche', () => {
  assert.equal(calcularDuracion('00:10', '06:30'), 380);
});

test('devuelve null si una hora no es válida', () => {
  assert.equal(calcularDuracion('25:00', '06:30'), null);
  assert.equal(calcularDuracion('', '06:30'), null);
});

test('acepta un registro válido', () => {
  assert.deepEqual(validarRegistro(VALIDOS, { hoy: HOY }), {});
});

test('rechaza fechas futuras e inexistentes', () => {
  assert.ok(validarRegistro({ ...VALIDOS, fecha: '2026-11-05' }, { hoy: HOY }).fecha);
  assert.ok(validarRegistro({ ...VALIDOS, fecha: '2026-02-31' }, { hoy: HOY }).fecha);
});

test('rechaza una segunda noche en la misma fecha, salvo al editarla', () => {
  const registros = [{ id: 'a', fecha: HOY }];
  assert.ok(validarRegistro(VALIDOS, { registros, hoy: HOY }).fecha);
  assert.equal(validarRegistro(VALIDOS, { registros, hoy: HOY, idEdicion: 'a' }).fecha, undefined);
});

test('rechaza horas iguales y duraciones fuera de rango', () => {
  assert.ok(validarRegistro({ ...VALIDOS, horaLevantarse: '22:30' }, { hoy: HOY }).horas);
  assert.ok(validarRegistro({ ...VALIDOS, horaAcostarse: '06:00', horaLevantarse: '23:00' }, { hoy: HOY }).horas);
});

test('exige la calidad y limita la nota', () => {
  assert.ok(validarRegistro({ ...VALIDOS, calidad: null }, { hoy: HOY }).calidad);
  assert.ok(validarRegistro({ ...VALIDOS, nota: 'x'.repeat(201) }, { hoy: HOY }).nota);
});

test('crea el registro con la duración calculada y la nota recortada', () => {
  const registro = crearRegistro({ ...VALIDOS, nota: '  hola ' }, 'id-1');
  assert.equal(registro.duracionMinutos, 480);
  assert.equal(registro.nota, 'hola');
});

test('valida el rango de la meta', () => {
  assert.equal(validarMeta(480), null);
  assert.ok(validarMeta(180));
  assert.ok(validarMeta(780));
  assert.ok(validarMeta(Number.NaN));
});

test('arma siete días terminando hoy y deja null los días sin registro', () => {
  const semana = ultimosSieteDias([noche(HOY, 480)], HOY);
  assert.equal(semana.length, 7);
  assert.equal(semana[0].fecha, '2026-10-29');
  assert.equal(semana[6].minutos, 480);
  assert.equal(semana[0].minutos, null);
});

test('la racha cuenta desde ayer si hoy aún no hay registro y se corta al fallar', () => {
  const registros = [noche('2026-11-03', 480), noche('2026-11-02', 500), noche('2026-11-01', 300)];
  assert.equal(calcularRacha(registros, 480, HOY), 2);
});

test('la racha es cero si la última noche no cumplió la meta', () => {
  assert.equal(calcularRacha([noche(HOY, 300), noche('2026-11-03', 480)], 480, HOY), 0);
});

test('resume solo los últimos siete días', () => {
  const registros = [noche(HOY, 480, 5), noche('2026-11-03', 420, 3), noche('2026-10-20', 60, 1)];
  const resumen = resumirSemana(registros, 480, HOY);
  assert.equal(resumen.noches, 2);
  assert.equal(resumen.promedioMinutos, 450);
  assert.equal(resumen.nochesConMeta, 1);
  assert.equal(resumen.calidadPromedio, 4);
});

test('el resumen sin registros no divide entre cero', () => {
  const resumen = resumirSemana([], 480, HOY);
  assert.equal(resumen.promedioMinutos, null);
  assert.equal(resumen.calidadPromedio, null);
});

test('filtra incluyendo los extremos y ordena de reciente a antiguo', () => {
  const registros = [noche('2026-11-01', 1), noche('2026-11-03', 1), noche('2026-11-05', 1)];
  const fechas = filtrarPorFechas(registros, '2026-11-01', '2026-11-03').map((registro) => registro.fecha);
  assert.deepEqual(fechas, ['2026-11-03', '2026-11-01']);
});

test('las fechas cruzan fin de mes y año, y se rechazan fechas imposibles', () => {
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(esFechaValida('2026-13-01'), false);
});

test('da formato a horas y duraciones', () => {
  assert.equal(minutosAHora(1435), '23:55');
  assert.equal(minutosAHora(-5), '23:55');
  assert.equal(duracionTexto(465), '7 h 45 min');
  assert.equal(duracionTexto(480), '8 h');
  assert.equal(duracionTexto(30), '30 min');
});

test('el repositorio guarda y vuelve a leer', () => {
  const memoria = new Map();
  const almacen = { getItem: (c) => memoria.get(c) ?? null, setItem: (c, v) => memoria.set(c, v) };
  const repositorio = new RepositorioSueno(almacen);
  assert.equal(repositorio.guardar({ registros: [noche(HOY, 480)], metaMinutos: 450 }), true);
  const leidos = repositorio.leer();
  assert.equal(leidos.metaMinutos, 450);
  assert.equal(leidos.registros.length, 1);
});

test('el repositorio informa datos dañados y fallos al guardar', () => {
  const repositorio = new RepositorioSueno({
    getItem: () => '{dañado',
    setItem: () => {
      throw new Error('lleno');
    },
  });
  assert.equal(repositorio.leer().fallo, true);
  assert.equal(repositorio.guardar({ registros: [], metaMinutos: 480 }), false);
});
