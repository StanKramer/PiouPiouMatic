/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 1 : Variables, zones anatomiques, hotspots, auto-alignement
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

let injuries = [];
let currentZone = null;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

/* ================================================================
   ZONES ANATOMIQUES — FACE + DOS
================================================================ */
const zones = [
  // --- Face ---
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
  {id:"elbow-left",x:20,y:34,name:"Coude gauche",tags:["elbow","joint"]},
  {id:"elbow-right",x:30,y:34,name:"Coude droit",tags:["elbow","joint"]},
  {id:"forearm-left",x:19,y:38,name:"Avant-bras gauche",tags:["forearm"]},
  {id:"forearm-right",x:31,y:38,name:"Avant-bras droit",tags:["forearm"]},
  {id:"wrist-left",x:18,y:45,name:"Poignet gauche",tags:["wrist","joint"]},
  {id:"wrist-right",x:32,y:45,name:"Poignet droit",tags:["wrist","joint"]},
  {id:"hand-left",x:18,y:50,name:"Main gauche",tags:["hand"]},
  {id:"hand-right",x:32,y:50,name:"Main droite",tags:["hand"]},
  {id:"fingers-left",x:18,y:54,name:"Doigts gauche",tags:["fingers"]},
  {id:"fingers-right",x:32,y:54,name:"Doigts droit",tags:["fingers"]},

  {id:"chest-left",x:24,y:26,name:"Thorax gauche",tags:["thorax"]},
  {id:"chest-right",x:26,y:26,name:"Thorax droit",tags:["thorax"]},
  {id:"abdomen-upper",x:25,y:34,name:"Abdomen (haut)",tags:["abdomen"]},
  {id:"abdomen-lower",x:25,y:42,name:"Abdomen (bas)",tags:["abdomen"]},
  {id:"groin",x:25,y:52,name:"Entre-jambe",tags:["groin","joint"]},
  {id:"hip-left",x:23,y:55,name:"Hanche gauche",tags:["hip","joint"]},
  {id:"hip-right",x:27,y:55,name:"Hanche droite",tags:["hip","joint"]},

  {id:"thigh-left",x:23,y:62,name:"Cuisse gauche",tags:["thigh"]},
  {id:"thigh-right",x:27,y:62,name:"Cuisse droite",tags:["thigh"]},
  {id:"knee-left",x:23,y:70,name:"Genou gauche",tags:["knee","joint"]},
  {id:"knee-right",x:27,y:70,name:"Genou droit",tags:["knee","joint"]},
  {id:"leg-left",x:23,y:77,name:"Jambe gauche",tags:["leg"]},
  {id:"leg-right",x:27,y:77,name:"Jambe droite",tags:["leg"]},
  {id:"ankle-left",x:23,y:86,name:"Cheville gauche",tags:["ankle","joint"]},
  {id:"ankle-right",x:27,y:86,name:"Cheville droite",tags:["ankle","joint"]},
  {id:"foot-left",x:23,y:92,name:"Pied gauche",tags:["foot"]},
  {id:"foot-right",x:27,y:92,name:"Pied droit",tags:["foot"]},
  {id:"toes-left",x:23,y:96,name:"Orteils gauche",tags:["toes"]},
  {id:"toes-right",x:27,y:96,name:"Orteils droit",tags:["toes"]},

  // --- Dos ---
  {id:"head-back",x:75,y:9,name:"Crâne (dos)",tags:["head","back"]},
  {id:"nape",x:75,y:20,name:"Nuque",tags:["neck","back"]},
  {id:"upper-back",x:75,y:25,name:"Dos haut",tags:["back"]},
  {id:"scapula-left",x:72,y:26,name:"Omoplate gauche",tags:["shoulder","back"]},
  {id:"scapula-right",x:78,y:26,name:"Omoplate droite",tags:["shoulder","back"]},
  {id:"lower-back",x:75,y:40,name:"Dos bas",tags:["back"]},
  {id:"flank-left",x:73,y:38,name:"Flanc gauche (dos)",tags:["abdomen","back"]},
  {id:"flank-right",x:77,y:38,name:"Flanc droit (dos)",tags:["abdomen","back"]},
  {id:"buttocks",x:75,y:55,name:"Fessier",tags:["hip","back"]},
  {id:"hamstring-left",x:73,y:62,name:"Ischio gauche",tags:["thigh","back"]},
  {id:"hamstring-right",x:77,y:62,name:"Ischio droit",tags:["thigh","back"]},
  {id:"popliteal-left",x:73,y:70,name:"Creux poplité gauche",tags:["knee","back"]},
  {id:"popliteal-right",x:77,y:70,name:"Creux poplité droit",tags:["knee","back"]},
  {id:"calf-left",x:73,y:78,name:"Mollet gauche",tags:["leg","back"]},
  {id:"calf-right",x:77,y:78,name:"Mollet droit",tags:["leg","back"]},
  {id:"achilles-left",x:73,y:86,name:"Tendon d’Achille gauche",tags:["ankle","back","tendon"]},
  {id:"achilles-right",x:77,y:86,name:"Tendon d’Achille droit",tags:["ankle","back","tendon"]}
];

