/**
 * @file Cálculos del resumen semanal de sueño (RF06 Estadísticas). Funciones puras.
 */

import { diaCorto, sumarDias } from '../utilidades/fechas.js';

/**
 * Arma los últimos 7 días, de más antiguo a hoy. Los días sin registro quedan con minutos null.
 * @param {Array<{fecha: string, duracionMinutos: number}>} registros
 * @param {string} hoy
 * @returns {Array<{fecha: string, dia: string, minutos: number|null}>}
 */
export function ultimosSieteDias(registros, hoy) {
  const porFecha = new Map(registros.map((registro) => [registro.fecha, registro.duracionMinutos]));
  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = sumarDias(hoy, indice - 6);
    return { fecha, dia: diaCorto(fecha), minutos: porFecha.get(fecha) ?? null };
  });
}

/**
 * Cuenta los días seguidos que cumplieron la meta. Si hoy aún no hay registro,
 * cuenta desde ayer: la racha no se pierde antes de que termine el día.
 * @param {Array<{fecha: string, duracionMinutos: number}>} registros
 * @param {number} metaMinutos
 * @param {string} hoy
 * @returns {number}
 */
export function calcularRacha(registros, metaMinutos, hoy) {
  const porFecha = new Map(registros.map((registro) => [registro.fecha, registro.duracionMinutos]));
  let fecha = porFecha.has(hoy) ? hoy : sumarDias(hoy, -1);
  let racha = 0;
  while ((porFecha.get(fecha) ?? -1) >= metaMinutos) {
    racha += 1;
    fecha = sumarDias(fecha, -1);
  }
  return racha;
}

/**
 * Resume los últimos 7 días.
 * @param {Array<{fecha: string, duracionMinutos: number, calidad: number}>} registros
 * @param {number} metaMinutos
 * @param {string} hoy
 * @returns {{semana: Array, noches: number, promedioMinutos: number|null, nochesConMeta: number, calidadPromedio: number|null, racha: number}}
 */
export function resumirSemana(registros, metaMinutos, hoy) {
  const semana = ultimosSieteDias(registros, hoy);
  const desde = semana[0].fecha;
  const recientes = registros.filter((registro) => registro.fecha >= desde && registro.fecha <= hoy);
  const noches = recientes.length;
  const sumar = (campo) => recientes.reduce((total, registro) => total + registro[campo], 0);

  return {
    semana,
    noches,
    promedioMinutos: noches ? Math.round(sumar('duracionMinutos') / noches) : null,
    nochesConMeta: recientes.filter((registro) => registro.duracionMinutos >= metaMinutos).length,
    calidadPromedio: noches ? sumar('calidad') / noches : null,
    racha: calcularRacha(registros, metaMinutos, hoy),
  };
}

/**
 * Filtra por rango de fechas (inclusive) y ordena de la fecha más reciente a la más antigua.
 * @template {{fecha: string}} T
 * @param {T[]} registros
 * @param {string} desde
 * @param {string} hasta
 * @returns {T[]}
 */
export function filtrarPorFechas(registros, desde, hasta) {
  return registros
    .filter((registro) => (!desde || registro.fecha >= desde) && (!hasta || registro.fecha <= hasta))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}
