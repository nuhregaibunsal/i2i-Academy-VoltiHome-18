import { useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from './ToastProvider.jsx';
import { Icon } from './Icon.jsx';

export function LoginScreen({ onEnter }) {
  const notify = useToast();
  const [mode, setMode] = useState('choose');
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  async function submitConsumer(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.consumerLogin({ email: email.trim(), password });
      onEnter({ role: 'consumer', homeId: result.homeId, homeName: result.name });
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark"><Icon name="bolt" size={30} /></span>
          <h1>VoltiHome</h1>
          <p className="muted">Gerçek zamanlı enerji izleme ve bütçe denetimi</p>
        </div>

        {mode === 'choose' && (
          <div className="role-grid">
            <button type="button" className="role-card" onClick={() => onEnter({ role: 'seller' })}>
              <span className="role-icon"><Icon name="building" size={28} /></span>
              <strong>Satıcı</strong>
              <span className="muted">Tüm evleri yönet ve izle, yeni ev kaydet</span>
            </button>
            <button type="button" className="role-card" onClick={() => setMode('consumer')}>
              <span className="role-icon"><Icon name="home" size={28} /></span>
              <strong>Kullanıcı</strong>
              <span className="muted">Kendi evinin tüketim ve tasarruf bilgileri</span>
            </button>
          </div>
        )}

        {mode === 'consumer' && (
          <form className="consumer-login" onSubmit={submitConsumer}>
            <label>
              E-posta
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ev kaydında girilen e-posta"
                required
                autoFocus
              />
            </label>
            <label>
              Şifre
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ev kaydında belirlenen şifre"
                required
              />
            </label>
            <div className="login-actions">
              <button type="button" className="ghost-button" onClick={() => setMode('choose')}>
                Geri
              </button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
