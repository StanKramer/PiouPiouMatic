/* ================================================================
   PiouPiouMatic RP - Script principal calibré
   PARTIE 1 : Variables globales, calibration automatique, zones anatomiques
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

/* ---------- Variables globales ---------- */
let injuries = [];
let currentZone = null;
let soundEnabled = false;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

/* ---------- Gestion du son ---------- */
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
function playSound(type) {
  if (!soundEnabled) return;
  const audio = new Audio();
  audio.volume = 0.4;
  if (type === "heart") audio.src = "sounds/heart.mp3";
  if (type === "bip") audio.src = "sounds/bip.mp3";
  audio.play().catch(() => {});
}

/* ================================================================
   🧭 CALIBRATION AUTOMATIQUE SUR body_both.png
================================================================ */
function autoAlignHotspots() {
  if (!imgEl.complete) return;

  const rect = imgEl.getBoundingClientRect();
  const centerX = rect.width / 2;
  const margin = rect.width * 0.02;

  zones.forEach((z) => {
    if (!z.x) return;
    if (z.tags && z.tags.includes("back")) {
      // moitié droite → dos
      const rel = (z.x - 50) / 50;
      z.x = ((centerX + margin) / rect.width * 100) +
            rel * ((rect.width / 2 - margin) / rect.width * 100);
    } else {
      // moitié gauche → face
      const rel = z.x / 50;
      z.x = (margin / rect.width * 100) +
            rel * ((centerX - margin) / rect.width * 100);
    }
  });
}