/* ================================================================
   AUTO-ALIGNEMENT FACE / DOS (image divisée en 2 moitiés)
================================================================ */
function autoAlignHotspots() {
  zones.forEach((z) => {
    if (!z.x) return;
    if (z.tags && z.tags.includes("back")) {
      // dos = moitié droite
      z.x = 50 + (z.x / 50) * 50;
    } else {
      // face = moitié gauche
      z.x = (z.x / 50) * 50;
    }
  });
}
autoAlignHotspots();

/* ================================================================
   POSITIONNEMENT & CREATION DES HOTSPOTS
================================================================ */
function positionHotspots() {
  if (!imgEl.complete) return;
  const rect = imgEl.getBoundingClientRect();
  const mapRect = bodyMap.getBoundingClientRect();
  const scaleX = rect.width / imgEl.naturalWidth;
  const scaleY = rect.height / imgEl.naturalHeight;

  document.querySelectorAll(".hotspot").forEach((spot) => {
    const px = parseFloat(spot.dataset.x);
    const py = parseFloat(spot.dataset.y);
    const left = rect.left + rect.width * (px / 100) - mapRect.left;
    const top = rect.top + rect.height * (py / 100) - mapRect.top;
    spot.style.left = left + "px";
    spot.style.top = top + "px";
    const baseSize = 40;
    const scale = Math.min(scaleX, scaleY);
    spot.style.width = baseSize * scale + "px";
    spot.style.height = baseSize * scale + "px";
  });
}
["resize","scroll","load"].forEach(evt => window.addEventListener(evt, positionHotspots));
if (window.visualViewport) {
  let lastZoom = window.visualViewport.scale;
  setInterval(() => {
    if (window.visualViewport.scale !== lastZoom) {
      lastZoom = window.visualViewport.scale;
      positionHotspots();
    }
  }, 200);
}

function createHotspot(zone) {
  const spot = document.createElement("div");
  spot.className = "hotspot";
  spot.dataset.x = zone.x;
  spot.dataset.y = zone.y;
  spot.title = zone.name;
  spot.addEventListener("click", (e) => handleZoneClick(zone, e));
  bodyMap.appendChild(spot);
}

/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 2 : Base médicale, diagnostics, traitements, procédures
================================================================ */

