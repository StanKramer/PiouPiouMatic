/* ================================================================
   PiouPiouMatic RP — Build final (sans calibration)
   - Hotspots absolus sur body_both.png (1024x1024)
   - Mode Admin (double-clic logo): édition + export
   - Résumé par zones, convalescence, facturation non cumulative
   - Cases à cocher (réanimation extérieure, agent public) dans le résumé
================================================================ */

/* ---------- Références DOM de base ---------- */
const bodyMap       = document.getElementById("body-map");
const imgEl         = document.getElementById("body-image");
const modal         = document.getElementById("injury-modal");
const injuryType    = document.getElementById("injury-type");
const painLevel     = document.getElementById("pain-level");
const painValue     = document.getElementById("pain-value");
const diagnosisText = document.getElementById("diagnosis-text");
const symptomText   = document.getElementById("symptom-text");
const treatmentText = document.getElementById("treatment-text");
const adviceText    = document.getElementById("advice-text");
const detailsText   = document.getElementById("details-text");
const saveBtn       = document.getElementById("save-injury");
const closeBtn      = document.getElementById("close-modal");
const injuryList    = document.getElementById("injury-list");
const panel         = document.getElementById("injury-panel");

/* ---------- Constantes image ---------- */
const IMG_WIDTH  = 1024;
const IMG_HEIGHT = 1024;

/* ---------- Coordonnées fixes (pixels réels) ---------- */
let ZONES = [
 const ZONES = [
  { id: "head", x: 256, y: 80, name: "Tête", tags: ["head","front"] },
  { id: "face", x: 256, y: 140, name: "Visage", tags: ["head","front"] },
  { id: "neck", x: 256, y: 190, name: "Cou", tags: ["neck","front"] },
  { id: "shoulderL", x: 177, y: 232, name: "Épaule gauche", tags: ["shoulder","front","L"] },
  { id: "shoulderR", x: 345, y: 241, name: "Épaule droite", tags: ["shoulder","front","R"] },
  { id: "chest", x: 256, y: 270, name: "Poitrine", tags: ["thorax","front"] },
  { id: "armL", x: 146, y: 323, name: "Bras gauche", tags: ["arm","front","L"] },
  { id: "armR", x: 332, y: 320, name: "Bras droit", tags: ["arm","front","R"] },
  { id: "forearmL", x: 140, y: 479, name: "Avant-bras gauche", tags: ["arm","front","L"] },
  { id: "forearmR", x: 370, y: 462, name: "Avant-bras droit", tags: ["arm","front","R"] },
  { id: "abdomen", x: 253, y: 436, name: "Abdomen", tags: ["abdomen","front"] },
  { id: "groin", x: 252, y: 561, name: "Entrejambe", tags: ["groin","front"] },
  { id: "thighL", x: 201, y: 610, name: "Cuisse gauche", tags: ["thigh","front","L"] },
  { id: "thighR", x: 302, y: 606, name: "Cuisse droite", tags: ["thigh","front","R"] },
  { id: "kneeL", x: 194, y: 714, name: "Genou gauche", tags: ["knee","front","L"] },
  { id: "kneeR", x: 305, y: 695, name: "Genou droit", tags: ["knee","front","R"] },
  { id: "shinL", x: 180, y: 788, name: "Tibia gauche", tags: ["leg","front","L"] },
  { id: "shinR", x: 315, y: 757, name: "Tibia droit", tags: ["leg","front","R"] },
  { id: "footL", x: 170, y: 901, name: "Pied gauche", tags: ["foot","front","L"] },
  { id: "footR", x: 315, y: 909, name: "Pied droit", tags: ["foot","front","R"] },
  { id: "headBack", x: 730, y: 101, name: "Crâne (dos)", tags: ["head","back"] },
  { id: "nape", x: 726, y: 178, name: "Nuque", tags: ["neck","back"] },
  { id: "shoulderBackL", x: 650, y: 234, name: "Épaule gauche (dos)", tags: ["shoulder","back","L"] },
  { id: "shoulderBackR", x: 826, y: 249, name: "Épaule droite (dos)", tags: ["shoulder","back","R"] },
  { id: "upperBack", x: 731, y: 250, name: "Haut du dos", tags: ["back"] },
  { id: "midBack", x: 734, y: 337, name: "Milieu du dos", tags: ["back"] },
  { id: "lowerBack", x: 736, y: 424, name: "Bas du dos", tags: ["back"] },
  { id: "buttocks", x: 738, y: 540, name: "Fessier", tags: ["hip","back"] },
  { id: "hamstringL", x: 681, y: 633, name: "Arrière cuisse gauche", tags: ["thigh","back","L"] },
  { id: "hamstringR", x: 781, y: 637, name: "Arrière cuisse droite", tags: ["thigh","back","R"] },
  { id: "kneeBackL", x: 676, y: 724, name: "Creux du genou gauche", tags: ["knee","back","L"] },
  { id: "kneeBackR", x: 792, y: 738, name: "Creux du genou droit", tags: ["knee","back","R"] },
  { id: "calfL", x: 669, y: 814, name: "Mollet gauche", tags: ["leg","back","L"] },
  { id: "calfR", x: 796, y: 826, name: "Mollet droit", tags: ["leg","back","R"] },
  { id: "heelL", x: 676, y: 915, name: "Talon gauche", tags: ["foot","back","L"] },
  { id: "heelR", x: 799, y: 923, name: "Talon droit", tags: ["foot","back","R"] }
];

/* ================================================================
   Hotspots (création, position, drag en mode admin)
================================================================ */
function createHotspot(zone) {
  const s = document.createElement("div");
  s.className = "hotspot";
  s.dataset.id = zone.id;
  s.dataset.x = zone.x;
  s.dataset.y = zone.y;
  s.title = zone.name;

  // Label (affiché en mode édition)
  const lbl = document.createElement("div");
  lbl.className = "hotspot-label";
  lbl.textContent = zone.name;
  s.appendChild(lbl);

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
    const top  = rect.top  + py * scaleY - mapRect.top;
    s.style.left = left + "px";
    s.style.top  = top  + "px";
    s.querySelector(".hotspot-label").style.display = editMode ? "block" : "none";
  });
}

