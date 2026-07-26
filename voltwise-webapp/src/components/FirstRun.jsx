import { Icon } from './Icon.jsx';

export function FirstRun({ onRegister }) {
  return (
    <div className="first-run">
      <span className="first-run-mark"><Icon name="bolt" size={38} /></span>
      <h2>VoltiHome’a hoş geldiniz</h2>
      <p className="muted first-run-lead">
        Evlerin elektrik tüketimini saniye saniye izleyin; bütçe aşımlarını ve cihaz anomalilerini
        oluştuğu an yakalayın.
      </p>
      <button type="button" className="primary-button first-run-cta" onClick={onRegister}>
        + İlk Evi Kaydet
      </button>
      <div className="first-run-steps">
        <div className="frs">
          <span className="frs-num">1</span>
          <span>Ev ve cihazlarını kaydet</span>
        </div>
        <div className="frs">
          <span className="frs-num">2</span>
          <span>Telemetri canlı akmaya başlar</span>
        </div>
        <div className="frs">
          <span className="frs-num">3</span>
          <span>Aşım ve anomali uyarıları düşer</span>
        </div>
      </div>
    </div>
  );
}
