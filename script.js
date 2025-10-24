/* ================================================================
   PiouPiouMatic — Build final complet
   - Hotspots 1024x1024 (pixels réels)
   - Mode Admin (double-clic logo): édition + export + centrer + quitter
   - Résumé par zones, convalescence recalibrée
   - Facturation complète (scanner/chirurgie/sutures/etc.)
   - Non cumulativité, pharmacie non facturée
   - Lieux de réanimation + options agent public + réa extérieure
   - Tableau des actes déclenchés + signature finale Ocean Medical Center
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
const panel = document.getElementById("injury-panel");
const resetBtn = document.getElementById("reset-btn");

const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1024;

/* ================================================================
   Création et affichage des hotspots
================================================================ */
function createHotspot(zone) {
  const s = document.createElement("div");
  s.className = "hotspot";
  s.dataset.id = zone.id;
  s.dataset.x = zone.x;
  s.dataset.y = zone.y;
  s.title = zone.name;
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
  });
}

window.addEventListener("resize", positionHotspots);


/* ---------- Coordonnées hotspots ---------- */
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
   ACTES MÉDICAUX ET TARIFS
================================================================ */
const ACTS_BY_TYPE = {
  // Traumatismes majeurs
  "arme feu":    ["Scanner", "Chirurgie (si indiqué)", "Antibiothérapie (ATB)", "Surveillance + Imagerie"],
  "perforation": ["Chirurgie (si indiqué)", "Antibiothérapie (ATB)", "Surveillance + Imagerie"],
  "ecrasement":  ["IRM", "Drainage / perfusion", "Chirurgie (si indiqué)", "Surveillance + Imagerie"],
  "avp":         ["IRM", "Scanner", "Chirurgie (si indiqué)", "Surveillance + Imagerie"],

  // Lésions fréquentes
  "fracture":    ["Radiographie", "Plâtre complet"],
  "luxation":    ["Réduction (luxation)", "Attelle", "Scanner"],
  "entorse":     ["Attelle", "Scanner"],

  // Plaies / brûlures / morsures
  "arme blanche": ["Sutures", "Antibiothérapie (ATB)", "Scanner"],
  "brulure":      ["Pansement / Bandage", "Antibiothérapie (ATB)"],
  "morsure":      ["Sutures", "Antibiothérapie (ATB)", "Scanner"],

  // Bilans / mineurs
  "chute":       ["Scanner", "Surveillance + Imagerie"],
  "contondante": ["Radiographie", "Trousse de soin"],
  "contusion":   ["Radiographie", "Trousse de soin"]
};

const ACT_PRICES = {
  "Base hospitalière":        800,
  "IRM":                      5000,
  "Scanner":                  3000,
  "Radiographie":             1500,
  "Chirurgie (si indiqué)":   5000,
  "Sutures":                   800,
  "Pansement / Bandage":      1000,   // pharmacie non facturée
  "Attelle":                  1000,
  "Plâtre complet":           4000,
  "Réduction (luxation)":     2000,
  "Antibiothérapie (ATB)":     500,
  "Surveillance + Imagerie":  1000,
  "Drainage / perfusion":     1500
};

// Non facturés
const PHARMACY_ACTS = new Set(["Pansement / Bandage", "Trousse de soin"]);

/* ================================================================
   FACTURATION + AFFICHAGE
================================================================ */
function calculateBilling(list, opts){
  const acts = new Set();
  const actSources = {};

  list.forEach(i => {
    const arr = ACTS_BY_TYPE[i.type] || [];
    arr.forEach(a => {
      acts.add(a);
      if (!actSources[a]) actSources[a] = new Set();
      actSources[a].add(i.type);
    });
  });

  let total = ACT_PRICES["Base hospitalière"];
  const details = [`Base hospitalière : ${ACT_PRICES["Base hospitalière"].toLocaleString()}$`];

  acts.forEach(a=>{
    const price = ACT_PRICES[a] || 0;
    const isPharma = PHARMACY_ACTS.has(a);
    const line = isPharma
      ? `${a} : 0$ (pharmacie — non facturé)`
      : `${a} : ${price.toLocaleString()}$`;
    details.push(line);
    if (!isPharma) total += price;
  });

  if (opts.reviveOutside) { total += 1500; details.push(`Réanimation extérieure : 1 500$`); }
  const reviveLocationFees = { none: 0, blaine: 2000, cayo: 3000 };
  const locFee = reviveLocationFees[opts.reviveLocation || "none"] || 0;
  if (locFee > 0) {
    const label = opts.reviveLocation === "cayo" ? "Cayo Perico" : "Blaine County / Paleto";
    details.push(`Réanimation sur site (${label}) : ${locFee.toLocaleString()}$`);
    total += locFee;
  }
  if (opts.publicAgent) { total /= 2; details.push(`Réduction agent public : −50%`); }

  // Tableau des actes déclenchés
  let recapActs = "";
  if (acts.size > 0) {
    recapActs = `<div class="billing-acts"><hr><h4>🩺 Actes déclenchés</h4>`;
    acts.forEach(a=>{
      const sources = Array.from(actSources[a] || []);
      recapActs += `<p>• ${a} <span style="color:#9df;">(${sources.join(" / ")})</span></p>`;
    });
    recapActs += `</div>`;
  }

  // Signature RP finale
  const signature = `<div class="signature"><hr><p style="font-size:0.85rem;color:#9df;">🧾 Diagnostic final validé par le service médical de l’Ocean Medical Center.</p></div>`;

  return { total: Math.round(total), details, recapHTML: recapActs + signature };
}

// Assure l'affichage immédiat des hotspots
window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  positionHotspots();
  console.log("✅ Hotspots initialisés :", document.querySelectorAll(".hotspot").length);
});
window.addEventListener("DOMContentLoaded", () => {
  refreshHotspots();
  positionHotspots();
  console.log("✅ Hotspots affichés :", document.querySelectorAll(".hotspot").length);
});