/* ---------- Base de données médicale enrichie ---------- */
const injuryDatabase = {
  "arme feu": {
    symptoms: [
      "Plaie pénétrante",
      "Saignement rapide",
      "Brûlure d’entrée/sortie"
    ],
    treatments: [
      "Compression hémorragique",
      "Voie veineuse",
      "Antibiothérapie IV",
      "Imagerie (radio/scanner)",
      "Suture/extraction selon indication"
    ]
  },
  "arme blanche": {
    symptoms: ["Lacération", "Saignement modéré"],
    treatments: [
      "Irrigation NaCl",
      "Désinfection",
      "Suture (si berges franches)",
      "Pansement compressif"
    ]
  },
  "contondante": {
    symptoms: ["Hématome", "Ecchymose", "Douleur locale"],
    treatments: [
      "Glace 15–20 min",
      "Antalgiques palier I–II",
      "Radio si douleur élevée"
    ]
  },
  "fracture": {
    symptoms: ["Douleur aiguë", "Déformation", "Perte de mobilité"],
    treatments: [
      "Immobilisation",
      "Radio/Scanner",
      "Réduction si nécessaire",
      "Antalgiques + glaçage"
    ]
  },
  "brulure": {
    symptoms: ["Rougeur", "Cloques", "Douleur intense"],
    treatments: [
      "Refroidissement 10 min",
      "Pansement gras stérile",
      "Antalgiques",
      "Évaluation du degré"
    ]
  },
  "entorse": {
    symptoms: ["Gonflement", "Douleur articulaire", "Instabilité"],
    treatments: [
      "RICE (Repos, Glace, Compression, Élévation)",
      "Immobilisation courte (orthèse)",
      "Antalgiques"
    ]
  },
  "luxation": {
    symptoms: ["Déformation articulaire", "Blocage moteur"],
    treatments: [
      "Immobilisation stricte",
      "Réduction (médicale)",
      "Radio post-réduction"
    ]
  },
  "morsure": {
    symptoms: ["Plaie irrégulière", "Risque infectieux"],
    treatments: [
      "Irrigation abondante",
      "Antibioprophylaxie",
      "Vaccination selon statut"
    ]
  },
  "ecrasement": {
    symptoms: ["Douleur diffuse", "Œdème", "Risque de syndrome des loges"],
    treatments: [
      "Libération prudente",
      "Surveillance loges",
      "Antalgiques",
      "Imagerie ciblée"
    ]
  },
  "perforation": {
    symptoms: ["Plaie profonde", "Risque lésion interne"],
    treatments: [
      "Imagerie urgente",
      "Antibiotiques IV",
      "Chirurgie selon atteinte"
    ]
  },
  "avp": {
    symptoms: ["Polytraumatisme possible"],
    treatments: [
      "Bilan trauma (ATLS)",
      "Scanner corps entier si indiqué",
      "Oxygénation / monitoring"
    ]
  },
  "chute": {
    symptoms: ["Ecchymoses", "Douleur variable"],
    treatments: [
      "Antalgiques",
      "Imagerie si point douloureux",
      "Repos / Surveillance"
    ]
  }
};

/* ---------- Fonctions utilitaires ---------- */
function getZoneById(id){ return zones.find(z=>z.id===id)||null; }
function zoneHasTag(zone,tag){ return zone && zone.tags && zone.tags.includes(tag); }
function regionOf(zoneObj){
  if(!zoneObj)return"Autres";
  const t=zoneObj.tags||[];
  if(t.some(v=>["head","eye","jaw","neck"].includes(v)))return"Tête & Cou";
  if(t.some(v=>["shoulder","arm","forearm","elbow","wrist","hand","fingers"].includes(v)))return"Membres supérieurs";
  if(t.some(v=>["thorax","abdomen","back","hip"].includes(v)))return"Tronc";
  if(t.some(v=>["thigh","knee","leg","ankle","foot","toes","tendon"].includes(v)))return"Membres inférieurs";
  return"Autres";
}

