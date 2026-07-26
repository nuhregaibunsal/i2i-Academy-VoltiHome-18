import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Icon } from './Icon.jsx';

const ToastContext = createContext(() => {});
const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  clear: () => {}
});

const ICONS = { error: '', success: '✓' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [log, setLog] = useState([]);

  const notify = useCallback((message, type = 'error', duration) => {
    const id = Date.now() + Math.random();
    const ttl = duration ?? (type === 'breach' ? 9000 : 4000);
    setToasts((current) => [...current, { id, message, type }]);
    setLog((current) => [{ id, message, type, ts: Date.now(), read: false }, ...current].slice(0, 60));
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, ttl);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setLog((current) => current.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setLog((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clear = useCallback(() => setLog([]), []);

  const unreadCount = log.reduce((n, item) => n + (item.read ? 0 : 1), 0);

  const notificationValue = useMemo(
    () => ({ notifications: log, unreadCount, markAllRead, markRead, clear }),
    [log, unreadCount, markAllRead, markRead, clear]
  );

  return (
    <ToastContext.Provider value={notify}>
      <NotificationContext.Provider value={notificationValue}>
        {children}
        <div className="toast-stack">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              onClick={() => dismissToast(toast.id)}
            >
              {toast.type === 'breach' ? (
                <span className="toast-icon"><Icon name="alert" size={16} /></span>
              ) : ICONS[toast.type] ? (
                <span className="toast-icon">{ICONS[toast.type]}</span>
              ) : null}
              <span className="toast-message">{toast.message}</span>
            </div>
          ))}
        </div>
      </NotificationContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function useNotifications() {
  return useContext(NotificationContext);
}
