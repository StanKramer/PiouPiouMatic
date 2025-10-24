/* ================================================================
   PiouPiouMatic RP - Script principal FINAL (calibration absolue)
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
const recalibrateBtn = document.getElementById("recalibrate-btn");
const overlay = document.getElementById("calibration-overlay");
const calibCancel = document.getElementById("calib-cancel");
const calibInstructions = document.getElementById("calib-instructions");
const alignStatus = document.getElementById("align-status");
const lastCalib = document.getElementById("last-calib");

/* ---------- État ---------- */
let injuries = [];
let currentZone = null;
let calibrationStep = 0;
let calibFace = null;
let calibBack = null;

/* ---------- Dimensions image ---------- */
const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1024;

/* ---------- Base anatomique (pixels absolus) ---------- */
const BASE_ZONES = [
  { id: "head", x: 256, y: 80, name: "Tête", tags: ["head"] },
  { id: "neck", x: 256, y: 160, name: "Cou", tags: ["neck"] },
  { id: "shoulderL", x: 210, y: 200, name: "Épaule gauche", tags: ["shoulder"] },
  { id: "shoulderR", x: 302, y: 200, name: "Épaule droite", tags: ["shoulder"] },
  { id: "chest", x: 256, y: 250, name: "Thorax", tags: ["thorax"] },
  { id: "abdomen", x: 256, y: 370, name: "Abdomen", tags: ["abdomen"] },
  { id: "groin", x: 256, y: 450, name: "Entrejambe", tags: ["groin"] },
  { id: "kneeL", x: 240, y: 600, name: "Genou gauche", tags: ["knee"] },
  { id: "kneeR", x: 272, y: 600, name: "Genou droit", tags: ["knee"] },
  { id: "footL", x: 240, y: 870, name: "Pied gauche", tags: ["foot"] },
  { id: "footR", x: 272, y: 870, name: "Pied droit", tags: ["foot"] },
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
let zones = BASE_ZONES.map(z => ({ ...z }));

/* ================================================================
   🩺 Calibration absolue (pixels)
================================================================ */
function startCalibration() {
  calibrationStep = 1;
  calibFace = calibBack = null;
  overlay.classList.remove("hidden");
  calibInstructions.innerHTML =
    "🩺 Calibration requise :<br>Vise le <strong>centre vital</strong> de PiouPiou (vue de face).";
  alignStatus.textContent = "⚠️ recalibrage requis";
}

function handleCalibrationClick(e) {
  const rect = imgEl.getBoundingClientRect();
  const scaleX = rect.width / IMG_WIDTH;
  const scaleY = rect.height / IMG_HEIGHT;

  const clickX = (e.clientX - rect.left) / scaleX;
  const clickY = (e.clientY - rect.top) / scaleY;

  // Halo visuel
  const halo = document.createElement("div");
  halo.className = "calib-halo";
  halo.style.left = e.clientX + "px";
  halo.style.top = e.clientY + "px";
  document.body.appendChild(halo);
  setTimeout(() => halo.remove(), 1000);

  if (calibrationStep === 1) {
    calibFace = { x: clickX, y: clickY };
    calibrationStep = 2;
    calibInstructions.innerHTML =
      "🩺 Calibration requise :<br>Vise le <strong>point secret dorsal</strong> de PiouPiou (vue de dos).";
  } else if (calibrationStep === 2) {
    calibBack = { x: clickX, y: clickY };
    overlay.classList.add("hidden");
    applyCalibration();
    const flash = document.createElement("div");
    flash.className = "calib-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
    alignStatus.textContent = "✅ alignés";
    const now = new Date();
    lastCalib.textContent = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
}

function applyCalibration() {
  if (!calibFace || !calibBack) return;

  const faceCenter = calibFace.x;
  const backCenter = calibBack.x;
  const faceWidth = faceCenter;
  const backWidth = IMG_WIDTH - backCenter;

  zones = BASE_ZONES.map(z => {
    let newX;
    if (z.tags.includes("back")) {
      const ratio = (z.x - 512) / 512;
      newX = backCenter + ratio * backWidth;
    } else {
      const ratio = z.x / 512;
      newX = ratio * faceWidth;
    }
    return { ...z, x: newX, y: z.y };
  });

  refreshHotspots();
}

recalibrateBtn.addEventListener("click", startCalibration);
imgEl.addEventListener("click", e => {
  if (calibrationStep > 0) handleCalibrationClick(e);
});
calibCancel.addEventListener("click", () => overlay.classList.add("hidden"));

/* ================================================================
   Hotspots positionnés en pixels
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
  zones.forEach(z => createHotspot(z));
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
   Diagnostic et affichage (inchangé)
================================================================ */
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
}

function closeModalWindow() {
  modal.classList.add("hidden");
  currentZone = null;
}
closeBtn.addEventListener("click", closeModalWindow);

/* ================================================================
   Initialisation
================================================================ */
window.addEventListener("DOMContentLoaded", () => {
  startCalibration();
  refreshHotspots();
  imgEl.addEventListener("load", positionHotspots);
});