/* ---------- Ajustements contextuels ---------- */
function applyModifiers(zone,type,pain,symptoms,treatments){
  if(pain>=8&&!treatments.includes("Morphine / monitorer la douleur"))treatments.push("Morphine / monitorer la douleur");
  else if(pain>=6&&!treatments.includes("Antalgiques"))treatments.push("Antalgiques");

  if(zoneHasTag(zone,"eye")){symptoms.push("Atteinte oculaire possible");treatments.push("Protection oculaire stérile");}
  if(zoneHasTag(zone,"jaw"))symptoms.push("Douleur à la mastication (masséter)");
  if(zoneHasTag(zone,"neck"))treatments.push("Collier cervical (si traumatisme)");
  if(zoneHasTag(zone,"thorax"))treatments.push("Imagerie thoracique","Oxygénation / surveillance SpO₂");
  if(zoneHasTag(zone,"abdomen"))treatments.push("Scanner abdomino-pelvien");
  if(zoneHasTag(zone,"back"))treatments.push("Repos relatif / décontracturants");
  if(zoneHasTag(zone,"joint")&&type==="entorse")treatments.push("RICE","Immobilisation courte");
  if(zoneHasTag(zone,"joint")&&type==="luxation")treatments.push("Réduction (médicale)","Immobilisation stricte");
  if(zoneHasTag(zone,"hand")||zoneHasTag(zone,"fingers"))treatments.push("Rééducation fonctionnelle (main)");
  if(zoneHasTag(zone,"tendon"))treatments.push("Échographie / immobilisation");
}

/* ---------- Diagnostic ---------- */
function composeDiagnosis(zone,type,pain){
  const zname=zone?zone.name:"Zone indéterminée";
  let dx=`Blessure ${zname.toLowerCase()}`;
  const add=[];
  switch(type){
    case"arme feu":add.push("plaie balistique","risque lésion profonde");break;
    case"fracture":add.push("déformation","mobilité douloureuse");break;
    case"brulure":add.push("évaluer degré","surveillance infection");break;
    case"entorse":add.push("atteinte ligamentaire probable");break;
  }
  if(zoneHasTag(zone,"eye"))add.push("atteinte oculaire");
  if(zoneHasTag(zone,"jaw"))add.push("douleur mastication");
  if(zoneHasTag(zone,"thorax"))add.push("détresse respiratoire possible");
  if(zoneHasTag(zone,"abdomen"))add.push("hémorragie interne possible");
  if(zoneHasTag(zone,"back"))add.push("douleur paravertébrale");
  if(pain>=8)add.push("douleur sévère");
  else if(pain>=6)add.push("douleur modérée");
  return`${dx} — ${add.join(", ")}`;
}

/* ---------- Conseils ---------- */
function generateAdvice(zone,type,pain){
  const tips=[];
  if(zoneHasTag(zone,"eye"))tips.push("💬 Suivi ophtalmologique sous 24 h");
  if(zoneHasTag(zone,"jaw"))tips.push("💬 Contrôle dentaire recommandé");
  if(zoneHasTag(zone,"arm")||zoneHasTag(zone,"hand"))tips.push("💬 Kiné main/bras si raideur");
  if(zoneHasTag(zone,"back"))tips.push("💬 Éviter port de charge 48 h");
  if(type==="fracture")tips.push("💬 Suivi orthopédique à J+10");
  if(type==="brulure")tips.push("💬 Vérifier vaccination antitétanique");
  return tips.join(" ");
}

/* ---------- Procédures détaillées ---------- */
function generateProcedures(zone,type,pain){
  const steps=[],zt=zone?.tags||[],add=(...a)=>a.forEach(s=>{if(!steps.includes(s))steps.push(s);});

  switch(type){
    case"arme feu":add("Ne pas retirer le projectile.","Compression hémorragique.","Voie veineuse + antibiotiques IV.","Scanner trajectoire.","Avis chirurgical immédiat.");break;
    case"fracture":add("Immobilisation attelle/plâtre.","Radiographie 2 incidences.","Réduction si déplacement.","Antalgie palier II.","Contrôle J+10.");break;
    case"brulure":add("Refroidir eau tempérée 10 min.","Pansement gras stérile.","Évaluer surface et degré.","Contrôle 24–48 h.");break;
    case"entorse":add("Protocole RICE.","Immobilisation orthèse 3 sem.","Kiné proprioception.");break;
  }

  if(zt.includes("eye"))add("Rinçage NaCl 0.9 %","Protection occlusive stérile");
  if(zt.includes("neck"))add("Immobilisation cervicale si trauma");
  if(zt.includes("thorax"))add("Surveillance SpO₂ / radio thorax");
  if(zt.includes("abdomen"))add("Surveillance constantes / scanner");
  if(zt.includes("back"))add("Décontracturants + repos relatif");
  if(zt.includes("hand"))add("Vérifier sensibilité digitale / flux capillaire");
  if(pain>=8)add("Antalgie palier III (sous surveillance)");
  return steps.join(" → ");
}

