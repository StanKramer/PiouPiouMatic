/* ================================================================
   PiouPiouMatic RP — Build final
   - Hotspots absolus sur body_both.png (1024x1024)
   - Mode Admin (double-clic logo): édition + export + centrer + quitter
   - Résumé par zones, convalescence recalibrée, facturation dynamique
   - Non cumulativité des soins, pharmacie non facturée
   - Lieux de réanimation (aucun / Blaine / Cayo) + options Agent public / Réa extérieure
================================================================ */

/* ---------- Références DOM ---------- */
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
const resetBtn      = document.getElementById("reset-btn");

/* ---------- Constantes image ---------- */
const IMG_WIDTH  = 1024;
const IMG_HEIGHT = 1024;

/* ---------- Coordonnées finales fournies (pixels réels) ---------- */
let ZONES = [
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

/* ---------- Drag & drop en mode édition ---------- */
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

  let left = e.clientX - dragOffset.x;
  let top  = e.clientY - dragOffset.y;

  left = Math.max(imgRect.left, Math.min(left, imgRect.right  - dragging.offsetWidth));
  top  = Math.max(imgRect.top,  Math.min(top,  imgRect.bottom - dragging.offsetHeight));

  dragging.style.left = (left - mapRect.left) + "px";
  dragging.style.top  = (top  - mapRect.top ) + "px";
}
function onMouseUp() {
  if (!editMode || !dragging) return;
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

  const id = dragging.dataset.id;
  const idx = ZONES.findIndex(z => z.id === id);
  if (idx >= 0) { ZONES[idx].x = px; ZONES[idx].y = py; }

  dragging = null;
}

/* ================================================================
   Mode Admin secret (double-clic sur le logo)
================================================================ */
const logo = document.querySelector(".logo");
let adminUI = null, editBtn = null, exportBtn = null, centerBtn = null, quitBtn = null, toastEl = null;

function showToast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    Object.assign(toastEl.style, {
      position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,255,255,0.4)",
      color: "#0ff", fontSize: "13px", padding: "8px 12px", borderRadius: "8px", zIndex: 99999
    });
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = "1";
  setTimeout(() => { if (toastEl) toastEl.style.opacity = "0"; }, 1800);
}

function buildAdminUI() {
  if (adminUI) return;
  adminUI = document.createElement("div");
  Object.assign(adminUI.style, {
    position: "fixed", bottom: "20px", right: "20px", display: "flex", gap: "10px", zIndex: 99998
  });

  editBtn = document.createElement("button");
  editBtn.textContent = "🧭 Éditer";
  styleAdminBtn(editBtn, "#0ff", "#000");

  exportBtn = document.createElement("button");
  exportBtn.textContent = "💾 Exporter";
  styleAdminBtn(exportBtn, "#09f", "#fff");

  centerBtn = document.createElement("button");
  centerBtn.textContent = "🎯 Centrer";
  styleAdminBtn(centerBtn, "#7cf", "#000");

  quitBtn = document.createElement("button");
  quitBtn.textContent = "🚪 Quitter";
  styleAdminBtn(quitBtn, "#f66", "#000");

  adminUI.appendChild(editBtn);
  adminUI.appendChild(exportBtn);
  adminUI.appendChild(centerBtn);
  adminUI.appendChild(quitBtn);
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

  centerBtn.addEventListener("click", () => {
    positionHotspots();
    showToast("🎯 Hotspots centrés visuellement.");
  });

  quitBtn.addEventListener("click", () => {
    adminMode = false; editMode = false; disableDragHandlers();
    if (adminUI) adminUI.style.display = "none";
    positionHotspots();
    showToast("🧭 Mode Admin désactivé");
  });
}

function styleAdminBtn(btn, bg, fg) {
  Object.assign(btn.style, {
    padding: "8px 12px", borderRadius: "8px", border: "none",
    background: bg, color: fg, fontWeight: 600, cursor: "pointer"
  });
}

