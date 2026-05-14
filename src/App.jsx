import React, { useState, useEffect, useRef } from "react";

const PROFILE = { dailyCal:3000, dailyProtein:150, dailyCarbs:380, dailyFat:100, dailyFiber:35, dailySugar:80, startWeight:60, targetWeight:70 };
const MACROS = [{key:"cal",label:"Kcal",color:"#f97316"},{key:"protein",label:"Prot",color:"#ef4444"},{key:"carbs",label:"Gluc",color:"#f59e0b"},{key:"fat",label:"Lip",color:"#8b5cf6"},{key:"fiber",label:"Fib",color:"#10b981"},{key:"sugar",label:"Sucre",color:"#ec4899"}];
const SLOTS = [{id:"breakfast",label:"Petit-dej",color:"#f59e0b"},{id:"lunch",label:"Dejeuner",color:"#10b981"},{id:"snack",label:"Gouter",color:"#8b5cf6"},{id:"dinner",label:"Diner",color:"#ef4444"}];
const today = () => new Date().toISOString().slice(0,10);
const fmtD  = d => new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});
const calcM = (f,g) => ({ cal:Math.round(f.cal*g/100), protein:Math.round(f.protein*g/100*10)/10, carbs:Math.round(f.carbs*g/100*10)/10, fat:Math.round(f.fat*g/100*10)/10, fiber:Math.round((f.fiber||0)*g/100*10)/10, sugar:Math.round((f.sugar||0)*g/100*10)/10 });
const sumM  = items => items.reduce((a,i)=>({ cal:a.cal+(i.cal||0), protein:a.protein+(i.protein||0), carbs:a.carbs+(i.carbs||0), fat:a.fat+(i.fat||0), fiber:a.fiber+(i.fiber||0), sugar:a.sugar+(i.sugar||0) }),{cal:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0});

// IndexedDB
async function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open("gm4",1);r.onupgradeneeded=e=>{e.target.result.createObjectStore("kv");};r.onsuccess=e=>res(e.target.result);r.onerror=e=>rej(e);});}
async function idbGet(key){const db=await idbOpen();return new Promise((res,rej)=>{const r=db.transaction("kv","readonly").objectStore("kv").get(key);r.onsuccess=()=>res(r.result??null);r.onerror=e=>rej(e);});}
async function idbSet(key,val){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction("kv","readwrite");tx.objectStore("kv").put(val,key);tx.oncomplete=()=>res();tx.onerror=e=>rej(e);});}

const MENUS = [
  {id:"m1",slot:"breakfast",type:"Cereales",name:"Porridge masse",cal:720,protein:28,carbs:90,fat:20,desc:"80g avoine + lait + banane + beurre cacahuete + miel"},
  {id:"m2",slot:"breakfast",type:"Oeufs",name:"Omelette matin",cal:540,protein:32,carbs:30,fat:28,desc:"3 oeufs + jambon + 2 tartines + cafe"},
  {id:"m3",slot:"breakfast",type:"Pain",name:"Tartines BCP masse",cal:700,protein:28,carbs:82,fat:28,desc:"3 tartines pain complet + beurre cacahuete + miel + lait 300ml"},
  {id:"m4",slot:"breakfast",type:"Pain",name:"Brioche Nutella",cal:790,protein:18,carbs:110,fat:28,desc:"3 tranches brioche + Nutella + lait + banane"},
  {id:"m5",slot:"breakfast",type:"Oeufs",name:"Pancakes proteines",cal:820,protein:25,carbs:105,fat:28,desc:"4 pancakes + sirop erable + 2 oeufs + lait"},
  {id:"m6",slot:"breakfast",type:"Cereales",name:"Bowl yaourt granola",cal:620,protein:22,carbs:82,fat:20,desc:"Yaourt grec + granola + fruits rouges + miel + cafe"},
  {id:"m7",slot:"breakfast",type:"Shake",name:"Shake ectomorphe",cal:900,protein:38,carbs:120,fat:28,desc:"Lait 400ml + 2 bananes + 80g avoine + beurre cacahuete + miel"},
  {id:"m8",slot:"breakfast",type:"Pain",name:"French toast",cal:820,protein:24,carbs:100,fat:30,desc:"3 tranches pain + oeuf + lait + beurre + sirop erable"},
  {id:"m11",slot:"lunch",type:"Riz",name:"Riz poulet classique",cal:850,protein:55,carbs:95,fat:18,desc:"200g poulet + 150g riz + legumes sautes + sauce soja"},
  {id:"m12",slot:"lunch",type:"Pates",name:"Pates bolognaise",cal:920,protein:48,carbs:105,fat:24,desc:"180g pates + 200g viande hachee + sauce tomate + gruyere"},
  {id:"m13",slot:"lunch",type:"Viandes",name:"Steak frites",cal:980,protein:42,carbs:85,fat:42,desc:"2 steaks haches + 200g frites four + ketchup + salade"},
  {id:"m14",slot:"lunch",type:"Pates",name:"Pates carbonara",cal:960,protein:38,carbs:105,fat:38,desc:"180g pates + lardons + creme + oeufs + gruyere"},
  {id:"m15",slot:"lunch",type:"Riz",name:"Riz cantonais",cal:820,protein:28,carbs:98,fat:28,desc:"200g riz + 2 oeufs + jambon + petits pois + sauce soja"},
  {id:"m16",slot:"lunch",type:"Viandes",name:"Burger maison",cal:1050,protein:50,carbs:95,fat:42,desc:"Steak + pain + gruyere fondu + oeuf + sauce + frites"},
  {id:"m17",slot:"lunch",type:"Viandes",name:"Poulet roti puree",cal:920,protein:52,carbs:85,fat:30,desc:"250g poulet roti + puree maison + haricots verts"},
  {id:"m18",slot:"lunch",type:"Riz",name:"Bowl proteine",cal:820,protein:58,carbs:72,fat:25,desc:"Riz brun + poulet + oeufs durs + avocat + legumes"},
  {id:"m19",slot:"lunch",type:"Oeufs",name:"Omelette geante",cal:720,protein:45,carbs:35,fat:42,desc:"5 oeufs + pommes de terre + lardons + oignon"},
  {id:"m20",slot:"lunch",type:"Pates",name:"Pates pesto poulet",cal:840,protein:45,carbs:88,fat:28,desc:"180g pates + 150g poulet + pesto + tomates cerises"},
  {id:"m21",slot:"lunch",type:"Viandes",name:"Tacos maison",cal:960,protein:40,carbs:105,fat:30,desc:"3 tacos + viande hachee + frites + sauce + fromage"},
  {id:"m22",slot:"snack",type:"Shake",name:"Shake masse classique",cal:620,protein:30,carbs:80,fat:18,desc:"400ml lait + 2 bananes + 3 cas beurre cacahuete + miel"},
  {id:"m23",slot:"snack",type:"Pain",name:"Tartines BCP miel",cal:520,protein:22,carbs:60,fat:22,desc:"3 tartines pain complet + beurre cacahuete + miel + lait"},
  {id:"m24",slot:"snack",type:"Cereales",name:"Yaourt fruits granola",cal:440,protein:16,carbs:62,fat:12,desc:"2 yaourts grecs + granola 40g + banane + miel"},
  {id:"m25",slot:"snack",type:"Shake",name:"Smoothie tropical",cal:680,protein:22,carbs:95,fat:18,desc:"Lait + mangue + banane + ananas"},
  {id:"m26",slot:"snack",type:"Pain",name:"Tartines Nutella",cal:580,protein:12,carbs:82,fat:22,desc:"3 tartines pain + Nutella + verre lait"},
  {id:"m27",slot:"snack",type:"Shake",name:"Smoothie banane avoine",cal:550,protein:18,carbs:85,fat:12,desc:"300ml lait + banane + 40g avoine + yaourt + miel"},
  {id:"m28",slot:"dinner",type:"Pates",name:"Poulet pates beurre",cal:900,protein:52,carbs:98,fat:28,desc:"200g poulet + 180g pates + beurre + parmesan"},
  {id:"m29",slot:"dinner",type:"Viandes",name:"Steak puree maison",cal:950,protein:50,carbs:88,fat:35,desc:"200g steak + grande puree beurre + haricots verts"},
  {id:"m30",slot:"dinner",type:"Pates",name:"Pates au gratin",cal:960,protein:40,carbs:108,fat:35,desc:"180g pates + creme + gruyere + lardons au four"},
  {id:"m31",slot:"dinner",type:"Viandes",name:"Burger soiree",cal:1050,protein:50,carbs:98,fat:45,desc:"Steak + pain brioche + fromage fondu + bacon + frites"},
  {id:"m32",slot:"dinner",type:"Pates",name:"Spaghetti carbonara",cal:980,protein:40,carbs:108,fat:38,desc:"180g spaghetti + lardons + creme + oeufs + gruyere"},
  {id:"m33",slot:"dinner",type:"Viandes",name:"Raclette soiree",cal:1100,protein:55,carbs:80,fat:55,desc:"Pommes de terre + charcuterie + raclette + cornichons"},
  {id:"m34",slot:"dinner",type:"Pates",name:"Lasagnes maison",cal:960,protein:44,carbs:90,fat:40,desc:"Lasagnes bolognaise maison + bechamel + gruyere"},
  {id:"m35",slot:"dinner",type:"Riz",name:"Riz saute complet",cal:880,protein:38,carbs:100,fat:25,desc:"200g riz + poulet + legumes varies + sauce soja + oeuf"},
  {id:"m36",slot:"dinner",type:"Viandes",name:"Poulet roti dominical",cal:920,protein:58,carbs:78,fat:30,desc:"250g poulet roti + pommes de terre + legumes rotis"},
];

