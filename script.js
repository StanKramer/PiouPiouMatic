/* ================================================================
   PiouPiouMatic RP - Script principal (version finale)
   PARTIE 1 : Variables globales + Calibration RP (halo + flash)
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

let injuries = [];
let currentZone = null;
let soundEnabled = false;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

/* ---------- Calibration variables ---------- */
let calibrationStep = 0;
let calibFace = null;
let calibBack = null;

/* ================================================================
   🩺 Calibration semi-automatique RP (halo + flash)
================================================================ */
function startCalibration() {
  calibrationStep = 1;
  calibFace = null;
  calibBack = null;
  overlay.classList.remove("hidden");
  calibInstructions.innerHTML =
    "🩺 Calibration requise :<br>Vise le <strong>centre vital</strong> de PiouPiou (vue de face).";
}

function handleCalibrationClick(e) {
  const rect = imgEl.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
  const clickY = ((e.clientY - rect.top) / rect.height) * 100;

  // Halo bleu visuel à chaque clic
  const halo = document.createElement("div");
  halo.className = "calib-halo";
  halo.style.left = e.clientX + "px";
  halo.style.top = e.clientY + "px";
  document.body.appendChild(halo);
  setTimeout(() => halo.remove(), 1000);

  if (calibrationStep === 1) {
    calibFace = clickX;
    calibrationStep = 2;
    calibInstructions.innerHTML =
      "🩺 Calibration requise :<br>Vise le <strong>point secret dorsal</strong> de PiouPiou (vue de dos).";
  } else if (calibrationStep === 2) {
    calibBack = clickX;
    overlay.classList.add("hidden");
    applyCalibration();

    // Flash bleu de fin de calibration
    const flash = document.createElement("div");
    flash.className = "calib-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  }
}

function applyCalibration() {
  if (calibFace == null || calibBack == null) return;
  const faceCenter = calibFace;
  const backCenter = calibBack;
  const faceWidth = faceCenter;
  const backWidth = 100 - backCenter;

  zones.forEach(z => {
    if (z.tags.includes("back")) {
      const ratio = (z.x - 50) / 50;
      z.x = backCenter + ratio * backWidth;
    } else {
      const ratio = z.x / 50;
      z.x = ratio * faceCenter;
    }
  });

  refreshHotspots();
}

/* ---------- Événements Calibration ---------- */
recalibrateBtn.addEventListener("click", startCalibration);
imgEl.addEventListener("click", e => {
  if (calibrationStep > 0) handleCalibrationClick(e);
});
calibCancel.addEventListener("click", () => overlay.classList.add("hidden"));

/* ================================================================
   PARTIE 2 : Moteur médical complet + Code Bleu + Hotspots dynamiques
================================================================ */

/* ---------- Données anatomiques (base fixe) ---------- */
const zones = [
  { id: "head", x: 25, y: 8, name: "Tête", tags: ["head"] },
  { id: "neck", x: 25, y: 22, name: "Cou", tags: ["neck"] },
  { id: "shoulderL", x: 21, y: 25, name: "Épaule gauche", tags: ["shoulder"] },
  { id: "shoulderR", x: 29, y: 25, name: "Épaule droite", tags: ["shoulder"] },
  { id: "chest", x: 25, y: 27, name: "Thorax", tags: ["thorax"] },
  { id: "abdomen", x: 25, y: 42, name: "Abdomen", tags: ["abdomen"] },
  { id: "groin", x: 25, y: 52, name: "Entrejambe", tags: ["groin"] },
  { id: "kneeL", x: 23, y: 71, name: "Genou gauche", tags: ["knee"] },
  { id: "kneeR", x: 27, y: 71, name: "Genou droit", tags: ["knee"] },
  { id: "footL", x: 23, y: 92, name: "Pied gauche", tags: ["foot"] },
  { id: "footR", x: 27, y: 92, name: "Pied droit", tags: ["foot"] },
  { id: "head-back", x: 75, y: 8, name: "Crâne (dos)", tags: ["head", "back"] },
  { id: "nape", x: 75, y: 20, name: "Nuque", tags: ["neck", "back"] },
  { id: "upper-back", x: 75, y: 32, name: "Dos haut", tags: ["back"] },
  { id: "lower-back", x: 75, y: 40, name: "Dos bas", tags: ["back"] },
  { id: "buttocks", x: 75, y: 54, name: "Fessier", tags: ["hip", "back"] },
  { id: "hamstringL", x: 73, y: 63, name: "Ischio gauche", tags: ["thigh", "back"] },
  { id: "hamstringR", x: 77, y: 63, name: "Ischio droit", tags: ["thigh", "back"] },
  { id: "calfL", x: 73, y: 77, name: "Mollet gauche", tags: ["leg", "back"] },
  { id: "calfR", x: 77, y: 77, name: "Mollet droit", tags: ["leg", "back"] }
];

/* ================================================================
   💉 Moteur médical : Symptômes + Traitements + Conseils
================================================================ */
const injuryDatabase = {
  "arme feu": {
    symptoms: ["Plaie pénétrante", "Saignement rapide", "Brûlure d’entrée/sortie"],
    treatments: ["Compression hémorragique", "Antibiotiques IV", "Radio/Scanner", "Suture chirurgicale"],
    advice: "Surveillance des constantes et contrôle du saignement."
  },
  "fracture": {
    symptoms: ["Douleur aiguë", "Déformation", "Perte de mobilité"],
    treatments: ["Immobilisation", "Radio", "Antalgiques", "Réduction si nécessaire"],
    advice: "Repos strict et suivi orthopédique."
  },
  "brulure": {
    symptoms: ["Rougeur", "Cloques", "Douleur importante"],
    treatments: ["Refroidissement 10 min", "Pansement gras", "Antalgiques"],
    advice: "Éviter la crème et surveiller les signes d’infection."
  },
  "chute": {
    symptoms: ["Ecchymose", "Douleur localisée"],
    treatments: ["Glace 15 min", "Repos", "Radio si nécessaire"],
    advice: "Surveillance et reprise progressive de l’activité."
  },
  "arme blanche": {
    symptoms: ["Plaie nette", "Saignement modéré"],
    treatments: ["Désinfection", "Suture", "Pansement compressif"],
    advice: "Surveillance infection + rappel vaccin antitétanique."
  }
};

/* ================================================================
   🧠 Easter Eggs + Code Bleu
================================================================ */
function handleZoneClick(zone, e) {
  if (calibrationStep > 0) return; // bloque pendant calibration
  registerClick();

  // Easter Eggs
  if (e.shiftKey && zone.tags.includes("head")) {
    alert("🧠 Le diagnostic serait trop compliqué pour toi.");
    return;
  }
  if (e.shiftKey && zone.tags.includes("thorax")) {
    alert("💔 Rien à réparer ici, c’est déjà détruit.");
    return;
  }
  if (zone.tags.includes("groin")) {
    groinClicks++;
    if (groinClicks === 10) {
      alert("😏 Stan : On va au chalet ?");
      groinClicks = 0;
      return;
    }
  }

  openModal(zone);
}

/* Code Bleu aléatoire */
function triggerCodeBlue() {
  const overlay = document.createElement("div");
  overlay.className = "code-blue-overlay";
  overlay.innerHTML = "<h1>🩸 Code Bleu ! Patient en détresse critique !</h1>";
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3500);
}
function registerClick() {
  clickCount++;
  if (clickCount >= codeBlueThreshold && Math.random() < 0.3) triggerCodeBlue();
}

