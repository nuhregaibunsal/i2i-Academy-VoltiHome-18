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
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggle(key) {
    setAppliances((current) =>
      current.map((appliance) =>
        appliance.key === key ? { ...appliance, checked: !appliance.checked } : appliance
      )
    );
  }

  function updateQuantity(key, quantity) {
    setAppliances((current) =>
      current.map((appliance) =>
        appliance.key === key ? { ...appliance, quantity: Math.max(1, quantity) } : appliance
      )
    );
  }

  function addCustom(appliance) {
    const key = `custom-${Date.now()}`;
    setAppliances((current) => [...current, { ...appliance, key, checked: true, custom: true, quantity: 1 }]);
    setModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const selected = appliances.filter((appliance) => appliance.checked);
    if (selected.length === 0) {
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
        appliances: selected.flatMap((appliance) => {
          const count = Math.max(1, Number(appliance.quantity) || 1);
          return Array.from({ length: count }, (_, i) => ({
            name: count > 1 ? `${appliance.name} #${i + 1}` : appliance.name,
            nominalWatt: Number(appliance.nominalWatt),
            safeLimitWatt: Number(appliance.safeLimitWatt)
          }));
        })
      };
      const created = await api.registerHome(payload);
      notify(`${created.name} kaydedildi`, 'success');
      setForm(initialForm());
      setAppliances(initialAppliances());
      if (onRegistered) {
        onRegistered();
      }
    } catch (err) {
      notify(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCount = appliances.filter((appliance) => appliance.checked).length;

  return (
    <form className="card register-form" onSubmit={handleSubmit}>
      <h3>Yeni Ev Kaydı</h3>
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

      <div className="appliance-picker">
        <div className="appliance-picker-head">
          <span>Cihazlar {selectedCount > 0 && <span className="count-pill">{selectedCount}</span>}</span>
          <button type="button" className="link-button" onClick={() => setModalOpen(true)}>
            + Cihaz ekle
          </button>
        </div>
        <div className="appliance-checklist">
          {appliances.map((appliance) => (
            <label key={appliance.key} className={`check-item ${appliance.checked ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={appliance.checked}
                onChange={() => toggle(appliance.key)}
              />
              <span className="check-name">
                {appliance.name}
                {appliance.custom && <span className="custom-tag">özel</span>}
              </span>
              <span className="check-watt">{appliance.nominalWatt}W / {appliance.safeLimitWatt}W</span>
              {appliance.checked && (
                <span className="qty-stepper">
                  <button
                    type="button"
                    aria-label="azalt"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(appliance.key, appliance.quantity - 1);
                    }}
                  >
                    −
                  </button>
                  <span className="qty-value">{appliance.quantity}</span>
                  <button
                    type="button"
                    aria-label="artır"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(appliance.key, appliance.quantity + 1);
                    }}
                  >
                    +
                  </button>
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? 'Kaydediliyor...' : 'Evi Kaydet'}
      </button>

      {modalOpen && <AddApplianceModal onConfirm={addCustom} onClose={() => setModalOpen(false)} />}
    </form>
  );
}
