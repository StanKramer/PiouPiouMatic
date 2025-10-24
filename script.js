/* ================================================================
   PiouPiouMatic RP - Version stable sans calibration
   Hotspots alignés (pixels réels) pour body_both.png (1024x1024)
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
const alignStatus = document.getElementById("align-status");
const lastCalib = document.getElementById("last-calib");

/* ---------- Constantes image ---------- */
const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1024;

/* ---------- Coordonnées fixes des zones anatomiques ---------- */
const ZONES = [
  // Face
  { id: "head", x: 256, y: 80, name: "Tête", tags: ["head","front"] },
  { id: "face", x: 256, y: 140, name: "Visage", tags: ["head","front"] },
  { id: "neck", x: 256, y: 190, name: "Cou", tags: ["neck","front"] },
  { id: "shoulderL", x: 200, y: 210, name: "Épaule gauche", tags: ["shoulder","front"] },
  { id: "shoulderR", x: 310, y: 210, name: "Épaule droite", tags: ["shoulder","front"] },
  { id: "chest", x: 256, y: 270, name: "Poitrine", tags: ["thorax","front"] },
  { id: "armL", x: 180, y: 320, name: "Bras gauche", tags: ["arm","front"] },
  { id: "armR", x: 332, y: 320, name: "Bras droit", tags: ["arm","front"] },
  { id: "forearmL", x: 170, y: 420, name: "Avant-bras gauche", tags: ["arm","front"] },
  { id: "forearmR", x: 342, y: 420, name: "Avant-bras droit", tags: ["arm","front"] },
  { id: "abdomen", x: 256, y: 400, name: "Abdomen", tags: ["abdomen","front"] },
  { id: "groin", x: 256, y: 470, name: "Entrejambe", tags: ["groin","front"] },
  { id: "thighL", x: 235, y: 540, name: "Cuisse gauche", tags: ["thigh","front"] },
  { id: "thighR", x: 277, y: 540, name: "Cuisse droite", tags: ["thigh","front"] },
  { id: "kneeL", x: 235, y: 650, name: "Genou gauche", tags: ["knee","front"] },
  { id: "kneeR", x: 277, y: 650, name: "Genou droit", tags: ["knee","front"] },
  { id: "shinL", x: 235, y: 760, name: "Tibia gauche", tags: ["leg","front"] },
  { id: "shinR", x: 277, y: 760, name: "Tibia droit", tags: ["leg","front"] },
  { id: "footL", x: 235, y: 880, name: "Pied gauche", tags: ["foot","front"] },
  { id: "footR", x: 277, y: 880, name: "Pied droit", tags: ["foot","front"] },

  // Dos
  { id: "headBack", x: 768, y: 80, name: "Crâne (dos)", tags: ["head","back"] },
  { id: "nape", x: 768, y: 150, name: "Nuque", tags: ["neck","back"] },
  { id: "shoulderBackL", x: 715, y: 210, name: "Épaule gauche (dos)", tags: ["shoulder","back"] },
  { id: "shoulderBackR", x: 821, y: 210, name: "Épaule droite (dos)", tags: ["shoulder","back"] },
  { id: "upperBack", x: 768, y: 270, name: "Haut du dos", tags: ["back"] },
  { id: "midBack", x: 768, y: 340, name: "Milieu du dos", tags: ["back"] },
  { id: "lowerBack", x: 768, y: 420, name: "Bas du dos", tags: ["back"] },
  { id: "buttocks", x: 768, y: 490, name: "Fessier", tags: ["hip","back"] },
  { id: "hamstringL", x: 745, y: 580, name: "Arrière cuisse gauche", tags: ["thigh","back"] },
  { id: "hamstringR", x: 791, y: 580, name: "Arrière cuisse droite", tags: ["thigh","back"] },
  { id: "kneeBackL", x: 745, y: 660, name: "Creux du genou gauche", tags: ["knee","back"] },
  { id: "kneeBackR", x: 791, y: 660, name: "Creux du genou droit", tags: ["knee","back"] },
  { id: "calfL", x: 745, y: 760, name: "Mollet gauche", tags: ["leg","back"] },
  { id: "calfR", x: 791, y: 760, name: "Mollet droit", tags: ["leg","back"] },
  { id: "heelL", x: 745, y: 880, name: "Talon gauche", tags: ["foot","back"] },
  { id: "heelR", x: 791, y: 880, name: "Talon droit", tags: ["foot","back"] }
];