/* ================================================================
   🔧 Positionnement des hotspots
================================================================ */
function createHotspot(zone) {
  const spot = document.createElement("div");
  spot.className = "hotspot";
  spot.dataset.x = zone.x;
  spot.dataset.y = zone.y;
  spot.title = zone.name;
  spot.addEventListener("click", (e) => handleZoneClick(zone, e));
  bodyMap.appendChild(spot);
}

function refreshHotspots() {
  document.querySelectorAll(".hotspot").forEach(h => h.remove());
  zones.forEach(z => createHotspot(z));
  positionHotspots();
}

function positionHotspots() {
  if (!imgEl.complete) return;
  const rect = imgEl.getBoundingClientRect();
  const mapRect = bodyMap.getBoundingClientRect();
  document.querySelectorAll(".hotspot").forEach(spot => {
    const px = parseFloat(spot.dataset.x);
    const py = parseFloat(spot.dataset.y);
    const left = rect.left + rect.width * (px / 100) - mapRect.left;
    const top = rect.top + rect.height * (py / 100) - mapRect.top;
    spot.style.left = left + "px";
    spot.style.top = top + "px";
  });
}
window.addEventListener("resize", positionHotspots);
window.addEventListener("scroll", positionHotspots);

/* ================================================================
   PARTIE 3 : Modale, Diagnostic, Sauvegarde, Réinitialisation, Init
================================================================ */

/* ---------- Modale & Diagnostic dynamique ---------- */
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  const title = document.getElementById("zone-title");
  if (title) title.textContent = `Blessure — ${zone.name}`;
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
  const base = injuryDatabase[type] || {
    symptoms: ["Douleur localisée"],
    treatments: ["Antalgique"],
    advice: "Surveillance 24–48 h."
  };

  // Texte principal
  diagnosisText.textContent = `Atteinte ${type} — douleur ${pain}/10.`;
  symptomText.textContent = base.symptoms.join(", ");
  treatmentText.textContent = base.treatments.join(", ");
  adviceText.textContent = base.advice || "Conseil : suivi si aggravation.";
  detailsText.textContent = "Procédure: nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change", updateDiagnosis);

/* ---------- Sauvegarde & Liste des blessures ---------- */
saveBtn.addEventListener("click", () => {
  if (!currentZone) return;
  const item = {
    zone: currentZone.name,
    type: injuryType.value,
    pain: parseInt(painLevel.value, 10),
    ts: Date.now()
  };
  injuries.unshift(item);
  renderInjuries();
  closeModalWindow();
});

function renderInjuries() {
  if (!injuryList) return;
  if (injuries.length === 0) {
    injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
    return;
  }
  injuryList.innerHTML = "";
  injuries.forEach((i) => {
    const row = document.createElement("div");
    row.className = "injury-item";
    row.innerHTML = `<strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)`;
    injuryList.appendChild(row);
  });
}

/* ---------- Réinitialisation ---------- */
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", () => {
  if (!confirm("⚠️ Réinitialiser toutes les blessures ?")) return;
  injuries = [];
  renderInjuries();
  alert("🩺 Système réinitialisé.");
});

/* ---------- Son ON/OFF ---------- */
const soundToggle = document.getElementById("sound-toggle");
if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
  });
}

/* ---------- Initialisation ---------- */
window.addEventListener("DOMContentLoaded", () => {
  // Lancement de la calibration RP (2 points : face puis dos)
  startCalibration();

  // Création & placement initial
  refreshHotspots();
  renderInjuries();

  // Recalage sur chargement effectif de l'image
  imgEl.addEventListener("load", positionHotspots);

  // Sécurité : recalc sur resize/scroll est déjà ajouté en PARTIE 2
});
