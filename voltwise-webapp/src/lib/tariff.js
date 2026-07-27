export const BREACH_RATIO = 1.0;
export const PENALTY_START = 1.5;
export const PENALTY_INCREMENT = 0.5;
export const PENALTY_STEP = 0.2;
export const PENALTY_CAP = 3.0;

export const MAX_TIER = Math.max(0, Math.floor((PENALTY_CAP - PENALTY_START) / PENALTY_INCREMENT));

export const TIER_LADDER = [
  { tier: -1, label: 'Standart', multiplier: 1, from: 0, to: 100 },
  ...Array.from({ length: MAX_TIER + 1 }, (_, tier) => {
    const from = Math.round((BREACH_RATIO + tier * PENALTY_STEP) * 100);
    const to = tier < MAX_TIER ? Math.round((BREACH_RATIO + (tier + 1) * PENALTY_STEP) * 100) : null;
    return {
      tier,
      label: `Ceza ${tier + 1}`,
      multiplier: Math.min(PENALTY_START + tier * PENALTY_INCREMENT, PENALTY_CAP),
      from,
      to
    };
  })
];

export function deriveTier(ratio) {
  if (!(ratio >= BREACH_RATIO)) {
    return { tier: -1, multiplier: 1 };
  }
  let tier = Math.floor((ratio - BREACH_RATIO) / PENALTY_STEP);
  if (tier < 0) tier = 0;
  if (tier > MAX_TIER) tier = MAX_TIER;
  return { tier, multiplier: Math.min(PENALTY_START + tier * PENALTY_INCREMENT, PENALTY_CAP) };
}

export function resolveTariff(source) {
  if (!source) {
    return { tier: -1, multiplier: 1, capped: false, active: false };
  }
  let tier;
  let multiplier;
  if (typeof source.penaltyTier === 'number' && typeof source.tariffMultiplier === 'number') {
    tier = source.penaltyTier;
    multiplier = source.tariffMultiplier;
  } else {
    const derived = deriveTier(source.budgetUsageRatio ?? 0);
    tier = derived.tier;
    multiplier = derived.multiplier;
  }
  const capped = tier >= 0 && multiplier >= PENALTY_CAP - 0.001;
  return { tier, multiplier, capped, active: tier >= 0 };
}

export function formatMultiplier(multiplier) {
  const fixed = multiplier.toFixed(1).replace('.', ',');
  return `×${fixed}`;
}

export function tierLabel(tier) {
  return tier < 0 ? 'Standart' : `K${tier + 1}`;
}