["resize","scroll"].forEach(evt => window.addEventListener(evt, positionHotspots));

/* ---------------- Drag & Drop (mode édition) ----------------- */
let adminMode = false;
let editMode  = false;
let dragging  = null;
let dragOffset = { x:0, y:0 };

function enableDragHandlers() {
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup",   onMouseUp);
}
function disableDragHandlers() {
  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup",   onMouseUp);
}

function onMouseDown(e) {
  if (!editMode) return;
  const target = e.target.closest(".hotspot");
  if (!target) return;
  dragging = target;
  const rect = dragging.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
}
function onMouseMove(e) {
  if (!editMode || !dragging) return;
  const mapRect = bodyMap.getBoundingClientRect();
  const imgRect = imgEl.getBoundingClientRect();

  // Position écran -> clamp sur la zone image
  let left = e.clientX - dragOffset.x;
  let top  = e.clientY - dragOffset.y;

  // Contraint aux bords de l'image
  left = Math.max(imgRect.left, Math.min(left, imgRect.right  - dragging.offsetWidth));
  top  = Math.max(imgRect.top,  Math.min(top,  imgRect.bottom - dragging.offsetHeight));

  dragging.style.left = (left - mapRect.left) + "px";
  dragging.style.top  = (top  - mapRect.top ) + "px";
}
function onMouseUp(e) {
  if (!editMode || !dragging) return;
  // Recalcule x,y en pixels réels à partir de la position
  const imgRect = imgEl.getBoundingClientRect();
  const mapRect = bodyMap.getBoundingClientRect();
  const currentLeft = parseFloat(dragging.style.left) + mapRect.left;
  const currentTop  = parseFloat(dragging.style.top)  + mapRect.top;
  const scaleX = imgRect.width / IMG_WIDTH;
  const scaleY = imgRect.height / IMG_HEIGHT;

  const px = Math.round((currentLeft - imgRect.left) / scaleX);
  const py = Math.round((currentTop  - imgRect.top ) / scaleY);

  dragging.dataset.x = px;
  dragging.dataset.y = py;

  // Met à jour ZONES
  const id = dragging.dataset.id;
  const idx = ZONES.findIndex(z => z.id === id);
  if (idx >= 0) {
    ZONES[idx].x = px;
    ZONES[idx].y = py;
  }

  dragging = null;
}

