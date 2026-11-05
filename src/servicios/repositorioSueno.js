/**
 * @file Persistencia del módulo en localStorage. La interfaz solo conoce este repositorio,
 * así que al integrar la API REST de VitaHealth basta con reemplazar esta clase.
 */

import { META_PREDETERMINADA } from '../modelo/sueno.js';

const CLAVE = 'vitahealth.sueno.v1';

/** Repositorio de los registros de sueño y la meta diaria. */
export class RepositorioSueno {
  /** @param {Pick<Storage, 'getItem'|'setItem'>} almacen Se inyecta para poder probarlo sin navegador. */
  constructor(almacen) {
    this.almacen = almacen;
  }

  /**
   * Lee los datos guardados.
   * @returns {{registros: object[], metaMinutos: number, fallo: boolean}} fallo=true si no se pudieron leer.
   */
  leer() {
    const vacio = { registros: [], metaMinutos: META_PREDETERMINADA };
    try {
      const texto = this.almacen.getItem(CLAVE);
      if (!texto) {
        return { ...vacio, fallo: false };
      }
      const datos = JSON.parse(texto);
      return {
        registros: Array.isArray(datos.registros) ? datos.registros : [],
        metaMinutos: Number.isFinite(datos.metaMinutos) ? datos.metaMinutos : META_PREDETERMINADA,
        fallo: false,
      };
    } catch {
      return { ...vacio, fallo: true };
    }
  }

  /**
   * Guarda todos los datos.
   * @param {{registros: object[], metaMinutos: number}} datos
   * @returns {boolean} false si el navegador no permitió guardar (modo privado o almacenamiento lleno).
   */
  guardar({ registros, metaMinutos }) {
    try {
      this.almacen.setItem(CLAVE, JSON.stringify({ registros, metaMinutos }));
      return true;
    } catch {
      return false;
    }
  }
}

/** @returns {string} Identificador único; randomUUID no existe en páginas sin contexto seguro. */
export function generarId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
