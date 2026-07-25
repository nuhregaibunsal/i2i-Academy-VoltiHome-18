const REASON_LABELS = {
  QUOTA_WARNING_80: 'Bütçe %80 uyarısı',
  QUOTA_BREACH_100: 'Bütçe aşımı',
  APPLIANCE_ANOMALY: 'Cihaz anomalisi',
  DOMINANT_APPLIANCE_ADVICE: 'Baskın cihaz tavsiyesi'
};

function formatDate(value) {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function RecommendationList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <p className="muted">Henüz bir tasarruf tavsiyesi oluşmadı. Her şey yolunda görünüyor.</p>;
  }

  return (
    <div className="recommendation-list">
      {recommendations.map((item) => (
        <div key={item.id} className="recommendation-card">
          <div className="recommendation-head">
            <span className="recommendation-reason">{REASON_LABELS[item.triggerReason] || item.triggerReason}</span>
            <span className="muted recommendation-date">{formatDate(item.createdAt)}</span>
          </div>
          <p className="recommendation-body">{item.content}</p>
        </div>
      ))}
    </div>
  );
}
