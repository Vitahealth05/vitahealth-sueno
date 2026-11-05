/**
 * @file Componente raíz: une la barra de navegación, las páginas y los avisos.
 */

import { useCallback, useEffect, useState } from 'react';
import Aviso from './componentes/Aviso.jsx';
import BarraSuperior from './componentes/BarraSuperior.jsx';
import { useRuta } from './hooks/useRuta.js';
import { useSueno } from './hooks/useSueno.js';
import PaginaEstadisticas from './paginas/PaginaEstadisticas.jsx';
import PaginaHistorial from './paginas/PaginaHistorial.jsx';
import PaginaRegistrar from './paginas/PaginaRegistrar.jsx';

const DURACION_AVISO = 4000;
const ERROR_GUARDADO = 'No se pudo guardar en este navegador. Revisa que el almacenamiento del sitio esté permitido.';

export default function App() {
  const { pagina, parametro } = useRuta();
  const sueno = useSueno();
  const [aviso, setAviso] = useState(null);

  /** Muestra un mensaje según el resultado de guardar. */
  const notificar = useCallback((guardado, mensaje) => {
    setAviso(guardado ? { tipo: 'exito', mensaje } : { tipo: 'error', mensaje: ERROR_GUARDADO });
  }, []);

  useEffect(() => {
    if (!aviso) {
      return undefined;
    }
    const temporizador = setTimeout(() => setAviso(null), DURACION_AVISO);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  return (
    <>
      <BarraSuperior paginaActual={pagina} />
      <main className="contenido">
        {sueno.falloLectura && (
          <p className="alerta" role="alert">
            Los datos guardados no se pudieron leer. Puedes seguir registrando noches desde cero.
          </p>
        )}
        {pagina === 'historial' && <PaginaHistorial sueno={sueno} notificar={notificar} />}
        {pagina === 'estadisticas' && <PaginaEstadisticas sueno={sueno} notificar={notificar} />}
        {pagina !== 'historial' && pagina !== 'estadisticas' && (
          // La llave reinicia el formulario al pasar de crear a editar.
          <PaginaRegistrar key={parametro ?? 'nuevo'} idEdicion={parametro} sueno={sueno} notificar={notificar} />
        )}
      </main>
      <Aviso aviso={aviso} />
    </>
  );
}
