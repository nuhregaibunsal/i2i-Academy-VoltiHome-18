export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-bar" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ height = 180 }) {
  return <div className="skeleton" style={{ height, borderRadius: 12 }} />;
}
