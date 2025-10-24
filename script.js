/* ================================================================
   PiouPiouMatic RP - Script principal FINAL
   Calibration anti-dérive + Moteur médical + Convalescence + Facturation
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
const alignStatus = document.getElementById("align-status");
const lastCalib = document.getElementById("last-calib");
const soundToggle = document.getElementById("sound-toggle");

/* Options facturation (modale) */
const chkPublic = document.getElementById("is-public-agent");
const chkExtRevive = document.getElementById("ext-revive");
const selReviveZone = document.getElementById("revive-zone");
const chkHosp = document.getElementById("svc-hospital");
const chkBoat = document.getElementById("svc-boat");
const chkHeli = document.getElementById("svc-heli");

/* ---------- État ---------- */
let injuries = [];
let currentZone = null;
let soundEnabled = false;
let groinClicks = 0;
let clickCount = 0;
let codeBlueThreshold = Math.floor(100 + Math.random() * 20);

/* ---------- Calibration vars ---------- */
let calibrationStep = 0, calibFace = null, calibBack = null;

/* ---------- Base immuable anti-drift ---------- */
const BASE_ZONES = [
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
let zones = BASE_ZONES.map(z => ({ ...z }));

/* ================================================================
   Calibration semi-auto (halo + flash) ANTI-DRIFT
================================================================ */
function startCalibration() {
  zones = BASE_ZONES.map(z => ({ ...z }));
  calibrationStep = 1; calibFace = calibBack = null;
  overlay.classList.remove("hidden");
  calibInstructions.innerHTML = "🩺 Calibration requise :<br>Vise le <strong>centre vital</strong> de PiouPiou (vue de face).";
  if (alignStatus) alignStatus.textContent = "⚠️ recalibrage requis";
  refreshHotspots();
}
function toggleCardTransparency(enable){
  const card=document.querySelector(".calib-card");
  if(!card)return; card.style.pointerEvents=enable?"none":"all"; card.style.opacity=enable?"0.6":"1";
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function handleCalibrationClick(e){
  const rect=imgEl.getBoundingClientRect();
  const clickX=((e.clientX-rect.left)/rect.width)*100;

  // Halo visuel
  const halo=document.createElement("div");
  halo.className="calib-halo";
  halo.style.left=e.clientX+"px"; halo.style.top=e.clientY+"px";
  document.body.appendChild(halo); setTimeout(()=>halo.remove(),1000);

  if(calibrationStep===1){
    calibFace=clickX; calibrationStep=2;
    calibInstructions.innerHTML="🩺 Calibration requise :<br>Vise le <strong>point secret dorsal</strong> de PiouPiou (vue de dos).";
    toggleCardTransparency(true);
  }else if(calibrationStep===2){
    calibBack=clickX; overlay.classList.add("hidden"); applyCalibration();
    const flash=document.createElement("div"); flash.className="calib-flash"; document.body.appendChild(flash);
    setTimeout(()=>flash.remove(),400); toggleCardTransparency(false);
    if (alignStatus) alignStatus.textContent = "✅ alignés";
    if (lastCalib) {
      const d=new Date(); const hh=String(d.getHours()).padStart(2,"0"); const mm=String(d.getMinutes()).padStart(2,"0");
      lastCalib.textContent = `${hh}:${mm}`;
    }
  }
}
function applyCalibration(){
  if(calibFace==null||calibBack==null)return;
  const faceCenter=clamp(calibFace,20,45);
  const backCenter=clamp(calibBack,55,80);
  zones=BASE_ZONES.map(z=>{
    let nx;
    if(z.tags.includes("back")){
      const ratio=(z.x-50)/50;
      nx=backCenter+ratio*(100-backCenter);
    }else{
      const ratio=z.x/50;
      nx=ratio*faceCenter;
    }
    return {...z,x:nx,y:z.y};
  });
  refreshHotspots();
}
recalibrateBtn.addEventListener("click",startCalibration);
imgEl.addEventListener("click",e=>{if(calibrationStep>0)handleCalibrationClick(e);});
calibCancel.addEventListener("click",()=>overlay.classList.add("hidden"));

/* ================================================================
   Hotspots
================================================================ */
function createHotspot(zone){
  const s=document.createElement("div");
  s.className="hotspot"; s.dataset.x=zone.x; s.dataset.y=zone.y; s.title=zone.name;
  s.addEventListener("click",e=>handleZoneClick(zone,e)); bodyMap.appendChild(s);
}
function refreshHotspots(){
  document.querySelectorAll(".hotspot").forEach(h=>h.remove());
  zones.forEach(z=>createHotspot(z)); positionHotspots();
}
function positionHotspots(){
  if(!imgEl.complete)return;
  const rect=imgEl.getBoundingClientRect(), mapRect=bodyMap.getBoundingClientRect();
  document.querySelectorAll(".hotspot").forEach(s=>{
    const px=parseFloat(s.dataset.x), py=parseFloat(s.dataset.y);
    s.style.left=rect.left+rect.width*(px/100)-mapRect.left+"px";
    s.style.top =rect.top +rect.height*(py/100)-mapRect.top +"px";
  });
}
["resize","scroll"].forEach(evt=>window.addEventListener(evt,positionHotspots));

/* ================================================================
   Moteur médical (base)
================================================================ */
const injuryDatabase = {
  "arme feu": { symptoms:["Plaie pénétrante","Saignement rapide","Brûlure d’entrée/sortie"], treatments:["Compression hémorragique","Antibiotiques IV","Imagerie (radio/scanner)","Suture/extraction si indication"], advice:"Surveillance des constantes." },
  "arme blanche": { symptoms:["Lacération","Saignement modéré"], treatments:["Irrigation NaCl","Désinfection","Suture","Pansement compressif"], advice:"Rappel tétanos si nécessaire." },
  "contondante": { symptoms:["Hématome","Œdème","Douleur locale"], treatments:["Glace 15–20 min","Antalgiques palier I–II","Radio si douleur élevée"], advice:"Repos relatif 24–48 h." },
  "fracture": { symptoms:["Douleur aiguë","Déformation","Mobilité réduite"], treatments:["Immobilisation","Radio/Scanner","Réduction si besoin","Antalgiques"], advice:"Suivi orthopédique." },
  "brulure": { symptoms:["Rougeur","Cloques","Douleur intense"], treatments:["Refroidissement 10 min","Pansement gras","Antalgiques"], advice:"Surveillance infection." },
  "entorse": { symptoms:["Gonflement","Douleur articulaire","Instabilité"], treatments:["RICE","Immobilisation courte","Antalgiques"], advice:"Reprise progressive." },
  "luxation": { symptoms:["Déformation articulaire","Blocage moteur"], treatments:["Immobilisation","Réduction médicale","Radio post-réduction"], advice:"Repos et contrôle." },
  "morsure": { symptoms:["Plaie irrégulière","Risque infectieux"], treatments:["Irrigation abondante","Antibioprophylaxie","Vaccination"], advice:"Surveillance rapprochée." },
  "ecrasement": { symptoms:["Douleur diffuse","Œdème","Risque syndrome des loges"], treatments:["Libération prudente","Surveillance","Antalgiques","Imagerie"], advice:"Vigilance douleur croissante." },
  "perforation": { symptoms:["Plaie profonde","Risque lésion interne"], treatments:["Imagerie urgente","Antibiotiques IV","Chirurgie si besoin"], advice:"Transport médicalisé." },
  "avp": { symptoms:["Polytraumatisme possible"], treatments:["ATLS","Scanner corps entier","Monitoring"], advice:"Surveillance continue." },
  "chute": { symptoms:["Ecchymoses","Douleur variable"], treatments:["Antalgiques","Imagerie si point douloureux","Repos"], advice:"Contrôle si aggravation." }
};

function updateDiagnosis(){
  const type=injuryType.value, pain=parseInt(painLevel.value,10);
  const base=injuryDatabase[type]||{symptoms:["Douleur localisée"],treatments:["Antalgique"],advice:"Surveillance 24–48 h."};
  diagnosisText.textContent=`Atteinte ${type} — douleur ${pain}/10.`;
  symptomText.textContent=base.symptoms.join(", ");
  treatmentText.textContent=base.treatments.join(", ");
  adviceText.textContent=base.advice;
  detailsText.textContent="Procédure: nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input",()=>{painValue.textContent=painLevel.value;updateDiagnosis();});
injuryType.addEventListener("change",updateDiagnosis);

/* ================================================================
   Convalescence RP
================================================================ */
function computeSeverity(type){
  if(["contondante","chute","entorse"].includes(type)) return 1;
  if(["arme blanche","morsure","ecrasement"].includes(type)) return 2;
  if(["fracture","luxation","perforation"].includes(type)) return 3;
  if(["brulure","avp"].includes(type)) return 4;
  if(["arme feu"].includes(type)) return 5;
  return 1;
}
function computeRecoveryTime(injuriesArr, location="exterieur"){
  if(injuriesArr.length===0) return "0 min";
  let maxMinutes=0;
  injuriesArr.forEach(i=>{
    const sev=computeSeverity(i.type), pain=parseInt(i.pain,10)||1;
    let minutes = (location==="chambre")
      ? Math.min(sev*pain*0.5,30)                 // 0–30 min
      : Math.min(Math.max(sev*pain*10,10),1440);  // 10 min–24 h
    if(minutes>maxMinutes) maxMinutes=minutes;
  });
  const h=Math.floor(maxMinutes/60), m=Math.round(maxMinutes%60);
  return h>0?`${h} h ${m} min`:`${m} min`;
}

/* ================================================================
   Facturation RP (options non cumulatives par défaut)
================================================================ */
function priceForReviveZone(zone){ return zone==="ls"?1500 : zone==="bc"?2000 : 3000; }
function calculateBilling(injuriesArr){
  // Base hospitalière incluse si cochée au moins une fois
  let baseHospital = injuriesArr.some(i=>i.opts?.hospital) ? 800 : 0;
  let total = baseHospital;
  const details = [];
  if(baseHospital>0) details.push("Base hospitalière : 800$");

  // Actes liés à la blessure (approx RP)
  injuriesArr.forEach(i=>{
    switch(i.type){
      case "arme feu": total+=5000; details.push("IRM : 5 000$"); break;
      case "fracture": total+=1300+3000; details.push("Plâtre + Radio : 4 300$"); break;
      case "brulure": total+=1000; details.push("Pansement / Bandage : 1 000$"); break;
      case "arme blanche": total+=800; details.push("Sutures : 800$"); break;
      case "luxation": total+=1000; details.push("Attelle : 1 000$"); break;
      case "chute": total+=3000; details.push("Scanner : 3 000$"); break;
      default: total+=1000; details.push("Trousse de soin : 1 000$");
    }

    // Options cochées pour CETTE blessure
    if(i.opts){
      if(i.opts.reviveExt){ const add=priceForReviveZone(i.opts.reviveZone||"ls"); total+=add; details.push(`Réanimation extérieure : ${add.toLocaleString()}$`); }
      if(i.opts.boat){ total+=2000; details.push("Intervention Bateau : 2 000$"); }
      if(i.opts.heli){ total+=3000; details.push("Intervention Hélicoptère : 3 000$"); }
      // (Hôpital déjà compté globalement si au moins une blessure coche hospital)
    }
  });

  // Réduction -50% si au moins une blessure coche "agent public"
  const isPublic = injuriesArr.some(i=>i.opts?.publicAgent);
  if(isPublic){ total = total/2; details.push("Réduction agent public : -50%"); }

  return { total: Math.round(total), details, isPublic };
}

/* ================================================================
   Easter Eggs + Code Bleu
================================================================ */
function handleZoneClick(zone,e){
  if(calibrationStep>0)return; // pas pendant calibration
  registerClick();
  if(e.shiftKey&&zone.tags.includes("head")){ alert("🧠 Le diagnostic serait trop compliqué pour toi."); return; }
  if(e.shiftKey&&zone.tags.includes("thorax")){ alert("💔 Rien à réparer ici, c’est déjà détruit."); return; }
  if(zone.tags.includes("groin")){ groinClicks++; if(groinClicks===10){ alert("😏 Stan : On va au chalet ?"); groinClicks=0; return; } }
  openModal(zone);
}
function triggerCodeBlue(){ const o=document.createElement("div"); o.className="code-blue-overlay"; o.innerHTML="<h1>🩸 Code Bleu ! Patient en détresse critique !</h1>"; document.body.appendChild(o); setTimeout(()=>o.remove(),3500); }
function registerClick(){ clickCount++; if(clickCount>=codeBlueThreshold&&Math.random()<0.3)triggerCodeBlue(); }

/* ================================================================
   Modale & Sauvegarde
================================================================ */
function openModal(zone){
  currentZone=zone; modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent=`Blessure — ${zone.name}`;
  // reset options (par défaut décochées à chaque blessure)
  chkPublic.checked=false; chkExtRevive.checked=false; selReviveZone.value="ls";
  chkHosp.checked=false; chkBoat.checked=false; chkHeli.checked=false;
  updateDiagnosis();
}
function closeModalWindow(){ modal.classList.add("hidden"); currentZone=null; }
closeBtn.addEventListener("click",closeModalWindow);

saveBtn.addEventListener("click",()=>{
  if(!currentZone)return;
  const item = {
    zone: currentZone.name,
    type: injuryType.value,
    pain: parseInt(painLevel.value,10),
    opts: {
      publicAgent: chkPublic.checked,
      reviveExt: chkExtRevive.checked,
      reviveZone: selReviveZone.value,
      hospital: chkHosp.checked,
      boat: chkBoat.checked,
      heli: chkHeli.checked
    },
    ts: Date.now()
  };
  injuries.unshift(item);
  renderInjuries();
  closeModalWindow();
});

/* ================================================================
   Affichage panneau : blessures + convalescence + facturation
================================================================ */
function renderInjuries(){
  if(!injuryList) return;
  if(injuries.length===0){ injuryList.innerHTML="<p>Aucune blessure détectée</p>"; return; }

  injuryList.innerHTML="";
  injuries.forEach(i=>{
    const row=document.createElement("div");
    row.className="injury-item";
    row.innerHTML=`<strong>${i.zone}</strong> — ${i.type} (Douleur ${i.pain}/10)`;
    injuryList.appendChild(row);
  });

  // Convalescence
  const recoveryRoom = computeRecoveryTime(injuries,"chambre");
  const recoveryOut  = computeRecoveryTime(injuries,"exterieur");
  const totalDiv = document.createElement("div");
  totalDiv.className = "injury-total";
  totalDiv.innerHTML = `
    <hr>
    <p>🏥 <strong>Convalescence en chambre :</strong> ${recoveryRoom}</p>
    <p>🌄 <strong>Convalescence en extérieur :</strong> ${recoveryOut}</p>
  `;
  injuryList.appendChild(totalDiv);

  // Facturation
  const bill = calculateBilling(injuries);
  const billDiv = document.createElement("div");
  billDiv.className = "billing-info";
  billDiv.innerHTML = `
    <hr>
    <h4>💰 Facturation RP</h4>
    ${bill.details.map(d=>`<p>${d}</p>`).join("")}
    <p><strong>Total : ${bill.total.toLocaleString()}$</strong></p>
    ${bill.isPublic ? "<p><em>(Remise agent public appliquée)</em></p>" : ""}
  `;
  injuryList.appendChild(billDiv);
}

/* ================================================================
   Réinitialisation + Son + Init
================================================================ */
document.getElementById("reset-btn").addEventListener("click",()=>{
  injuries=[]; renderInjuries(); alert("🩺 Système réinitialisé.");
});
if(soundToggle){ soundToggle.addEventListener("click",()=>{ soundEnabled=!soundEnabled; soundToggle.textContent=soundEnabled?"🔊":"🔇"; }); }

window.addEventListener("DOMContentLoaded",()=>{
  startCalibration();    // lance la calibration à l’ouverture
  refreshHotspots();     // créé points
  renderInjuries();      // affiche panneau
  imgEl.addEventListener("load",positionHotspots);
});
