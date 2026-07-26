import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RegisterHomeForm } from './RegisterHomeForm.jsx';

export function RegisterHomeModal({ onClose, onRegistered }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-register" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Yeni Ev Kaydı</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>
        <RegisterHomeForm
          onRegistered={() => {
            if (onRegistered) onRegistered();
            onClose();
          }}
        />
      </div>
    </div>,
    document.body
  );
}
