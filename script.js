/* ---------- Références DOM ---------- */
const bodyMap = document.getElementById("body-map");
const imgEl = document.getElementById("body-image");
const modal = document.getElementById("injury-modal");
const injuryType = document.getElementById("injury-type");
const painLevel = document.getElementById("pain-level");
const painValue = document.getElementById("pain-value");
const symptomText = document.getElementById("symptom-text");
const treatmentText = document.getElementById("treatment-text");
const diagnosisText = document.getElementById("diagnosis-text");
const adviceText = document.getElementById("advice-text");
const detailsText = document.getElementById("details-text");
const saveBtn = document.getElementById("save-injury");
const closeBtn = document.getElementById("close-modal");
const injuryList = document.getElementById("injury-list");

/* ---------- Audio : désactivé par défaut, activé si Easter Egg découvert ---------- */
let soundEnabled = false;
const soundToggle = document.getElementById("sound-toggle");
soundToggle.textContent = "🔇";
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
});

function activateSoundSystem() {
  if (soundEnabled) return;
  soundEnabled = true;
  soundToggle.textContent = "🔊";
  const notif = document.createElement("div");
  notif.className = "sound-activated";
  notif.textContent = "🔊 Système audio médical activé";
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add("fade-out"), 1500);
  setTimeout(() => notif.remove(), 2500);
}

/* Fonction de lecture sonore */
function playSound(type) {
  if (!soundEnabled) return;
  const audio = new Audio();
  audio.volume = 0.4;
  if (type === "heart") audio.src = "sounds/heart.mp3";
  if (type === "bip") audio.src = "sounds/bip.mp3";
  audio.play().catch(() => {});
}

/* ---------- États globaux ---------- */
let injuries = [];
let currentZone = null;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

/* ---------- Zones anatomiques ---------- */
const zones = [
  {id:"head",x:25,y:9,name:"Crâne / Tête (face)",tags:["head"]},
  {id:"forehead",x:25,y:12,name:"Front",tags:["head"]},
  {id:"eye-left",x:24,y:14,name:"Œil gauche",tags:["eye"]},
  {id:"eye-right",x:26,y:14,name:"Œil droit",tags:["eye"]},
  {id:"nose",x:25,y:16,name:"Nez",tags:["face"]},
  {id:"jaw",x:25,y:18,name:"Mâchoire",tags:["jaw"]},
  {id:"neck-front",x:25,y:21,name:"Cou (face)",tags:["neck"]},
  {id:"shoulder-left",x:21,y:22,name:"Épaule gauche",tags:["shoulder","joint"]},
  {id:"shoulder-right",x:29,y:22,name:"Épaule droite",tags:["shoulder","joint"]},
  {id:"chest-left",x:24,y:26,name:"Thorax gauche",tags:["thorax"]},
  {id:"chest-right",x:26,y:26,name:"Thorax droit",tags:["thorax"]},
  {id:"abdomen-upper",x:25,y:34,name:"Abdomen (haut)",tags:["abdomen"]},
  {id:"abdomen-lower",x:25,y:42,name:"Abdomen (bas)",tags:["abdomen"]},
  {id:"groin",x:25,y:52,name:"Entre-jambe",tags:["groin","joint"]}
];

/* ---------- Fonctions utilitaires ---------- */
function getZoneById(id){ return zones.find(z => z.id === id) || null; }
function zoneHasTag(zone, tag){ return zone && Array.isArray(zone.tags) && zone.tags.includes(tag); }

function regionOf(zoneObj){
  if (!zoneObj) return "Autres";
  const t = zoneObj.tags || [];
  if (t.includes("head")||t.includes("eye")||t.includes("jaw")||t.includes("neck")) return "Tête & Cou";
  if (t.includes("thorax")||t.includes("abdomen")||t.includes("groin")) return "Tronc";
  return "Autres";
}

/* ---------- Code Bleu (événement rare) ---------- */
function triggerCodeBlue() {
  const overlay = document.createElement("div");
  overlay.className = "code-blue-overlay";
  overlay.innerHTML = "<h1>🩸 Code Bleu ! Patient en détresse critique !</h1>";
  document.body.appendChild(overlay);

  // Logo et bandeau passent en mode urgence
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.classList.add("code-blue");
    setTimeout(() => logo.classList.remove("code-blue"), 4000);
  }

  const status = document.querySelector(".system-status");
  if (status) {
    status.classList.add("code-blue");
    status.innerHTML = "🩸 <strong>Code Bleu activé — Patient en détresse critique !</strong>";
    setTimeout(() => {
      status.classList.remove("code-blue");
      status.innerHTML = "🟢 Système prêt — En attente de diagnostic";
    }, 4000);
  }

  setTimeout(() => overlay.classList.add("fade-out"), 2000);
  setTimeout(() => overlay.remove(), 3500);
  clickCount = 0;
  codeBlueThreshold = Math.floor(100 + Math.random() * 20);
}

function registerClick() {
  clickCount++;
  // 30% de chance de déclencher le Code Bleu une fois le seuil atteint
  if (clickCount >= codeBlueThreshold && Math.random() < 0.3) {
    triggerCodeBlue();
  }
}

