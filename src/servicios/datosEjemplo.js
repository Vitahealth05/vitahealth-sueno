/**
 * @file Noches de ejemplo para demostrar el módulo sin tener que digitarlas.
 */

import { crearRegistro } from '../modelo/sueno.js';
import { sumarDias } from '../utilidades/fechas.js';
import { generarId } from './repositorioSueno.js';

/** Hora de acostarse, hora de levantarse, calidad y nota. Índice 0 = hoy. */
const NOCHES = [
  ['22:30', '06:30', 4, ''],
  ['23:15', '06:30', 3, 'Me acosté tarde terminando una evidencia.'],
  ['22:00', '06:15', 5, ''],
  ['22:45', '06:45', 4, ''],
  ['00:10', '06:30', 2, 'Tomé café en la noche.'],
  ['22:30', '07:00', 5, ''],
  ['23:00', '07:15', 4, 'Día de descanso.'],
  ['22:50', '06:20', 3, ''],
];

/**
 * @param {string} hoy
 * @returns {object[]} Registros listos para guardar.
 */
export function crearDatosEjemplo(hoy) {
  return NOCHES.map(([horaAcostarse, horaLevantarse, calidad, nota], indice) =>
    crearRegistro({ fecha: sumarDias(hoy, -indice), horaAcostarse, horaLevantarse, calidad, nota }, generarId()),
  );
}
