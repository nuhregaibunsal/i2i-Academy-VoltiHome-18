import { Icon } from './Icon.jsx';

const FEATURES = [
  {
    icon: 'bolt',
    title: 'Anlık görünürlük',
    text: 'Evinizin elektriğini gerçek zamanlı izleyin — hangi cihaz ne kadar harcıyor, paranız nereye gidiyor.'
  },
  {
    icon: 'alert',
    title: 'Sürprizsiz fatura',
    text: 'Bütçenize yaklaştığınızda ve bir cihaz anormal davrandığında anında haberdar olun; aşımdan önce önlem alın.'
  },
  {
    icon: 'home',
    title: 'Bütçe sizde',
    text: 'Kendi harcama sınırınızı belirleyin, nereye ne kadar gittiğini net görün — kontrol tamamen elinizde.'
  },
  {
    icon: 'check',
    title: 'Kişisel tasarruf koçu',
    text: 'Kullanımınıza özel, sade Türkçe önerilerle faturanızı düşürün.'
  }
];

export function Landing({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <span className="brand-mark landing-mark">
          <Icon name="bolt" size={34} />
        </span>
        <h1 className="landing-title">VoltiHome</h1>
        <p className="landing-tagline">
          Gerçek zamanlı ev enerji analitiği ve bütçe denetimi. Akıllı ev cihazlarının tüketimini izleyin,
          maliyetleri kontrol altında tutun, aşımdan önce müdahale edin.
        </p>
        <button type="button" className="primary-button landing-cta" onClick={onStart}>
          Başla →
        </button>

        <div className="landing-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature">
              <span className="landing-feature-icon">
                <Icon name={f.icon} size={20} />
              </span>
              <div>
                <strong>{f.title}</strong>
                <p className="muted">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