if (logo) {
  logo.addEventListener("dblclick", () => {
    adminMode = !adminMode;
    if (adminMode) {
      buildAdminUI();
      adminUI.style.display = "flex";
      showToast("🧭 Mode Admin activé — édition & export");
    } else {
      editMode = false; disableDragHandlers();
      if (adminUI) adminUI.style.display = "none";
      showToast("🧭 Mode Admin désactivé");
    }
    positionHotspots();
  });
}

/* ================================================================
   Moteur médical (diag simplifié) + Saisie blessures
================================================================ */
let injuries = []; // { zone,id,tags,type,pain,ts, care, advice }

function openModal(zone) {
  modal.classList.remove("hidden");
  document.getElementById("zone-title").textContent = `Blessure — ${zone.name}`;
  updateDiagnosis(); // texte auto
  // Mémorise zone active pour save
  openModal.currentZone = zone;
}
function closeModalWindow() { modal.classList.add("hidden"); openModal.currentZone = null; }
if (closeBtn) closeBtn.addEventListener("click", closeModalWindow);

function updateDiagnosis() {
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  diagnosisText.textContent = `Atteinte ${type} — douleur ${pain}/10.`;
  symptomText.textContent   = "Douleur localisée, inflammation probable.";
  const care   = CARE_BY_TYPE[type]?.care   || "Antalgique, désinfection, repos.";
  const advice = CARE_BY_TYPE[type]?.advice || "Suivi à l’Ocean Medical Center si persistant.";
  treatmentText.textContent = `Soin : ${care}`;
  adviceText.textContent    = `Recommandation : ${advice}`;
  detailsText.textContent   = "Procédure : nettoyage, contrôle douleur, imagerie si nécessaire.";
}
painLevel.addEventListener("input", () => { painValue.textContent = painLevel.value; updateDiagnosis(); });
injuryType.addEventListener("change", updateDiagnosis);

saveBtn.addEventListener("click", () => {
  const zone = openModal.currentZone;
  if (!zone) return;
  const type = injuryType.value;
  const pain = parseInt(painLevel.value, 10);
  const care   = CARE_BY_TYPE[type]?.care   || "Antalgique, désinfection, repos.";
  const advice = CARE_BY_TYPE[type]?.advice || "Suivi à l’Ocean Medical Center si persistant.";
  injuries.unshift({
    zone: zone.name, id: zone.id, tags: zone.tags,
    type, pain, ts: Date.now(),
    care, advice
  });
  closeModalWindow();
  renderSummary(); // ⚡ MAJ en temps réel
});

/* ================================================================
   Connaissance médicale (soins + reco OMC) + actes & tarifs
================================================================ */
const CARE_BY_TYPE = {
  "contondante": { care: "Glaçage + repos + antalgique", advice: "Surveille hématomes 24h, contrôle à l’Ocean Medical Center si douleur persistante." },
  "arme blanche": { care: "Suture + désinfection", advice: "Vérifier vaccination antitétanique à l’Ocean Medical Center." },
  "arme feu": { care: "Chirurgie + IRM + surveillance", advice: "Suivi post-opératoire obligatoire à l’Ocean Medical Center." },
  "fracture": { care: "Plâtre ou attelle + radiographie", advice: "Contrôle orthopédique sous 15 jours à l’Ocean Medical Center." },
  "luxation": { care: "Réduction + attelle", advice: "Rééducation kinésithérapie à l’Ocean Medical Center." },
  "brulure": { care: "Pansement stérile + crème cicatrisante", advice: "Suivi cicatriciel à l’Ocean Medical Center." },
  "chute": { care: "Scanner + observation", advice: "Bilan complet 48h à l’Ocean Medical Center." },
  "morsure": { care: "Nettoyage + antibiothérapie + vaccin", advice: "Contrôle du risque infectieux à l’Ocean Medical Center." },
  "entorse": { care: "Attelle + glace", advice: "Consultation kiné si douleur / laxité, à l’Ocean Medical Center." },
  "perforation": { care: "Chirurgie + antibiothérapie", advice: "Surveillance 48h à l’Ocean Medical Center." },
  "ecrasement": { care: "IRM + drainage si besoin", advice: "Suivi traumatologique à l’Ocean Medical Center." },
  "avp": { care: "IRM + observation 24h", advice: "Contrôle vital complet à l’Ocean Medical Center." },
  "contusion": { care: "Glaçage + anti-inflammatoire", advice: "Repos et suivi à l’Ocean Medical Center." }
};

