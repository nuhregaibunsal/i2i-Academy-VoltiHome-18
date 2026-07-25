import { useEffect } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { useToast } from './ToastProvider.jsx';
import { ApplianceList } from './ApplianceList.jsx';
import { ConsumptionChart } from './ConsumptionChart.jsx';
import { SkeletonBlock } from './Skeleton.jsx';

function formatCurrency(value) {
  return `${value.toFixed(2)} TL`;
}

export function HomeModal({ homeId, onClose }) {
  const notify = useToast();
  const { data: status, loading, error } = usePolling(() => api.getStatus(homeId), 2000, true);
  const { data: history } = usePolling(() => api.getHistory(homeId), 8000, true);

  useEffect(() => {
    if (error) {
      notify(error);
    }
  }, [error, notify]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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

            <h4>Cihazlar</h4>
            <ApplianceList appliances={status.appliances} />

            <h4>Günlük Tüketim Trendi</h4>
            <ConsumptionChart history={history?.content} />
          </div>
        ) : (
          <p className="muted">Veri yüklenemedi.</p>
        )}
      </div>
    </div>
  );
}