const EXERCISES = [
  {id:"e1",name:"Pompes classiques",muscle:"Pecs",equip:"Corps",level:"Debutant",sets:4,reps:"10-12",rest:75,cal:22,desc:"Position planche, mains largeur epaules. Descends la poitrine vers le sol, coudes a 45 degres. Pousse fort en remontant. Corps rigide de la tete aux talons pendant toute la serie."},
  {id:"e2",name:"Pompes larges",muscle:"Pecs",equip:"Corps",level:"Debutant",sets:4,reps:"10-12",rest:75,cal:20,desc:"Mains 2 fois la largeur des epaules. Coudes s'ecartent davantage. Etire bien les pectoraux en bas. Cible le bas et l'exterieur des pecs pour donner du volume."},
  {id:"e3",name:"Pompes declinees",muscle:"Pecs",equip:"Corps",level:"Intermediaire",sets:4,reps:"10",rest:90,cal:24,desc:"Pieds sur une chaise, mains au sol. Corps incline vers le bas. Cible le haut des pectoraux. Garde les epaules rentrees, ne laisse pas les hanches tomber."},
  {id:"e4",name:"Pompes inclinees",muscle:"Pecs",equip:"Corps",level:"Debutant",sets:3,reps:"12",rest:75,cal:18,desc:"Mains sur une chaise ou un banc bas. Corps incline vers le haut. Cible le bas des pectoraux. Version plus facile, ideale pour debuter ou finir une seance."},
  {id:"e5",name:"Pompes diamant",muscle:"Triceps",equip:"Corps",level:"Intermediaire",sets:3,reps:"8-10",rest:75,cal:16,desc:"Pouces et index se touchent sous la poitrine en formant un losange. Coudes serres le long du corps. Forte sollicitation des triceps. Descends lentement, pousse fort."},
  {id:"e6",name:"Pompes explosives",muscle:"Pecs",equip:"Corps",level:"Avance",sets:4,reps:"8",rest:90,cal:28,desc:"Pompe classique mais remontee explosive : les mains decollent du sol. Atterris souple bras legerement flechis. Developpe la puissance des pectoraux. Tres efficace pour la prise de masse rapide."},
  {id:"e7",name:"Dips sur chaise",muscle:"Triceps",equip:"Corps",level:"Debutant",sets:4,reps:"12-15",rest:75,cal:18,desc:"Mains sur le bord d'une chaise derriere toi, jambes tendues devant. Descends en flechissant les coudes jusqu'a 90 degres en gardant les coudes serres. Remonte en poussant fort sur les mains."},
  {id:"e8",name:"Pike push-up",muscle:"Epaules",equip:"Corps",level:"Debutant",sets:4,reps:"10",rest:75,cal:18,desc:"Hanches levees haut en forme de V inverse. Flechi les coudes pour descendre la tete vers le sol entre les mains. Reviens. Simule le developpe militaire. Renforce les epaules et les triceps efficacement."},
  {id:"e9",name:"Elevations laterales",muscle:"Epaules",equip:"Halteres",level:"Debutant",sets:4,reps:"12-15",rest:60,cal:14,desc:"Debout, halteres le long du corps. Leve les bras sur les cotes jusqu'a hauteur epaule, coudes legerement flechis. Descente lente sur 3 secondes. Ne balance pas le buste. Cible les deltoide lateraux."},
  {id:"e10",name:"Developpe militaire",muscle:"Epaules",equip:"Halteres",level:"Debutant",sets:4,reps:"10-12",rest:90,cal:20,desc:"Assis ou debout, halteres a hauteur epaules, coudes devant toi. Pousse vers le haut jusqu'a extension complete des bras. Redescends lentement. Renforce l'ensemble de l'epaule et les trapeze superieurs."},
  {id:"e11",name:"Extension triceps",muscle:"Triceps",equip:"Halteres",level:"Debutant",sets:3,reps:"12-15",rest:60,cal:14,desc:"Assis, un haltere a deux mains derriere la tete, coude pointe vers le plafond. Etends le bras vers le haut. Coude fixe. Descends lentement en controlant. Cible l'ensemble du triceps."},
  {id:"e12",name:"Curl biceps",muscle:"Biceps",equip:"Halteres",level:"Debutant",sets:4,reps:"12-15",rest:60,cal:14,desc:"Debout, halteres le long du corps. Flechi les coudes pour amener les halteres vers les epaules. Coudes fixes contre le corps. Contraction maximale en haut, descente lente sur 3 secondes."},
  {id:"e13",name:"Curl marteau",muscle:"Biceps",equip:"Halteres",level:"Debutant",sets:3,reps:"12",rest:60,cal:12,desc:"Meme mouvement que le curl mais les paumes se font face (position neutre). Sollicite le brachial et le long supinateur en plus du biceps. Donne du volume a l'avant du bras."},
  {id:"e14",name:"Rowing halteres",muscle:"Dos",equip:"Halteres",level:"Debutant",sets:4,reps:"10-12",rest:75,cal:18,desc:"Un genou et une main sur une chaise, corps parallele au sol. Tire l'haltere vers la hanche en serrant l'omoplate. Coude pres du corps. Descente lente. Cible le grand dorsal et le rhomboid."},
  {id:"e15",name:"Tractions australiennes",muscle:"Dos",equip:"Corps",level:"Debutant",sets:4,reps:"10-12",rest:90,cal:28,desc:"Allonge sous une table basse ou une barre basse. Corps droit, talons au sol. Tire ta poitrine vers la barre en serrant les omoplates. Retour lent. Equivalent du rowing avec le poids du corps."},
  {id:"e16",name:"Superman",muscle:"Dos",equip:"Corps",level:"Debutant",sets:3,reps:"15",rest:45,cal:8,desc:"Allonge ventre au sol, bras tendus devant toi. Souleve simultanement les bras et les jambes en contractant le bas du dos. Tiens 2 secondes en haut. Renforce les erecteurs et les lombaires."},
  {id:"e17",name:"Squats poids du corps",muscle:"Jambes",equip:"Corps",level:"Debutant",sets:4,reps:"15-20",rest:60,cal:22,desc:"Pieds largeur epaules, orteils legerement vers l'exterieur. Descends comme pour t'asseoir sur une chaise invisible, genoux dans l'axe des pieds. Descends jusqu'aux cuisses paralleles au sol."},
  {id:"e18",name:"Fentes alternees",muscle:"Jambes",equip:"Corps",level:"Debutant",sets:4,reps:"12/j",rest:60,cal:25,desc:"Grand pas en avant. Descends jusqu'au genou arriere qui frole le sol. Genou avant directement au-dessus du pied, jamais en avant. Buste droit. Reviens et alterne les jambes."},
  {id:"e19",name:"Squats bulgares",muscle:"Jambes",equip:"Corps",level:"Intermediaire",sets:4,reps:"10/j",rest:90,cal:30,desc:"Pied arriere pose sur une chaise. Descends le genou arriere vers le sol en controlant. Genou avant dans l'axe du pied. Excellent pour le quadriceps et le fessier. Tres efficace masse."},
  {id:"e20",name:"Pont fessier",muscle:"Fessiers",equip:"Corps",level:"Debutant",sets:4,reps:"20",rest:45,cal:12,desc:"Allonge sur le dos, pieds a plat sur le sol pres des fessiers. Souleve les hanches en serrant les fessiers. Tiens 1-2 secondes en haut. Descends lentement. Pour progresser : version uni-jambiste."},
  {id:"e21",name:"Squat goblet haltere",muscle:"Jambes",equip:"Halteres",level:"Debutant",sets:4,reps:"12-15",rest:75,cal:26,desc:"Tiens un haltere a deux mains contre la poitrine. Effectue un squat profond. L'haltere devant aide a garder le buste droit et permet d'aller plus bas. Excellent pour debutants."},
  {id:"e22",name:"Fentes halteres",muscle:"Jambes",equip:"Halteres",level:"Debutant",sets:4,reps:"10/j",rest:75,cal:28,desc:"Meme mouvement que les fentes mais avec des halteres dans chaque main. Augmente la charge et donc la stimulation musculaire. Halteres le long des cuisses, dos droit."},
  {id:"e23",name:"Mollets debout",muscle:"Mollets",equip:"Corps",level:"Debutant",sets:4,reps:"20-25",rest:45,cal:10,desc:"Debout sur une marche ou le sol. Monte sur la pointe des pieds en contractant les mollets. Pause 1 seconde en haut. Descends jusqu'au maximum d'amplitude. Progresser : version uni-jambiste."},
  {id:"e24",name:"Gainage planche",muscle:"Abdos",equip:"Corps",level:"Debutant",sets:3,reps:"30-45s",rest:45,cal:8,desc:"Appui sur les avant-bras et les orteils. Corps droit de la tete aux talons. Ventre rentre, fessiers serres. Ne laisse pas les hanches monter ou descendre. Augmente de 5 secondes par semaine."},
  {id:"e25",name:"Crunchs",muscle:"Abdos",equip:"Corps",level:"Debutant",sets:3,reps:"20",rest:45,cal:8,desc:"Allonge sur le dos, genoux flechis, pieds au sol. Mains derriere les oreilles. Souleve les omoplates du sol en contractant les abdos. Expiration en montant. Pas de coup de nuque."},
  {id:"e26",name:"Mountain climbers",muscle:"Abdos",equip:"Corps",level:"Intermediaire",sets:3,reps:"20",rest:45,cal:20,desc:"Position de pompe. Ramene alternativement chaque genou vers la poitrine le plus vite possible. Garde les hanches stables et basses. Excellent exercice cardio plus renforcement du core."},
  {id:"e27",name:"Russian twist",muscle:"Abdos",equip:"Halteres",level:"Intermediaire",sets:3,reps:"20",rest:45,cal:12,desc:"Assis, jambes legerement soulevees, dos incline a 45 degres. Tiens un haltere a deux mains. Rotation du buste de gauche a droite en touchant le sol de chaque cote. Sollicite les obliques."},
  {id:"e28",name:"Leg raise",muscle:"Abdos",equip:"Corps",level:"Intermediaire",sets:3,reps:"15",rest:45,cal:10,desc:"Allonge sur le dos, mains sous les fessiers pour soutenir le bas du dos. Souleve les jambes tendues jusqu'a la verticale. Descends lentement sans que les pieds touchent le sol. Abdos inferieurs."},
  {id:"e29",name:"Burpees",muscle:"Full Body",equip:"Corps",level:"Intermediaire",sets:3,reps:"10",rest:90,cal:40,desc:"Debout, descends en squat, pose les mains, saute les pieds en arriere en planche, fais une pompe, ramene les pieds, saute en l'air bras leves. L'exercice total. Cardio plus force simultanement."},
  {id:"e30",name:"Fentes sautees",muscle:"Jambes",equip:"Corps",level:"Intermediaire",sets:3,reps:"8/j",rest:75,cal:32,desc:"Fente basse puis saut explosif pour changer de jambe en l'air. Atterrissage souple directement en fente sur l'autre jambe. Developpe la puissance et l'endurance musculaire simultanement."},
];

