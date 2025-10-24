/* ================================================================
   PiouPiouMatic - Ocean Medical Center
   Version complète (Hotspots + Modale + Résumé + Facturation)
================================================================ */

/* --- Constantes DOM --- */
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
const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1024;

/* --- Données globales --- */
window.injuries = [];

/* --- Coordonnées des hotspots --- */
const ZONES = [
  { id: "head", x: 256, y: 80, name: "Tête" },
  { id: "face", x: 256, y: 140, name: "Visage" },
  { id: "neck", x: 256, y: 190, name: "Cou" },
  { id: "chest", x: 256, y: 270, name: "Poitrine" },
  { id: "abdomen", x: 253, y: 436, name: "Abdomen" },
  { id: "groin", x: 252, y: 561, name: "Entrejambe" },
  { id: "thighL", x: 201, y: 610, name: "Cuisse gauche" },
  { id: "thighR", x: 302, y: 606, name: "Cuisse droite" },
  { id: "kneeL", x: 194, y: 714, name: "Genou gauche" },
  { id: "kneeR", x: 305, y: 695, name: "Genou droit" },
  { id: "shinL", x: 180, y: 788, name: "Tibia gauche" },
  { id: "shinR", x: 315, y: 757, name: "Tibia droit" },
  { id: "footL", x: 170, y: 901, name: "Pied gauche" },
  { id: "footR", x: 315, y: 909, name: "Pied droit" },
  { id: "upperBack", x: 731, y: 250, name: "Haut du dos" },
  { id: "midBack", x: 734, y: 337, name: "Milieu du dos" },
  { id: "lowerBack", x: 736, y: 424, name: "Bas du dos" },
  { id: "buttocks", x: 738, y: 540, name: "Fessier" },
  { id: "calfL", x: 669, y: 814, name: "Mollet gauche" },
  { id: "calfR", x: 796, y: 826, name: "Mollet droit" },
];

/* ================================================================
   === CREATION ET POSITIONNEMENT DES HOTSPOTS ===
================================================================ */
function createHotspot(zone) {
  const s = document.createElement("div");
  s.className = "hotspot";
  s.dataset.id = zone.id;
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
  const imgW = imgEl.offsetWidth;
  const imgH = imgEl.offsetHeight;
  const scaleX = imgW / IMG_WIDTH;
  const scaleY = imgH / IMG_HEIGHT;
  document.querySelectorAll(".hotspot").forEach(s => {
    const px = parseFloat(s.dataset.x);
    const py = parseFloat(s.dataset.y);
    s.style.left = px * scaleX + "px";
    s.style.top = py * scaleY + "px";
  });
}
window.addEventListener("resize", positionHotspots);

/* ================================================================
   === FENETRE DE DIAGNOSTIC ===
================================================================ */
function openModal(zone) {
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  openModal.currentZone = zone;
  updateDiagnosis();
}
function closeModalWindow() {
  modal.classList.add("hidden");
  openModal.currentZone = null;
}
closeBtn.addEventListener("click", closeModalWindow);

/* ================================================================
   === MISE A JOUR DU DIAGNOSTIC ===
================================================================ */
function updateDiagnosis() {
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  diagnosisText.textContent = `Atteinte de type ${type} — douleur ${pain}/10.`;
  symptomText.textContent = "Douleur localisée, inflammation probable.";
  treatmentText.textContent = "Soin : nettoyage, contrôle douleur, imagerie si nécessaire.";
  adviceText.textContent = "Recommandation : Suivi à l’Ocean Medical Center si persistant.";
}
painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change", updateDiagnosis);

/* ================================================================
   === ENREGISTREMENT DE LA BLESSURE ===
================================================================ */
saveBtn.addEventListener("click", () => {
  const zone = openModal.currentZone;
  if (!zone) return;
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  const care = "Traitement adapté selon protocole.";
  const advice = "Suivi à l’Ocean Medical Center si symptômes persistants.";
  window.injuries.unshift({
    zone: zone.name,
    id: zone.id,
    type,
    pain,
    care,
    advice,
    ts: Date.now(),
  });
  closeModalWindow();
  renderSummary();
});

/* ================================================================
   === RENDU DU RESUME MEDICAL ===
================================================================ */
function renderSummary() {
  const container = document.getElementById("injury-list");
  container.innerHTML = "";

  if (window.injuries.length === 0) {
    container.innerHTML = "<p>Aucune blessure détectée</p>";
    return;
  }

  const grouped = {};
  window.injuries.forEach(i => {
    if (!grouped[i.zone]) grouped[i.zone] = [];
    grouped[i.zone].push(i);
  });

  for (const zone in grouped) {
    const group = grouped[zone];
    const groupDiv = document.createElement("div");
    groupDiv.className = "injury-group";
    const h3 = document.createElement("h3");
    h3.textContent = zone;
    groupDiv.appendChild(h3);

    group.forEach(i => {
      const p = document.createElement("p");
      p.className = "injury-item";
      p.textContent = `• ${i.type} (Douleur ${i.pain}/10) — ${i.care}`;
      groupDiv.appendChild(p);
    });

    container.appendChild(groupDiv);
  }

  const total = window.injuries.length * 500; // exemple de coût simplifié
  const factDiv = document.createElement("div");
  factDiv.className = "billing-info";
  factDiv.innerHTML = `
    <hr>
    <h4>💰 Facturation</h4>
    <p>Nombre total de blessures : ${window.injuries.length}</p>
    <p><strong>Total :</strong> ${total.toLocaleString()}$</p>
    <p style="font-size:0.85rem;color:#9df;">🧾 Diagnostic final validé par le service médical de l’Ocean Medical Center.</p>
  `;
  container.appendChild(factDiv);
}

/* ================================================================
   === INITIALISATION ===
================================================================ */
window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  renderSummary();
  console.log("✅ Hotspots et résumé initialisés :", ZONES.length, "zones.");
});