/* ================================================================
   Mode Admin secret (double-clic sur le logo)
================================================================ */
const logo = document.querySelector(".logo");
let adminUI = null, editBtn = null, exportBtn = null, toastEl = null;

function showToast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.style.position = "fixed";
    toastEl.style.bottom = "16px";
    toastEl.style.left = "50%";
    toastEl.style.transform = "translateX(-50%)";
    toastEl.style.background = "rgba(0,0,0,0.8)";
    toastEl.style.border = "1px solid rgba(0,255,255,0.4)";
    toastEl.style.color = "#0ff";
    toastEl.style.fontSize = "13px";
    toastEl.style.padding = "8px 12px";
    toastEl.style.borderRadius = "8px";
    toastEl.style.zIndex = "99999";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = "1";
  setTimeout(() => { if (toastEl) toastEl.style.opacity = "0"; }, 1800);
}

function buildAdminUI() {
  if (adminUI) return;
  adminUI = document.createElement("div");
  adminUI.style.position = "fixed";
  adminUI.style.bottom = "20px";
  adminUI.style.right  = "20px";
  adminUI.style.display = "flex";
  adminUI.style.gap = "10px";
  adminUI.style.zIndex = "99998";

  editBtn = document.createElement("button");
  editBtn.textContent = "🧭 Éditer les hotspots";
  editBtn.style.padding = "8px 12px";
  editBtn.style.borderRadius = "8px";
  editBtn.style.background = "#0ff";
  editBtn.style.color = "#000";
  editBtn.style.fontWeight = "600";

  exportBtn = document.createElement("button");
  exportBtn.textContent = "💾 Exporter positions";
  exportBtn.style.padding = "8px 12px";
  exportBtn.style.borderRadius = "8px";
  exportBtn.style.background = "#09f";
  exportBtn.style.color = "#fff";
  exportBtn.style.fontWeight = "600";

  adminUI.appendChild(editBtn);
  adminUI.appendChild(exportBtn);
  document.body.appendChild(adminUI);

  editBtn.addEventListener("click", () => {
    editMode = !editMode;
    editBtn.style.background = editMode ? "#09f" : "#0ff";
    editBtn.style.color = editMode ? "#fff" : "#000";
    if (editMode) enableDragHandlers(); else disableDragHandlers();
    positionHotspots();
  });

  exportBtn.addEventListener("click", () => {
    const out = "const ZONES = [\n" + ZONES.map(z =>
      `  { id: "${z.id}", x: ${z.x}, y: ${z.y}, name: "${z.name}", tags: ${JSON.stringify(z.tags)} }`
    ).join(",\n") + "\n];\n";
    navigator.clipboard.writeText(out);
    showToast("💾 Coordonnées copiées dans le presse-papiers.");
  });
}

if (logo) {
  logo.addEventListener("dblclick", () => {
    adminMode = !adminMode;
    if (adminMode) {
      buildAdminUI();
      adminUI.style.display = "flex";
      showToast("🧭 Mode Admin activé — Éditez vos hotspots");
    } else {
      editMode = false; disableDragHandlers(); positionHotspots();
      if (adminUI) adminUI.style.display = "none";
      showToast("🧭 Mode Admin désactivé");
    }
  });
}

/* ================================================================
   Moteur médical (diag simple) + Saisie blessures
================================================================ */
let injuries = []; // { zone, id, type, pain, tags, ts }

function openModal(zone) {
  currentZone = zone;
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  updateDiagnosis(); // remplit les textes
}
function closeModalWindow() { modal.classList.add("hidden"); currentZone = null; }
if (closeBtn) closeBtn.addEventListener("click", closeModalWindow);

function updateDiagnosis() {
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  diagnosisText.textContent = `Atteinte ${type} — douleur ${pain}/10.`;
  symptomText.textContent   = "Douleur localisée, inflammation probable.";
  treatmentText.textContent = "Antalgique, désinfection, repos.";
  adviceText.textContent    = "Surveillance 24–48 h.";
  detailsText.textContent   = "Procédure : nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input", () => { painValue.textContent = painLevel.value; updateDiagnosis(); });
injuryType.addEventListener("change", updateDiagnosis);

saveBtn.addEventListener("click", () => {
  if (!currentZone) return;
  injuries.unshift({
    zone: currentZone.name,
    id:   currentZone.id,
    tags: currentZone.tags,
    type: injuryType.value,
    pain: parseInt(painLevel.value,10),
    ts:   Date.now()
  });
  renderSummary();
  closeModalWindow();
});

