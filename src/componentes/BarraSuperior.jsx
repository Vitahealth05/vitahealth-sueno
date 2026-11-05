/**
 * @file Barra superior con la marca y la navegación del módulo.
 */

const ENLACES = [
  { pagina: 'registrar', texto: 'Registrar' },
  { pagina: 'historial', texto: 'Historial' },
  { pagina: 'estadisticas', texto: 'Mi semana' },
];

/** @param {{paginaActual: string}} props */
export default function BarraSuperior({ paginaActual }) {
  return (
    <header className="barra">
      <div className="barra__contenido">
        <a className="marca" href="#/registrar">
          <img className="marca__logo" src="logo.svg" alt="" width="34" height="34" />
          <span className="marca__nombre">VitaHealth</span>
        </a>
        <nav className="menu" aria-label="Módulo de sueño">
          {ENLACES.map(({ pagina, texto }) => (
            <a
              key={pagina}
              href={`#/${pagina}`}
              className={`menu__enlace${paginaActual === pagina ? ' menu__enlace--activo' : ''}`}
              aria-current={paginaActual === pagina ? 'page' : undefined}
            >
              {texto}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
