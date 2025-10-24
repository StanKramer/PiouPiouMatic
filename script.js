/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 1 : Variables, zones, hotspots, calibration automatique
================================================================ */

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

/* ---------- État global ---------- */
let soundEnabled = false;
let injuries = [];
let currentZone = null;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

const soundToggle = document.getElementById("sound-toggle");
soundToggle.textContent = "🔇";
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
});

/* ---------- Sons ---------- */
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
function playSound(type) {
  if (!soundEnabled) return;
  const audio = new Audio();
  audio.volume = 0.4;
  if (type === "heart") audio.src = "sounds/heart.mp3";
  if (type === "bip") audio.src = "sounds/bip.mp3";
  audio.play().catch(() => {});
}

/* ================================================================
   🔹 ZONES ANATOMIQUES (face + dos)
================================================================ */
const zones = [
  // FACE
  {id:"head",x:25,y:9,name:"Crâne / Tête (face)",tags:["head"]},
  {id:"forehead",x:25,y:12,name:"Front",tags:["head"]},
  {id:"eye-left",x:24,y:14,name:"Œil gauche",tags:["eye"]},
  {id:"eye-right",x:26,y:14,name:"Œil droit",tags:["eye"]},
  {id:"nose",x:25,y:16,name:"Nez",tags:["face"]},
  {id:"jaw",x:25,y:18,name:"Mâchoire",tags:["jaw"]},
  {id:"neck-front",x:25,y:21,name:"Cou (face)",tags:["neck"]},
  {id:"shoulder-left",x:21,y:22,name:"Épaule gauche",tags:["shoulder","joint"]},
  {id:"shoulder-right",x:29,y:22,name:"Épaule droite",tags:["shoulder","joint"]},
  {id:"arm-left",x:20,y:30,name:"Bras gauche",tags:["arm"]},
  {id:"arm-right",x:30,y:30,name:"Bras droit",tags:["arm"]},
  {id:"forearm-left",x:19,y:38,name:"Avant-bras gauche",tags:["forearm"]},
  {id:"forearm-right",x:31,y:38,name:"Avant-bras droit",tags:["forearm"]},
  {id:"hand-left",x:18,y:50,name:"Main gauche",tags:["hand"]},
  {id:"hand-right",x:32,y:50,name:"Main droite",tags:["hand"]},
  {id:"chest-left",x:24,y:26,name:"Thorax gauche",tags:["thorax"]},
  {id:"chest-right",x:26,y:26,name:"Thorax droit",tags:["thorax"]},
  {id:"abdomen-upper",x:25,y:34,name:"Abdomen (haut)",tags:["abdomen"]},
  {id:"abdomen-lower",x:25,y:42,name:"Abdomen (bas)",tags:["abdomen"]},
  {id:"groin",x:25,y:52,name:"Entre-jambe",tags:["groin"]},
  {id:"thigh-left",x:23,y:62,name:"Cuisse gauche",tags:["thigh"]},
  {id:"thigh-right",x:27,y:62,name:"Cuisse droite",tags:["thigh"]},
  {id:"knee-left",x:23,y:70,name:"Genou gauche",tags:["knee"]},
  {id:"knee-right",x:27,y:70,name:"Genou droit",tags:["knee"]},
  {id:"foot-left",x:23,y:92,name:"Pied gauche",tags:["foot"]},
  {id:"foot-right",x:27,y:92,name:"Pied droit",tags:["foot"]},

  // DOS
  {id:"head-back",x:75,y:9,name:"Crâne (dos)",tags:["head","back"]},
  {id:"nape",x:75,y:20,name:"Nuque",tags:["neck","back"]},
  {id:"scapula-left",x:72,y:26,name:"Omoplate gauche",tags:["shoulder","back"]},
  {id:"scapula-right",x:78,y:26,name:"Omoplate droite",tags:["shoulder","back"]},
  {id:"lower-back",x:75,y:40,name:"Dos bas",tags:["back"]},
  {id:"buttocks",x:75,y:55,name:"Fessier",tags:["back","hip"]},
  {id:"hamstring-left",x:73,y:62,name:"Ischio gauche",tags:["thigh","back"]},
  {id:"hamstring-right",x:77,y:62,name:"Ischio droit",tags:["thigh","back"]},
  {id:"calf-left",x:73,y:78,name:"Mollet gauche",tags:["leg","back"]},
  {id:"calf-right",x:77,y:78,name:"Mollet droit",tags:["leg","back"]},
  {id:"achilles-left",x:73,y:86,name:"Tendon d’Achille gauche",tags:["ankle","tendon","back"]},
  {id:"achilles-right",x:77,y:86,name:"Tendon d’Achille droit",tags:["ankle","tendon","back"]}
];