/* ================================================================
   Résumé par zones -> Convalescence -> Facturation
================================================================ */

/* --- Regroupement par régions anatomiques --- */
function regionOf(i) {
  const t = i.tags || [];
  const L = t.includes("L"), R = t.includes("R");
  if (t.includes("head"))   return "Tête & Cou";
  if (t.includes("neck"))   return "Tête & Cou";
  if (t.includes("thorax") || t.includes("abdomen") || t.includes("groin")) return "Tronc (avant)";
  if (t.includes("back") || t.includes("hip")) return "Tronc (arrière)";
  if (t.includes("arm") || t.includes("shoulder")) return L ? "Membre supérieur gauche" : R ? "Membre supérieur droit" : "Membres supérieurs";
  if (t.includes("thigh") || t.includes("knee") || t.includes("leg") || t.includes("foot")) return L ? "Membre inférieur gauche" : R ? "Membre inférieur droit" : "Membres inférieurs";
  return "Autres";
}

function groupInjuriesByRegion(list) {
  const groups = {};
  list.forEach(i => {
    const region = regionOf(i);
    if (!groups[region]) groups[region] = [];
    groups[region].push(i);
  });
  return groups;
}

/* --- Convalescence --- */
function severityOf(type){
  if (["contondante","chute","entorse"].includes(type)) return 1;
  if (["arme blanche","morsure","ecrasement"].includes(type)) return 2;
  if (["fracture","luxation","perforation"].includes(type)) return 3;
  if (["brulure","avp"].includes(type)) return 4;
  if (["arme feu"].includes(type)) return 5;
  return 1;
}
function computeRecovery(list, where="exterieur"){
  if (list.length===0) return "0 min";
  let maxMin = 0;
  list.forEach(i=>{
    const sev = severityOf(i.type), pain=i.pain||1;
    const minutes = (where==="chambre")
      ? Math.min(sev* pain * 0.5, 30)
      : Math.min(Math.max(sev* pain * 10, 10), 1440);
    if (minutes>maxMin) maxMin = minutes;
  });
  const h = Math.floor(maxMin/60), m=Math.round(maxMin%60);
  return h>0 ? `${h} h ${m} min` : `${m} min`;
}

/* --- Facturation non cumulative + contrôles --- */
const ACTS_BY_TYPE = {
  "arme feu":   ["IRM"],
  "fracture":   ["Plâtre + Radio"],
  "brulure":    ["Pansement / Bandage"],
  "arme blanche":["Sutures"],
  "luxation":   ["Attelle"],
  "chute":      ["Scanner"],
  "perforation":["Chirurgie (si indiqué)"],
  "avp":        ["Scanner"],
  "ecrasement": ["Surveillance + Imagerie"],
  "morsure":    ["Irrigation + ATB"],
  "entorse":    ["Immobilisation courte"],
  "contondante":["Trousse de soin"]
};
const ACT_PRICES = {
  "Base hospitalière": 800,
  "IRM": 5000,
  "Plâtre + Radio": 4300,
  "Pansement / Bandage": 1000,
  "Sutures": 800,
  "Attelle": 1000,
  "Scanner": 3000,
  "Chirurgie (si indiqué)": 5000,
  "Surveillance + Imagerie": 1000,
  "Irrigation + ATB": 1000,
  "Immobilisation courte": 500,
  "Trousse de soin": 1000
};

function calculateBilling(list, opts){
  // set d’actes uniques
  const acts = new Set();
  list.forEach(i => {
    const arr = ACTS_BY_TYPE[i.type] || ["Trousse de soin"];
    arr.forEach(a => acts.add(a));
  });

  // base hospitalière
  let total = ACT_PRICES["Base hospitalière"];
  const details = [`Base hospitalière : ${ACT_PRICES["Base hospitalière"].toLocaleString()}$`];

  // actes uniques
  acts.forEach(a=>{
    const price = ACT_PRICES[a] || 0;
    total += price;
    details.push(`${a} : ${price.toLocaleString()}$`);
  });

  // options
  if (opts.reviveOutside) {
    total += 1500;
    details.push(`Réanimation extérieure : 1 500$`);
  }
  if (opts.publicAgent) {
    total = total / 2;
    details.push(`Réduction agent public : −50%`);
  }

  return { total: Math.round(total), details };
}

