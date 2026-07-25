import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { HomeGrid } from './HomeGrid.jsx';
import { HomeModal } from './HomeModal.jsx';
import { RegisterHomeForm } from './RegisterHomeForm.jsx';
import { SkeletonGrid } from './Skeleton.jsx';
import { useToast } from './ToastProvider.jsx';

export function SellerDashboard({ onLogout }) {
  const notify = useToast();
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: homes, loading, error } = usePolling(() => api.listHomes(), 2000, true);

  useEffect(() => {
    if (error) {
      notify(error);
    }
  }, [error, notify]);

  const breachedCount = (homes || []).filter((home) => home.quotaBreached).length;
  const anomalyCount = (homes || []).filter((home) => home.hasAnomaly).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">⚡</span>
          <div>
            <h1>VoltWise</h1>
            <p className="muted">Satıcı panosu · gerçek zamanlı izleme</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat">
              <strong>{homes ? homes.length : '—'}</strong>
              <span className="muted">ev</span>
            </div>
            <div className="stat">
              <strong className={breachedCount > 0 ? 'danger' : ''}>{breachedCount}</strong>
              <span className="muted">bütçe aşımı</span>
            </div>
            <div className="stat">
              <strong className={anomalyCount > 0 ? 'warning' : ''}>{anomalyCount}</strong>
              <span className="muted">anomali</span>
            </div>
          </div>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Rol değiştir
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="dashboard">
          {loading && !homes ? <SkeletonGrid /> : <HomeGrid homes={homes} onSelect={setSelectedHomeId} />}
        </section>
        <aside className="sidebar">
          <RegisterHomeForm key={refreshKey} onRegistered={() => setRefreshKey((k) => k + 1)} />
        </aside>
      </main>

      {selectedHomeId && <HomeModal homeId={selectedHomeId} onClose={() => setSelectedHomeId(null)} />}
    </div>
  );
}