const CALI_EXERCISES = [
  {id:"c1",name:"Pompes sur genoux",muscle:"Haut",equip:"Corps",level:"Debutant",sets:3,reps:"10-15",rest:60,cal:12,desc:"Version facilitee des pompes. Genoux au sol, corps droit des genoux aux epaules. Mains largeur epaules. Parfait pour apprendre la technique avant les vraies pompes. Cible pecs et triceps."},
  {id:"c2",name:"Squats muraux",muscle:"Jambes",equip:"Corps",level:"Debutant",sets:3,reps:"30-60s",rest:60,cal:10,desc:"Dos contre le mur, glisse jusqu'aux cuisses paralleles au sol. Tiens la position en isometrie. Renforce les quadriceps sans charge. Excellent pour debutants et pour la recuperation active."},
  {id:"c3",name:"Dead hang",muscle:"Dos",equip:"Corps",level:"Debutant",sets:3,reps:"20-30s",rest:60,cal:5,desc:"Suspens-toi a une barre ou un encadrement de porte solide. Corps relache. Renforce la prise en main, etire le dos et les epaules. Prerequis indispensable avant de commencer les tractions."},
  {id:"c4",name:"Negative tractions",muscle:"Dos",equip:"Corps",level:"Debutant",sets:3,reps:"5-8",rest:90,cal:15,desc:"Monte jusqu'au sommet a l'aide d'une chaise. Retire la chaise et descends le plus lentement possible en visant 5 a 10 secondes. Renforce les muscles necessaires aux tractions sans pouvoir encore monter seul."},
  {id:"c5",name:"L-sit chaises",muscle:"Abdos",equip:"Corps",level:"Intermediaire",sets:3,reps:"10-20s",rest:60,cal:8,desc:"Assis entre deux chaises, mains sur les bords. Souleve le corps et etends les jambes horizontalement. Maintiens la position. Elite pour les abdominaux, flechisseurs de hanches et triceps."},
  {id:"c6",name:"Hollow body hold",muscle:"Abdos",equip:"Corps",level:"Intermediaire",sets:3,reps:"20-30s",rest:60,cal:8,desc:"Allonge sur le dos. Leve simultanement les epaules et les jambes tendues a 20 cm du sol. Corps en forme de banane creuse. Bras tendus au-dessus de la tete. Position fondamentale en callisthenie."},
  {id:"c7",name:"Arch body hold",muscle:"Dos",equip:"Corps",level:"Intermediaire",sets:3,reps:"20-30s",rest:60,cal:8,desc:"Ventre au sol. Leve simultanement bras et jambes tendus en arc de cercle. Corps en forme de banane convexe. Maintiens. Renforce la chaine posterieure. Complement du hollow body."},
  {id:"c8",name:"Frog stand",muscle:"Haut",equip:"Corps",level:"Intermediaire",sets:3,reps:"10-20s",rest:90,cal:8,desc:"Accroupi, mains au sol largeur epaules. Place les genoux sur les triceps et bascule le poids en avant pour soulever les pieds. Equilibre. Prerequis au poirier. Renforce poignets et core."},
  {id:"c9",name:"Poirier mur assiste",muscle:"Haut",equip:"Corps",level:"Avance",sets:3,reps:"15-30s",rest:90,cal:10,desc:"Mains au sol a 10 cm du mur. Monte les jambes contre le mur. Corps le plus droit possible. Pousse fort dans le sol. Renforce toute la chaine superieure et le core. Base pour le poirier libre."},
  {id:"c10",name:"Rowing elastique",muscle:"Dos",equip:"Elastique",level:"Debutant",sets:4,reps:"12-15",rest:60,cal:16,desc:"Fixe l'elastique a hauteur de poitrine sur un montant. Tire vers toi en serrant les omoplates, coudes pres du corps. Retour lent et controle. Simule parfaitement le rowing cable de salle."},
  {id:"c11",name:"Curl elastique",muscle:"Biceps",equip:"Elastique",level:"Debutant",sets:3,reps:"12-15",rest:60,cal:12,desc:"Pose l'elastique sous tes pieds. Tiens les extremites et flechi les coudes pour amener les mains vers les epaules. Coudes fixes. Descente lente. Excellent supplementaire pour les biceps."},
  {id:"c12",name:"Presse epaules elastique",muscle:"Epaules",equip:"Elastique",level:"Debutant",sets:4,reps:"12",rest:60,cal:14,desc:"Elastique sous les pieds. Tiens les extremites a hauteur epaules. Pousse vers le haut jusqu'a extension complete. Retour lent. Simule le developpe militaire sans poids."},
  {id:"c13",name:"Squat elastique",muscle:"Jambes",equip:"Elastique",level:"Debutant",sets:4,reps:"15",rest:60,cal:22,desc:"Elastique sous les pieds, tenu des deux mains devant ou sur les epaules. Squat profond. La resistance augmente a chaque montee rendant l'exercice plus difficile qu'un squat poids du corps."},
  {id:"c14",name:"Face pull elastique",muscle:"Epaules",equip:"Elastique",level:"Debutant",sets:3,reps:"15",rest:45,cal:10,desc:"Elastique fixe a hauteur de visage. Tire vers ton visage en ecartant les mains, coudes hauts. Cible les deltoide posterieurs et les rotateurs de l'epaule. Indispensable pour la sante des epaules."},
  {id:"c15",name:"Chest fly elastique",muscle:"Pecs",equip:"Elastique",level:"Intermediaire",sets:3,reps:"12-15",rest:60,cal:14,desc:"Elastique fixe dans ton dos a hauteur epaules. Ramene les bras devant toi en arc de cercle. Retour lent. Cible l'interieur des pectoraux qui est souvent neglige avec les pompes."},
  {id:"c16",name:"TRX rowing",muscle:"Dos",equip:"Sangle",level:"Debutant",sets:4,reps:"10-12",rest:75,cal:20,desc:"Sangles fixees en hauteur. Corps incline en arriere, bras tendus tenant les poignees. Tire le corps vers les poignees en serrant les omoplates. Plus tu t'inclines, plus c'est difficile."},
  {id:"c17",name:"TRX pompes",muscle:"Pecs",equip:"Sangle",level:"Intermediaire",sets:3,reps:"10-12",rest:75,cal:18,desc:"Pieds dans les sangles, mains au sol. Effectue des pompes. L'instabilite des sangles force le core et les stabilisateurs a travailler en permanence. Plus difficile que les pompes classiques."},
  {id:"c18",name:"TRX squat",muscle:"Jambes",equip:"Sangle",level:"Debutant",sets:4,reps:"12-15",rest:60,cal:24,desc:"Tiens les sangles devant toi pour l'equilibre. Effectue un squat tres profond en te laissant aider par les sangles pour la stabilite. Excellent pour apprendre le squat profond."},
  {id:"c19",name:"TRX planche",muscle:"Abdos",equip:"Sangle",level:"Intermediaire",sets:3,reps:"20-30s",rest:45,cal:10,desc:"Pieds dans les sangles, corps en position de planche sur les mains. L'instabilite des sangles fait travailler le core beaucoup plus intensement qu'une planche classique au sol."},
  {id:"c20",name:"TRX biceps curl",muscle:"Biceps",equip:"Sangle",level:"Debutant",sets:3,reps:"12",rest:60,cal:14,desc:"Face aux poignees de sangle, bras tendus. Flechi les coudes pour amener les mains vers le front. Corps reste droit. Plus tu t'inclines vers l'arriere, plus c'est difficile. Excellent pour les biceps."},
  {id:"c21",name:"TRX fentes",muscle:"Jambes",equip:"Sangle",level:"Intermediaire",sets:4,reps:"10/j",rest:75,cal:28,desc:"Un pied dans la sangle, l'autre au sol devant toi. Effectue des fentes en abaissant le genou arriere. L'instabilite de la sangle intensifie le travail musculaire et ameliore l'equilibre."},
  {id:"c22",name:"TRX Y-raise",muscle:"Epaules",equip:"Sangle",level:"Intermediaire",sets:3,reps:"12-15",rest:60,cal:12,desc:"Corps incline en arriere tenant les poignees. Leve les bras en Y au-dessus de la tete. Retour lent. Renforce les trapeze, les deltoide posterieurs. Excellent pour la posture et la prevention blessures."},
  {id:"c23",name:"Skin the cat partiel",muscle:"Dos",equip:"Corps",level:"Avance",sets:3,reps:"3-5",rest:120,cal:15,desc:"Suspens-toi a une barre. Ramene les genoux vers la poitrine puis passe les jambes derriere la barre en controlant. Reviens. Renforce epaules et dos de facon unique. Etire la ceinture scapulaire."},
  {id:"c24",name:"Muscle up partiel",muscle:"Haut",equip:"Corps",level:"Avance",sets:3,reps:"3-5",rest:120,cal:25,desc:"Traction explosive jusqu'au sternum, essaie de passer la poitrine au-dessus de la barre. Progression vers le muscle up complet. Necessite des tractions solides et beaucoup d'explosivite."},
  {id:"c25",name:"Planche leaning",muscle:"Haut",equip:"Corps",level:"Avance",sets:3,reps:"5-10s",rest:120,cal:10,desc:"En appui sur les mains, corps horizontal, incline vers l'avant en poussant fort dans le sol. Progression vers la planche humaine. Renforce les epaules et le core au niveau maximal."},
];