/* ================================================================
   ⚙️ CALIBRATION AUTOMATIQUE SUR L'IMAGE
================================================================ */
function autoAlignHotspots() {
  if (!imgEl.complete) return;

  const rect = imgEl.getBoundingClientRect();
  const centerX = rect.width / 2;
  const margin = rect.width * 0.02;

  zones.forEach((z) => {
    if (!z.x) return;
    if (z.tags && z.tags.includes("back")) {
      const relativeX = (z.x - 50) / 50; // normalisation moitié droite
      z.x = ((centerX + margin) / rect.width * 100) +
            relativeX * ((rect.width / 2 - margin) / rect.width * 100);
    } else {
      const relativeX = z.x / 50;
      z.x = (margin / rect.width * 100) +
            relativeX * ((centerX - margin) / rect.width * 100);
    }
  });
}

/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 2 : Diagnostics, traitements, Code Bleu, positionnement
================================================================ */

/* ---------- Base médicale enrichie ---------- */
const injuryDatabase = {
  "arme feu": { symptoms:["Plaie pénétrante","Saignement rapide","Brûlure d’entrée/sortie"],
    treatments:["Compression hémorragique","Voie veineuse","Antibiothérapie IV","Imagerie (radio/scanner)","Suture/extraction selon indication"] },
  "arme blanche": { symptoms:["Lacération","Saignement modéré"],
    treatments:["Irrigation NaCl","Désinfection","Suture (si berges franches)","Pansement compressif"] },
  "contondante": { symptoms:["Hématome","Ecchymose","Douleur locale"],
    treatments:["Glace 15–20 min","Antalgiques palier I–II","Radio si douleur élevée"] },
  "fracture": { symptoms:["Douleur aiguë","Déformation","Perte de mobilité"],
    treatments:["Immobilisation","Radio/Scanner","Réduction si nécessaire","Antalgiques + glaçage"] },
  "brulure": { symptoms:["Rougeur","Cloques","Douleur intense"],
    treatments:["Refroidissement 10 min","Pansement gras stérile","Antalgiques","Évaluation du degré"] },
  "entorse": { symptoms:["Gonflement","Douleur articulaire","Instabilité"],
    treatments:["RICE (Repos, Glace, Compression, Élévation)","Immobilisation courte","Antalgiques"] },
  "luxation": { symptoms:["Déformation articulaire","Blocage moteur"],
    treatments:["Immobilisation stricte","Réduction (médicale)","Radio post-réduction"] },
  "morsure": { symptoms:["Plaie irrégulière","Risque infectieux"],
    treatments:["Irrigation abondante","Antibioprophylaxie","Vaccination selon statut"] },
  "ecrasement": { symptoms:["Douleur diffuse","Œdème","Risque de syndrome des loges"],
    treatments:["Libération prudente","Surveillance loges","Antalgiques","Imagerie ciblée"] },
  "perforation": { symptoms:["Plaie profonde","Risque lésion interne"],
    treatments:["Imagerie urgente","Antibiotiques IV","Chirurgie selon atteinte"] },
  "avp": { symptoms:["Polytraumatisme possible"],
    treatments:["Bilan trauma (ATLS)","Scanner corps entier","Oxygénation / monitoring"] },
  "chute": { symptoms:["Ecchymoses","Douleur variable"],
    treatments:["Antalgiques","Imagerie si point douloureux","Repos / Surveillance"] }
};

/* ---------- Fonctions contextuelles ---------- */
function zoneHasTag(z,t){return z&&z.tags&&z.tags.includes(t);}
function regionOf(z){if(!z)return"Autres";
  const t=z.tags||[];
  if(t.some(v=>["head","eye","jaw","neck"].includes(v)))return"Tête & Cou";
  if(t.some(v=>["shoulder","arm","forearm","elbow","wrist","hand","fingers"].includes(v)))return"Membres supérieurs";
  if(t.some(v=>["thorax","abdomen","back","hip"].includes(v)))return"Tronc";
  if(t.some(v=>["thigh","knee","leg","ankle","foot","toes","tendon"].includes(v)))return"Membres inférieurs";
  return"Autres";
}

/* ---------- Ajustements symptomatiques ---------- */
function applyModifiers(zone,type,pain,symptoms,treatments){
  if(pain>=8)treatments.push("Morphine / monitorer la douleur");
  else if(pain>=6)treatments.push("Antalgiques");
  if(zoneHasTag(zone,"eye")){symptoms.push("Atteinte oculaire possible");treatments.push("Protection oculaire stérile");}
  if(zoneHasTag(zone,"jaw"))symptoms.push("Douleur à la mastication");
  if(zoneHasTag(zone,"neck"))treatments.push("Collier cervical (si traumatisme)");
  if(zoneHasTag(zone,"thorax"))treatments.push("Imagerie thoracique","Surveillance SpO₂");
  if(zoneHasTag(zone,"back"))treatments.push("Repos relatif / décontracturants");
}

