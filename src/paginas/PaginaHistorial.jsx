/**
 * @file Historial de noches: filtro por fechas (HU15), edición (HU16) y eliminación (HU17).
 */

import { useState } from 'react';
import ModalConfirmacion from '../componentes/ModalConfirmacion.jsx';
import { filtrarPorFechas } from '../modelo/estadisticas.js';
import { textoCalidad } from '../modelo/sueno.js';
import { duracionTexto, fechaLarga, hoyIso, sumarDias } from '../utilidades/fechas.js';

const DIAS_FILTRO = 29;

/**
 * @param {{sueno: ReturnType<import('../hooks/useSueno.js').useSueno>,
 *   notificar: (guardado: boolean, mensaje: string) => void}} props
 */
export default function PaginaHistorial({ sueno, notificar }) {
  const hoy = hoyIso();
  const [desde, setDesde] = useState(sumarDias(hoy, -DIAS_FILTRO));
  const [hasta, setHasta] = useState(hoy);
  const [porEliminar, setPorEliminar] = useState(null);

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const visibles = rangoInvalido ? [] : filtrarPorFechas(sueno.registros, desde, hasta);

  if (sueno.registros.length === 0) {
    return (
      <div className="vacio">
        <h1>Aún no tienes noches registradas</h1>
        <p>Registra la de anoche para empezar a ver tu historial.</p>
        <div className="vacio__acciones">
          <a className="boton" href="#/registrar">
            Registrar noche
          </a>
          <button
            type="button"
            className="boton boton--fantasma"
            onClick={() => notificar(sueno.cargarEjemplos(), 'Datos de ejemplo cargados.')}
          >
            Cargar datos de ejemplo
          </button>
        </div>
      </div>
    );
  }

  const confirmarEliminacion = () => {
    notificar(sueno.eliminarRegistro(porEliminar.id), 'Noche eliminada.');
    setPorEliminar(null);
  };

  return (
    <>
      <h1 className="titulo">Historial</h1>

      <form className="filtro" onSubmit={(evento) => evento.preventDefault()} aria-label="Filtrar por fechas">
        <div className="campo">
          <label htmlFor="desde">Desde</label>
          <input id="desde" type="date" max={hoy} value={desde} onChange={(evento) => setDesde(evento.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="hasta">Hasta</label>
          <input id="hasta" type="date" max={hoy} value={hasta} onChange={(evento) => setHasta(evento.target.value)} />
        </div>
      </form>

      {rangoInvalido && (
        <p className="alerta" role="alert">
          La fecha inicial debe ser anterior a la final.
        </p>
      )}
      {!rangoInvalido && visibles.length === 0 && (
        <p className="vacio vacio--compacto">No hay noches en esas fechas. Amplía el rango para ver más.</p>
      )}

      <ul className="noches">
        {visibles.map((registro) => (
          <li key={registro.id} className="noche">
            <div className="noche__principal">
              <h2 className="noche__fecha">{fechaLarga(registro.fecha)}</h2>
              <p className="noche__horas">
                {registro.horaAcostarse} a {registro.horaLevantarse}
              </p>
              {registro.nota && <p className="noche__nota">{registro.nota}</p>}
            </div>
            <div className="noche__datos">
              <strong className="noche__duracion">{duracionTexto(registro.duracionMinutos)}</strong>
              <span className="noche__calidad">{textoCalidad(registro.calidad)}</span>
            </div>
            <div className="noche__acciones">
              <a className="boton boton--fantasma boton--pequeno" href={`#/registrar/${registro.id}`}>
                Editar
              </a>
              <button
                type="button"
                className="boton boton--peligro-suave boton--pequeno"
                onClick={() => setPorEliminar(registro)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {porEliminar && (
        <ModalConfirmacion
          titulo="¿Eliminar esta noche?"
          texto={`Se borrará el registro del ${fechaLarga(porEliminar.fecha)}. No se puede deshacer.`}
          textoConfirmar="Eliminar"
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </>
  );
}
