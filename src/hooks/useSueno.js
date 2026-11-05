/**
 * @file Hook que concentra el estado del módulo: las páginas leen de aquí y nunca
 * tocan el almacenamiento directamente.
 */

import { useCallback, useMemo, useState } from 'react';
import { crearRegistro } from '../modelo/sueno.js';
import { crearDatosEjemplo } from '../servicios/datosEjemplo.js';
import { generarId, RepositorioSueno } from '../servicios/repositorioSueno.js';
import { hoyIso } from '../utilidades/fechas.js';

/** Almacén en memoria para navegadores que bloquean localStorage. */
function crearAlmacen() {
  try {
    return window.localStorage;
  } catch {
    const memoria = new Map();
    return { getItem: (clave) => memoria.get(clave) ?? null, setItem: (clave, valor) => memoria.set(clave, valor) };
  }
}

/**
 * @returns {{registros: object[], metaMinutos: number, falloLectura: boolean,
 *   guardarRegistro: Function, eliminarRegistro: Function, cambiarMeta: Function, cargarEjemplos: Function}}
 */
export function useSueno() {
  const repositorio = useMemo(() => new RepositorioSueno(crearAlmacen()), []);
  const [datos, setDatos] = useState(() => repositorio.leer());

  /** Aplica un cambio y lo guarda. Devuelve false si no se pudo guardar. */
  const persistir = useCallback(
    (cambio) => {
      const nuevo = { ...datos, ...cambio, fallo: false };
      const guardado = repositorio.guardar(nuevo);
      setDatos(nuevo);
      return guardado;
    },
    [datos, repositorio],
  );

  const guardarRegistro = useCallback(
    (valores, idEdicion) => {
      const registro = crearRegistro(valores, idEdicion ?? generarId());
      const otros = datos.registros.filter((actual) => actual.id !== idEdicion);
      return persistir({ registros: [...otros, registro] });
    },
    [datos.registros, persistir],
  );

  const eliminarRegistro = useCallback(
    (id) => persistir({ registros: datos.registros.filter((registro) => registro.id !== id) }),
    [datos.registros, persistir],
  );

  const cambiarMeta = useCallback((metaMinutos) => persistir({ metaMinutos }), [persistir]);

  const cargarEjemplos = useCallback(() => persistir({ registros: crearDatosEjemplo(hoyIso()) }), [persistir]);

  return {
    registros: datos.registros,
    metaMinutos: datos.metaMinutos,
    falloLectura: datos.fallo,
    guardarRegistro,
    eliminarRegistro,
    cambiarMeta,
    cargarEjemplos,
  };
}
