import { useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from './ToastProvider.jsx';
import { AddApplianceModal } from './AddApplianceModal.jsx';
import { APPLIANCE_PRESETS } from '../data/appliancePresets.js';

function initialAppliances() {
  return APPLIANCE_PRESETS.map((preset) => ({ ...preset, checked: false, custom: false, quantity: 1 }));
}

function initialForm() {
  return { name: '', contactEmail: '', password: '', budgetLimit: '', baseRatePerKwh: '' };
}

export function RegisterHomeForm({ onRegistered }) {
  const notify = useToast();
  const [form, setForm] = useState(initialForm);
  const [appliances, setAppliances] = useState(initialAppliances);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggle(key) {
    setAppliances((current) =>
      current.map((a) => (a.key === key ? { ...a, checked: !a.checked } : a))
    );
  }

  function updateQuantity(key, quantity) {
    setAppliances((current) =>
      current.map((a) => (a.key === key ? { ...a, quantity: Math.max(1, quantity) } : a))
    );
  }

  function addCustom(appliance) {
    const key = `custom-${Date.now()}`;
    setAppliances((current) => [...current, { ...appliance, key, checked: true, custom: true, quantity: 1 }]);
    setModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const selected = appliances.filter((a) => a.checked);
    if (selected.length === 0) {
      setPickerOpen(true);
      notify('En az bir cihaz seçmelisiniz.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactEmail: form.contactEmail.trim(),
        password: form.password,
        budgetLimit: Number(form.budgetLimit),
        baseRatePerKwh: Number(form.baseRatePerKwh),
        appliances: selected.flatMap((a) => {
          const count = Math.max(1, Number(a.quantity) || 1);
          return Array.from({ length: count }, (_, i) => ({
            name: count > 1 ? `${a.name} #${i + 1}` : a.name,
            nominalWatt: Number(a.nominalWatt),
            safeLimitWatt: Number(a.safeLimitWatt)
          }));
        })
      };
      const created = await api.registerHome(payload);
      notify(`${created.name} kaydedildi`, 'success');
      setForm(initialForm());
      setAppliances(initialAppliances());
      if (onRegistered) onRegistered();
    } catch (err) {
      notify(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCount = appliances.reduce((n, a) => n + (a.checked ? Math.max(1, a.quantity) : 0), 0);

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-fields">
        <label>
          Ev adı
          <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        </label>
        <label>
          İletişim e-postası
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            required
          />
        </label>
        <label>
          Şifre belirle
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Kullanıcı girişi için (en az 4 karakter)"
            minLength={4}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Bütçe (TL)
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.budgetLimit}
              onChange={(e) => updateField('budgetLimit', e.target.value)}
              required
            />
          </label>
          <label>
            kWh ücreti (TL)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.baseRatePerKwh}
              onChange={(e) => updateField('baseRatePerKwh', e.target.value)}
              required
            />
          </label>
        </div>
      </div>

      <div className="register-appliances">
        <button
          type="button"
          className={`picker-toggle ${pickerOpen ? 'open' : ''}`}
          onClick={() => setPickerOpen((v) => !v)}
        >
          <span>Cihazlar {selectedCount > 0 && <span className="count-pill">{selectedCount} seçili</span>}</span>
          <span className="chevron">{pickerOpen ? '▾' : '▸'}</span>
        </button>

        {pickerOpen && (
          <>
            <div className="appliance-checklist">
              {appliances.map((a) => (
                <label key={a.key} className={`check-item ${a.checked ? 'checked' : ''}`}>
                  <input type="checkbox" checked={a.checked} onChange={() => toggle(a.key)} />
                  <span className="check-name">
                    {a.name}
                    {a.custom && <span className="custom-tag">özel</span>}
                  </span>
                  <span className="check-watt">{a.nominalWatt}W / {a.safeLimitWatt}W</span>
                  {a.checked && (
                    <span className="qty-stepper">
                      <button
                        type="button"
                        aria-label="azalt"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(a.key, a.quantity - 1); }}
                      >
                        −
                      </button>
                      <span className="qty-value">{a.quantity}</span>
                      <button
                        type="button"
                        aria-label="artır"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(a.key, a.quantity + 1); }}
                      >
                        +
                      </button>
                    </span>
                  )}
                </label>
              ))}
            </div>
            <button type="button" className="link-button add-appliance-link" onClick={() => setModalOpen(true)}>
              + Listede olmayan cihaz ekle
            </button>
          </>
        )}
      </div>

      <button type="submit" className="primary-button register-submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor...' : 'Evi Kaydet'}
      </button>

      {modalOpen && <AddApplianceModal onConfirm={addCustom} onClose={() => setModalOpen(false)} />}
    </form>
  );
}
