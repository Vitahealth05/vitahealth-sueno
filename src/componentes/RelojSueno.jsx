/**
 * @file Reloj de 24 horas: la medianoche queda arriba y el mediodía abajo. El arco verde es el
 * tiempo dormido. Las dos manijas se arrastran con el puntero o se mueven con el teclado
 * (flechas: 5 min; Re Pág / Av Pág: 30 min), y siguen sincronizadas con el formulario.
 */

import { useRef } from 'react';
import { horaAMinutos, minutosAHora, MINUTOS_DIA, duracionTexto } from '../utilidades/fechas.js';

const CENTRO = 170;
const RADIO = 118;
const PASO = 5;
const PASO_LARGO = 30;
const MARCAS = [
  { hora: 0, texto: '00' },
  { hora: 6, texto: '06' },
  { hora: 12, texto: '12' },
  { hora: 18, texto: '18' },
];

/** Convierte minutos del día en un punto de la circunferencia. */
function punto(minutos, radio = RADIO) {
  const angulo = (minutos / MINUTOS_DIA) * 2 * Math.PI - Math.PI / 2;
  return { x: CENTRO + radio * Math.cos(angulo), y: CENTRO + radio * Math.sin(angulo) };
}

/** Traza el arco en sentido horario entre dos momentos del día. */
function trazarArco(inicio, fin) {
  const a = punto(inicio);
  const b = punto(fin);
  const recorrido = (fin - inicio + MINUTOS_DIA) % MINUTOS_DIA;
  const arcoGrande = recorrido > MINUTOS_DIA / 2 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${RADIO} ${RADIO} 0 ${arcoGrande} 1 ${b.x} ${b.y}`;
}

/**
 * Manija arrastrable.
 * @param {{minutos: number, etiqueta: string, tipo: 'luna'|'sol', onCambiar: (minutos: number) => void,
 *   aMinutosDesdePuntero: (evento: PointerEvent) => number}} props
 */
function Manija({ minutos, etiqueta, tipo, onCambiar, aMinutosDesdePuntero }) {
  const { x, y } = punto(minutos);

  const alPresionar = (evento) => {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    evento.currentTarget.focus();
  };

  const alMover = (evento) => {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      onCambiar(aMinutosDesdePuntero(evento));
    }
  };

  const alTeclear = (evento) => {
    const cambios = {
      ArrowUp: PASO,
      ArrowRight: PASO,
      ArrowDown: -PASO,
      ArrowLeft: -PASO,
      PageUp: PASO_LARGO,
      PageDown: -PASO_LARGO,
    };
    if (evento.key in cambios) {
      evento.preventDefault();
      onCambiar((minutos + cambios[evento.key] + MINUTOS_DIA) % MINUTOS_DIA);
    }
  };

  return (
    <g
      className="reloj__manija"
      transform={`translate(${x} ${y})`}
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={MINUTOS_DIA - 1}
      aria-valuenow={minutos}
      aria-valuetext={minutosAHora(minutos)}
      data-manija={tipo}
      onPointerDown={alPresionar}
      onPointerMove={alMover}
      onKeyDown={alTeclear}
    >
      {/* Área táctil más grande que el dibujo. */}
      <circle r="24" fill="transparent" />
      <circle className="reloj__manija-fondo" r="17" />
      {tipo === 'luna' ? (
        <path className="reloj__icono-luna" d="M4 -8 A 8.5 8.5 0 1 0 8 5 A 7 7 0 0 1 4 -8 Z" />
      ) : (
        <g className="reloj__icono-sol">
          <circle r="4.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((grados) => (
            <line key={grados} x1="0" y1="-7.5" x2="0" y2="-10" transform={`rotate(${grados})`} />
          ))}
        </g>
      )}
    </g>
  );
}

/**
 * @param {{horaAcostarse: string, horaLevantarse: string, duracion: number|null, metaMinutos: number,
 *   onCambiarAcostarse: (hora: string) => void, onCambiarLevantarse: (hora: string) => void}} props
 */
export default function RelojSueno({
  horaAcostarse,
  horaLevantarse,
  duracion,
  metaMinutos,
  onCambiarAcostarse,
  onCambiarLevantarse,
}) {
  const svg = useRef(null);
  const inicio = horaAMinutos(horaAcostarse);
  const fin = horaAMinutos(horaLevantarse);
  const horasValidas = inicio !== null && fin !== null;

  /** Traduce la posición del puntero a minutos del día, de 5 en 5. */
  const aMinutosDesdePuntero = (evento) => {
    const caja = svg.current.getBoundingClientRect();
    const x = evento.clientX - caja.left - caja.width / 2;
    const y = evento.clientY - caja.top - caja.height / 2;
    const angulo = (Math.atan2(y, x) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    const minutos = (angulo / (2 * Math.PI)) * MINUTOS_DIA;
    return (Math.round(minutos / PASO) * PASO) % MINUTOS_DIA;
  };

  return (
    <div className="reloj">
      <svg ref={svg} viewBox="0 0 340 340" className="reloj__svg" role="group" aria-label="Reloj de sueño de 24 horas">
        {/* Anillo de fondo: noche de 18:00 a 06:00 y día de 06:00 a 18:00. */}
        <path className="reloj__franja reloj__franja--dia" d={trazarArco(360, 1080)} />
        <path className="reloj__franja reloj__franja--noche" d={trazarArco(1080, 360)} />

        {Array.from({ length: 24 }, (_, hora) => {
          const a = punto(hora * 60, 138);
          const b = punto(hora * 60, hora % 6 === 0 ? 146 : 142);
          return <line key={hora} className="reloj__marca" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        {MARCAS.map(({ hora, texto }) => {
          const { x, y } = punto(hora * 60, 158);
          return (
            <text key={hora} className="reloj__numero" x={x} y={y} textAnchor="middle" dominantBaseline="central">
              {texto}
            </text>
          );
        })}

        {horasValidas && duracion > 0 && <path className="reloj__arco" d={trazarArco(inicio, fin)} />}

        {inicio !== null && (
          <Manija
            minutos={inicio}
            etiqueta="Hora de acostarte"
            tipo="luna"
            onCambiar={(minutos) => onCambiarAcostarse(minutosAHora(minutos))}
            aMinutosDesdePuntero={aMinutosDesdePuntero}
          />
        )}
        {fin !== null && (
          <Manija
            minutos={fin}
            etiqueta="Hora de levantarte"
            tipo="sol"
            onCambiar={(minutos) => onCambiarLevantarse(minutosAHora(minutos))}
            aMinutosDesdePuntero={aMinutosDesdePuntero}
          />
        )}
      </svg>

      {/* El texto central va fuera del SVG para respetar la tipografía y el zoom del navegador. */}
      <div className="reloj__centro" aria-live="polite">
        <strong className="reloj__duracion">{horasValidas ? duracionTexto(duracion) : '--'}</strong>
        <span className="reloj__meta">Meta: {duracionTexto(metaMinutos)}</span>
      </div>
    </div>
  );
}
