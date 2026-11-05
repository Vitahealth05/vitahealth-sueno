/**
 * @file Utilidades de fechas y horas. Todas trabajan con la fecha local del dispositivo:
 * toISOString() usa UTC y en Colombia cambiaría de día a partir de las 7:00 p. m.
 */

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const MINUTOS_DIA = 1440;

/**
 * Convierte AAAA-MM-DD en Date local.
 * @param {string} iso
 * @returns {Date}
 */
export function deIso(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/**
 * Convierte un Date en AAAA-MM-DD según la hora local.
 * @param {Date} fecha
 * @returns {string}
 */
export function aIso(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** @returns {string} La fecha de hoy en AAAA-MM-DD. */
export function hoyIso() {
  return aIso(new Date());
}

/**
 * Suma (o resta) días a una fecha.
 * @param {string} iso
 * @param {number} dias
 * @returns {string}
 */
export function sumarDias(iso, dias) {
  const fecha = deIso(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aIso(fecha);
}

/**
 * Comprueba que el texto sea una fecha real (rechaza, por ejemplo, 2026-02-31).
 * @param {unknown} iso
 * @returns {boolean}
 */
export function esFechaValida(iso) {
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && aIso(deIso(iso)) === iso;
}

/** @param {string} iso @returns {string} Día abreviado, por ejemplo "lun". */
export function diaCorto(iso) {
  return DIAS_CORTOS[deIso(iso).getDay()];
}

/** @param {string} iso @returns {string} Por ejemplo "martes 3 nov". */
export function fechaLarga(iso) {
  const fecha = deIso(iso);
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
}

/**
 * Convierte HH:MM en minutos desde la medianoche.
 * @param {unknown} hora
 * @returns {number|null} null si el formato no es válido.
 */
export function horaAMinutos(hora) {
  if (typeof hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return null;
  }
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Convierte minutos desde la medianoche en HH:MM.
 * @param {number} minutos Se normaliza al rango de un día.
 * @returns {string}
 */
export function minutosAHora(minutos) {
  const normalizado = ((minutos % MINUTOS_DIA) + MINUTOS_DIA) % MINUTOS_DIA;
  const horas = String(Math.floor(normalizado / 60)).padStart(2, '0');
  return `${horas}:${String(normalizado % 60).padStart(2, '0')}`;
}

/**
 * Da formato a una duración.
 * @param {number} minutos
 * @returns {string} Por ejemplo "7 h 45 min", "8 h" o "30 min".
 */
export function duracionTexto(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) {
    return `${resto} min`;
  }
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
