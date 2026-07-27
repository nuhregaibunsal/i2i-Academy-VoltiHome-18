import { Icon } from './Icon.jsx';
import { resolveTariff, formatMultiplier, tierLabel, MAX_TIER } from '../lib/tariff.js';

export function TariffBadge({ source, variant = 'card' }) {
  const { tier, multiplier, capped, active } = resolveTariff(source);
  const tone = capped ? 'capped' : active ? 'penalty' : 'standard';

  const text = active ? `${tierLabel(tier)} · ${formatMultiplier(multiplier)}` : 'Standart';
  const fill = capped ? 100 : active ? ((tier + 1) / (MAX_TIER + 1)) * 100 : 0;
  const ariaLabel = active
    ? `Tarife kademesi ${tierLabel(tier)}, çarpan ${formatMultiplier(multiplier)}${capped ? ', tavan' : ''}`
    : 'Standart tarife';

  return (
    <span className={`tariff-badge tariff-badge-${variant} tone-${tone}`} role="img" aria-label={ariaLabel}>
      <span className="tariff-badge-row">
        <Icon name={capped ? 'lock' : 'bolt'} size={variant === 'tile' ? 16 : 13} />
        <span className="tariff-badge-text">{text}</span>
      </span>
      {active && (
        <span className="tariff-badge-track" aria-hidden="true">
          <span className="tariff-badge-fill" style={{ width: `${fill}%` }} />
        </span>
      )}
    </span>
  );
}