const MC={Pecs:"#f97316",Epaules:"#3b82f6",Triceps:"#8b5cf6",Dos:"#10b981",Biceps:"#06b6d4",Jambes:"#f59e0b",Fessiers:"#ec4899",Mollets:"#84cc16",Abdos:"#ef4444","Full Body":"#a78bfa",Haut:"#f97316"};
const LC={Debutant:"#10b981",Intermediaire:"#f59e0b",Avance:"#ef4444"};

export default function App(){
  const[ok,setOk]=useState(()=>{try{return localStorage.getItem("gm_ok")==="1";}catch{return false;}});
  const[tab,setTab]=useState("journal");
  const[date,setDate]=useState(today());
  const[db,setDb]=useState({});
  const[foods,setFoods]=useState([]);
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{Promise.all([idbGet("db"),idbGet("foods")]).then(([d,f])=>{if(d)setDb(d);if(f)setFoods(f);setLoaded(true);});},[]);
  useEffect(()=>{if(loaded)idbSet("db",db);},[db,loaded]);
  useEffect(()=>{if(loaded)idbSet("foods",foods);},[foods,loaded]);
  const accept=()=>{try{localStorage.setItem("gm_ok","1");}catch{}setOk(true);};
  const day=db[date]||{meals:{breakfast:[],lunch:[],snack:[],dinner:[]},weight:null,sleep:null,exercises:[]};
  const updateDay=p=>setDb(prev=>({...prev,[date]:{...prev[date],...p}}));
  const allDates=Object.keys(db).sort();
  const items=Object.values(day.meals||{}).flat();
  const tot=sumM(items);
  const exCal=(day.exercises||[]).reduce((s,e)=>s+(e.cal||0),0);
  const target=PROFILE.dailyCal+exCal;
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return d.toISOString().slice(0,10);});
  return(
    <div style={{minHeight:"100vh",background:"#08080f",color:"#f1f5f9",fontFamily:"system-ui,sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input,select,textarea{outline:none;font-family:inherit;color:#f1f5f9}button{font-family:inherit;cursor:pointer}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#f97316;border-radius:2px}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .25s ease both}`}</style>
      {!ok&&<Disclaimer accept={accept}/>}
      <header style={{padding:"11px 14px",background:"#0f172a",borderBottom:"1px solid #1f2937",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <svg width="30" height="30" viewBox="0 0 30 30"><rect width="30" height="30" rx="7" fill="#f97316"/><text x="15" y="21" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="15" fill="white" letterSpacing="-1">GM</text></svg>
          <div><div style={{fontSize:15,fontWeight:900,color:"#f97316",letterSpacing:1,lineHeight:1}}>GainMode</div><div style={{fontSize:8,color:"#6b7280"}}>Built Different</div></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:900,color:tot.cal>=target*0.9?"#10b981":"#f97316"}}>{tot.cal}<span style={{fontSize:9,color:"#6b7280",fontWeight:400}}>/{target}</span></div>
          <div style={{fontSize:9,color:"#6b7280"}}>kcal</div>
        </div>
      </header>
      <nav style={{display:"flex",background:"#0a0a18",borderBottom:"1px solid #1f2937",position:"sticky",top:52,zIndex:9}}>
        {[{id:"journal",l:"Journal"},{id:"menus",l:"Menus"},{id:"sport",l:"Sport"},{id:"cali",l:"Calisthenique"},{id:"stats",l:"Stats"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"8px 2px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#f97316":"transparent"}`,color:tab===t.id?"#f97316":"#4b5563",transition:"all .2s"}}>
            <span style={{fontSize:9,fontWeight:tab===t.id?700:400}}>{t.l}</span>
          </button>
        ))}
      </nav>
      <main style={{padding:"14px 12px 80px"}} className="fu" key={tab}>
        {tab==="journal"&&<Journal date={date} setDate={setDate} day={day} updateDay={updateDay} foods={foods} setFoods={setFoods} tot={tot} target={target} exCal={exCal}/>}
        {tab==="menus"&&<Menus day={day} updateDay={updateDay}/>}
        {tab==="sport"&&<ExList exos={EXERCISES} title="Musculation" day={day} updateDay={updateDay}/>}
        {tab==="cali"&&<ExList exos={CALI_EXERCISES} title="Callisthenie" day={day} updateDay={updateDay}/>}
        {tab==="stats"&&<Stats db={db} last14={last14} allDates={allDates} setDate={setDate} setTab={setTab}/>}
      </main>
    </div>
  );
}

function Disclaimer({accept}){
  return(
    <div style={{position:"fixed",inset:0,background:"#08080f",zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" rx="14" fill="#f97316"/><text x="30" y="42" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="28" fill="white" letterSpacing="-2">GM</text></svg>
          <div style={{fontSize:22,fontWeight:900,color:"#f97316",letterSpacing:3,marginTop:8}}>GainMode</div>
          <div style={{fontSize:10,color:"#6b7280",letterSpacing:2}}>BUILT DIFFERENT</div>
        </div>
        <div style={{background:"#0f172a",borderRadius:14,padding:18,marginBottom:14,border:"1px solid #1f2937"}}>
          <div style={{fontSize:14,fontWeight:800,color:"#f97316",textAlign:"center",marginBottom:12}}>Avertissement</div>
          {[["Pas un avis medical","Ne remplace pas un medecin, nutritionniste ou coach diplome."],["Estimations","Les valeurs caloriques sont approximatives."],["Usage personnel","Creee pour usage prive. Toute utilisation par un tiers est sous sa responsabilite."]].map(([t,d])=>(
            <div key={t} style={{borderLeft:"3px solid #f97316",paddingLeft:10,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#f97316"}}>{t}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:2,lineHeight:1.5}}>{d}</div>
            </div>
          ))}
          <label style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:12,cursor:"pointer"}}>
            <input type="checkbox" id="cb" style={{width:17,height:17,accentColor:"#f97316",marginTop:2,flexShrink:0}}/>
            <span style={{fontSize:11,color:"#94a3b8",lineHeight:1.5}}>Je comprends que GainMode est un outil indicatif et j'utilise cette application sous ma propre responsabilite.</span>
          </label>
        </div>
        <button onClick={()=>{const c=document.getElementById("cb");if(c?.checked)accept();else if(c)c.style.outline="2px solid #f97316";}}
          style={{width:"100%",padding:13,background:"linear-gradient(135deg,#f97316,#fbbf24)",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:14}}>
          Acceder a GainMode
        </button>
      </div>
    </div>
  );
}

function Journal({date,setDate,day,updateDay,foods,setFoods,tot,target,exCal}){
  const[openSlot,setOpenSlot]=useState(null);
  const[step,setStep]=useState("list");
  const[selFood,setSelFood]=useState(null);
  const[grams,setGrams]=useState("100");
  const[editItem,setEditItem]=useState(null);
  const[editG,setEditG]=useState("");
  const[sleepIn,setSleepIn]=useState("");
  const[weightIn,setWeightIn]=useState("");
  const[showAdd,setShowAdd]=useState(false);
  const[newF,setNewF]=useState({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:"",sugar:""});
  const addFood=slotId=>{
    if(!selFood)return;
    const g=parseFloat(grams)||100;
    const entry={id:Date.now(),name:selFood.name,grams:g,...calcM(selFood,g)};
    const meals={...(day.meals||{})};meals[slotId]=[...(meals[slotId]||[]),entry];
    updateDay({meals});setSelFood(null);setGrams("100");setStep("list");
  };
  const saveNewFood=slotId=>{
    const f={id:"u"+Date.now(),name:newF.name||"Aliment perso",cal:parseFloat(newF.cal)||0,protein:parseFloat(newF.protein)||0,carbs:parseFloat(newF.carbs)||0,fat:parseFloat(newF.fat)||0,fiber:parseFloat(newF.fiber)||0,sugar:parseFloat(newF.sugar)||0};
    setFoods(p=>[...p,f]);
    const entry={id:Date.now(),name:f.name,grams:100,...calcM(f,100)};
    const meals={...(day.meals||{})};meals[slotId]=[...(meals[slotId]||[]),entry];
    updateDay({meals});setNewF({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:"",sugar:""});setShowAdd(false);
  };
  const removeItem=(slotId,id)=>{const meals={...(day.meals||{})};meals[slotId]=(meals[slotId]||[]).filter(i=>i.id!==id);updateDay({meals});};
  const applyEdit=slotId=>{
    if(!editItem)return;
    const g=parseFloat(editG)||editItem.grams;
    const food=foods.find(f=>f.name===editItem.name)||editItem;
    const meals={...(day.meals||{})};
    meals[slotId]=(meals[slotId]||[]).map(i=>i.id===editItem.id?{...i,grams:g,...calcM(food,g)}:i);
    updateDay({meals});setEditItem(null);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d.toISOString().slice(0,10));}} style={{background:"#1f2937",border:"none",color:"#f1f5f9",borderRadius:10,padding:"7px 14px",fontSize:18}}>&#8249;</button>
        <div style={{textAlign:"center"}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{background:"transparent",border:"none",color:"#f97316",fontWeight:700,fontSize:14,textAlign:"center"}}/>
          <div style={{fontSize:10,color:"#6b7280"}}>{fmtD(date)}</div>
        </div>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d.toISOString().slice(0,10));}} style={{background:"#1f2937",border:"none",color:"#f1f5f9",borderRadius:10,padding:"7px 14px",fontSize:18}}>&#8250;</button>
      </div>
      <div style={{background:"#0f172a",borderRadius:14,padding:14,border:"1px solid #1f2937"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:tot.sugar>PROFILE.dailySugar?10:0}}>
          {MACROS.map(m=>{const val=Math.round((tot[m.key]||0)*10)/10;const t=m.key==="cal"?target:PROFILE["daily"+m.key.charAt(0).toUpperCase()+m.key.slice(1)]||99;const pct=Math.min(100,Math.round(val/t*100));const over=m.key==="sugar"&&val>PROFILE.dailySugar;return(
            <div key={m.key} style={{textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:900,color:over?"#ef4444":m.color}}>{val}</div>
              <div style={{fontSize:9,color:"#6b7280"}}>{m.label}/{m.key==="cal"?target:PROFILE["daily"+m.key.charAt(0).toUpperCase()+m.key.slice(1)]||99}</div>
              <div style={{height:3,background:"#1f2937",borderRadius:2,marginTop:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:over?"#ef4444":m.color,transition:"width .4s"}}/></div>
            </div>
          );})}
        </div>
        {tot.sugar>PROFILE.dailySugar&&<div style={{background:"#7f1d1d",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#fca5a5"}}>! Limite sucres depassee : {Math.round(tot.sugar)}g / {PROFILE.dailySugar}g</div>}
        {exCal>0&&<div style={{fontSize:10,color:"#a78bfa",marginTop:6,textAlign:"center"}}>Sport +{exCal} kcal brulees - objectif ajuste a {target} kcal</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:"#0f172a",borderRadius:12,padding:12,border:"1px solid #1f2937"}}>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:5}}>Sommeil</div>
          {day.sleep?(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:18,fontWeight:900,color:day.sleep>=7?"#10b981":"#f59e0b"}}>{day.sleep}h</span><button onClick={()=>updateDay({sleep:null})} style={{background:"none",border:"none",color:"#374151",fontSize:13}}>x</button></div>):(<div style={{display:"flex",gap:6,alignItems:"center"}}><input type="number" step=".5" min="0" max="12" placeholder="7.5" value={sleepIn} onChange={e=>setSleepIn(e.target.value)} style={{background:"#1f2937",border:"none",borderRadius:6,padding:"5px 8px",fontSize:13,width:"100%"}}/><button onClick={()=>{if(sleepIn){updateDay({sleep:parseFloat(sleepIn)});setSleepIn("");}}} style={{background:"#f97316",border:"none",color:"#fff",borderRadius:6,padding:"5px 9px",fontWeight:700,fontSize:11,flexShrink:0}}>OK</button></div>)}
        </div>
        <div style={{background:"#0f172a",borderRadius:12,padding:12,border:"1px solid #1f2937"}}>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:5}}>Poids</div>
          {day.weight?(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:18,fontWeight:900,color:"#f97316"}}>{day.weight} kg</span><button onClick={()=>updateDay({weight:null})} style={{background:"none",border:"none",color:"#374151",fontSize:13}}>x</button></div>):(<div style={{display:"flex",gap:6,alignItems:"center"}}><input type="number" step=".1" placeholder="60.0" value={weightIn} onChange={e=>setWeightIn(e.target.value)} style={{background:"#1f2937",border:"none",borderRadius:6,padding:"5px 8px",fontSize:13,width:"100%"}}/><button onClick={()=>{if(weightIn){updateDay({weight:parseFloat(weightIn)});setWeightIn("");}}} style={{background:"#f97316",border:"none",color:"#fff",borderRadius:6,padding:"5px 9px",fontWeight:700,fontSize:11,flexShrink:0}}>OK</button></div>)}
        </div>
      </div>
      {SLOTS.map(slot=>{
        const its=(day.meals||{})[slot.id]||[];const stot=sumM(its);const isO=openSlot===slot.id;
        return(
          <div key={slot.id} style={{background:"#0f172a",borderRadius:14,border:`1px solid ${isO?slot.color+"50":"#1f2937"}`,borderLeft:`3px solid ${slot.color}`,overflow:"hidden"}}>
            <button onClick={()=>{setOpenSlot(isO?null:slot.id);setStep("list");setSelFood(null);setShowAdd(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"}}>
              <div style={{width:28,height:28,borderRadius:7,background:slot.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:slot.color,flexShrink:0}}>{slot.label.slice(0,2)}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{slot.label}</div><div style={{fontSize:10,color:"#6b7280"}}>{its.length} aliment{its.length>1?"s":""}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:slot.color}}>{stot.cal}</div><div style={{fontSize:9,color:"#6b7280"}}>kcal</div></div>
              <span style={{color:"#374151",fontSize:13,marginLeft:4}}>{isO?"^":"v"}</span>
            </button>
            {its.length>0&&(
              <div style={{borderTop:"1px solid #111827"}}>
                {its.map(item=>(
                  <div key={item.id}>
                    <div style={{display:"flex",alignItems:"center",padding:"9px 14px",gap:8}}>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{item.name}</div><div style={{fontSize:10,color:"#6b7280"}}>{item.grams}g - {item.protein}g P - {item.carbs}g G - {item.fat}g L</div></div>
                      <div style={{fontSize:13,fontWeight:700,color:slot.color,minWidth:32,textAlign:"right"}}>{item.cal}</div>
                      <button onClick={()=>{setEditItem(item);setEditG(String(item.grams));}} style={{background:"#1e3a5f",border:"none",color:"#60a5fa",borderRadius:5,padding:"3px 7px",fontSize:10}}>Edit</button>
                      <button onClick={()=>removeItem(slot.id,item.id)} style={{background:"#7f1d1d",border:"none",color:"#fca5a5",borderRadius:5,padding:"3px 7px",fontSize:10}}>x</button>
                    </div>
                    {editItem?.id===item.id&&(
                      <div style={{background:"#1e293b",padding:"10px 14px",borderTop:"1px solid #1f2937"}}>
                        <div style={{fontSize:11,color:"#f97316",fontWeight:700,marginBottom:8}}>Modifier la quantite</div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <input type="number" value={editG} onChange={e=>setEditG(e.target.value)} style={{background:"#0f172a",border:"1px solid #374151",borderRadius:6,padding:"5px 8px",fontSize:13,width:70}}/>
                          <span style={{fontSize:11,color:"#6b7280"}}>g</span>
                          <button onClick={()=>applyEdit(slot.id)} style={{background:"#10b981",border:"none",color:"#fff",borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:700}}>Valider</button>
                          <button onClick={()=>setEditItem(null)} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:6,padding:"6px 10px",fontSize:11}}>Annuler</button>
                        </div>
                        <div style={{fontSize:10,color:"#6b7280",marginTop:5}}>Les macros seront recalculees selon le grammage.</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isO&&(
              <div style={{borderTop:"1px solid #1f2937",padding:12}}>
                {!showAdd&&step==="list"&&(
                  <>
                    <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto",marginBottom:8}}>
                      {foods.length===0&&<div style={{fontSize:12,color:"#6b7280",textAlign:"center",padding:"16px 0"}}>Aucun aliment enregistre. Ajoutes-en ci-dessous !</div>}
                      {foods.map(f=>(
                        <button key={f.id} onClick={()=>{setSelFood(f);setGrams("100");setStep("qty");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#111827",border:"1px solid #1f2937",borderRadius:8,padding:"8px 12px",textAlign:"left",width:"100%"}}>
                          <div><div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{f.name}</div><div style={{fontSize:10,color:"#6b7280"}}>{f.cal} kcal / 100g</div></div>
                          <div style={{fontSize:11,color:"#f97316",fontWeight:700}}>{f.cal} kcal</div>
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"#1f2937",border:"1px dashed #374151",color:"#9ca3af",borderRadius:8,padding:"9px",fontSize:12,fontWeight:700}}>+ Ajouter un aliment</button>
                  </>
                )}
                {step==="qty"&&selFood&&!showAdd&&(
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:slot.color,marginBottom:10}}>{selFood.name}</div>
                    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                      {[50,100,150,200,250,300].map(g=>(
                        <button key={g} onClick={()=>setGrams(String(g))} style={{background:grams===String(g)?"#f97316":"#1f2937",border:"none",color:grams===String(g)?"#fff":"#9ca3af",borderRadius:6,padding:"5px 8px",fontSize:11,fontWeight:700}}>{g}g</button>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                      <input type="number" value={grams} onChange={e=>setGrams(e.target.value)} min="1" style={{background:"#111827",border:"1px solid #374151",borderRadius:8,padding:"8px 10px",fontSize:16,fontWeight:700,width:90,textAlign:"center"}}/>
                      <span style={{fontSize:12,color:"#6b7280"}}>grammes</span>
                    </div>
                    {(()=>{const g=parseFloat(grams)||100;const m=calcM(selFood,g);return(<div style={{background:"#111827",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",gap:10,flexWrap:"wrap",fontSize:12}}><span style={{color:"#f97316",fontWeight:700}}>{m.cal} kcal</span><span style={{color:"#ef4444"}}>{m.protein}g P</span><span style={{color:"#f59e0b"}}>{m.carbs}g G</span><span style={{color:"#8b5cf6"}}>{m.fat}g L</span></div>);})()}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>addFood(slot.id)} style={{flex:1,background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13}}>Ajouter</button>
                      <button onClick={()=>{setStep("list");setSelFood(null);}} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"10px 14px",fontSize:13}}>Retour</button>
                    </div>
                  </div>
                )}
                {showAdd&&(
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#f97316",marginBottom:12}}>Nouvel aliment - valeurs pour 100g</div>
                    <input placeholder="Nom de l'aliment" value={newF.name} onChange={e=>setNewF(p=>({...p,name:e.target.value}))} style={{width:"100%",background:"#111827",border:"1px solid #374151",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:8}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                      {[{k:"cal",l:"Calories"},{k:"protein",l:"Proteines"},{k:"carbs",l:"Glucides"},{k:"fat",l:"Lipides"},{k:"fiber",l:"Fibres"},{k:"sugar",l:"Sucres"}].map(f=>(
                        <div key={f.k}><div style={{fontSize:9,color:"#6b7280",marginBottom:3}}>{f.l}</div><input type="number" value={newF[f.k]} onChange={e=>setNewF(p=>({...p,[f.k]:e.target.value}))} style={{background:"#111827",border:"1px solid #374151",borderRadius:6,padding:"6px 8px",fontSize:13,width:"100%"}}/></div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>Sauvegarde definitivement dans votre appli (resiste au vider cache).</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>saveNewFood(slot.id)} style={{flex:1,background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13}}>Sauvegarder et ajouter</button>
                      <button onClick={()=>setShowAdd(false)} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"10px 14px",fontSize:13}}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {(day.exercises||[]).length>0&&(
        <div style={{background:"#0f172a",borderRadius:14,padding:14,border:"1px solid #1f2937"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ef4444",marginBottom:8}}>Sport du jour</div>
          {(day.exercises||[]).map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #111827"}}>
              <span style={{fontSize:12}}>{e.name}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,color:"#ef4444",fontWeight:700}}>-{e.cal} kcal</span>
                <button onClick={()=>{const exercises=(day.exercises||[]).filter((_,j)=>j!==i);updateDay({exercises});}} style={{background:"#7f1d1d",border:"none",color:"#fca5a5",borderRadius:5,padding:"2px 7px",fontSize:10}}>x</button>
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:"#a78bfa",marginTop:6}}>Total : {exCal} kcal brulees</div>
        </div>
      )}
    </div>
  );
}

function Menus({day,updateDay}){
  const[sf,setSf]=useState("Tous");const[tf,setTf]=useState("Tous");const[q,setQ]=useState("");const[open,setOpen]=useState(null);const[added,setAdded]=useState(null);
  const slots=["Tous","breakfast","lunch","snack","dinner"];const slotL={"breakfast":"Petit-dej","lunch":"Dejeuner","snack":"Gouter","dinner":"Diner"};
  const types=["Tous",...Array.from(new Set(MENUS.map(m=>m.type)))];
  const fil=MENUS.filter(m=>(sf==="Tous"||m.slot===sf)&&(tf==="Tous"||m.type===tf)&&(!q||m.name.toLowerCase().includes(q.toLowerCase())||m.desc.toLowerCase().includes(q.toLowerCase())));
  const sc={"breakfast":"#f59e0b","lunch":"#10b981","snack":"#8b5cf6","dinner":"#ef4444"};
  const add=(menu,slotId)=>{
    const entry={id:Date.now(),name:menu.name,grams:1,cal:menu.cal,protein:menu.protein,carbs:menu.carbs,fat:menu.fat,fiber:2,sugar:Math.round(menu.carbs*0.25)};
    const meals={...(day.meals||{})};meals[slotId]=[...(meals[slotId]||[]),entry];
    updateDay({meals});setAdded(menu.id+slotId);setTimeout(()=>setAdded(null),2000);setOpen(null);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:13,fontWeight:700}}>Idees de repas</div>
      <input placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)} style={{background:"#0f172a",border:"1px solid #374151",borderRadius:10,padding:"9px 12px",fontSize:13,width:"100%"}}/>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {slots.map(s=><button key={s} onClick={()=>setSf(s)} style={{background:sf===s?"#f97316":"#1f2937",border:"none",color:sf===s?"#fff":"#9ca3af",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{s==="Tous"?"Tous":slotL[s]||s}</button>)}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {types.map(t=><button key={t} onClick={()=>setTf(t)} style={{background:tf===t?"#3b82f6":"#1f2937",border:"none",color:tf===t?"#fff":"#9ca3af",borderRadius:6,padding:"5px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{t}</button>)}
      </div>
      <div style={{fontSize:10,color:"#6b7280"}}>{fil.length} menus</div>
      {fil.map(menu=>{const col=sc[menu.slot]||"#f97316";const isO=open===menu.id;return(
        <div key={menu.id} style={{background:"#0f172a",borderRadius:12,border:`1px solid ${isO?col+"50":"#1f2937"}`,borderLeft:`3px solid ${col}`,overflow:"hidden"}}>
          <button onClick={()=>setOpen(isO?null:menu.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{menu.name}</div><div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{slotL[menu.slot]} - {menu.type}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:col}}>{menu.cal}</div><div style={{fontSize:9,color:"#6b7280"}}>kcal</div></div>
            <span style={{color:"#374151",marginLeft:4}}>{isO?"^":"v"}</span>
          </button>
          {isO&&(
            <div style={{padding:"0 14px 14px",borderTop:"1px solid #1f2937"}}>
              <p style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6,margin:"10px 0"}}>{menu.desc}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                <span style={{background:"#ef444420",color:"#f87171",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>P:{menu.protein}g</span>
                <span style={{background:"#f59e0b20",color:"#fbbf24",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>G:{menu.carbs}g</span>
                <span style={{background:"#8b5cf620",color:"#a78bfa",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>L:{menu.fat}g</span>
              </div>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>Ajouter au journal :</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["breakfast","lunch","snack","dinner"].map(sid=>{const k=menu.id+sid;return(
                  <button key={sid} onClick={()=>add(menu,sid)} style={{background:added===k?"#10b981":(sc[sid]||"#f97316"),border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,transition:"background .3s"}}>
                    {added===k?"OK !":"+ "+slotL[sid]}
                  </button>
                );})}
              </div>
            </div>
          )}
        </div>
      );})}
    </div>
  );
}

function ExList({exos,title,day,updateDay}){
  const[mf,setMf]=useState("Tous");const[ef,setEf]=useState("Tous");const[lf,setLf]=useState("Tous");const[open,setOpen]=useState(null);
  const muscles=["Tous",...Array.from(new Set(exos.map(e=>e.muscle)))];
  const equips=["Tous",...Array.from(new Set(exos.map(e=>e.equip)))];
  const levels=["Tous","Debutant","Intermediaire","Avance"];
  const fil=exos.filter(e=>(mf==="Tous"||e.muscle===mf)&&(ef==="Tous"||e.equip===ef)&&(lf==="Tous"||e.level===lf));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:13,fontWeight:700}}>{title}</div>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {muscles.map(m=><button key={m} onClick={()=>setMf(m)} style={{background:mf===m?(MC[m]||"#f97316"):"#1f2937",border:"none",color:mf===m?"#fff":"#9ca3af",borderRadius:6,padding:"5px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{m}</button>)}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {equips.map(e=><button key={e} onClick={()=>setEf(e)} style={{background:ef===e?"#3b82f6":"#1f2937",border:"none",color:ef===e?"#fff":"#9ca3af",borderRadius:6,padding:"4px 9px",fontSize:10,fontWeight:700}}>{e}</button>)}
        {levels.map(l=><button key={l} onClick={()=>setLf(l)} style={{background:lf===l?(LC[l]||"#374151"):"#1f2937",border:"none",color:lf===l?"#fff":"#9ca3af",borderRadius:6,padding:"4px 9px",fontSize:10,fontWeight:700}}>{l==="Tous"?"Tous niv.":l}</button>)}
      </div>
      <div style={{fontSize:10,color:"#6b7280"}}>{fil.length} exercices</div>
      {fil.map(ex=>{const mc=MC[ex.muscle]||"#f97316";const isO=open===ex.id;return(
        <div key={ex.id} style={{background:"#0f172a",borderRadius:12,border:`1px solid ${isO?mc+"50":"#1f2937"}`,borderLeft:`3px solid ${mc}`,overflow:"hidden"}}>
          <button onClick={()=>setOpen(isO?null:ex.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>{ex.name}</div>
              <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                <span style={{background:mc+"30",color:mc,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{ex.muscle}</span>
                <span style={{background:"#1f2937",color:"#9ca3af",borderRadius:4,padding:"1px 6px",fontSize:9}}>{ex.equip}</span>
                <span style={{background:(LC[ex.level]||"#374151")+"30",color:LC[ex.level]||"#e2e8f0",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{ex.level}</span>
              </div>
            </div>
            <div style={{textAlign:"right",minWidth:46}}>
              <div style={{fontSize:11,color:"#f97316",fontWeight:700}}>{ex.sets}x{ex.reps}</div>
              <div style={{fontSize:9,color:"#6b7280"}}>{ex.rest}s repos</div>
              <div style={{fontSize:11,color:"#ef4444",fontWeight:700}}>~{ex.cal*ex.sets}cal</div>
            </div>
            <span style={{color:"#374151",marginLeft:4}}>{isO?"^":"v"}</span>
          </button>
          {isO&&(
            <div style={{borderTop:"1px solid #1f2937",padding:"12px 14px"}}>
              <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:14}}>{ex.desc}</p>
              <Timer ex={ex} day={day} updateDay={updateDay}/>
            </div>
          )}
        </div>
      );})}
    </div>
  );
}

function Timer({ex,day,updateDay}){
  const[phase,setPhase]=useState("idle");const[secs,setSecs]=useState(0);const[target,setTarget]=useState(0);const[curSet,setCurSet]=useState(1);const[paused,setPaused]=useState(false);const ref=useRef(null);
  const bell=()=>{try{const c=new(window.AudioContext||window.webkitAudioContext)();[880,660,880].forEach((f,i)=>{const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=f;g.gain.setValueAtTime(0.5,c.currentTime+i*0.2);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.2+0.4);o.start(c.currentTime+i*0.2);o.stop(c.currentTime+i*0.2+0.5);});}catch{}try{navigator.vibrate([150,80,150]);}catch{}};
  useEffect(()=>{
    if((phase==="work"||phase==="rest")&&!paused){
      ref.current=setInterval(()=>{setSecs(s=>{if(s<=1){clearInterval(ref.current);bell();if(phase==="work"){if(curSet<ex.sets){setPhase("rest");setSecs(ex.rest);setTarget(ex.rest);}else setPhase("done");}else{const n=curSet+1;setCurSet(n);if(n<=ex.sets){setPhase("work");setSecs(30);setTarget(30);}else setPhase("done");}return 0;}return s-1;});},1000);
    }else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[phase,paused,curSet,ex.sets,ex.rest]);
  const start=()=>{setPhase("work");setSecs(30);setTarget(30);setCurSet(1);setPaused(false);};
  const stop=()=>{setPhase("idle");setSecs(0);setCurSet(1);setPaused(false);clearInterval(ref.current);};
  const log=()=>{const exercises=[...(day.exercises||[]),{name:ex.name,cal:ex.cal*ex.sets}];updateDay({exercises});stop();};
  const pct=target>0?(secs/target):0;const col=phase==="rest"?"#3b82f6":secs<=5?"#ef4444":secs<=10?"#f59e0b":"#10b981";const r=36;const circ=2*Math.PI*r;
  if(phase==="idle")return(<button onClick={start} style={{width:"100%",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",color:"#fff",borderRadius:10,padding:"11px",fontWeight:800,fontSize:14}}>Demarrer - {ex.sets} series de {ex.reps} - {ex.rest}s repos</button>);
  if(phase==="done")return(<div style={{textAlign:"center",padding:"8px 0"}}><div style={{fontSize:20,marginBottom:4}}>Bravo !</div><div style={{fontSize:13,color:"#10b981",fontWeight:700,marginBottom:12}}>{ex.sets} series - ~{ex.cal*ex.sets} kcal</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><button onClick={log} style={{background:"#10b981",border:"none",color:"#fff",borderRadius:10,padding:"10px 18px",fontWeight:800,fontSize:13}}>Logger dans le journal</button><button onClick={stop} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:10,padding:"10px 14px",fontSize:13}}>Fermer</button></div></div>);
  return(<div style={{textAlign:"center"}}><div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>{phase==="work"?"EFFORT":"REPOS"} - Serie {curSet}/{ex.sets}{phase==="work"&&` - ${ex.reps} reps`}</div><div style={{display:"flex",justifyContent:"center",marginBottom:12}}><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="6"/><circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" style={{transition:"stroke-dasharray .9s,stroke .3s"}}/><text x="50" y="44" textAnchor="middle" fill={col} fontSize="22" fontWeight="900">{secs}</text><text x="50" y="60" textAnchor="middle" fill="#6b7280" fontSize="10">sec</text></svg></div><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8}}><button onClick={()=>setPaused(p=>!p)} style={{background:paused?"#10b981":"#f59e0b",border:"none",color:"#fff",borderRadius:10,padding:"10px 22px",fontWeight:800,fontSize:14}}>{paused?"Reprendre":"Pause"}</button><button onClick={stop} style={{background:"#ef4444",border:"none",color:"#fff",borderRadius:10,padding:"10px 18px",fontWeight:800,fontSize:14}}>Stop</button></div>{phase==="work"&&(<button onClick={()=>{if(curSet<ex.sets){setPhase("rest");setSecs(ex.rest);setTarget(ex.rest);setCurSet(c=>c+1);setPaused(false);}else setPhase("done");}} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"7px 16px",fontSize:11}}>Serie terminee</button>)}</div>);
}

function Stats({db,last14,allDates,setDate,setTab}){
  const wp=allDates.map(d=>({d,w:db[d]?.weight})).filter(x=>x.w);
  const cd=last14.map(d=>{const items=Object.values(db[d]?.meals||{}).flat();return{d,cal:sumM(items).cal};});
  const sd=last14.map(d=>({d,s:db[d]?.sleep||0}));
  const Card=({title,sub,children})=>(<div style={{background:"#0f172a",borderRadius:14,padding:14,border:"1px solid #1f2937"}}><div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{title}</div>{sub&&<div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>{sub}</div>}{children}</div>);
  const Empty=({t})=>(<div style={{fontSize:12,color:"#6b7280",padding:"14px 0",textAlign:"center"}}>{t}</div>);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card title="Poids" sub={`${PROFILE.startWeight}kg vers ${PROFILE.targetWeight}kg`}>
        {wp.length<2?<Empty t="Enregistre ton poids depuis le Journal."/>:(()=>{
          const vals=[...wp.map(x=>x.w),PROFILE.startWeight,PROFILE.targetWeight];const minV=Math.min(...vals)-0.5,maxV=Math.max(...vals)+0.5,range=maxV-minV;const W=340,H=120;
          const px=i=>(i/(wp.length-1))*W;const py=v=>H-((v-minV)/range)*H;const line=wp.map((x,i)=>`${i===0?"M":"L"}${px(i)},${py(x.w)}`).join(" ");const tY=py(PROFILE.targetWeight);
          return(<svg width="100%" viewBox={`0 0 ${W} ${H+18}`} style={{overflow:"visible",marginTop:8}}>
            <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".3"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></linearGradient></defs>
            {[0,.5,1].map(f=><line key={f} x1="0" x2={W} y1={f*H} y2={f*H} stroke="#1f2937" strokeWidth="1"/>)}
            <line x1="0" x2={W} y1={tY} y2={tY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3"/>
            <text x="3" y={tY-4} fill="#10b981" fontSize="9">Objectif {PROFILE.targetWeight}kg</text>
            <path d={line+" L"+W+","+H+" L0,"+H+" Z"} fill="url(#wg)"/>
            <path d={line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round"/>
            {wp.map((x,i)=>(<g key={i}><circle cx={px(i)} cy={py(x.w)} r="4" fill="#f97316" stroke="#08080f" strokeWidth="2"/><text x={px(i)} y={py(x.w)-7} fill="#f97316" fontSize="9" textAnchor="middle">{x.w}</text>{i%Math.max(1,Math.floor(wp.length/5))===0&&<text x={px(i)} y={H+14} fill="#6b7280" fontSize="8" textAnchor="middle">{fmtD(x.d).slice(0,6)}</text>}</g>))}
          </svg>);
        })()}
      </Card>
      <Card title="Calories - 14 jours" sub={`Objectif ${PROFILE.dailyCal} kcal/jour`}>
        {!cd.some(x=>x.cal>0)?<Empty t="Ajoute des aliments dans le Journal."/>:(()=>{
          const maxC=Math.max(...cd.map(x=>x.cal),PROFILE.dailyCal);
          return(<svg width="100%" viewBox="0 0 340 120" style={{overflow:"visible",marginTop:8}}>
            <line x1="0" x2="340" y1={100-(PROFILE.dailyCal/maxC)*100} y2={100-(PROFILE.dailyCal/maxC)*100} stroke="#f97316" strokeWidth="1.2" strokeDasharray="4,3"/>
            {cd.map((x,i)=>{const bW=340/14-2,bx=i*(340/14)+1,h=x.cal?Math.max(3,(x.cal/maxC)*100):0,col=x.cal>=PROFILE.dailyCal*0.9?"#10b981":x.cal>0?"#f59e0b":"#1f2937";return(<g key={x.d}><rect x={bx} y={100-h} width={bW} height={h} fill={col} rx="2"/>{x.cal>0&&<text x={bx+bW/2} y={100-h-3} fill={col} fontSize="7" textAnchor="middle">{x.cal}</text>}{i%2===0&&<text x={bx+bW/2} y={116} fill="#6b7280" fontSize="7" textAnchor="middle">{fmtD(x.d).slice(0,5)}</text>}</g>);})}
          </svg>);
        })()}
      </Card>
      <Card title="Sommeil - 14 jours" sub="Vert 8h+ | Orange 6-8h | Rouge moins de 6h">
        {!sd.some(x=>x.s>0)?<Empty t="Enregistre ton sommeil depuis le Journal."/>:(()=>{
          const maxS=Math.max(...sd.map(x=>x.s),10);
          return(<svg width="100%" viewBox="0 0 340 120" style={{overflow:"visible",marginTop:8}}>
            <line x1="0" x2="340" y1={100-(8/maxS)*100} y2={100-(8/maxS)*100} stroke="#10b981" strokeWidth="1.2" strokeDasharray="4,3"/>
            <text x="2" y={100-(8/maxS)*100-3} fill="#10b981" fontSize="8">8h</text>
            {sd.map((x,i)=>{const bW=340/14-2,bx=i*(340/14)+1,h=x.s?Math.max(3,(x.s/maxS)*100):0,col=x.s>=8?"#10b981":x.s>=6?"#f59e0b":x.s>0?"#ef4444":"#1f2937";return(<g key={x.d}><rect x={bx} y={100-h} width={bW} height={h} fill={col} rx="2"/>{x.s>0&&<text x={bx+bW/2} y={100-h-3} fill={col} fontSize="7" textAnchor="middle">{x.s}h</text>}{i%2===0&&<text x={bx+bW/2} y={116} fill="#6b7280" fontSize="7" textAnchor="middle">{fmtD(x.d).slice(0,5)}</text>}</g>);})}
          </svg>);
        })()}
      </Card>
      <div style={{background:"#0f172a",borderRadius:14,border:"1px solid #1f2937",overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #1f2937",fontSize:13,fontWeight:700}}>Historique</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:"#111827"}}>{["Date","Kcal","Prot","Poids","Sommeil"].map(h=><th key={h} style={{padding:"7px 8px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>{[...allDates].reverse().slice(0,20).map(d=>{const e=db[d]||{};const items=Object.values(e.meals||{}).flat();const t=sumM(items);return(<tr key={d} style={{borderBottom:"1px solid #111827",cursor:"pointer"}} onClick={()=>{setDate(d);setTab("journal");}}><td style={{padding:"7px 8px",fontSize:10}}>{fmtD(d)}</td><td style={{padding:"7px 8px",color:t.cal>=PROFILE.dailyCal*0.9?"#4ade80":"#f87171",fontWeight:700}}>{t.cal||"-"}</td><td style={{padding:"7px 8px",color:"#ef4444"}}>{t.protein||"-"}g</td><td style={{padding:"7px 8px",color:"#f97316"}}>{e.weight?e.weight+"kg":"-"}</td><td style={{padding:"7px 8px",color:e.sleep>=7?"#4ade80":"#f87171"}}>{e.sleep?e.sleep+"h":"-"}</td></tr>);})}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
