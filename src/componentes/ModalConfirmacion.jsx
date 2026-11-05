/**
 * @file Ventana de confirmación con <dialog>, que ya atrapa el foco y se cierra con Esc.
 */

import { useEffect, useRef } from 'react';

/**
 * @param {{titulo: string, texto: string, textoConfirmar: string, onConfirmar: Function, onCancelar: Function}} props
 */
export default function ModalConfirmacion({ titulo, texto, textoConfirmar, onConfirmar, onCancelar }) {
  const referencia = useRef(null);

  useEffect(() => {
    const dialogo = referencia.current;
    dialogo.showModal();
    return () => dialogo.close();
  }, []);

  return (
    <dialog ref={referencia} className="modal" aria-labelledby="modal-titulo" onCancel={onCancelar}>
      <h2 id="modal-titulo">{titulo}</h2>
      <p>{texto}</p>
      <div className="modal__acciones">
        <button type="button" className="boton boton--fantasma" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="boton boton--peligro" onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}
