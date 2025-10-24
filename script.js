// ===========================
// PiouPiouMatic Diagnostic UI - Version modal au clic
// ===========================

// RÉFÉRENCES DOM
const bodyMap = document.getElementById("hotspotLayer");
const modal = document.getElementById("modal");
const modalPart = document.getElementById("modalPart");
const modalCancel = document.getElementById("modalCancel");
const modalAdd = document.getElementById("modalAdd");
const modalType = document.getElementById("modalType");
const modalPain = document.getElementById("modalPain");
const modalPainLabel = document.getElementById("modalPainLabel");
const modalSymptoms = document.getElementById("modalSymptoms");
const modalTreatments = document.getElementById("modalTreatments");
const injuryList = document.getElementById("injuryList");

let injuries = [];
let currentZone = null;

// Empêche le modal de s'afficher au chargement
document.addEventListener("DOMContentLoaded", () => {
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
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

// ===========================
// AJOUT DYNAMIQUE DES HOTSPOTS
// ===========================
zones.forEach((zone) => {
  const spot = document.createElement("div");
  spot.classList.add("hotspot");
  spot.style.left = zone.x;
  spot.style.top = zone.y;
  spot.dataset.zone = zone.id;
  spot.title = zone.name;

  // clic sur zone → ouvre le modal
  spot.addEventListener("click", () => {
    currentZone = zone;
    modalPart.textContent = "Partie: " + zone.name;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    updateModalFields();
  });

  bodyMap.appendChild(spot);
});

// ===========================
// INITIALISATION DU MODAL
// ===========================
function updateModalFields() {
  modalPain.value = 5;
  modalPainLabel.textContent = "5";
  modalType.innerHTML = `
    <option value="arme feu">Arme à feu</option>
    <option value="arme blanche">Arme blanche</option>
    <option value="contendante">Contondante</option>
    <option value="avp">Accident véhicule</option>
    <option value="chute">Chute</option>
  `;
  modalSymptoms.textContent = "—";
  modalTreatments.textContent = "—";
}

// Mise à jour de l'affichage de la douleur
modalPain.addEventListener("input", () => {
  modalPainLabel.textContent = modalPain.value;
});

// ===========================
// FERMETURE DU MODAL
// ===========================
modalCancel.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentZone = null;
});

// ===========================
// AJOUT DE BLESSURE
// ===========================
modalAdd.addEventListener("click", () => {
  if (!currentZone) return;

  const type = modalType.value;
  const pain = parseInt(modalPain.value);
  const symptoms = generateSymptoms(type, pain);
  const treatment = generateTreatment(type, pain);

  injuries.push({
    zone: currentZone.name,
    type,
    pain,
    symptoms,
    treatment,
  });

  updateInjuryList();
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentZone = null;
});

// ===========================
// GÉNÉRATION AUTOMATIQUE
// ===========================
function generateSymptoms(type, pain) {
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

function generateTreatment(type, pain) {
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
function updateInjuryList
