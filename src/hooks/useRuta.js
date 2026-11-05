/**
 * @file Enrutamiento mínimo por hash (#/registrar, #/historial, #/estadisticas).
 * Funciona al abrir dist/index.html directamente, sin configurar un servidor.
 */

import { useEffect, useState } from 'react';

/** @returns {{pagina: string, parametro: string|undefined}} */
function leerRuta() {
  const [, pagina = 'registrar', parametro] = window.location.hash.replace(/^#/, '').split('/');
  return { pagina: pagina || 'registrar', parametro };
}

/** @param {string} ruta Por ejemplo "/historial". */
export function navegar(ruta) {
  window.location.hash = ruta;
}

/** @returns {{pagina: string, parametro: string|undefined}} Ruta actual, actualizada al cambiar el hash. */
export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const alCambiar = () => {
      setRuta(leerRuta());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return ruta;
}