/* ================================================================
   Hotspots absolus (coordonnées fixes)
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
   Moteur médical simplifié
================================================================ */
let injuries = [];
let currentZone = null;

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
  detailsText.textContent = "Procédure : nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change", updateDiagnosis);

saveBtn.addEventListener("click", () => {
  if (!currentZone) return;
  injuries.unshift({
    zone: currentZone.name,
    type: injuryType.value,
    pain: painLevel.value
  });
  renderInjuries();
  closeModalWindow();
});

/* ================================================================
   Convalescence + Facturation sur résumé
================================================================ */
function computeSeverity(type) {
  if (["contondante", "chute", "entorse"].includes(type)) return 1;
  if (["arme blanche", "morsure", "ecrasement"].includes(type)) return 2;
  if (["fracture", "luxation", "perforation"].includes(type)) return 3;
  if (["brulure", "avp"].includes(type)) return 4;
  if (["arme feu"].includes(type)) return 5;
  return 1;
}

function computeRecovery(injuries, loc = "exterieur") {
  if (injuries.length === 0) return "0 min";
  let max = 0;
  for (const i of injuries) {
    const sev = computeSeverity(i.type);
    const pain = parseInt(i.pain, 10);
    const m = loc === "chambre"
      ? Math.min(sev * pain * 0.5, 30)
      : Math.min(Math.max(sev * pain * 10, 10), 1440);
    if (m > max) max = m;
  }
  const h = Math.floor(max / 60);
  const min = Math.round(max % 60);
  return h > 0 ? `${h} h ${min} min` : `${min} min`;
}

function calculateBilling(injuries) {
  let total = 800;
  const details = ["Base hospitalière : 800$"];
  for (const i of injuries) {
    switch (i.type) {
      case "arme feu": total += 5000; details.push("IRM : 5 000$"); break;
      case "fracture": total += 4300; details.push("Plâtre + Radio : 4 300$"); break;
      case "brulure": total += 1000; details.push("Pansement / Bandage : 1 000$"); break;
      case "arme blanche": total += 800; details.push("Sutures : 800$"); break;
      case "luxation": total += 1000; details.push("Attelle : 1 000$"); break;
      case "chute": total += 3000; details.push("Scanner : 3 000$"); break;
      default: total += 1000; details.push("Trousse de soin : 1 000$");
    }
  }
  return { total, details };
}

function renderInjuries() {
  if (injuries.length === 0) {
    injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
    return;
  }

  injuryList.innerHTML = injuries
    .map(i => `<div class='injury-item'><strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)</div>`)
    .join("");

  const recIn = computeRecovery(injuries, "chambre");
  const recOut = computeRecovery(injuries, "exterieur");
  const bill = calculateBilling(injuries);

  injuryList.innerHTML += `
    <div class="injury-total">
      <hr>
      <p>🏥 <strong>Convalescence en chambre :</strong> ${recIn}</p>
      <p>🌄 <strong>Convalescence en extérieur :</strong> ${recOut}</p>
    </div>
    <div class="billing-info">
      <hr>
      <h4>💰 Facturation RP</h4>
      ${bill.details.map(d => `<p>${d}</p>`).join("")}
      <p><strong>Total : ${bill.total.toLocaleString()}$</strong></p>
    </div>
  `;
}

/* ================================================================
   Réinitialisation + Initialisation
================================================================ */
document.getElementById("reset-btn").addEventListener("click", () => {
  injuries = [];
  renderInjuries();
  alert("🩺 Système réinitialisé.");
});

window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  renderInjuries();
  imgEl.addEventListener("load", positionHotspots);
  if (alignStatus) alignStatus.textContent = "✅ alignés";
  if (lastCalib) {
    const d = new Date();
    lastCalib.textContent = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
});
