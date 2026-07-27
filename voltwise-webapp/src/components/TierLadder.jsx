import { TIER_LADDER, resolveTariff, formatMultiplier, PENALTY_CAP } from '../lib/tariff.js';

function rangeText(step) {
  if (step.tier < 0) return '< %100';
  if (step.to == null) return `%${step.from}+`;
  return `%${step.from}–${step.to}`;
}

export function TierLadder({ source }) {
  const { tier, multiplier, capped, active } = resolveTariff(source);

  const caption = !active
    ? 'Bütçe içindesiniz — standart fiyat uygulanıyor.'
    : `Şu an her kWh standart fiyatın ${formatMultiplier(multiplier)} katı fiyatlanıyor${
        capped ? ' (en üst kademe — daha fazla artmaz).' : '.'
      }`;

  return (
    <div
      className="tier-ladder"
      role="meter"
      aria-valuemin={1}
      aria-valuemax={PENALTY_CAP}
      aria-valuenow={multiplier}
      aria-label={`Ceza tarifesi, geçerli çarpan ${formatMultiplier(multiplier)}`}
    >
      <div className="tier-ladder-steps">
        {TIER_LADDER.map((step) => {
          const isCurrent = step.tier === tier;
          const isCap = step.to == null && step.tier >= 0;
          const cls = [
            'tier-step',
            isCurrent ? 'is-current' : '',
            isCurrent && capped ? 'is-capped' : '',
            step.tier < 0 ? 'is-standard' : 'is-penalty'
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={step.tier} className={cls}>
              {isCurrent && <span className="tier-here">Buradasınız</span>}
              <span className="tier-mult">{formatMultiplier(step.multiplier)}</span>
              <span className="tier-range">{rangeText(step)}</span>
              {isCap && <span className="tier-cap-note">tavan</span>}
            </div>
          );
        })}
      </div>
      <p className="tier-ladder-caption">{caption}</p>
    </div>
  );
}
