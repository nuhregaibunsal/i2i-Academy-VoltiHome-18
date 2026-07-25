import { HomeCard } from './HomeCard.jsx';

export function HomeGrid({ homes, onSelect }) {
  if (!homes || homes.length === 0) {
    return (
      <div className="empty-state">
        <p>Henüz kayıtlı ev yok.</p>
        <p className="muted">Sağ üstteki formu kullanarak ilk evi kaydedin.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {homes.map((home) => (
        <HomeCard key={home.homeId} home={home} onSelect={onSelect} />
      ))}
    </div>
  );
}
