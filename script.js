const form = document.getElementById("build-form");

const inputs = {
  lifePool: document.getElementById("life-pool"),
  armourValue: document.getElementById("armour-value"),
  gemLevel: document.getElementById("skeleton-gem-level"),
  heartboundDamage: document.getElementById("heartbound-damage"),
  overrideEnabled: document.getElementById("skeleton-override-enabled"),
  overrideValue: document.getElementById("skeleton-override"),
  chestReduction: document.getElementById("chest-reduction"),
  enduranceCharges: document.getElementById("endurance-charges"),
  ascendantBerserker: document.getElementById("ascendant-berserker"),
  mindOverMatter: document.getElementById("mind-over-matter"),
  progenesis: document.getElementById("progenesis-enabled"),
};

const outputs = {
  derivedSkeletonCount: document.getElementById("derived-skeleton-count"),
  statusCard: document.getElementById("status-card"),
  statusPill: document.getElementById("status-pill"),
  verdictLabel: document.getElementById("verdict-label"),
  verdictValue: document.getElementById("verdict-value"),
  statusMessage: document.getElementById("status-message"),
  progenesisWarning: document.getElementById("progenesis-warning"),
  progenesisWarningText: document.getElementById("progenesis-warning-text"),
  rawHitValue: document.getElementById("raw-hit-value"),
  summaryDamagePerMinionValue: document.getElementById("summary-damage-per-minion-value"),
  skeletonCountUsed: document.getElementById("skeleton-count-used"),
  damagePerMinionValue: document.getElementById("damage-per-minion-value"),
  armourReductionValue: document.getElementById("armour-reduction-value"),
  extraReductionValue: document.getElementById("extra-reduction-value"),
  damageTakenModifierValue: document.getElementById("damage-taken-modifier-value"),
  mitigatedHitValue: document.getElementById("mitigated-hit-value"),
  manaLossValue: document.getElementById("mana-loss-value"),
  delayedLossValue: document.getElementById("delayed-loss-value"),
  lifeAfterHitValue: document.getElementById("life-after-hit-value"),
  formulaLine: document.getElementById("formula-line"),
  overrideField: document.getElementById("skeleton-override-field"),
  breakdownRows: {
    armourReduction: document.getElementById("armour-reduction-row"),
    extraReduction: document.getElementById("extra-reduction-row"),
    damageTakenModifier: document.getElementById("damage-taken-modifier-row"),
    manaLoss: document.getElementById("mana-loss-row"),
    delayedLoss: document.getElementById("delayed-loss-row"),
  },
};

function clampNumber(value, min, max) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
}

function clampInteger(value, min, max) {
  return Math.round(clampNumber(value, min, max));
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(1, maximumFractionDigits),
  }).format(value);
}

function formatPercent(decimalValue) {
  return `${formatNumber(decimalValue * 100, 1)}%`;
}

function roundReductionToWholePercent(decimalValue) {
  return Math.round(decimalValue * 100) / 100;
}

function toggleBreakdownRow(element, shouldShow) {
  element.hidden = !shouldShow;
}

function deriveSkeletonCount(gemLevel) {
  if (gemLevel >= 31) {
    return 5;
  }

  if (gemLevel >= 21) {
    return 4;
  }

  if (gemLevel >= 11) {
    return 3;
  }

  return 2;
}

function calculateResult() {
  const lifePool = clampNumber(inputs.lifePool.value, 0, 50000);
  const armourValue = clampNumber(inputs.armourValue.value, 0, 500000);
  const gemLevel = clampInteger(inputs.gemLevel.value, 1, 40);
  const derivedSkeletonCount = deriveSkeletonCount(gemLevel);
  const manualOverrideEnabled = inputs.overrideEnabled.checked;
  const overrideSkeletonCount = clampInteger(inputs.overrideValue.value, 0, 20);
  const skeletonCount = manualOverrideEnabled ? overrideSkeletonCount : derivedSkeletonCount;
  const heartboundDamage = clampNumber(inputs.heartboundDamage.value, 0, 5000);
  const chestReductionPercent = clampNumber(inputs.chestReduction.value, 0, 90);
  const enduranceCharges = clampInteger(inputs.enduranceCharges.value, 0, 12);
  const additionalReduction = Math.min(0.9, (chestReductionPercent + enduranceCharges * 4) / 100);
  const totalIncomingDamage = skeletonCount * heartboundDamage;
  const rawArmourReduction = heartboundDamage > 0 ? armourValue / (armourValue + 5 * heartboundDamage) : 0;
  const armourReduction = roundReductionToWholePercent(rawArmourReduction);
  const totalReduction = Math.min(0.9, armourReduction + additionalReduction);
  const mitigatedDamagePerHit = heartboundDamage * (1 - totalReduction);
  const mitigatedHit = mitigatedDamagePerHit * skeletonCount;
  const damageTakenMultiplier = inputs.ascendantBerserker.checked ? 1.05 : 1;
  const damageTakenPerMinionDeath = mitigatedDamagePerHit * damageTakenMultiplier;
  const damageBeforeSplit = mitigatedHit * damageTakenMultiplier;
  const manaLoss = inputs.mindOverMatter.checked ? damageBeforeSplit * 0.4 : 0;
  const lifePortion = inputs.mindOverMatter.checked ? damageBeforeSplit * 0.6 : damageBeforeSplit;
  const delayedLoss = inputs.progenesis.checked ? lifePortion * 0.25 : 0;
  const immediateLifeLoss = inputs.progenesis.checked ? lifePortion * 0.75 : lifePortion;
  const lifeAfterHitWithoutProgenesis = lifePool - lifePortion;
  const lifeAfterHit = lifePool - immediateLifeLoss;
  const shiftedLoss = manaLoss + delayedLoss;
  const survives = lifeAfterHit > 0;
  const progenesisSaves = inputs.progenesis.checked && survives && lifeAfterHitWithoutProgenesis <= 0;

  return {
    derivedSkeletonCount,
    skeletonCount,
    totalIncomingDamage,
    hitDamage: heartboundDamage,
    armourReduction,
    additionalReduction,
    totalReduction,
    mitigatedDamagePerHit,
    mitigatedHit,
    damageTakenMultiplier,
    damageTakenPerMinionDeath,
    damageBeforeSplit,
    manaLoss,
    delayedLoss,
    immediateLifeLoss,
    lifeAfterHitWithoutProgenesis,
    lifeAfterHit,
    shiftedLoss,
    progenesisSaves,
    survives,
  };
}

