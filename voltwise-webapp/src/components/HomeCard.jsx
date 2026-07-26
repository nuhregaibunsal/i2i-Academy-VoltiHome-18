import { MeterDial } from './MeterDial.jsx';

function formatCurrency(value) {
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatEta(seconds) {
  if (seconds < 60) return '<1 dk';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} dk`;
  return `~${Math.round(mins / 60)} sa`;
}

export function HomeCard({ home, onSelect, secondsToBreach }) {
  const state = home.quotaBreached ? 'breach' : home.budgetUsageRatio >= 0.8 ? 'warn' : 'safe';
  const showEta = !home.quotaBreached && typeof secondsToBreach === 'number';

  return (
    <button type="button" className={`card home-card state-${state}`} onClick={() => onSelect(home.homeId)}>
      <div className="home-card-head">
        <h3>{home.name}</h3>
        <div className="tags">
          {home.penaltyActive && <span className="tag tag-breach">CEZA</span>}
          {home.hasAnomaly && <span className="tag tag-warn">ANOMALİ</span>}
        </div>
      </div>

      <MeterDial
        ratio={home.budgetUsageRatio}
        state={state}
        size={132}
        value={Math.round(home.budgetUsageRatio * 100)}
        unit="%"
        label="bütçe"
      />

      <div className="home-card-readout">
        <span className="readout">{formatCurrency(home.accumulatedCost)}</span>
        <span className="readout-sep">/ {formatCurrency(home.budgetLimit)} ₺</span>
      </div>

      {showEta && (
        <div className="home-card-eta">
          <span className="eta-dot" /> {formatEta(secondsToBreach)} sonra aşım
        </div>
      )}

      <div className="home-card-foot">
        <span className="unit-label">{home.applianceCount} cihaz</span>
        <span className="unit-label">detay →</span>
      </div>
    </button>
  );
}