/* ---------- Moteur de diagnostic ---------- */
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
  adviceText.textContent=generateAdvice(zone,type,pain);
  detailsText.textContent=generateProcedures(zone,type,pain);
}

painLevel.addEventListener("input",()=>{
  painValue.textContent=painLevel.value;
  updateDiagnosis();
});
injuryType.addEventListener("change",updateDiagnosis);

/* ================================================================
   PiouPiouMatic RP - Script principal
   PARTIE 3 : Easter Eggs, Code Bleu, Modale, Réinitialisation, Calibration
================================================================ */

/* ---------- Easter Eggs ---------- */
function handleZoneClick(zone, e) {
  registerClick();

  // 🧠 Shift + Tête
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

  // 💔 Shift + Thorax
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

  // 😏 10 clics sur l'entrejambe
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

/* ---------- Code Bleu (rare : ~100 clics, 30% de chance) ---------- */
function triggerCodeBlue() {
  const overlay = document.createElement("div");
  overlay.className = "code-blue-overlay";
  overlay.innerHTML = "<h1>🩸 Code Bleu ! Patient en détresse critique !</h1>";
  document.body.appendChild(overlay);

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
  if (clickCount >= codeBlueThreshold && Math.random() < 0.3) {
    triggerCodeBlue();
  }
}

/* ---------- Modale ---------- */
function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  updateDiagnosis();
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

function regionOf(zoneObj){
  if(!zoneObj)return"Autres";
  const t=zoneObj.tags||[];
  if(t.some(v=>["head","eye","jaw","neck"].includes(v)))return"Tête & Cou";
  if(t.some(v=>["shoulder","arm","forearm","elbow","wrist","hand","fingers"].includes(v)))return"Membres supérieurs";
  if(t.some(v=>["thorax","abdomen","back","hip"].includes(v)))return"Tronc";
  if(t.some(v=>["thigh","knee","leg","ankle","foot","toes","tendon"].includes(v)))return"Membres inférieurs";
  return"Autres";
}

function renderInjuries() {
  const groups = {};
  injuries.forEach((i) => {
    const z = zones.find(zz => zz.id === i.zoneId) || { tags: [] };
    const region = regionOf(z);
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

/* ---------- Mode calibration (Alt + C) ---------- */
let calibrationActive = false;
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "c") toggleCalibration();
});

function toggleCalibration() {
  calibrationActive = !calibrationActive;
  document.querySelectorAll(".calib-label").forEach(el => el.remove());
  if (!calibrationActive) return;

  // Affiche une étiquette à la position %
  zones.forEach((z) => {
    const label = document.createElement("div");
    label.className = "calib-label";
    label.style.position = "absolute";
    label.style.left = `${z.x}%`;
    label.style.top = `${z.y}%`;
    label.style.transform = "translate(-50%, -100%)";
    label.style.padding = "2px 6px";
    label.style.borderRadius = "6px";
    label.style.background = "rgba(0, 255, 255, 0.12)";
    label.style.border = "1px solid rgba(0, 255, 255, 0.35)";
    label.style.fontSize = "10px";
    label.style.color = "#bff";
    label.style.pointerEvents = "none";
    label.style.backdropFilter = "blur(2px)";
    label.textContent = `${z.name} (${z.x.toFixed(1)}%, ${z.y.toFixed(1)}%)`;
    bodyMap.appendChild(label);
  });

  // recalcule les positions (hotspots déjà existants)
  setTimeout(positionHotspots, 30);
}

/* ---------- Initialisation ---------- */
window.addEventListener("DOMContentLoaded", () => {
  modal.classList.add("hidden");
  zones.forEach(z => createHotspot(z));
  positionHotspots();
});
