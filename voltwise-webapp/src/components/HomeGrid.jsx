import { HomeCard } from './HomeCard.jsx';

export function HomeGrid({ homes, onSelect, forecast }) {
  if (!homes || homes.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark">🏠</span>
        <p>Görüntülenecek ev yok.</p>
        <p className="muted">Sağ üstteki “+ Yeni Ev” ile ilk evi kaydedin ya da filtreyi değiştirin.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {homes.map((home) => (
        <HomeCard
          key={home.homeId}
          home={home}
          onSelect={onSelect}
          secondsToBreach={forecast ? forecast.get(home.homeId) : undefined}
        />
      ))}
    </div>
  );
}
