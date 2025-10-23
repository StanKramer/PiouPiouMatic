/* PiouPiouMatic v3 — script.js
Hotspots calibrated to assets/body_both.png with light overlap.
Ensure image is present at assets/body_both.png
*/


// HOTSPOTS: percentages relative to image container (left%, top%, width%, height%)
const HOTSPOTS = [
// Face (left half ~0-50)
{id:'head_face',label:'Tête (face)',left:6,top:4,w:12,h:14,view:'face',zone:'head'},
{id:'jaw_face',label:'Mâchoire',left:14,top:16,w:10,h:8,view:'face',zone:'jaw'},
{id:'neck_face',label:'Cou',left:22,top:20,w:8,h:8,view:'face',zone:'neck'},
{id:'chest_face',label:'Thorax',left:18,top:30,w:16,h:16,view:'face',zone:'chest'},
{id:'abdomen_face',label:'Abdomen',left:20,top:50,w:14,h:14,view:'face',zone:'abdomen'},
{id:'pelvis_face',label:'Bassin',left:22,top:68,w:12,h:10,view:'face',zone:'pelvis'},
{id:'left_shoulder_face',label:'Épaule gauche',left:8,top:28,w:10,h:10,view:'face',zone:'left_shoulder'},
{id:'right_shoulder_face',label:'Épaule droite',left:36,top:28,w:10,h:10,view:'face',zone:'right_shoulder'},
{id:'left_forearm_face',label:'Avant-bras gauche',left:6,top:38,w:10,h:18,view:'face',zone:'left_forearm'},
{id:'right_forearm_face',label:'Avant-bras droit',left:36,top:38,w:10,h:18,view:'face',zone:'right_forearm'},
{id:'left_hand_face',label:'Main / doigts gauche',left:6,top:58,w:10,h:12,view:'face',zone:'left_hand'},
{id:'right_hand_face',label:'Main / doigts droit',left:36,top:58,w:10,h:12,view:'face',zone:'right_hand'},
{id:'left_thigh_face',label:'Cuisse gauche',left:20,top:72,w:10,h:18,view:'face',zone:'left_thigh'},
{id:'right_thigh_face',label:'Cuisse droite',left:30,top:72,w:10,h:18,view:'face',zone:'right_thigh'},
{id:'left_shin_face',label:'Tibia gauche',left:20,top:86,w:6,h:12,view:'face',zone:'left_shin'},
{id:'right_shin_face',label:'Tibia droit',left:32,top:86,w:6,h:12,view:'face',zone:'right_shin'},
{id:'crotch_face',label:'Entrejambe (face)',left:26,top:70,w:6,h:8,view:'face',zone:'crotch'},
// Back (right half ~50-100)
{id:'head_dos',label:'Tête (dos)',left:56,top:4,w:12,h:14,view:'dos',zone:'head'},
{id:'neck_dos',label:'Cou (dos)',left:66,top:18,w:8,h:8,view:'dos',zone:'neck'},
{id:'upper_back',label:'Haut du dos',left:62,top:30,w:16,h:12,view:'dos',zone:'upper_back'},
{id:'lower_back',label:'Bas du dos',left:64,top:44,w:14,h:12,view:'dos',zone:'lower_back'},
{id:'left_shoulder_dos',label:'Épaule gauche (dos)',left:56,top:28,w:10,h:10,view:'dos',zone:'left_shoulder'},
{id:'right_shoulder_dos',label:'Épaule droite (dos)',left:86,top:28,w:10,h:10,view:'dos',zone:'right_shoulder'},
{id:'left_arm_dos',label:'Avant-bras gauche (dos)',left:56,top:38,w:10,h:18,view:'dos',zone:'left_forearm'},
{id:'right_arm_dos',label:'Avant-bras droit (dos)',left:86,top:38,w:10,h:18,view:'dos',zone:'right_forearm'},
{id:'left_hand_dos',label:'Main gauche (dos)',left:56,top:58,w:10,h:12,view:'dos',zone:'left_hand'},
{id:'right_hand_dos',label:'Main droite (dos)',left:86,top:58,w:10,h:12,view:'dos',zone:'right_hand'},
{id:'left_thigh_dos',label:'Cuisse gauche (dos)',left:64,top:72,w:10,h:18,view:'dos',zone:'left_thigh'},
{id:'right_thigh_dos',label:'Cuisse droite (dos)',left:80,top:72,w:10,h:18,view:'dos',zone:'right_thigh'},
{id:'left_shin_dos',label:'Tibia gauche (dos)',left:66,top:86,w:6,h:12,view:'dos',zone:'left_shin'},
{id:'right_shin_dos',label:'Tibia droit (dos)',left:78,top:86,w:6,h:12,view:'dos',zone:'right_shin'},
{id:'crotch_dos',label:'Entrejambe (dos)',left:74,top:70,w:6,h:8,view:'dos',zone:'crotch'}
];


// Injury libraries (condensed for readability)
const SUPERFICIAL = [
{key:'plaie_superf',label:'Plaie superficielle',symptoms:['Saignement local','Douleur légère'],treatments:['Nettoyage, pansement','Antiseptique local','Crème apaisante','Paracétamol']},
{key:'contusion',label:'Contusion',symptoms:['Ecchymose','Gonflement','Douleur'],treatments:['Glace, repos','Paracétamol/IBU si toléré','Crème anti-inflammatoire']},
{key:'fracture_simple',label:'Fracture suspectée',symptoms:['Douleur à mobilisation','Déformation possible'],treatments:['Radio','Immobilisation','Antalgiques']},
{key:'eraflure',label:'Éraflure',symptoms:['Perte superficielle de peau','Douleur légère'],treatments:['Désinfection','Pansement','Crème cicatrisante']}
];


const DEEP_BY_ZONE = {
head:[{key:'trauma_cranien',label:'Traumatisme crânien',symptoms:['Céphalées','Naussées','Confusion'],treatments:['Scanner cérébral','Surveillance neuro','Analgesie forte']}],
jaw:[{key:'fracture_mandibule',label:'Fracture mandibulaire',symptoms:['Douleur mastication','Malocclusion'],treatments:['Scanner facial','Chirurgie maxillo-faciale','Antalgiques']}],
chest:[{key:'pneumothorax',label:'Pneumothorax',symptoms:['Dyspnée','Douleur thoracique'],treatments:['Radio/Scanner','Drain thoracique','Oxygène']}],
abdomen:[{key:'visceral',label:'Lésion viscérale',symptoms:['Douleur abdominale','Rigidité'],treatments:['Scanner abdo','Surveillance hémodynamique','Chirurgie si besoin']}],
pelvis:[{key:'fracture_pelvis',label:'Fracture du bassin',symptoms:['Douleur pelvienne','Instabilité'],treatments:['Immobilisation','Scanner','Stabilisation hémorragique']}],
left_forearm:[{key:'tendon',label:'Lésion tendineuse',symptoms:['Perte de fonction','Douleur'],treatments:['IRM','Immobilisation','Chirurgie si rupture']}],
left_hand:[{key:'doigt_fracture',label:'Fracture phalangienne',symptoms:['Douleur locale','Déformation'],treatments:['Radio','Attelle','Antalgique']}],
left_thigh:[{key:'muscle_thig
