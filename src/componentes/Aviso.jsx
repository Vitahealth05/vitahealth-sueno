/**
 * @file Mensaje temporal de confirmación o error. La región "status" lo anuncia en lectores de pantalla.
 */

/** @param {{aviso: {tipo: 'exito'|'error', mensaje: string}|null}} props */
export default function Aviso({ aviso }) {
  return (
    <div className="aviso-region" role="status">
      {aviso && <p className={`aviso aviso--${aviso.tipo}`}>{aviso.mensaje}</p>}
    </div>
  );
}
