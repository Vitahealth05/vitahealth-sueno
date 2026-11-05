/**
 * @file Formulario para registrar o editar una noche. El reloj y los campos de hora comparten el estado.
 */

import { useState } from 'react';
import { calcularDuracion, CALIDADES, MAX_NOTA, validarRegistro } from '../modelo/sueno.js';
import { duracionTexto, hoyIso } from '../utilidades/fechas.js';
import RelojSueno from './RelojSueno.jsx';

const VALORES_INICIALES = { horaAcostarse: '22:30', horaLevantarse: '06:30', calidad: null, nota: '' };

/** Compara la duración con la meta en una frase. */
function mensajeMeta(duracion, meta) {
  if (duracion === null) {
    return '';
  }
  if (duracion >= meta) {
    return duracion === meta ? 'Justo en tu meta.' : `${duracionTexto(duracion - meta)} por encima de tu meta.`;
  }
  return `${duracionTexto(meta - duracion)} por debajo de tu meta.`;
}

/**
 * @param {{registro?: object, registros: object[], metaMinutos: number, onGuardar: (valores: object) => void,
 *   onCancelar?: () => void}} props
 */
export default function FormularioSueno({ registro, registros, metaMinutos, onGuardar, onCancelar }) {
  const hoy = hoyIso();
  const [valores, setValores] = useState(() => registro ?? { ...VALORES_INICIALES, fecha: hoy });
  const [errores, setErrores] = useState({});
  const duracion = calcularDuracion(valores.horaAcostarse, valores.horaLevantarse);

  /** Actualiza un campo y borra el error que lo señalaba. */
  const cambiar = (campo, valor, campoError = campo) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campoError]: undefined }));
  };

  const alEnviar = (evento) => {
    evento.preventDefault();
    const encontrados = validarRegistro(valores, { registros, hoy, idEdicion: registro?.id });
    setErrores(encontrados);
    if (Object.keys(encontrados).length === 0) {
      onGuardar(valores);
    }
  };

  return (
    <form className="registro" onSubmit={alEnviar} noValidate>
      <section className="registro__reloj" aria-label="Horas de sueño">
        <RelojSueno
          horaAcostarse={valores.horaAcostarse}
          horaLevantarse={valores.horaLevantarse}
          duracion={duracion}
          metaMinutos={metaMinutos}
          onCambiarAcostarse={(hora) => cambiar('horaAcostarse', hora, 'horas')}
          onCambiarLevantarse={(hora) => cambiar('horaLevantarse', hora, 'horas')}
        />
        <p className="registro__comparacion">{mensajeMeta(duracion, metaMinutos)}</p>
        <p className="registro__ayuda">Arrastra la luna y el sol, o escribe las horas.</p>
      </section>

      <section className="registro__campos" aria-label="Datos de la noche">
        <div className="campo">
          <label htmlFor="fecha">Día en que te levantaste</label>
          <input
            id="fecha"
            type="date"
            max={hoy}
            value={valores.fecha}
            aria-invalid={Boolean(errores.fecha)}
            aria-describedby="error-fecha"
            onChange={(evento) => cambiar('fecha', evento.target.value)}
          />
          <p id="error-fecha" className="campo__error">
            {errores.fecha}
          </p>
        </div>

        <div className="registro__horas">
          <div className="campo">
            <label htmlFor="hora-acostarse">Me acosté</label>
            <input
              id="hora-acostarse"
              type="time"
              value={valores.horaAcostarse}
              aria-invalid={Boolean(errores.horas)}
              aria-describedby="error-horas"
              onChange={(evento) => cambiar('horaAcostarse', evento.target.value, 'horas')}
            />
          </div>
          <div className="campo">
            <label htmlFor="hora-levantarse">Me levanté</label>
            <input
              id="hora-levantarse"
              type="time"
              value={valores.horaLevantarse}
              aria-invalid={Boolean(errores.horas)}
              aria-describedby="error-horas"
              onChange={(evento) => cambiar('horaLevantarse', evento.target.value, 'horas')}
            />
          </div>
        </div>
        <p id="error-horas" className="campo__error">
          {errores.horas}
        </p>

        <fieldset className="campo calidad" aria-describedby="error-calidad">
          <legend>¿Cómo descansaste?</legend>
          <div className="calidad__opciones">
            {CALIDADES.map(({ valor, texto }) => (
              <label key={valor} className="calidad__opcion">
                <input
                  type="radio"
                  name="calidad"
                  value={valor}
                  checked={valores.calidad === valor}
                  onChange={() => cambiar('calidad', valor)}
                />
                <span>{texto}</span>
              </label>
            ))}
          </div>
          <p id="error-calidad" className="campo__error">
            {errores.calidad}
          </p>
        </fieldset>

        <div className="campo">
          <label htmlFor="nota">Nota (opcional)</label>
          <textarea
            id="nota"
            rows="2"
            maxLength={MAX_NOTA}
            value={valores.nota}
            placeholder="Ej: tomé café en la noche"
            onChange={(evento) => cambiar('nota', evento.target.value)}
          />
        </div>

        <div className="registro__acciones">
          <button type="submit" className="boton">
            {registro ? 'Guardar cambios' : 'Guardar noche'}
          </button>
          {onCancelar && (
            <button type="button" className="boton boton--fantasma" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </section>
    </form>
  );
}
