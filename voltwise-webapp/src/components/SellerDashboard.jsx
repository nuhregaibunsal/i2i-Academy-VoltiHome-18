import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { useForecast } from '../hooks/useForecast.js';
import { HomeGrid } from './HomeGrid.jsx';
import { HomeModal } from './HomeModal.jsx';
import { RegisterHomeModal } from './RegisterHomeModal.jsx';
import { NotificationBell } from './NotificationBell.jsx';
import { FleetTrend } from './FleetTrend.jsx';
import { FirstRun } from './FirstRun.jsx';
import { Icon } from './Icon.jsx';
import { SkeletonGrid } from './Skeleton.jsx';
import { useToast } from './ToastProvider.jsx';

function formatCurrency(value) {
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SellerDashboard({ onLogout }) {
  const notify = useToast();
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState('usage');
  const [filterBy, setFilterBy] = useState('all');
  const [trend, setTrend] = useState([]);
  const { data: homes, loading, error } = usePolling(() => api.listHomes(), 2000, true);
  const forecast = useForecast(homes);
  const prevRef = useRef(new Map());

  useEffect(() => {
    if (error) notify(error);
  }, [error, notify]);

  useEffect(() => {
    if (!homes) return;
    const prev = prevRef.current;
    homes.forEach((h) => {
      const before = prev.get(h.homeId);
      if (before) {
        if (h.quotaBreached && !before.quotaBreached) {
          notify(`${h.name} bütçeyi aştı — ceza tarifesinde`, 'breach');
        }
        const beforeAnom = before.anomalousAppliances || [];
        (h.anomalousAppliances || [])
          .filter((a) => !beforeAnom.includes(a.name))
          .forEach((a) => notify(`${h.name} — “${a.name}” limiti %${a.overagePercent} aştı`, 'breach'));
      }
    });
    const next = new Map();
    homes.forEach((h) =>
      next.set(h.homeId, {
        quotaBreached: h.quotaBreached,
        anomalousAppliances: (h.anomalousAppliances || []).map((a) => a.name)
      })
    );
    prevRef.current = next;

    const total = homes.reduce((sum, h) => sum + h.accumulatedCost, 0);
    setTrend((current) => [...current, { t: Date.now(), total }].slice(-60));
  }, [homes, notify]);

  const list = homes || [];
  const totalCost = list.reduce((sum, h) => sum + h.accumulatedCost, 0);
  const breachedCount = list.filter((h) => h.quotaBreached).length;
  const anomalyCount = list.filter((h) => h.hasAnomaly).length;

  const displayed = list
    .filter((h) => (filterBy === 'breached' ? h.quotaBreached : filterBy === 'anomaly' ? h.hasAnomaly : true))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'tr');
      if (sortBy === 'recent') return b.homeId - a.homeId;
      return b.budgetUsageRatio - a.budgetUsageRatio;
    });

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark"><Icon name="bolt" size={24} /></span>
          <div>
            <h1>VoltiHome</h1>
            <p className="muted live-line">
              <span className="live-dot" /> canlı izleme · satıcı konsolu
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat">
              <strong>{homes ? homes.length : '—'}</strong>
              <span>ev</span>
            </div>
            <div className="stat">
              <strong>
                {homes ? formatCurrency(totalCost) : '—'}
                <span className="stat-unit">₺</span>
              </strong>
              <span>toplam</span>
            </div>
            <div className="stat">
              <strong className={breachedCount > 0 ? 'danger' : ''}>{breachedCount}</strong>
              <span>bütçe aşımı</span>
            </div>
            <div className="stat">
              <strong className={anomalyCount > 0 ? 'warning' : ''}>{anomalyCount}</strong>
              <span>anomali</span>
            </div>
          </div>
          <NotificationBell />
          <button type="button" className="primary-button" onClick={() => setRegisterOpen(true)}>
            + Yeni Ev
          </button>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Rol değiştir
          </button>
        </div>
      </header>

      {list.length > 0 && (
        <>
          <FleetTrend data={trend} />
          <div className="fleet-controls">
            <div className="filter-chips">
              <button type="button" className={`chip ${filterBy === 'all' ? 'active' : ''}`} onClick={() => setFilterBy('all')}>
                Tümü ({list.length})
              </button>
              <button type="button" className={`chip ${filterBy === 'breached' ? 'active' : ''}`} onClick={() => setFilterBy('breached')}>
                Aşanlar ({breachedCount})
              </button>
              <button type="button" className={`chip ${filterBy === 'anomaly' ? 'active' : ''}`} onClick={() => setFilterBy('anomaly')}>
                Anomali ({anomalyCount})
              </button>
            </div>
            <label className="sort-select">
              <span className="unit-label">sırala</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="usage">Bütçe %'sine göre</option>
                <option value="name">Ada göre</option>
                <option value="recent">Son eklenen</option>
              </select>
            </label>
          </div>
        </>
      )}

      <main className="dashboard full">
        {loading && !homes ? (
          <SkeletonGrid />
        ) : list.length === 0 ? (
          <FirstRun onRegister={() => setRegisterOpen(true)} />
        ) : (
          <HomeGrid homes={displayed} onSelect={setSelectedHomeId} forecast={forecast} />
        )}
      </main>

      {registerOpen && (
        <RegisterHomeModal
          key={refreshKey}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => setRefreshKey((k) => k + 1)}
        />
      )}
      {selectedHomeId && <HomeModal homeId={selectedHomeId} onClose={() => setSelectedHomeId(null)} />}
    </div>
  );
}
