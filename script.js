const bodyMap = document.getElementById("body-map");
const modal = document.getElementById("injury-modal");
const injuryType = document.getElementById("injury-type");
const painLevel = document.getElementById("pain-level");
const painValue = document.getElementById("pain-value");
const symptomText = document.getElementById("symptom-text");
const treatmentText = document.getElementById("treatment-text");
const saveBtn = document.getElementById("save-injury");
const closeBtn = document.getElementById("close-modal");
const injuryList = document.getElementById("injury-list");

let injuries = [];
let currentZone = null;
let groinClicks = 0;

// ——— Empêche le modal d'apparaître au démarrage ———
window.addEventListener("DOMContentLoaded", () => {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
});

// ——— Définition des zones cliquables ———
const zones = [
  { id: "head", x: "47%", y: "12%", name: "Tête" },
  { id: "chest", x: "47%", y: "32%", name: "Torse" },
  { id: "abdomen", x: "47%", y: "45%", name: "Abdomen" },
  { id: "left-arm", x: "35%", y: "35%", name: "Bras gauche" },
  { id: "right-arm", x: "60%", y: "35%", name: "Bras droit" },
  { id: "left-leg", x: "44%", y: "70%", name: "Jambe gauche" },
  { id: "right-leg", x: "52%", y: "70%", name: "Jambe droite" },
  { id: "groin", x: "48%", y: "55%", name: "Entre-jambe" },
];

// Création des hotspots
zones.forEach((zone) => {
  const spot = document.createElement("div");
  spot.className = "hotspot";
  spot.style.left = zone.x;
  spot.style.top = zone.y;
  spot.title = zone.name;

  spot.addEventListener("click", () => {
    if (zone.id === "groin") {
      groinClicks++;
      if (groinClicks === 10) {
        alert("On peut apprendre à se connaître avant non ? Moi c’est Stan, on va au chalet ?");
        groinClicks = 0;
        return;
      }
    }
    openModal(zone);
  });

  bodyMap.appendChild(spot);
});

// ——— Gestion du modal ———
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  currentZone = null;
}

closeBtn.addEventListener("click", closeModal);

// ——— Gestion douleur ———
painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});

// ——— Génération des symptômes et traitements ———
function updateDiagnosis() {
  const type = injuryType.value;
  const pain = parseInt(painLevel.value);
  let symptoms = [];
  let treatments = [];

  switch (type) {
    case "arme feu":
      symptoms = ["Plaie perforante", "Saignement abondant"];
      if (pain >= 5) symptoms.push("Organe ou muscle touché");
      treatments = ["Extraction de balle", "Suture", "Antibiotiques"];
      break;
    case "arme blanche":
      symptoms = ["Entaille profonde", "Saignement modéré"];
      if (pain >= 6) symptoms.push("Lésion musculaire");
      treatments = ["Suture fine", "Désinfection", "Antalgiques"];
      break;
    case "contendante":
      symptoms = ["Hématome", "Douleur localisée"];
      if (pain >= 7) symptoms.push("Fracture suspectée");
      treatments = ["Glace", "Radio", "Immobilisation"];
      break;
    case "avp":
      symptoms = ["Traumatisme global", "Douleur diffuse"];
      if (pain >= 7) symptoms.push("Lésions internes probables");
      treatments = ["Scanner complet", "Surveillance", "Oxygène"];
      break;
    case "chute":
      symptoms = ["Ecchymoses", "Douleur diffuse"];
      if (pain >= 8) symptoms.push("Fracture possible");
      treatments = ["Radio", "Antalgiques", "Repos"];
      break;
  }

  if (pain >= 8) treatments.push("Morphine / IRM");
  else if (pain >= 5) treatments.push("Antalgiques", "Surveillance");
  else treatments.push("Crème apaisante", "Repos localisé");

  symptomText.textContent = symptoms.join(", ");
  treatmentText.textContent = treatments.join(", ");
}

injuryType.addEventListener("change", updateDiagnosis);

// ——— Ajout de la blessure ———
saveBtn.addEventListener("click", () => {
  if (!currentZone) return;

  const injury = {
    zone: currentZone.name,
    type: injuryType.value,
    pain: painLevel.value,
    symptoms: symptomText.textContent,
    treatments: treatmentText.textContent,
  };
  injuries.push(injury);
  renderInjuries();
  closeModal();
});

function renderInjuries() {
  injuryList.innerHTML = "";
  injuries.forEach((i) => {
    const item = document.createElement("div");
    item.classList.add("injury-item");
    item.innerHTML = `<strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)<br>
    Symptômes: ${i.symptoms}<br>
    Traitements: ${i.treatments}<br><hr>`;
    injuryList.appendChild(item);
  });
}