const ACTS_BY_TYPE = {
  "arme feu":   ["IRM", "Chirurgie (si indiqué)"],
  "fracture":   ["Plâtre + Radio"],
  "brulure":    ["Pansement / Bandage"],           // pharmacie (non facturé)
  "arme blanche":["Sutures"],
  "luxation":   ["Attelle"],
  "chute":      ["Scanner"],
  "perforation":["Chirurgie (si indiqué)"],
  "avp":        ["Scanner"],
  "ecrasement": ["Surveillance + Imagerie"],
  "morsure":    ["Irrigation + ATB"],
  "entorse":    ["Immobilisation courte"],
  "contondante":["Trousse de soin"],               // pharmacie (non facturé)
  "contusion":  ["Trousse de soin"]                // pharmacie (non facturé)
};

const ACT_PRICES = {
  "Base hospitalière": 800,
  "IRM": 5000,
  "Plâtre + Radio": 4300,
  "Pansement / Bandage": 1000, // pharmacie
  "Sutures": 800,
  "Attelle": 1000,
  "Scanner": 3000,
  "Chirurgie (si indiqué)": 5000,
  "Surveillance + Imagerie": 1000,
  "Irrigation + ATB": 1000,
  "Immobilisation courte": 500,
  "Trousse de soin": 1000      // pharmacie
};

// actes à lister mais non facturer
const PHARMACY_ACTS = new Set(["Pansement / Bandage", "Trousse de soin"]);

/* ================================================================
   Regroupement, convalescence recalibrée, facturation dynamique
================================================================ */
function regionOf(i) {
  const t = i.tags || [];
  const L = t.includes("L"), R = t.includes("R");
  if (t.includes("head") || t.includes("neck")) return "Tête & Cou";
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

/* --- Convalescence (recalibrée) ---
   Pire blessure (gravité 5, douleur 10) => 24h extérieur (1440 min)
   Chambre : min(sev * pain * 0.6, 30)
   Extérieur: min(max(sev * pain * 4.8, 10), 1440)
*/
function severityOf(type){
  if (["contondante","chute","entorse","contusion"].includes(type)) return 1;
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
      ? Math.min(sev * pain * 0.6, 30)
      : Math.min(Math.max(sev * pain * 4.8, 10), 1440);
    if (minutes>maxMin) maxMin = minutes;
  });
  const h = Math.floor(maxMin/60), m=Math.round(maxMin%60);
  return h>0 ? `${h} h ${m} min` : `${m} min`;
}

/* --- Facturation non cumulative + options --- */
const reviveLocationFees = { none: 0, blaine: 2000, cayo: 3000 };

function calculateBilling(list, opts){
  const acts = new Set();
  list.forEach(i => {
    const arr = ACTS_BY_TYPE[i.type] || [];
    arr.forEach(a => acts.add(a));
  });

  let total = ACT_PRICES["Base hospitalière"];
  const details = [`Base hospitalière : ${ACT_PRICES["Base hospitalière"].toLocaleString()}$`];

  acts.forEach(a=>{
    const price = ACT_PRICES[a] || 0;
    const isPharma = PHARMACY_ACTS.has(a);
    const line = isPharma ? `${a} : 0$ (pharmacie — non facturé)` : `${a} : ${price.toLocaleString()}$`;
    details.push(line);
    if (!isPharma) total += price;
  });

  if (opts.reviveOutside) {
    total += 1500;
    details.push(`Réanimation extérieure : 1 500$`);
  }
  const locFee = reviveLocationFees[opts.reviveLocation || "none"] || 0;
  if (locFee > 0) {
    const label = opts.reviveLocation === "cayo" ? "Cayo Perico" : "Blaine County / Paleto";
    details.push(`Réanimation sur site (${label}) : ${locFee.toLocaleString()}$`);
    total += locFee;
  }
  if (opts.publicAgent) {
    total = total / 2;
    details.push(`Réduction agent public : −50%`);
  }

  return { total: Math.round(total), details };
}

