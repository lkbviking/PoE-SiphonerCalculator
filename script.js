const form = document.getElementById("build-form");
const primaryInput = document.getElementById("primary-value");
const supportInput = document.getElementById("support-value");
const thresholdInput = document.getElementById("required-threshold");
const safetyInput = document.getElementById("safety-check");

const statusCard = document.getElementById("status-card");
const scoreValue = document.getElementById("score-value");
const thresholdValue = document.getElementById("threshold-value");
const bufferValue = document.getElementById("buffer-value");
const safetyValue = document.getElementById("safety-value");
const statusMessage = document.getElementById("status-message");

function calculateScore() {
  const primary = Number(primaryInput.value) || 0;
  const support = Number(supportInput.value) || 0;
  const threshold = Number(thresholdInput.value) || 0;
  const safetyPenalty = safetyInput.checked ? 10 : 0;

  const score = primary + support - safetyPenalty;
  const buffer = score - threshold;
  const passes = buffer >= 0;

  return { score, threshold, buffer, passes };
}

function renderStatus() {
  const { score, threshold, buffer, passes } = calculateScore();

  scoreValue.textContent = String(score);
  thresholdValue.textContent = String(threshold);
  bufferValue.textContent = `${buffer >= 0 ? "+" : ""}${buffer}`;
  safetyValue.textContent = safetyInput.checked ? "On" : "Off";

  statusCard.classList.toggle("status-card--pass", passes);
  statusCard.classList.toggle("status-card--fail", !passes);

  const pill = statusCard.querySelector(".status-card__pill");

  if (passes) {
    pill.textContent = "Build Works";
    statusMessage.textContent = "Your placeholder build score clears the current threshold.";
  } else {
    pill.textContent = "Build Fails";
    statusMessage.textContent = "The placeholder build score is below the current threshold, so this setup needs more room.";
  }
}

form.addEventListener("input", renderStatus);
renderStatus();