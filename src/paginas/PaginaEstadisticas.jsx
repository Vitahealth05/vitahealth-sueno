/**
 * @file Resumen de los últimos 7 días (HU18) y meta diaria de sueño (HU19).
 */

import { useState } from 'react';
import GraficoSemana from '../componentes/GraficoSemana.jsx';
import { resumirSemana } from '../modelo/estadisticas.js';
import { validarMeta } from '../modelo/sueno.js';
import { duracionTexto, hoyIso } from '../utilidades/fechas.js';

/**
 * @param {{sueno: ReturnType<import('../hooks/useSueno.js').useSueno>,
 *   notificar: (guardado: boolean, mensaje: string) => void}} props
 */
export default function PaginaEstadisticas({ sueno, notificar }) {
  const { registros, metaMinutos } = sueno;
  const resumen = resumirSemana(registros, metaMinutos, hoyIso());
  const [horasMeta, setHorasMeta] = useState(String(metaMinutos / 60));
  const [errorMeta, setErrorMeta] = useState(null);

  const guardarMeta = (evento) => {
    evento.preventDefault();
    const minutos = Number(horasMeta.replace(',', '.')) * 60;
    const error = horasMeta.trim() === '' ? 'Escribe tu meta en horas.' : validarMeta(minutos);
    setErrorMeta(error);
    if (!error) {
      notificar(sueno.cambiarMeta(minutos), 'Meta guardada.');
    }
  };

  const datos = [
    {
      valor: resumen.promedioMinutos === null ? '--' : duracionTexto(resumen.promedioMinutos),
      texto: 'Promedio por noche',
    },
    { valor: `${resumen.nochesConMeta} de ${resumen.noches}`, texto: 'Noches con la meta cumplida' },
    { valor: resumen.racha === 1 ? '1 día' : `${resumen.racha} días`, texto: 'Racha cumpliendo la meta' },
    {
      valor: resumen.calidadPromedio === null ? '--' : `${resumen.calidadPromedio.toFixed(1).replace('.', ',')} de 5`,
      texto: 'Calidad promedio',
    },
  ];

  return (
    <>
      <h1 className="titulo">Mi semana</h1>

      {resumen.noches === 0 && (
        <p className="vacio vacio--compacto">
          No tienes noches en los últimos 7 días. <a href="#/registrar">Registra la de anoche</a> o carga los datos de
          ejemplo desde el <a href="#/historial">historial</a>.
        </p>
      )}

      <dl className="datos">
        {datos.map(({ valor, texto }) => (
          <div key={texto} className="dato">
            <dd className="dato__valor">{valor}</dd>
            <dt className="dato__texto">{texto}</dt>
          </div>
        ))}
      </dl>

      <div className="semana">
        <section className="panel semana__grafico">
          <h2>Horas de sueño, últimos 7 días</h2>
          <GraficoSemana semana={resumen.semana} metaMinutos={metaMinutos} />
        </section>

        <section className="panel semana__meta">
          <h2>Tu meta</h2>
          <p className="panel__texto">Para adultos se suele recomendar dormir de 7 a 9 horas por noche.</p>
          <form onSubmit={guardarMeta} noValidate>
            <div className="campo">
              <label htmlFor="meta">Horas por noche</label>
              <input
                id="meta"
                type="number"
                min="4"
                max="12"
                step="0.5"
                value={horasMeta}
                aria-invalid={Boolean(errorMeta)}
                aria-describedby="error-meta"
                onChange={(evento) => {
                  setHorasMeta(evento.target.value);
                  setErrorMeta(null);
                }}
              />
              <p id="error-meta" className="campo__error">
                {errorMeta}
              </p>
            </div>
            <button type="submit" className="boton">
              Guardar meta
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
