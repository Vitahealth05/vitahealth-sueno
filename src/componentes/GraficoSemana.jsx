/**
 * @file Gráfico de barras de los últimos 7 días con la línea de la meta.
 * Cada barra recibe foco y muestra su detalle; la tabla da el mismo dato sin depender de la vista.
 */

import { duracionTexto, fechaLarga } from '../utilidades/fechas.js';

const ESCALA_MINIMA = 10 * 60;

/** @param {{semana: Array<{fecha: string, dia: string, minutos: number|null}>, metaMinutos: number}} props */
export default function GraficoSemana({ semana, metaMinutos }) {
  const maximo = Math.max(ESCALA_MINIMA, metaMinutos, ...semana.map((dia) => dia.minutos ?? 0));
  const alturaMeta = (metaMinutos / maximo) * 100;

  return (
    <figure className="grafico">
      <div className="grafico__area">
        <div className="grafico__meta" style={{ bottom: `${alturaMeta}%` }}>
          <span>Meta {duracionTexto(metaMinutos)}</span>
        </div>
        {semana.map(({ fecha, minutos }) => (
          <div key={fecha} className="grafico__columna">
            {minutos === null ? (
              <span className="grafico__sin-dato" title={`${fechaLarga(fecha)}: sin registro`} />
            ) : (
              <div className="grafico__barra" style={{ height: `${(minutos / maximo) * 100}%` }} tabIndex={0}>
                <span className="grafico__detalle" role="tooltip">
                  {fechaLarga(fecha)}: {duracionTexto(minutos)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grafico__dias" aria-hidden="true">
        {semana.map(({ fecha, dia }, indice) => (
          <span key={fecha} className={indice === semana.length - 1 ? 'grafico__dia--hoy' : ''}>
            {indice === semana.length - 1 ? 'Hoy' : dia}
          </span>
        ))}
      </div>

      <details className="grafico__tabla">
        <summary>Ver como tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Día</th>
              <th scope="col">Sueño</th>
            </tr>
          </thead>
          <tbody>
            {semana.map(({ fecha, minutos }) => (
              <tr key={fecha}>
                <td>{fechaLarga(fecha)}</td>
                <td>{minutos === null ? 'Sin registro' : duracionTexto(minutos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