/* ================================================================
   🩺 ZONES ANATOMIQUES CALIBRÉES
   (toutes coordonnées ajustées à body_both.png)
================================================================ */
const zones = [
  // --- FACE ---
  {id:"head",x:24,y:8,name:"Crâne / Tête (face)",tags:["head"]},
  {id:"forehead",x:24,y:11,name:"Front",tags:["head"]},
  {id:"eye-left",x:23,y:14,name:"Œil gauche",tags:["eye"]},
  {id:"eye-right",x:25,y:14,name:"Œil droit",tags:["eye"]},
  {id:"nose",x:24,y:16,name:"Nez",tags:["face"]},
  {id:"jaw",x:24,y:19,name:"Mâchoire",tags:["jaw"]},
  {id:"neck-front",x:24,y:22,name:"Cou (face)",tags:["neck"]},
  {id:"shoulder-left",x:20,y:24,name:"Épaule gauche",tags:["shoulder","joint"]},
  {id:"shoulder-right",x:28,y:24,name:"Épaule droite",tags:["shoulder","joint"]},
  {id:"arm-left",x:19,y:30,name:"Bras gauche",tags:["arm"]},
  {id:"arm-right",x:29,y:30,name:"Bras droit",tags:["arm"]},
  {id:"elbow-left",x:19,y:36,name:"Coude gauche",tags:["elbow","joint"]},
  {id:"elbow-right",x:29,y:36,name:"Coude droit",tags:["elbow","joint"]},
  {id:"forearm-left",x:18,y:42,name:"Avant-bras gauche",tags:["forearm"]},
  {id:"forearm-right",x:30,y:42,name:"Avant-bras droit",tags:["forearm"]},
  {id:"wrist-left",x:17,y:47,name:"Poignet gauche",tags:["wrist","joint"]},
  {id:"wrist-right",x:31,y:47,name:"Poignet droit",tags:["wrist","joint"]},
  {id:"hand-left",x:17,y:51,name:"Main gauche",tags:["hand"]},
  {id:"hand-right",x:31,y:51,name:"Main droite",tags:["hand"]},
  {id:"fingers-left",x:17,y:55,name:"Doigts gauche",tags:["fingers"]},
  {id:"fingers-right",x:31,y:55,name:"Doigts droit",tags:["fingers"]},
  {id:"chest-left",x:23,y:27,name:"Thorax gauche",tags:["thorax"]},
  {id:"chest-right",x:25,y:27,name:"Thorax droit",tags:["thorax"]},
  {id:"abdomen-upper",x:24,y:35,name:"Abdomen (haut)",tags:["abdomen"]},
  {id:"abdomen-lower",x:24,y:43,name:"Abdomen (bas)",tags:["abdomen"]},
  {id:"groin",x:24,y:52,name:"Entre-jambe",tags:["groin"]},
  {id:"hip-left",x:22,y:56,name:"Hanche gauche",tags:["hip","joint"]},
  {id:"hip-right",x:26,y:56,name:"Hanche droite",tags:["hip","joint"]},
  {id:"thigh-left",x:22,y:64,name:"Cuisse gauche",tags:["thigh"]},
  {id:"thigh-right",x:26,y:64,name:"Cuisse droite",tags:["thigh"]},
  {id:"knee-left",x:22,y:71,name:"Genou gauche",tags:["knee","joint"]},
  {id:"knee-right",x:26,y:71,name:"Genou droit",tags:["knee","joint"]},
  {id:"leg-left",x:22,y:78,name:"Jambe gauche",tags:["leg"]},
  {id:"leg-right",x:26,y:78,name:"Jambe droite",tags:["leg"]},
  {id:"ankle-left",x:22,y:86,name:"Cheville gauche",tags:["ankle","joint"]},
  {id:"ankle-right",x:26,y:86,name:"Cheville droite",tags:["ankle","joint"]},
  {id:"foot-left",x:22,y:92,name:"Pied gauche",tags:["foot"]},
  {id:"foot-right",x:26,y:92,name:"Pied droit",tags:["foot"]},

  // --- DOS ---
  {id:"head-back",x:74,y:8,name:"Crâne (dos)",tags:["head","back"]},
  {id:"nape",x:74,y:20,name:"Nuque",tags:["neck","back"]},
  {id:"scapula-left",x:71,y:26,name:"Omoplate gauche",tags:["shoulder","back"]},
  {id:"scapula-right",x:77,y:26,name:"Omoplate droite",tags:["shoulder","back"]},
  {id:"upper-back",x:74,y:32,name:"Dos haut",tags:["back"]},
  {id:"lower-back",x:74,y:40,name:"Dos bas",tags:["back"]},
  {id:"buttocks",x:74,y:54,name:"Fessier",tags:["hip","back"]},
  {id:"hamstring-left",x:72,y:63,name:"Ischio gauche",tags:["thigh","back"]},
  {id:"hamstring-right",x:76,y:63,name:"Ischio droit",tags:["thigh","back"]},
  {id:"knee-back-left",x:72,y:70,name:"Creux poplité gauche",tags:["knee","joint","back"]},
  {id:"knee-back-right",x:76,y:70,name:"Creux poplité droit",tags:["knee","joint","back"]},
  {id:"calf-left",x:72,y:77,name:"Mollet gauche",tags:["leg","back"]},
  {id:"calf-right",x:76,y:77,name:"Mollet droit",tags:["leg","back"]},
  {id:"achilles-left",x:72,y:85,name:"Tendon d’Achille gauche",tags:["ankle","tendon","back"]},
  {id:"achilles-right",x:76,y:85,name:"Tendon d’Achille droit",tags:["ankle","tendon","back"]},
  {id:"heel-left",x:72,y:92,name:"Talon gauche",tags:["foot","back"]},
  {id:"heel-right",x:76,y:92,name:"Talon droit",tags:["foot","back"]}
];

/* ================================================================
   PiouPiouMatic RP – Script principal calibré
   PARTIE 2 : Diagnostic, traitements, positionnement, Code Bleu
================================================================ */

