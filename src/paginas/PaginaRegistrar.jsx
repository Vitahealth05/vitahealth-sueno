/**
 * @file Página para registrar una noche (HU14) o editar una existente (HU16).
 */

import FormularioSueno from '../componentes/FormularioSueno.jsx';
import { navegar } from '../hooks/useRuta.js';

/**
 * @param {{idEdicion?: string, sueno: ReturnType<import('../hooks/useSueno.js').useSueno>,
 *   notificar: (guardado: boolean, mensaje: string) => void}} props
 */
export default function PaginaRegistrar({ idEdicion, sueno, notificar }) {
  const registro = sueno.registros.find((actual) => actual.id === idEdicion);

  if (idEdicion && !registro) {
    return (
      <div className="vacio">
        <h1>Esa noche ya no está en tu historial</h1>
        <a className="boton" href="#/historial">
          Ir al historial
        </a>
      </div>
    );
  }

  const alGuardar = (valores) => {
    const guardado = sueno.guardarRegistro(valores, registro?.id);
    notificar(guardado, registro ? 'Cambios guardados.' : 'Noche guardada.');
    navegar(registro ? '/historial' : '/estadisticas');
  };

  return (
    <>
      <h1 className="titulo">{registro ? 'Editar noche' : '¿Cómo dormiste?'}</h1>
      <FormularioSueno
        registro={registro}
        registros={sueno.registros}
        metaMinutos={sueno.metaMinutos}
        onGuardar={alGuardar}
        onCancelar={registro ? () => navegar('/historial') : undefined}
      />
    </>
  );
}