function renderResult() {
  const result = calculateResult();

  outputs.derivedSkeletonCount.textContent = String(result.derivedSkeletonCount);
  outputs.overrideField.hidden = !inputs.overrideEnabled.checked;
  inputs.overrideValue.disabled = !inputs.overrideEnabled.checked;
  outputs.overrideField.classList.toggle("field--disabled", !inputs.overrideEnabled.checked);

  outputs.statusCard.classList.toggle("status-card--pass", result.survives);
  outputs.statusCard.classList.toggle("status-card--fail", !result.survives);

  outputs.rawHitValue.textContent = formatNumber(result.totalIncomingDamage);
  outputs.skeletonCountUsed.textContent = formatNumber(result.skeletonCount, 0);
  outputs.summaryDamagePerMinionValue.textContent = formatNumber(result.damageTakenPerMinionDeath);
  outputs.damagePerMinionValue.textContent = formatNumber(result.damageTakenPerMinionDeath);
  outputs.armourReductionValue.textContent = formatPercent(result.armourReduction);
  outputs.extraReductionValue.textContent = formatPercent(result.additionalReduction);
  outputs.damageTakenModifierValue.textContent = formatPercent(result.damageTakenMultiplier - 1);
  outputs.mitigatedHitValue.textContent = formatNumber(result.damageBeforeSplit);
  outputs.manaLossValue.textContent = formatNumber(result.manaLoss);
  outputs.delayedLossValue.textContent = formatNumber(result.delayedLoss);
  outputs.lifeAfterHitValue.textContent = formatNumber(Math.max(result.lifeAfterHit, 0));
  outputs.progenesisWarning.hidden = !result.progenesisSaves;

  toggleBreakdownRow(outputs.breakdownRows.armourReduction, result.armourReduction > 0);
  toggleBreakdownRow(outputs.breakdownRows.extraReduction, result.additionalReduction > 0);
  toggleBreakdownRow(outputs.breakdownRows.damageTakenModifier, result.damageTakenMultiplier > 1);
  toggleBreakdownRow(outputs.breakdownRows.manaLoss, result.manaLoss > 0);
  toggleBreakdownRow(outputs.breakdownRows.delayedLoss, result.delayedLoss > 0);

  const berserkerStep = result.damageTakenMultiplier > 1
    ? ` -> Ascendant Berserker ${formatPercent(result.damageTakenMultiplier - 1)} increased taken = ${formatNumber(result.damageBeforeSplit)}`
    : "";

  outputs.formulaLine.textContent = `${formatNumber(result.skeletonCount, 0)} hits of ${formatNumber(result.hitDamage)} -> ${formatNumber(result.skeletonCount, 0)} hits of ${formatNumber(result.mitigatedDamagePerHit)}${berserkerStep} -> immediate life loss ${formatNumber(result.immediateLifeLoss)}.`;

  if (result.progenesisSaves) {
    outputs.progenesisWarningText.textContent = `Progenesis is the only reason this setup survives the break. It must actually be active when the hit happens, which in practice means you will need effectively 100% uptime on it. You will then take ${formatNumber(result.delayedLoss)} delayed life loss over 4 seconds, so without at least 33% life recoup you are still net losing life during that window and may die afterward.`;
  }

  if (result.survives) {
    outputs.statusPill.textContent = "Survives";
    outputs.verdictLabel.textContent = "Immediate life remaining";
    outputs.verdictValue.textContent = formatNumber(result.lifeAfterHit);
    outputs.statusMessage.textContent = `The final unwarded Heartbound hit leaves ${formatNumber(result.lifeAfterHit)} life, so this character survives the siphoner break.`;
  } else {
    outputs.statusPill.textContent = "Dies";
    outputs.verdictLabel.textContent = "Life shortfall";
    outputs.verdictValue.textContent = formatNumber(Math.abs(result.lifeAfterHit));
    outputs.statusMessage.textContent = `The final unwarded Heartbound hit exceeds your life pool by ${formatNumber(Math.abs(result.lifeAfterHit))}, so this setup dies on encountering a siphoner.`;
  }
}

form.addEventListener("input", renderResult);
form.addEventListener("change", renderResult);
renderResult();