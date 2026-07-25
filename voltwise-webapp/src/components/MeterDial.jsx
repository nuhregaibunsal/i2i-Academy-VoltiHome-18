const CENTER = 80;
const RADIUS = 62;
const START = 225;
const SWEEP = 270;

function polar(deg, r = RADIUS) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

function arcPath(fraction) {
  const end = START + SWEEP * fraction;
  const [x1, y1] = polar(START);
  const [x2, y2] = polar(end);
  const largeArc = SWEEP * fraction > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const TICKS = Array.from({ length: 19 }, (_, i) => {
  const deg = START + (SWEEP * i) / 18;
  const outer = polar(deg, RADIUS + 9);
  const inner = polar(deg, RADIUS + (i % 3 === 0 ? 2 : 5));
  return { x1: inner[0], y1: inner[1], x2: outer[0], y2: outer[1], major: i % 3 === 0 };
});

export function MeterDial({ ratio, state = 'safe', size = 168, value, unit, label }) {
  const shown = Math.max(0, Math.min(ratio, 1));
  const stateColor = `var(--${state})`;

  return (
    <div className="dial" style={{ width: size, height: size, fontSize: size / 7.5 }}>
      <svg viewBox="0 0 160 160" className="dial-svg" aria-hidden="true">
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            className={t.major ? 'dial-tick major' : 'dial-tick'}
          />
        ))}
        <path d={arcPath(1)} className="dial-track" />
        <path
          d={arcPath(1)}
          className="dial-fill"
          pathLength="1"
          style={{ stroke: stateColor, strokeDasharray: '1 1', strokeDashoffset: 1 - shown }}
        />
      </svg>
      <div className="dial-center">
        <span className="dial-value" style={{ color: stateColor }}>
          {value}
        </span>
        {unit && <span className="dial-unit">{unit}</span>}
        {label && <span className="dial-label">{label}</span>}
      </div>
    </div>
  );
}
