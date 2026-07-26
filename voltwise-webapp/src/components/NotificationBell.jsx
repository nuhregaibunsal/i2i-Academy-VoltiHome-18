import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../hooks/usePolling.js';
import { Icon } from './Icon.jsx';

const SEVERITY = {
  QUOTA_BREACH_100: 'breach',
  QUOTA_WARNING_80: 'warn',
  APPLIANCE_ANOMALY: 'warn',
  DOMINANT_APPLIANCE_ADVICE: 'advice'
};

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 30) return 'az önce';
  if (diff < 60) return `${diff} sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return new Date(ts).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function NotificationBell({ scope }) {
  const homeId = scope?.homeId;
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const ref = useRef(null);
  const { data } = usePolling(() => api.getNotifications({ homeId, size: 40 }), 5000, true);

  const notifications = data?.content || [];
  const isRead = (n) => n.read || readIds.has(n.id);
  const unreadCount = notifications.reduce((c, n) => c + (isRead(n) ? 0 : 1), 0);

  useEffect(() => {
    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
    return undefined;
  }, [open]);

  function markRead(id) {
    setReadIds((prev) => new Set(prev).add(id));
    api.markNotificationRead(id).catch(() => {});
  }

  function markAllRead() {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
    api.markAllNotificationsRead(homeId).catch(() => {});
  }

  return (
    <div className="bell" ref={ref}>
      <button type="button" className="bell-button" aria-label="Bildirimler" onClick={() => setOpen((v) => !v)}>
        <Icon name="bell" size={18} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="bell-panel">
          <div className="bell-panel-head">
            <span>Bildirimler</span>
            {unreadCount > 0 && (
              <button type="button" className="link-button" onClick={markAllRead}>
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="bell-list">
            {notifications.length === 0 ? (
              <p className="bell-empty muted">Henüz bildirim yok.</p>
            ) : (
              notifications.map((n) => {
                const severity = SEVERITY[n.type] || 'warn';
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`bell-item type-${severity} ${isRead(n) ? 'read' : 'unread'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="bell-item-icon">
                      {severity === 'advice' ? <Icon name="check" size={14} /> : <Icon name="alert" size={14} />}
                    </span>
                    <span className="bell-item-body">
                      <span className="bell-item-msg">
                        {homeId == null && <strong>{n.homeName}: </strong>}
                        {n.message}
                      </span>
                      <span className="bell-item-time">{relativeTime(n.createdAt)}</span>
                    </span>
                    {!isRead(n) && <span className="bell-item-dot" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
