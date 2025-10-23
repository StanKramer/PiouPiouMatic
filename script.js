// ===========================
// PiouPiouMatic Diagnostic UI
// ===========================

// RÉFÉRENCES DOM
const bodyMap = document.getElementById("body-map");
const modal = document.getElementById("injury-modal");
const typeSelect = document.getElementById("injury-type");
const painInput = document.getElementById("pain-level");
const saveBtn = document.getElementById("save-injury");
const closeBtn = document.getElementById("close-modal");
const injuryList = document.getElementById("injury-list");

let injuries = [];
let currentZone = null;

// Empêche le modal de s’afficher au démarrage
document.addEventListener("DOMContentLoaded", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentZone = null;
});

// ===========================
// DÉFINITION DES ZONES
// ===========================
const zones = [
  { id: "head", name: "Tête / Mâchoire", x: "49%", y: "12%" },
  { id: "chest", name: "Torse", x: "49%", y: "30%" },
  { id: "abdomen", name: "Abdomen", x: "49%", y: "45%" },
  { id: "left-arm", name: "Bras gauche / Avant-bras", x: "38%", y: "30%" },
  { id: "right-arm", name: "Bras droit / Avant-bras", x: "60%", y: "30%" },
  { id: "left-hand", name: "Main gauche / Doigts", x: "34%", y: "45%" },
  { id: "right-hand", name: "Main droite / Doigts", x: "64%", y: "45%" },
  { id: "left-thigh", name: "Cuisse gauche", x: "45%", y: "60%" },
  { id: "right-thigh", name: "Cuisse droite", x: "53%", y: "60%" },
  { id: "left-leg", name: "Jambe gauche / Tibia", x: "46%", y: "75%" },
  { id: "right-leg", name: "Jambe droite / Tibia", x: "52%", y: "75%" },
  { id: "groin", name: "Entre-jambe", x: "49%", y: "54%" },
];

// Ajout dynamique des hotspots
zones.forEach((zone) => {
  const spot = document.createElement("div");
  spot.classList.add("hotspot");
  spot.style.left = zone.x;
  spot.style.top = zone.y;
  spot.dataset.zone = zone.id;
  spot.title = zone.name;

  // Clic sur zone → ouvre le modal
  spot.addEventListener("click", () => {
    openModal(zone);
    handleSpecialClick(zone);
  });

  bodyMap.appendChild(spot);
});

// ===========================
// FONCTIONS DE BASE
// ===========================
function openModal(zone) {
  if (!zone || !zone.id) return;
  currentZone = zone;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentZone = null;
}

closeBtn.addEventListener("click", closeModal);

// ===========================
// ENREGISTREMENT BLESSURE
// ===========================
saveBtn.addEventListener("click", () => {
  if (!currentZone) {
    console.warn("Aucune zone sélectionnée — modal ignoré");
    return;
  }

  const type = typeSelect.value;
  const pain = parseInt(painInput.value);
  const symptoms = generateSymptoms(type, pain, currentZone);
  const treatment = generateTreatment(type, pain, currentZone);

  injuries.push({
    zone: currentZone.name,
    type,
    pain,
    symptoms,
    treatment,
  });

  updateList();
  closeModal();
});

// ===========================
// GÉNÉRATION AUTOMATIQUE
// ===========================
function generateSymptoms(type, pain, zone) {
  let base = [];

  switch (type) {
    case "arme feu":
      base = ["Plaie perforante", "Saignement"];
      if (pain >= 5) base.push("Possible organe touché");
      break;
    case "arme blanche":
      base = ["Entaille", "Saignement modéré"];
      if (pain >= 5) base.push("Lésion musculaire probable");
      break;
    case "contendante":
      base = ["Hématome", "Douleur localisée"];
      if (pain >= 7) base.push("Fracture suspectée");
      break;
    case "avp":
      base = ["Traumatisme global", "Douleur généralisée"];
      if (pain >= 6) base.push("Suspicion de lésions internes");
      break;
    case "chute":
      base = ["Ecchymoses", "Douleur diffuse"];
      if (pain >= 8) base.push("Risque de fracture ou luxation");
      break;
    default:
      base = ["Douleur localisée"];
  }
  return base.join(", ");
}

function generateTreatment(type, pain, zone) {
  let treatments = ["Surveillance médicale"];

  if (pain >= 8) treatments.push("Morphine IV", "Imagerie (IRM, Scanner)");
  else if (pain >= 5) treatments.push("Antalgiques", "Radio de contrôle");
  else treatments.push("Crème apaisante", "Repos localisé");

  if (type === "arme feu") treatments.push("Extraction de balle", "Suture");
  if (type === "arme blanche") treatments.push("Désinfection", "Suture fine");
  if (type === "contendante") treatments.push("Immobilisation", "Bandage");
  if (type === "avp") treatments.push("Scanner complet", "Mise sous oxygène");
  if (type === "chute") treatments.push("Radio", "Bilan locomoteur");

  return treatments.join(", ");
}

// ===========================
// AFFICHAGE DES BLESSURES
// ===========================
function updateList() {
  injuryList.innerHTML = "";
  injuries.forEach((injury, index) => {
    const item = document.createElement("div");
    item.classList.add("injury-item");
    item.innerHTML = `
      <strong>${injury.zone}</strong> — ${injury.type} (Douleur ${injury.pain}/10)<br>
      <em>Symptômes :</em> ${injury.symptoms}<br>
      <em>Traitement :</em> ${injury.treatment}
    `;
    injuryList.appendChild(item);
  });
}

// ===========================
// EASTER EGG — ENTRE-JAMBE
// ===========================
let groinClicks = 0;
function handleSpecialClick(zone) {
  if (zone.id === "groin") {
    groinClicks++;
    if (groinClicks === 10) {
      alert("On peut apprendre à se connaître avant non ? Moi c’est Stan, on va au chalet ?");
      groinClicks = 0;
    }
  }
}