/* ---------- Génération du diagnostic ---------- */
function composeDiagnosis(zone,type,pain){
  const zname=zone?zone.name:"zone indéterminée";
  let dx=`Blessure ${zname.toLowerCase()}`;
  const notes=[];
  if(pain>=8)notes.push("douleur sévère");else if(pain>=6)notes.push("douleur modérée");
  if(zoneHasTag(zone,"back"))notes.push("atteinte musculaire possible");
  if(type==="fracture")notes.push("mobilité douloureuse ou impossible");
  if(type==="brulure")notes.push("évaluer le degré de brûlure");
  return`${dx} — ${notes.join(", ")}`;
}

/* ---------- Génération des traitements ---------- */
function generateProcedures(zone,type,pain){
  const steps=[];
  const add=(...a)=>a.forEach(s=>{if(!steps.includes(s))steps.push(s);});
  switch(type){
    case"fracture":add("Immobilisation","Radiographie","Antalgie palier II","Contrôle radio J+10");break;
    case"arme feu":add("Compression hémorragique","Scanner trajectoire","Antibiotiques IV","Avis chirurgical");break;
    case"brulure":add("Refroidissement 10 min","Pansement gras","Contrôle 48 h");break;
  }
  if(zoneHasTag(zone,"back"))add("Repos relatif","Massage décontracturant");
  if(pain>=8)add("Morphine si indiquée (surveillance)");
  return steps.join(" → ");
}

/* ---------- Moteur d’analyse ---------- */
function updateDiagnosis(){
  const type=injuryType.value;
  const pain=parseInt(painLevel.value,10);
  const zone=currentZone;
  const base=injuryDatabase[type];
  let symptoms=[],treatments=[];
  if(base){symptoms=[...base.symptoms];treatments=[...base.treatments];}
  applyModifiers(zone,type,pain,symptoms,treatments);
  diagnosisText.textContent=composeDiagnosis(zone,type,pain);
  symptomText.textContent=[...new Set(symptoms)].join(", ");
  treatmentText.textContent=[...new Set(treatments)].join(", ");
  adviceText.textContent="💬 Repos, hydratation, surveillance et suivi médical recommandés.";
  detailsText.textContent=generateProcedures(zone,type,pain);
}
painLevel.addEventListener("input",()=>{painValue.textContent=painLevel.value;updateDiagnosis();});
injuryType.addEventListener("change",updateDiagnosis);

/* ---------- Positionnement dynamique des hotspots ---------- */
function positionHotspots(){
  if(!imgEl.complete)return;
  const rect=imgEl.getBoundingClientRect();
  const mapRect=bodyMap.getBoundingClientRect();
  const scaleX=rect.width/imgEl.naturalWidth;
  const scaleY=rect.height/imgEl.naturalHeight;
  document.querySelectorAll(".hotspot").forEach(spot=>{
    const px=parseFloat(spot.dataset.x);
    const py=parseFloat(spot.dataset.y);
    const left=rect.left+rect.width*(px/100)-mapRect.left;
    const top=rect.top+rect.height*(py/100)-mapRect.top;
    spot.style.left=left+"px";
    spot.style.top=top+"px";
    const base=35,scale=Math.min(scaleX,scaleY);
    spot.style.width=base*scale+"px";
    spot.style.height=base*scale+"px";
  });
}
window.addEventListener("load",()=>{autoAlignHotspots();positionHotspots();});
window.addEventListener("resize",()=>{autoAlignHotspots();positionHotspots();});

/* ---------- Code Bleu ---------- */
function triggerCodeBlue(){
  const overlay=document.createElement("div");
  overlay.className="code-blue-overlay";
  overlay.innerHTML="<h1>🩸 Code Bleu ! Patient en détresse critique !</h1>";
  document.body.appendChild(overlay);
  const logo=document.querySelector(".logo");
  if(logo){logo.classList.add("code-blue");setTimeout(()=>logo.classList.remove("code-blue"),4000);}
  const status=document.querySelector(".system-status");
  if(status){
    status.classList.add("code-blue");
    status.innerHTML="🩸 <strong>Code Bleu activé — Urgence vitale !</strong>";
    setTimeout(()=>{status.classList.remove("code-blue");status.innerHTML="🟢 Système prêt — En attente de diagnostic";},4000);
  }
  setTimeout(()=>overlay.classList.add("fade-out"),2000);
  setTimeout(()=>overlay.remove(),3500);
  clickCount=0;codeBlueThreshold=Math.floor(100+Math.random()*20);
}
function registerClick(){clickCount++;if(clickCount>=codeBlueThreshold&&Math.random()<0.3)triggerCodeBlue();}