/* ================================================================
   UI Facturation (contrôles) + rendu panneau
================================================================ */
let billControls = null;
const billState = { reviveOutside: false, publicAgent: false, reviveLocation: "none" };

function renderSummary(){
  if (!injuryList) return;

  // 1) Blessures par zones (avec soin + reco)
  if (injuries.length === 0) {
    injuryList.innerHTML = "<p>Aucune blessure détectée</p>";
  } else {
    const groups = groupInjuriesByRegion(injuries);
    let html = "";
    Object.keys(groups).sort().forEach(region=>{
      html += `<div class="injury-group"><h3>🦴 ${region}</h3>`;
      groups[region].forEach(i=>{
        html += `
          <div class="injury-item">• ${i.zone} — ${i.type} (Douleur ${i.pain}/10)
            <div style="margin-left:12px; font-size:.85rem; color:#9df;">
              🩹 <em>Soin :</em> ${i.care}<br>
              💬 <em>Recommandation :</em> ${i.advice}
            </div>
          </div>`;
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
  }

  // 3) Facturation + contrôles
  renderBillingSection(); // construit/MAJ la facture et ses contrôles
}

function renderBillingSection(){
  let billDiv = document.querySelector(".billing-info");
  if (!billDiv) {
    billDiv = document.createElement("div");
    billDiv.className = "billing-info";
    panel.appendChild(billDiv);
  }

  // Construire les contrôles s’ils n’existent pas
  if (!billControls) {
    billControls = document.createElement("div");
    billControls.style.marginTop = "0.6rem";
    billControls.innerHTML = `
      <div style="margin:.5rem 0;">
        <label style="display:block;margin:.3rem 0;">
          <input type="checkbox" id="chk-revive"> Réanimation à l’extérieur (+1 500$)
        </label>
        <label style="display:block;margin:.3rem 0;">
          <input type="checkbox" id="chk-public"> Agent des services publics (−50%)
        </label>
      </div>
      <div style="margin:.5rem 0;">
        <div style="margin-bottom:.2rem;">📍 Lieu de réanimation</div>
        <label style="display:block;"><input type="radio" name="revive-loc" value="none"  checked> Aucun (défaut)</label>
        <label style="display:block;"><input type="radio" name="revive-loc" value="blaine"> Blaine County / Paleto (+2 000$)</label>
        <label style="display:block;"><input type="radio" name="revive-loc" value="cayo"> Cayo Perico (+3 000$)</label>
      </div>
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
    billControls.querySelectorAll('input[name="revive-loc"]').forEach(r=>{
      r.addEventListener("change", (e)=>{
        billState.reviveLocation = e.target.value;
        updateBillingUI();
      });
    });
  }

  // Premier rendu
  updateBillingUI();
}

function updateBillingUI(){
  let billDiv = document.querySelector(".billing-info");
  const calc = calculateBilling(injuries, billState);

  billDiv.innerHTML = `
    <hr>
    <h4>💰 Facturation RP</h4>
    ${calc.details.map(d=>`<p>${d}</p>`).join("")}
    <p><strong>Total : ${calc.total.toLocaleString()}$</strong></p>
  `;
  // Réinjecter les contrôles
  if (billControls) billDiv.appendChild(billControls);

  // Rétablir états
  billControls.querySelector("#chk-revive").checked = billState.reviveOutside;
  billControls.querySelector("#chk-public").checked = billState.publicAgent;
  billControls.querySelectorAll('input[name="revive-loc"]').forEach(r=>{
    r.checked = (r.value === billState.reviveLocation);
  });
}

/* ================================================================
   Reset + Initialisation
================================================================ */
if (resetBtn) resetBtn.addEventListener("click", () => {
  injuries = [];
  renderSummary();
  alert("🩺 Système réinitialisé.");
});

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
