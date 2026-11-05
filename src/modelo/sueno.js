/**
 * @file Modelo de dominio "RegistroSueno". Sigue la forma de las entidades de VitaHealth
 * (Hidratacion, RegistroActividad): un registro por fecha con sus validaciones de dominio.
 * No depende de React ni del navegador, por eso se prueba con node:test.
 */

import { esFechaValida, horaAMinutos, MINUTOS_DIA } from '../utilidades/fechas.js';

/** Escala de calidad percibida del descanso. */
export const CALIDADES = Object.freeze([
  { valor: 1, texto: 'Muy mala' },
  { valor: 2, texto: 'Mala' },
  { valor: 3, texto: 'Regular' },
  { valor: 4, texto: 'Buena' },
  { valor: 5, texto: 'Excelente' },
]);

export const MIN_DURACION = 30;
export const MAX_DURACION = 16 * 60;
export const MAX_NOTA = 200;
export const META_PREDETERMINADA = 8 * 60;
export const MIN_META = 4 * 60;
export const MAX_META = 12 * 60;

/**
 * Calcula cuánto duró el sueño. Si la hora de levantarse es menor, la noche cruzó la medianoche.
 * @param {string} horaAcostarse HH:MM
 * @param {string} horaLevantarse HH:MM
 * @returns {number|null} Minutos dormidos; null si alguna hora no es válida.
 */
export function calcularDuracion(horaAcostarse, horaLevantarse) {
  const inicio = horaAMinutos(horaAcostarse);
  const fin = horaAMinutos(horaLevantarse);
  if (inicio === null || fin === null) {
    return null;
  }
  return (fin - inicio + MINUTOS_DIA) % MINUTOS_DIA;
}

/**
 * Devuelve el texto de una calidad.
 * @param {number} valor
 * @returns {string}
 */
export function textoCalidad(valor) {
  return CALIDADES.find((calidad) => calidad.valor === valor)?.texto ?? 'Sin dato';
}

/**
 * Valida los datos del formulario.
 * @param {{fecha: string, horaAcostarse: string, horaLevantarse: string, calidad: number|null, nota?: string}} datos
 * @param {{registros?: Array<{id: string, fecha: string}>, hoy: string, idEdicion?: string}} contexto
 * @returns {Record<string, string>} Mensaje de error por campo; vacío si todo es válido.
 */
export function validarRegistro(datos, { registros = [], hoy, idEdicion }) {
  const errores = {};

  if (!esFechaValida(datos.fecha)) {
    errores.fecha = 'Elige el día en que te levantaste.';
  } else if (datos.fecha > hoy) {
    errores.fecha = 'La fecha no puede ser futura.';
  } else if (registros.some((registro) => registro.fecha === datos.fecha && registro.id !== idEdicion)) {
    errores.fecha = 'Ya registraste esa fecha. Edítala desde el historial.';
  }

  const duracion = calcularDuracion(datos.horaAcostarse, datos.horaLevantarse);
  if (duracion === null) {
    errores.horas = 'Escribe la hora de acostarte y la de levantarte.';
  } else if (duracion < MIN_DURACION) {
    errores.horas = `El sueño debe durar al menos ${MIN_DURACION} minutos.`;
  } else if (duracion > MAX_DURACION) {
    errores.horas = 'El sueño no puede durar más de 16 horas. Revisa las dos horas.';
  }

  if (!CALIDADES.some((calidad) => calidad.valor === datos.calidad)) {
    errores.calidad = 'Elige cómo descansaste.';
  }

  if ((datos.nota ?? '').length > MAX_NOTA) {
    errores.nota = `La nota no puede superar ${MAX_NOTA} caracteres.`;
  }

  return errores;
}

/**
 * Valida la meta diaria de sueño.
 * @param {number} minutos
 * @returns {string|null} Mensaje de error; null si es válida.
 */
export function validarMeta(minutos) {
  if (!Number.isFinite(minutos) || minutos < MIN_META || minutos > MAX_META) {
    return 'La meta debe estar entre 4 y 12 horas.';
  }
  return null;
}

/**
 * Construye la entidad que se guarda, con la duración ya calculada.
 * @param {{fecha: string, horaAcostarse: string, horaLevantarse: string, calidad: number, nota?: string}} datos
 * @param {string} id
 * @returns {object}
 */
export function crearRegistro(datos, id) {
  return {
    id,
    fecha: datos.fecha,
    horaAcostarse: datos.horaAcostarse,
    horaLevantarse: datos.horaLevantarse,
    duracionMinutos: calcularDuracion(datos.horaAcostarse, datos.horaLevantarse),
    calidad: datos.calidad,
    nota: (datos.nota ?? '').trim(),
  };
}