/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 3 : Easter Eggs, Modale, Réinitialisation, Calibration, Init
================================================================ */

/* ---------- Easter Eggs ---------- */
function handleZoneClick(zone, e) {
  registerClick();

  // 🧠 Shift + tête
  if (e.shiftKey && (zone.id.includes("head") || zone.id.includes("forehead"))) {
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

  // 💔 Shift + thorax (zones 'chest'/'thorax')
  if (e.shiftKey && (zone.id.includes("chest") || zone.id.includes("thorax"))) {
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

  // 😏 10 clics sur l’entrejambe
  if (zone.id === "groin") {
    groinClicks++;
    if (groinClicks === 10) {
      activateSoundSystem();
      alert("😏 Moi c’est Stan, on va au chalet ?");
      groinClicks = 0;
      return;
    }
  }

  openModal(zone);
}

/* ---------- Modale ---------- */
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  const titleEl = document.getElementById("zone-title");
  if (titleEl) titleEl.textContent = `Blessure — ${zone.name}`;
  updateDiagnosis(); // défini en PARTIE 2
}
function closeModal() {
  modal.classList.add("hidden");
  currentZone = null;
}
closeBtn.addEventListener("click", closeModal);

/* ---------- Sauvegarde & affichage des blessures ---------- */
saveBtn.addEventListener("click", () => {
  if (!currentZone) return;
  const injury = {
    zone: currentZone.name,
    zoneId: currentZone.id,
    tags: currentZone.tags || [],
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

function renderInjuries() {
  const groups = {};
  injuries.forEach((i) => {
    const z = zones.find(zz => zz.id === i.zoneId) || { tags: [] };
    const region = regionOf(z); // défini en PARTIE 2
    if (!groups[region]) groups[region] = [];
    groups[region].unshift(i);
  });

  injuryList.innerHTML = "";
  const order = ["Tête & Cou", "Membres supérieurs", "Tronc", "Membres inférieurs", "Autres"];
  let total = 0;

  order.forEach((region) => {
    const arr = groups[region];
    if (!arr || arr.length === 0) return;
    total += arr.length;

    const groupEl = document.createElement("div");
    groupEl.className = "injury-group";
    groupEl.innerHTML = `<h3>${region}</h3>`;

    arr.forEach((i) => {
      const item = document.createElement("div");
      item.className = "injury-item";
      item.innerHTML = `
        <strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)<br>
        <em>${i.diagnosis || ""}</em><br>
        Symptômes : ${i.symptoms}<br>
        Traitements : ${i.treatments}<br>
        ${i.advice || ""}<br>
        🩺 Détails : ${i.details || ""}
      `;
      groupEl.appendChild(item);
    });

    injuryList.appendChild(groupEl);
  });

  if (total === 0) {
    injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
  }
}

/* ---------- Bouton Réinitialiser ---------- */
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (!confirm("⚠️ Voulez-vous vraiment réinitialiser toutes les blessures ?")) return;
    injuries = [];
    renderInjuries();
    modal.classList.add("hidden");
    const status = document.querySelector(".system-status");
    if (status) status.innerHTML = "🟢 Système réinitialisé — prêt pour un nouveau diagnostic";
  });
}

/* ---------- Mode Calibration (Alt + C) : affiche les étiquettes ---------- */
let calibrationActive = false;
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "c") toggleCalibration();
});
function toggleCalibration() {
  calibrationActive = !calibrationActive;
  document.querySelectorAll(".calib-label").forEach(el => el.remove());
  if (!calibrationActive) return;

  zones.forEach((z) => {
    const label = document.createElement("div");
    label.className = "calib-label";
    label.style.left = `${z.x}%`;
    label.style.top = `${z.y}%`;
    label.textContent = `${z.name} (${z.x.toFixed(1)}%, ${z.y.toFixed(1)}%)`;
    bodyMap.appendChild(label);
  });

  // recalcule position des étiquettes après leur insertion
  setTimeout(positionHotspots, 30); // défini en PARTIE 2
}

/* ---------- Création des hotspots ---------- */
function createHotspot(zone) {
  const spot = document.createElement("div");
  spot.className = "hotspot";
  spot.dataset.x = zone.x;
  spot.dataset.y = zone.y;
  spot.title = zone.name;
  spot.addEventListener("click", (e) => handleZoneClick(zone, e));
  bodyMap.appendChild(spot);
}

/* ---------- Initialisation ---------- */
window.addEventListener("DOMContentLoaded", () => {
  // Calibration automatique + placement (déjà re-déclenchés sur 'load' et 'resize')
  autoAlignHotspots();  // PARTIE 1
  zones.forEach(z => createHotspot(z));
  positionHotspots();   // PARTIE 2
});