/* --- UI des contrôles facture (dans le résumé) --- */
let billControls = null;
const billState = { reviveOutside: false, publicAgent: false };

/* ================================================================
   Rendu du panneau : Zones -> Convalescence -> Facturation
================================================================ */
function renderSummary(){
  if (!injuryList) return;

  // 0) Aucune blessure
  if (injuries.length === 0) {
    injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
    renderBillingSection(); // affiche quand même les contrôles
    return;
  }

  // 1) Blessures par zones
  const groups = groupInjuriesByRegion(injuries);
  let html = "";
  Object.keys(groups).sort().forEach(region=>{
    html += `<div class="injury-group"><h3>🦴 ${region}</h3>`;
    groups[region].forEach(i=>{
      html += `<div class="injury-item">• ${i.zone} — ${i.type} (Douleur ${i.pain}/10)</div>`;
    });
    html += `</div>`;
  });

  // 2) Convalescence
  const recIn  = computeRecovery(injuries, "chambre");
  const recOut = computeRecovery(injuries, "exterieur");
  html += `
    <div class="injury-total">
      <hr>
      <p>🏥 <strong>Convalescence en chambre :</strong> ${recIn}</p>
      <p>🌄 <strong>Convalescence en extérieur :</strong> ${recOut}</p>
    </div>
  `;

  injuryList.innerHTML = html;

  // 3) Facturation (non cumulative) + contrôles
  renderBillingSection();
}

function renderBillingSection(){
  // Crée/Met à jour le bloc facturation en bas du panneau
  let billDiv = document.querySelector(".billing-info");
  if (!billDiv) {
    billDiv = document.createElement("div");
    billDiv.className = "billing-info";
    panel.appendChild(billDiv);
  }

  // Contrôles (checkbox) si absents
  if (!billControls) {
    billControls = document.createElement("div");
    billControls.style.marginTop = "0.6rem";
    billControls.innerHTML = `
      <label style="display:block;margin:.3rem 0;">
        <input type="checkbox" id="chk-revive"> Réanimation à l’extérieur (+1 500$)
      </label>
      <label style="display:block;margin:.3rem 0;">
        <input type="checkbox" id="chk-public"> Agent des services publics (−50%)
      </label>
    `;
    billDiv.appendChild(billControls);

    billControls.querySelector("#chk-revive").addEventListener("change", (e)=>{
      billState.reviveOutside = e.target.checked;
      updateBillingUI();
    });
    billControls.querySelector("#chk-public").addEventListener("change", (e)=>{
      billState.publicAgent = e.target.checked;
      updateBillingUI();
    });
  }

  // Calcul + rendu détails
  updateBillingUI();
}

function updateBillingUI(){
  const billDiv = document.querySelector(".billing-info");
  const calc = calculateBilling(injuries, billState);

  // Nettoie (sauf les contrôles)
  billDiv.innerHTML = `
    <hr>
    <h4>💰 Facturation RP</h4>
    ${calc.details.map(d=>`<p>${d}</p>`).join("")}
    <p><strong>Total : ${calc.total.toLocaleString()}$</strong></p>
  `;

  // Réinjecte les contrôles
  if (billControls) billDiv.appendChild(billControls);

  // Recocher l'état actuel (au cas où le DOM a été reconstruit)
  billControls.querySelector("#chk-revive").checked = billState.reviveOutside;
  billControls.querySelector("#chk-public").checked = billState.publicAgent;
}

/* ================================================================
   Reset + Initialisation
================================================================ */
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) resetBtn.addEventListener("click", () => {
  injuries = [];
  renderSummary();
  alert("🩺 Système réinitialisé.");
});

let currentZone = null;

window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  renderSummary();
  imgEl.addEventListener("load", positionHotspots);
});

/* ================================================================
   Styles runtime (labels hotspots en mode édition)
================================================================ */
const runtimeStyle = document.createElement("style");
runtimeStyle.textContent = `
  .hotspot-label {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    color: #0ff;
    font-size: 10px;
    background: rgba(0,0,0,0.7);
    padding: 1px 4px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    display: none;
  }
`;
document.head.appendChild(runtimeStyle);