/* ---------- Base médicale enrichie ---------- */
const injuryDatabase = {
  "arme feu": { symptoms:["Plaie pénétrante","Saignement rapide","Brûlure d’entrée/sortie"],
    treatments:["Compression hémorragique","Voie veineuse","Antibiothérapie IV","Imagerie (radio/scanner)","Suture/extraction si indication"] },
  "arme blanche": { symptoms:["Lacération","Saignement modéré"],
    treatments:["Irrigation NaCl","Désinfection","Suture (berges franches)","Pansement compressif"] },
  "contondante": { symptoms:["Hématome","Ecchymose","Douleur locale"],
    treatments:["Glace 15–20 min","Antalgiques palier I–II","Radio si douleur élevée"] },
  "fracture": { symptoms:["Douleur aiguë","Déformation","Perte de mobilité"],
    treatments:["Immobilisation","Radio/Scanner","Réduction si nécessaire","Antalgiques + glaçage"] },
  "brulure": { symptoms:["Rougeur","Cloques","Douleur intense"],
    treatments:["Refroidissement 10 min","Pansement gras stérile","Antalgiques","Évaluation du degré"] },
  "entorse": { symptoms:["Gonflement","Douleur articulaire","Instabilité"],
    treatments:["RICE (Repos, Glace, Compression, Élévation)","Immobilisation courte","Antalgiques"] },
  "luxation": { symptoms:["Déformation articulaire","Blocage moteur"],
    treatments:["Immobilisation stricte","Réduction médicale","Radio post-réduction"] },
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
function regionOf(z){
  if(!z)return"Autres";
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

/* ---------- Diagnostic dynamique ---------- */
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

/* ---------- Procédures et traitement détaillés ---------- */
function generateProcedures(zone,type,pain){
  const steps=[],add=(...a)=>a.forEach(s=>{if(!steps.includes(s))steps.push(s);});
  switch(type){
    case"fracture":add("Immobilisation","Radiographie","Antalgie palier II","Contrôle radio J+10");break;
    case"arme feu":add("Compression hémorragique","Scanner trajectoire","Antibiotiques IV","Avis chirurgical");break;
    case"brulure":add("Refroidissement 10 min","Pansement gras","Contrôle 48 h");break;
  }
  if(zoneHasTag(zone,"back"))add("Repos relatif","Massage décontracturant");
  if(pain>=8)add("Morphine si indiquée (surveillance)");
  return steps.join(" → ");
}

/* ---------- Moteur d’analyse et de mise à jour ---------- */
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
    const base=28,scale=Math.min(scaleX,scaleY);
    spot.style.width=base*scale+"px";
    spot.style.height=base*scale+"px";
  });
}
window.addEventListener("load",()=>{autoAlignHotspots();positionHotspots();});
window.addEventListener("resize",()=>{autoAlignHotspots();positionHotspots();});

/* ---------- Code Bleu (événement rare) ---------- */
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
   PiouPiouMatic RP – Script principal calibré
   PARTIE 3 : Easter Eggs, Modale, Réinitialisation, Calibration & Init
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

  // 💔 Shift + thorax
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

  // 🍆 10 clics sur l’entrejambe
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

/* ---------- Sauvegarde et affichage des blessures ---------- */
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

  if (total === 0) injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
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

/* ---------- Mode Calibration (Alt + C) ---------- */
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
  setTimeout(positionHotspots, 30);
}

/* ---------- Mode test visuel (Alt + T) ---------- */
let testLabels = false;
document.addEventListener("keydown", e => {
  if (e.altKey && e.key.toLowerCase() === "t") toggleTestLabels();
});
function toggleTestLabels() {
  testLabels = !testLabels;
  document.querySelectorAll(".test-label").forEach(l => l.remove());
  if (!testLabels) return;
  zones.forEach(z => {
    const l = document.createElement("div");
    l.className = "test-label";
    l.textContent = z.name;
    l.style.left = `${z.x}%`;
    l.style.top = `${z.y}%`;
    bodyMap.appendChild(l);
  });
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
  autoAlignHotspots();      // calibration auto
  zones.forEach(z => createHotspot(z));
  positionHotspots();       // position dynamique
});

/* ================================================================
   PiouPiouMatic RP – Script principal calibré
   PARTIE 4 : Recalibrage dynamique, zoom, stabilité & fin de script
================================================================ */

/* ---------- Rafraîchissement continu des positions ---------- */
["resize", "scroll"].forEach(evt => window.addEventListener(evt, positionHotspots));

/* ---------- Gestion du zoom navigateur ---------- */
if (window.visualViewport) {
  let lastZoom = window.visualViewport.scale;
  setInterval(() => {
    if (window.visualViewport.scale !== lastZoom) {
      lastZoom = window.visualViewport.scale;
      autoAlignHotspots();
      positionHotspots();
    }
  }, 300);
}

/* ---------- Vérification d'image chargée ---------- */
imgEl.addEventListener("load", () => {
  autoAlignHotspots();
  positionHotspots();
});

/* ---------- Petite animation d’entrée ---------- */
window.addEventListener("load", () => {
  document.body.classList.add("ready");
});

/* ---------- Sécurité : recalage périodique ---------- */
setInterval(() => {
  positionHotspots();
}, 5000);

/* ================================================================
   ✅ Fin du script principal calibré PiouPiouMatic RP
   Tous les systèmes sont synchronisés avec body_both.png
================================================================ */
