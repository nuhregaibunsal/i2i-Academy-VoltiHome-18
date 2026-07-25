import { useEffect } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { useToast } from './ToastProvider.jsx';
import { ApplianceList } from './ApplianceList.jsx';
import { ConsumptionChart } from './ConsumptionChart.jsx';
import { RecommendationList } from './RecommendationList.jsx';
import { MeterDial } from './MeterDial.jsx';
import { SkeletonBlock } from './Skeleton.jsx';

function formatCurrency(value) {
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ConsumerView({ homeId, homeName, onLogout }) {
  const notify = useToast();
  const { data: status, loading, error } = usePolling(() => api.getStatus(homeId), 2000, true);
  const { data: history } = usePolling(() => api.getHistory(homeId), 8000, true);
  const { data: recommendations } = usePolling(() => api.getRecommendations(homeId), 10000, true);

  useEffect(() => {
    if (error) {
      notify(error);
    }
  }, [error, notify]);

  const state = status
    ? status.quotaBreached
      ? 'breach'
      : status.budgetUsageRatio >= 0.8
        ? 'warn'
        : 'safe'
    : 'safe';

  const statusText = status
    ? status.quotaBreached
      ? 'Bütçe aşıldı'
      : status.budgetUsageRatio >= 0.8
        ? 'Bütçe sınırına yaklaşıyor'
        : 'Bütçe içinde'
    : '';

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">🏠</span>
          <div>
            <h1>{homeName}</h1>
            <p className="muted">Enerji tüketim ve tasarruf bilgilendirmesi</p>
          </div>
        </div>
        <button type="button" className="ghost-button" onClick={onLogout}>
          Rol değiştir
        </button>
      </header>

      {loading && !status ? (
        <SkeletonBlock height={320} />
      ) : status ? (
        <main className="consumer-main">
          <section className={`budget-hero hero-${state}`}>
            <MeterDial
              ratio={status.budgetUsageRatio}
              state={state}
              size={240}
              value={Math.round(status.budgetUsageRatio * 100)}
              unit="%"
              label="bütçe kullanımı"
            />
            <div className="budget-hero-info">
              <span className={`budget-status-label label-${state}`}>{statusText}</span>
              <div className="budget-amounts">
                <strong>{formatCurrency(status.accumulatedCost)} ₺</strong>
                <span className="muted">/ {formatCurrency(status.budgetLimit)} ₺ bütçe</span>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="readout">{(status.accumulatedEnergyWh / 1000).toFixed(2)}</span>
                  <span className="unit-label">kWh tüketim</span>
                </div>
                <div className="hero-stat">
                  <span className="readout">{status.penaltyActive ? 'Ceza' : 'Standart'}</span>
                  <span className="unit-label">tarife</span>
                </div>
              </div>
              <div className="budget-badges">
                {status.penaltyActive && <span className="tag tag-breach">CEZA TARİFESİ</span>}
                {status.hasAnomaly && <span className="tag tag-warn">CİHAZ ANOMALİSİ</span>}
              </div>
            </div>
          </section>

          <section className="consumer-columns">
            <div className="card consumer-panel">
              <h3>Cihazlarım</h3>
              <ApplianceList appliances={status.appliances} />
            </div>
            <div className="card consumer-panel">
              <h3>Tasarruf Tavsiyeleri</h3>
              <RecommendationList recommendations={recommendations?.content} />
            </div>
          </section>

          <section className="card consumer-panel">
            <h3>Günlük Tüketim Trendi</h3>
            <ConsumptionChart history={history?.content} />
          </section>
        </main>
      ) : (
        <p className="muted">Veri yüklenemedi.</p>
      )}
    </div>
  );
}