/* ---------- Hotspots ---------- */
function createHotspot(zone){
  const spot = document.createElement("div");
  spot.className = "hotspot";
  spot.dataset.x = zone.x;
  spot.dataset.y = zone.y;
  spot.title = zone.name;

  spot.addEventListener("click", (e) => {
    registerClick();

    // Easter eggs 🧠 / 💔 / 🍆
    if (e.shiftKey && (zone.id.includes("head") || zone.id.includes("forehead"))){
      activateSoundSystem();
      playSound("bip");
      alert("🧠 Le diagnostic serait trop compliqué pour toi.");
      const bulb = document.createElement("div");
      bulb.className = "idea-bulb";
      bulb.textContent = "💡";
      bulb.style.left = e.clientX + "px";
      bulb.style.top = e.clientY + "px";
      document.body.appendChild(bulb);
      setTimeout(() => bulb.remove(), 1500);
      return;
    }

    if (e.shiftKey && (zone.id.includes("chest") || zone.id.includes("thorax"))){
      activateSoundSystem();
      playSound("heart");
      alert("💔 Rien à réparer ici, c’est déjà détruit.");
      const heart = document.createElement("div");
      heart.className = "broken-heart";
      heart.textContent = "💔";
      heart.style.left = e.clientX + "px";
      heart.style.top = e.clientY + "px";
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1500);
      return;
    }

    if (zone.id === "groin"){
      groinClicks++;
      if (groinClicks === 10){
        activateSoundSystem();
        alert("😏 Moi c’est Stan, on va au chalet ?");
        groinClicks = 0;
        return;
      }
    }

    openModal(zone);
  });

  bodyMap.appendChild(spot);
}

/* ---------- Positionnement responsive ---------- */
function positionHotspots(){
  if (!imgEl.complete) return;
  const rect = imgEl.getBoundingClientRect();
  const mapRect = bodyMap.getBoundingClientRect();
  document.querySelectorAll(".hotspot").forEach((spot) => {
    const px = parseFloat(spot.dataset.x);
    const py = parseFloat(spot.dataset.y);
    const left = rect.left + (rect.width * px / 100);
    const top  = rect.top  + (rect.height* py / 100);
    spot.style.left = (left - mapRect.left) + "px";
    spot.style.top  = (top - mapRect.top) + "px";
  });
}

function resizeHotspots(){ positionHotspots(); }
window.addEventListener("resize", resizeHotspots);
imgEl.addEventListener("load", resizeHotspots);

/* ---------- Diagnostic ---------- */
function openModal(zone){
  currentZone = zone;
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  updateDiagnosis();
}

function closeModal(){
  modal.classList.add("hidden");
  currentZone = null;
}
closeBtn.addEventListener("click", closeModal);

painLevel.addEventListener("input", () => {
  painValue.textContent = painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change", updateDiagnosis);

/* ---------- Simulation de diagnostic ---------- */
function updateDiagnosis(){
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  const zone = currentZone;

  diagnosisText.textContent = `${type} — ${zone ? zone.name : "Zone inconnue"} — douleur ${pain}/10`;
  symptomText.textContent = "Analyse en cours...";
  treatmentText.textContent = "Préparation du protocole...";
  adviceText.textContent = "Consultation recommandée selon gravité.";
  detailsText.textContent = "Procédure de soin standard, évaluation complémentaire requise.";
}

/* ---------- Sauvegarde ---------- */
saveBtn.addEventListener("click", () => {
  if (!currentZone) return;
  const injury = {
    zone: currentZone.name,
    zoneId: currentZone.id,
    type: injuryType.value,
    pain: painLevel.value,
    diagnosis: diagnosisText.textContent,
    symptoms: symptomText.textContent,
    treatments: treatmentText.textContent,
    advice: adviceText.textContent,
    details: detailsText.textContent
  };
  injuries.push(injury);
  renderInjuries();
  closeModal();
});

/* ---------- Affichage ---------- */
function renderInjuries(){
  const groups = {};
  injuries.forEach((i) => {
    const z = getZoneById(i.zoneId);
    const region = regionOf(z);
    if (!groups[region]) groups[region] = [];
    groups[region].unshift(i);
  });

  injuryList.innerHTML = "";
  const order = ["Tête & Cou","Tronc","Autres"];
  let total = 0;
  order.forEach(region => {
    const arr = groups[region];
    if (!arr || arr.length === 0) return;
    total += arr.length;
    const groupEl = document.createElement("div");
    groupEl.className = "injury-group";
    groupEl.innerHTML = `<h3>${region}</h3>`;
    arr.forEach((i) => {
      const item = document.createElement("div");
      item.className = "injury-item";
      item.innerHTML = `<strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)<br>
      <em>${i.diagnosis}</em><br>
      Symptômes: ${i.symptoms}<br>
      Traitements: ${i.treatments}<br>
      ${i.advice}<br>
      🩺 Détails: ${i.details}`;
      groupEl.appendChild(item);
    });
    injuryList.appendChild(groupEl);
  });
  if (total === 0) injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
}

/* ---------- Initialisation ---------- */
window.addEventListener("DOMContentLoaded", () => {
  modal.classList.add("hidden");
  zones.forEach(z => createHotspot(z));
  positionHotspots();
});
