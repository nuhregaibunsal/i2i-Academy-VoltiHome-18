import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function AddApplianceModal({ onConfirm, onClose }) {
  const [name, setName] = useState('');
  const [nominalWatt, setNominalWatt] = useState('');
  const [safeLimitWatt, setSafeLimitWatt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(event) {
    event.preventDefault();
    const nominal = Number(nominalWatt);
    const safe = Number(safeLimitWatt);
    if (!name.trim()) {
      setError('Cihaz adı gerekli.');
      return;
    }
    if (!(nominal > 0) || !(safe > 0)) {
      setError('Watt değerleri pozitif olmalı.');
      return;
    }
    if (safe < nominal) {
      setError('Güvenli limit, nominal değerden küçük olamaz.');
      return;
    }
    onConfirm({ name: name.trim(), nominalWatt: nominal, safeLimitWatt: safe });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-narrow" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Cihaz Ekle</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <label>
            Cihaz adı
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <div className="form-row">
            <label>
              Nominal güç (W)
              <input
                type="number"
                min="1"
                value={nominalWatt}
                onChange={(e) => setNominalWatt(e.target.value)}
              />
            </label>
            <label>
              Güvenli limit (W)
              <input
                type="number"
                min="1"
                value={safeLimitWatt}
                onChange={(e) => setSafeLimitWatt(e.target.value)}
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="primary-button">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
