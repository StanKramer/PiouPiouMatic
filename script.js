/* ================================================================
   PiouPiouMatic RP - Version sans calibration
   Hotspots en coordonnées absolues (pixels réels)
   Image : body_both.png — 1024x1024px
================================================================ */

/* ---------- Références DOM ---------- */
const bodyMap = document.getElementById("body-map");
const imgEl = document.getElementById("body-image");
const modal = document.getElementById("injury-modal");
const injuryType = document.getElementById("injury-type");
const painLevel = document.getElementById("pain-level");
const painValue = document.getElementById("pain-value");
const diagnosisText = document.getElementById("diagnosis-text");
const symptomText = document.getElementById("symptom-text");
const treatmentText = document.getElementById("treatment-text");
const adviceText = document.getElementById("advice-text");
const detailsText = document.getElementById("details-text");
const saveBtn = document.getElementById("save-injury");
const closeBtn = document.getElementById("close-modal");
const injuryList = document.getElementById("injury-list");
const recalibrateBtn = document.getElementById("recalibrate-btn"); // inutilisé maintenant

/* ---------- Constantes image ---------- */
const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1024;

/* ---------- Données anatomiques (pixels) ---------- */
const ZONES = [
  { id: "head", x: 256, y: 80, name: "Tête", tags: ["head"] },
  { id: "neck", x: 256, y: 160, name: "Cou", tags: ["neck"] },
  { id: "shoulderL", x: 210, y: 200, name: "Épaule gauche", tags: ["shoulder"] },
  { id: "shoulderR", x: 302, y: 200, name: "Épaule droite", tags: ["shoulder"] },
  { id: "chest", x: 256, y: 260, name: "Thorax", tags: ["thorax"] },
  { id: "abdomen", x: 256, y: 370, name: "Abdomen", tags: ["abdomen"] },
  { id: "groin", x: 256, y: 450, name: "Entrejambe", tags: ["groin"] },
  { id: "kneeL", x: 240, y: 600, name: "Genou gauche", tags: ["knee"] },
  { id: "kneeR", x: 272, y: 600, name: "Genou droit", tags: ["knee"] },
  { id: "footL", x: 240, y: 870, name: "Pied gauche", tags: ["foot"] },
  { id: "footR", x: 272, y: 870, name: "Pied droit", tags: ["foot"] },

  // Dos
  { id: "head-back", x: 768, y: 80, name: "Crâne (dos)", tags: ["head", "back"] },
  { id: "nape", x: 768, y: 160, name: "Nuque", tags: ["neck", "back"] },
  { id: "upper-back", x: 768, y: 280, name: "Dos haut", tags: ["back"] },
  { id: "lower-back", x: 768, y: 400, name: "Dos bas", tags: ["back"] },
  { id: "buttocks", x: 768, y: 480, name: "Fessier", tags: ["hip", "back"] },
  { id: "hamstringL", x: 740, y: 600, name: "Ischio gauche", tags: ["thigh", "back"] },
  { id: "hamstringR", x: 796, y: 600, name: "Ischio droit", tags: ["thigh", "back"] },
  { id: "calfL", x: 740, y: 780, name: "Mollet gauche", tags: ["leg", "back"] },
  { id: "calfR", x: 796, y: 780, name: "Mollet droit", tags: ["leg", "back"] }
];

/* ================================================================
   Hotspots absolus
================================================================ */
function createHotspot(zone) {
  const s = document.createElement("div");
  s.className = "hotspot";
  s.dataset.x = zone.x;
  s.dataset.y = zone.y;
  s.title = zone.name;
  s.addEventListener("click", () => openModal(zone));
  bodyMap.appendChild(s);
}

function refreshHotspots() {
  document.querySelectorAll(".hotspot").forEach(h => h.remove());
  ZONES.forEach(z => createHotspot(z));
  positionHotspots();
}

function positionHotspots() {
  const rect = imgEl.getBoundingClientRect();
  const scaleX = rect.width / IMG_WIDTH;
  const scaleY = rect.height / IMG_HEIGHT;
  const mapRect = bodyMap.getBoundingClientRect();

  document.querySelectorAll(".hotspot").forEach(s => {
    const px = parseFloat(s.dataset.x);
    const py = parseFloat(s.dataset.y);
    const left = rect.left + px * scaleX - mapRect.left;
    const top = rect.top + py * scaleY - mapRect.top;
    s.style.left = left + "px";
    s.style.top = top + "px";
  });
}

["resize", "scroll"].forEach(evt => window.addEventListener(evt, positionHotspots));

/* ================================================================
   Moteur médical simplifié (inchangé)
================================================================ */
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  updateDiagnosis();
}

function closeModalWindow() {
  modal.classList.add("hidden");
  currentZone = null;
}
closeBtn.addEventListener("click", closeModalWindow);

function updateDiagnosis() {
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  diagnosisText.textContent = `Atteinte ${type} — douleur ${pain}/10.`;
  symptomText.textContent = "Douleur localisée, inflammation probable.";
  treatmentText.textContent = "Antalgique, désinfection, repos.";
  adviceText.textContent = "Surveillance 24–48 h.";
  detailsText.textContent = "Procédure: nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change", updateDiagnosis);

/* ================================================================
   Initialisation
================================================================ */
window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  imgEl.addEventListener("load", positionHotspots);
});
