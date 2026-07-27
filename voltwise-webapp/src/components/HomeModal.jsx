import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { useToast } from './ToastProvider.jsx';
import { ApplianceList } from './ApplianceList.jsx';
import { ApplianceBreakdown } from './ApplianceBreakdown.jsx';
import { HistoryChart } from './HistoryChart.jsx';
import { RecommendationList } from './RecommendationList.jsx';
import { AddApplianceModal } from './AddApplianceModal.jsx';
import { SkeletonBlock } from './Skeleton.jsx';

function formatCurrency(value) {
  return `${value.toFixed(2)} TL`;
}

export function HomeModal({ homeId, onClose }) {
  const notify = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { data: status, loading, error } = usePolling(() => api.getStatus(homeId), 2000, true);
  const { data: recommendations } = usePolling(() => api.getRecommendations(homeId), 10000, true);

  useEffect(() => {
    if (error) notify(error);
  }, [error, notify]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleAdd(payload) {
    try {
      await api.addAppliance(homeId, payload);
      notify(`“${payload.name}” eklendi`, 'success');
      setAddOpen(false);
    } catch (err) {
      notify(err.message);
    }
  }

  async function handleRemove(applianceId, name) {
    if (!window.confirm(`“${name}” cihazı kaldırılsın mı?`)) return;
    try {
      await api.removeAppliance(homeId, applianceId);
      notify(`“${name}” kaldırıldı`, 'success');
    } catch (err) {
      notify(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`“${status?.name}” evi ve tüm verileri kalıcı olarak silinsin mi?`)) return;
    try {
      await api.deleteHome(homeId);
      notify('Ev silindi', 'success');
      onClose();
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{status ? status.name : 'Yükleniyor...'}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>

        {loading && !status ? (
          <SkeletonBlock height={280} />
        ) : status ? (
          <div className="modal-body">
            <div className="summary-row">
              <div className="summary-tile">
                <span className="muted">Biriken Tutar</span>
                <strong>{formatCurrency(status.accumulatedCost)}</strong>
              </div>
              <div className="summary-tile">
                <span className="muted">Bütçe Limiti</span>
                <strong>{formatCurrency(status.budgetLimit)}</strong>
              </div>
              <div className="summary-tile">
                <span className="muted">Kullanım</span>
                <strong>%{(status.budgetUsageRatio * 100).toFixed(0)}</strong>
              </div>
              <div className="summary-tile">
                <span className="muted">Tarife</span>
                <strong>{status.penaltyActive ? 'Ceza' : 'Standart'}</strong>
              </div>
            </div>

            <div className="section-head">
              <h4>Cihazlar</h4>
              <button type="button" className="link-button" onClick={() => setAddOpen(true)}>
                + Cihaz ekle
              </button>
            </div>
            <ApplianceList appliances={status.appliances} onRemove={handleRemove} />

            <h4>Cihaz Bazında Tüketim</h4>
            <ApplianceBreakdown appliances={status.appliances} />

            <h4>Tüketim Trendi</h4>
            <HistoryChart homeId={homeId} />

            <h4>AI Tasarruf Tavsiyeleri</h4>
            <RecommendationList recommendations={recommendations?.content} />

            <div className="modal-danger-zone">
              <button type="button" className="danger-button" onClick={handleDelete}>
                Evi sil
              </button>
            </div>
          </div>
        ) : (
          <p className="muted">Veri yüklenemedi.</p>
        )}
      </div>

      {addOpen && <AddApplianceModal onConfirm={handleAdd} onClose={() => setAddOpen(false)} />}
    </div>
  );
}
