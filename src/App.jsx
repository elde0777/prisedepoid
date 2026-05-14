import React, { useState, useEffect, useRef } from "react";

/* ===========================================================
   GainMode v4 - Interface aeree + IndexedDB + Callisthenie
=========================================================== */

const PROFILE = {
  startWeight:60, targetWeight:70, height:180, age:30, goalMonths:6,
  dailyCal:3000, dailyProtein:150, dailyCarbs:380, dailyFat:100,
  dailyFiber:35, dailySugar:80,
};

// IndexedDB - resist vider cache
function openIDB() {
  return new Promise((res,rej) => {
    const r = indexedDB.open("gainmode_v4",1);
    r.onupgradeneeded = e => { e.target.result.createObjectStore("kv"); };
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e);
  });
}
async function idbGet(key) {
  const db = await openIDB();
  return new Promise((res,rej) => {
    const r = db.transaction("kv","readonly").objectStore("kv").get(key);
    r.onsuccess = () => res(r.result ?? null);
    r.onerror   = e => rej(e);
  });
}
async function idbSet(key,val) {
  const db = await openIDB();
  return new Promise((res,rej) => {
    const tx = db.transaction("kv","readwrite");
    tx.objectStore("kv").put(val,key);
    tx.oncomplete = () => res();
    tx.onerror    = e => rej(e);
  });
}

// Helpers
const todayStr = () => new Date().toISOString().slice(0,10);
const fmtDate  = d => new Date(d+"T12:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});
const calcM    = (f,g) => ({
  cal:     Math.round(f.cal*g/100),
  protein: Math.round(f.protein*g/100*10)/10,
  carbs:   Math.round(f.carbs*g/100*10)/10,
  fat:     Math.round(f.fat*g/100*10)/10,
  fiber:   Math.round(f.fiber*g/100*10)/10,
  sugar:   Math.round(f.sugar*g/100*10)/10,
});
const sumM = items => items.reduce((a,i) => ({
  cal:a.cal+(i.cal||0), protein:a.protein+(i.protein||0),
  carbs:a.carbs+(i.carbs||0), fat:a.fat+(i.fat||0),
  fiber:a.fiber+(i.fiber||0), sugar:a.sugar+(i.sugar||0),
}), {cal:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0});

// Base aliments (100g)
const BASE_FOODS = [
  {id:"f1", name:"Riz blanc cuit",       cal:130,protein:2.7,carbs:28,  fat:0.3,fiber:0.4,sugar:0,   cat:"Feculents"},
  {id:"f2", name:"Riz basmati cuit",     cal:121,protein:2.7,carbs:26,  fat:0.3,fiber:0.4,sugar:0,   cat:"Feculents"},
  {id:"f3", name:"Pates cuites",         cal:158,protein:5.5,carbs:31,  fat:0.9,fiber:1.8,sugar:0.6, cat:"Feculents"},
  {id:"f4", name:"Pomme de terre",       cal:86, protein:1.8,carbs:20,  fat:0.1,fiber:1.8,sugar:0.9, cat:"Feculents"},
  {id:"f5", name:"Patate douce",         cal:86, protein:1.6,carbs:20,  fat:0.1,fiber:3,  sugar:4.2, cat:"Feculents"},
  {id:"f6", name:"Flocons avoine",       cal:389,protein:17, carbs:66,  fat:7,  fiber:11, sugar:1,   cat:"Feculents"},
  {id:"f7", name:"Pain complet",         cal:247,protein:9,  carbs:41,  fat:3.5,fiber:7,  sugar:4,   cat:"Feculents"},
  {id:"f8", name:"Pain blanc",           cal:265,protein:9,  carbs:49,  fat:3.2,fiber:2.7,sugar:4,   cat:"Feculents"},
  {id:"f9", name:"Pain de mie",          cal:260,protein:8,  carbs:47,  fat:4,  fiber:2,  sugar:5,   cat:"Feculents"},
  {id:"f10",name:"Lentilles cuites",     cal:116,protein:9,  carbs:20,  fat:0.4,fiber:7.9,sugar:1.8, cat:"Feculents"},
  {id:"f11",name:"Pois chiches",         cal:164,protein:8.9,carbs:27,  fat:2.6,fiber:7.6,sugar:4.8, cat:"Feculents"},
  {id:"f12",name:"Quinoa cuit",          cal:120,protein:4.4,carbs:22,  fat:1.9,fiber:2.8,sugar:0.9, cat:"Feculents"},
  {id:"f13",name:"Semoule cuite",        cal:112,protein:3.8,carbs:23,  fat:0.2,fiber:1.4,sugar:0.5, cat:"Feculents"},
  {id:"f14",name:"Haricots rouges",      cal:127,protein:8.7,carbs:22,  fat:0.5,fiber:6.4,sugar:0.3, cat:"Feculents"},
  {id:"f15",name:"Naan",                 cal:310,protein:8,  carbs:55,  fat:6,  fiber:2,  sugar:4,   cat:"Feculents"},
  {id:"f16",name:"Tortilla",             cal:306,protein:8.5,carbs:51,  fat:7,  fiber:3,  sugar:3,   cat:"Feculents"},
  {id:"v1", name:"Blanc poulet",         cal:110,protein:23, carbs:0,   fat:1.2,fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v2", name:"Cuisse poulet",        cal:155,protein:22, carbs:0,   fat:7.5,fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v3", name:"Steak hache 5%",       cal:158,protein:20, carbs:0,   fat:8.4,fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v4", name:"Steak hache 15%",      cal:235,protein:17, carbs:0,   fat:18, fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v5", name:"Boeuf rumsteak",       cal:158,protein:22, carbs:0,   fat:7.5,fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v6", name:"Porc filet",           cal:147,protein:22, carbs:0,   fat:6.2,fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v7", name:"Jambon blanc",         cal:107,protein:17, carbs:1.1, fat:3.5,fiber:0,  sugar:0.8, cat:"Viandes"},
  {id:"v8", name:"Jambon cru",           cal:196,protein:18, carbs:0.3, fat:13, fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v9", name:"Lardons",              cal:365,protein:13, carbs:0,   fat:35, fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v10",name:"Merguez",              cal:296,protein:14, carbs:1,   fat:26, fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v11",name:"Saucisse Francfort",   cal:280,protein:12, carbs:3,   fat:25, fiber:0,  sugar:1,   cat:"Viandes"},
  {id:"v12",name:"Chorizo",              cal:455,protein:24, carbs:2,   fat:40, fiber:0,  sugar:0.5, cat:"Viandes"},
  {id:"v13",name:"Dinde escalope",       cal:104,protein:23, carbs:0,   fat:1,  fiber:0,  sugar:0,   cat:"Viandes"},
  {id:"v14",name:"Chipolata",            cal:285,protein:13, carbs:2,   fat:25, fiber:0,  sugar:1,   cat:"Viandes"},
  {id:"v15",name:"Boudin blanc",         cal:220,protein:14, carbs:5,   fat:16, fiber:0,  sugar:1,   cat:"Viandes"},
  {id:"l1", name:"Oeuf entier",          cal:155,protein:13, carbs:1.1, fat:11, fiber:0,  sugar:1.1, cat:"Oeufs & Laitiers"},
  {id:"l2", name:"Blanc oeuf",           cal:52, protein:11, carbs:0.7, fat:0.2,fiber:0,  sugar:0.7, cat:"Oeufs & Laitiers"},
  {id:"l3", name:"Yaourt grec",          cal:97, protein:9,  carbs:3.6, fat:5,  fiber:0,  sugar:3.2, cat:"Oeufs & Laitiers"},
  {id:"l4", name:"Fromage blanc 3%",     cal:66, protein:7,  carbs:4,   fat:3,  fiber:0,  sugar:4,   cat:"Oeufs & Laitiers"},
  {id:"l5", name:"Gruyere rape",         cal:413,protein:29, carbs:0.4, fat:33, fiber:0,  sugar:0.2, cat:"Oeufs & Laitiers"},
  {id:"l6", name:"Emmental",             cal:380,protein:28, carbs:0.5, fat:29, fiber:0,  sugar:0.5, cat:"Oeufs & Laitiers"},
  {id:"l7", name:"Raclette",             cal:350,protein:24, carbs:0.5, fat:28, fiber:0,  sugar:0.5, cat:"Oeufs & Laitiers"},
  {id:"l8", name:"Mozzarella",           cal:280,protein:18, carbs:2,   fat:22, fiber:0,  sugar:1,   cat:"Oeufs & Laitiers"},
  {id:"l9", name:"Beurre",               cal:717,protein:0.6,carbs:0.6, fat:81, fiber:0,  sugar:0.6, cat:"Oeufs & Laitiers"},
  {id:"l10",name:"Creme fraiche",        cal:292,protein:2.1,carbs:2.8, fat:30, fiber:0,  sugar:2.8, cat:"Oeufs & Laitiers"},
  {id:"l11",name:"Fromage ail herbes",   cal:290,protein:7,  carbs:4,   fat:27, fiber:0,  sugar:2,   cat:"Oeufs & Laitiers"},
  {id:"l12",name:"Parmesan",             cal:431,protein:38, carbs:0,   fat:29, fiber:0,  sugar:0,   cat:"Oeufs & Laitiers"},
  {id:"l13",name:"Skyr",                 cal:63, protein:11, carbs:4,   fat:0.2,fiber:0,  sugar:4,   cat:"Oeufs & Laitiers"},
  {id:"fr1",name:"Banane",               cal:89, protein:1.1,carbs:23,  fat:0.3,fiber:2.6,sugar:12,  cat:"Fruits"},
  {id:"fr2",name:"Pomme",                cal:52, protein:0.3,carbs:14,  fat:0.2,fiber:2.4,sugar:10,  cat:"Fruits"},
  {id:"fr3",name:"Orange",               cal:47, protein:0.9,carbs:12,  fat:0.1,fiber:2.4,sugar:9,   cat:"Fruits"},
  {id:"fr4",name:"Fraises",              cal:32, protein:0.7,carbs:7.7, fat:0.3,fiber:2,  sugar:4.9, cat:"Fruits"},
  {id:"fr5",name:"Mangue",               cal:60, protein:0.8,carbs:15,  fat:0.4,fiber:1.6,sugar:14,  cat:"Fruits"},
  {id:"fr6",name:"Avocat",               cal:160,protein:2,  carbs:9,   fat:15, fiber:7,  sugar:0.7, cat:"Fruits"},
  {id:"fr7",name:"Kiwi",                 cal:61, protein:1.1,carbs:15,  fat:0.5,fiber:3,  sugar:9,   cat:"Fruits"},
  {id:"fr8",name:"Raisin",               cal:69, protein:0.7,carbs:18,  fat:0.2,fiber:0.9,sugar:16,  cat:"Fruits"},
  {id:"fr9",name:"Peche",                cal:39, protein:0.9,carbs:10,  fat:0.3,fiber:1.5,sugar:8,   cat:"Fruits"},
  {id:"fr10",name:"Ananas",              cal:50, protein:0.5,carbs:13,  fat:0.1,fiber:1.4,sugar:10,  cat:"Fruits"},
  {id:"lg1",name:"Tomates",              cal:18, protein:0.9,carbs:3.9, fat:0.2,fiber:1.2,sugar:2.6, cat:"Legumes"},
  {id:"lg2",name:"Carottes",             cal:41, protein:0.9,carbs:10,  fat:0.2,fiber:2.8,sugar:4.7, cat:"Legumes"},
  {id:"lg3",name:"Courgettes",           cal:17, protein:1.2,carbs:3.1, fat:0.3,fiber:1,  sugar:2.5, cat:"Legumes"},
  {id:"lg4",name:"Epinards",             cal:23, protein:2.9,carbs:3.6, fat:0.4,fiber:2.2,sugar:0.4, cat:"Legumes"},
  {id:"lg5",name:"Brocoli",              cal:34, protein:2.8,carbs:7,   fat:0.4,fiber:2.6,sugar:1.7, cat:"Legumes"},
  {id:"lg6",name:"Champignons",          cal:22, protein:3.1,carbs:3.3, fat:0.3,fiber:1,  sugar:1.5, cat:"Legumes"},
  {id:"lg7",name:"Poivron rouge",        cal:31, protein:1,  carbs:6,   fat:0.3,fiber:2.1,sugar:4.2, cat:"Legumes"},
  {id:"lg8",name:"Salade verte",         cal:15, protein:1.4,carbs:2.2, fat:0.2,fiber:1.5,sugar:1.2, cat:"Legumes"},
  {id:"lg9",name:"Concombre",            cal:15, protein:0.6,carbs:3.6, fat:0.1,fiber:0.5,sugar:1.7, cat:"Legumes"},
  {id:"lg10",name:"Oignon",              cal:40, protein:1.1,carbs:9.3, fat:0.1,fiber:1.7,sugar:4.2, cat:"Legumes"},
  {id:"lg11",name:"Mais en boite",       cal:86, protein:3.2,carbs:19,  fat:1.2,fiber:2.7,sugar:3.2, cat:"Legumes"},
  {id:"lg12",name:"Petits pois",         cal:81, protein:5.4,carbs:14,  fat:0.4,fiber:5.7,sugar:5.7, cat:"Legumes"},
  {id:"g1", name:"Huile olive",          cal:884,protein:0,  carbs:0,   fat:100,fiber:0,  sugar:0,   cat:"Graisses & Sauces"},
  {id:"g2", name:"Beurre cacahuete",     cal:597,protein:25, carbs:20,  fat:51, fiber:6,  sugar:9,   cat:"Graisses & Sauces"},
  {id:"g3", name:"Mayonnaise",           cal:680,protein:1.3,carbs:2.6, fat:75, fiber:0,  sugar:1.2, cat:"Graisses & Sauces"},
  {id:"g4", name:"Ketchup",              cal:112,protein:1.6,carbs:26,  fat:0.2,fiber:0.5,sugar:23,  cat:"Graisses & Sauces"},
  {id:"g5", name:"Sauce tomate",         cal:39, protein:1.5,carbs:8,   fat:0.2,fiber:1.5,sugar:6,   cat:"Graisses & Sauces"},
  {id:"g6", name:"Miel",                 cal:304,protein:0.3,carbs:82,  fat:0,  fiber:0.2,sugar:82,  cat:"Graisses & Sauces"},
  {id:"g7", name:"Nutella",              cal:530,protein:6.3,carbs:57,  fat:31, fiber:2,  sugar:56,  cat:"Graisses & Sauces"},
  {id:"g8", name:"Confiture",            cal:260,protein:0.4,carbs:65,  fat:0.1,fiber:0.8,sugar:62,  cat:"Graisses & Sauces"},
  {id:"g9", name:"Sauce soja",           cal:53, protein:8.1,carbs:4.9, fat:0.1,fiber:0,  sugar:1,   cat:"Graisses & Sauces"},
  {id:"g10",name:"Sirop erable",         cal:260,protein:0,  carbs:67,  fat:0,  fiber:0,  sugar:60,  cat:"Graisses & Sauces"},
  {id:"b1", name:"Jus orange",           cal:45, protein:0.7,carbs:10,  fat:0.2,fiber:0.2,sugar:8,   cat:"Boissons"},
  {id:"b2", name:"Cafe expresso",        cal:2,  protein:0.3,carbs:0,   fat:0,  fiber:0,  sugar:0,   cat:"Boissons"},
  {id:"b3", name:"Cafe au lait",         cal:65, protein:3.4,carbs:5.1, fat:3.8,fiber:0,  sugar:5.1, cat:"Boissons"},
  {id:"b4", name:"Chocolat chaud",       cal:150,protein:5,  carbs:22,  fat:5,  fiber:1,  sugar:20,  cat:"Boissons"},
  {id:"b5", name:"Jus pomme",            cal:46, protein:0.1,carbs:11,  fat:0.1,fiber:0.1,sugar:10,  cat:"Boissons"},
  {id:"b6", name:"Coca-Cola",            cal:42, protein:0,  carbs:10.6,fat:0,  fiber:0,  sugar:10.6,cat:"Boissons"},
  {id:"n1", name:"Amandes",              cal:579,protein:21, carbs:22,  fat:50, fiber:12, sugar:4,   cat:"Noix & Oleagineux"},
  {id:"n2", name:"Noix",                 cal:654,protein:15, carbs:14,  fat:65, fiber:6.7,sugar:2.6, cat:"Noix & Oleagineux"},
  {id:"n3", name:"Cacahuetes",           cal:567,protein:26, carbs:16,  fat:49, fiber:8.5,sugar:4,   cat:"Noix & Oleagineux"},
  {id:"n4", name:"Noix de cajou",        cal:553,protein:18, carbs:30,  fat:44, fiber:3.3,sugar:6,   cat:"Noix & Oleagineux"},
  {id:"n5", name:"Graines chia",         cal:486,protein:17, carbs:42,  fat:31, fiber:34, sugar:0,   cat:"Noix & Oleagineux"},
];

// Menus
const MENUS = [
  {id:1,slot:"breakfast",name:"Porridge masse",       cal:720,protein:28,carbs:90,fat:20,desc:"80g avoine + lait entier + banane + beurre cacahuete + miel",types:["Feculents","Fruits"]},
  {id:2,slot:"breakfast",name:"Oeufs-jambon-tartines",cal:580,protein:38,carbs:42,fat:22,desc:"3 oeufs + 2 tranches jambon + 2 tartines pain complet + cafe",types:["Oeufs","Viandes","Feculents"]},
  {id:3,slot:"breakfast",name:"Pancakes maison",      cal:780,protein:22,carbs:100,fat:26,desc:"4 pancakes + sirop erable + 2 oeufs + verre lait",types:["Feculents","Oeufs"]},
  {id:4,slot:"breakfast",name:"Shake banane-avoine",  cal:650,protein:30,carbs:85,fat:16,desc:"300ml lait + 2 bananes + 60g avoine + beurre cacahuete",types:["Feculents","Fruits"]},
  {id:5,slot:"breakfast",name:"Tartines beurre cacahuete",cal:620,protein:24,carbs:72,fat:26,desc:"3 tartines + beurre cacahuete + miel + 250ml lait entier",types:["Feculents"]},
  {id:6,slot:"breakfast",name:"Bowl yaourt granola",  cal:520,protein:20,carbs:70,fat:16,desc:"Yaourt grec + 50g granola + fruits rouges + miel + cafe",types:["Laitiers","Fruits"]},
  {id:7,slot:"breakfast",name:"Pain perdu",           cal:700,protein:20,carbs:90,fat:26,desc:"3 tranches pain brioche + oeuf + lait + beurre + sirop",types:["Feculents","Oeufs"]},
  {id:8,slot:"breakfast",name:"Croissant + jus",      cal:460,protein:10,carbs:58,fat:22,desc:"2 croissants beurre + jus orange + cafe au lait",types:["Feculents","Boissons"]},
  {id:101,slot:"lunch",name:"Riz poulet legumes",     cal:820,protein:52,carbs:88,fat:18,desc:"200g blanc poulet + 150g riz + legumes sautes + sauce soja",types:["Viandes","Feculents","Legumes"]},
  {id:102,slot:"lunch",name:"Pates bolognaise",       cal:880,protein:46,carbs:100,fat:22,desc:"180g pates + 200g viande hachee + sauce tomate + gruyere",types:["Viandes","Feculents"]},
  {id:103,slot:"lunch",name:"Steak hache-frites",     cal:950,protein:40,carbs:82,fat:40,desc:"2 steaks haches + frites four + ketchup + salade",types:["Viandes","Feculents"]},
  {id:104,slot:"lunch",name:"Burger maison",          cal:1000,protein:48,carbs:88,fat:42,desc:"Steak + pain brioche + gruyere fondu + oeuf + sauce",types:["Viandes","Feculents","Oeufs"]},
  {id:105,slot:"lunch",name:"Pates carbonara",        cal:920,protein:36,carbs:100,fat:36,desc:"180g pates + lardons + creme + oeufs + gruyere",types:["Feculents","Viandes"]},
  {id:106,slot:"lunch",name:"Riz saute oeufs",        cal:750,protein:28,carbs:88,fat:26,desc:"150g riz + 4 oeufs + lardons + sauce soja + petits pois",types:["Feculents","Oeufs","Viandes"]},
  {id:107,slot:"lunch",name:"Poulet curry riz",       cal:830,protein:46,carbs:86,fat:20,desc:"200g poulet + 150g riz + sauce curry + creme + oignon",types:["Viandes","Feculents"]},
  {id:108,slot:"lunch",name:"Wrap poulet avocat",     cal:720,protein:40,carbs:68,fat:26,desc:"2 wraps + poulet + avocat + tomates + salade + sauce",types:["Viandes","Feculents","Legumes"]},
  {id:109,slot:"lunch",name:"Tacos maison",           cal:920,protein:38,carbs:100,fat:28,desc:"3 tacos + viande hachee + frites + sauce + fromage",types:["Viandes","Feculents"]},
  {id:110,slot:"lunch",name:"Omelette geante",        cal:680,protein:42,carbs:30,fat:40,desc:"5 oeufs + pommes de terre + lardons + gruyere fondu",types:["Oeufs","Feculents","Viandes"]},
  {id:201,slot:"snack",name:"Shake masse",            cal:580,protein:28,carbs:76,fat:16,desc:"400ml lait + 2 bananes + 3 cas beurre cacahuete + miel",types:["Fruits"]},
  {id:202,slot:"snack",name:"Pain beurre cacahuete",  cal:500,protein:20,carbs:58,fat:20,desc:"3 tartines + beurre cacahuete + miel + 200ml lait",types:["Feculents"]},
  {id:203,slot:"snack",name:"Yaourt fruits granola",  cal:420,protein:16,carbs:60,fat:12,desc:"2 yaourts grecs + granola + banane + miel",types:["Laitiers","Fruits"]},
  {id:204,slot:"snack",name:"Tartines Nutella",       cal:560,protein:12,carbs:78,fat:20,desc:"3 tartines + Nutella + verre lait",types:["Feculents"]},
  {id:205,slot:"snack",name:"Noix fruits secs",       cal:380,protein:10,carbs:40,fat:20,desc:"Melange noix + amandes + raisins + dattes",types:["Noix","Fruits"]},
  {id:206,slot:"snack",name:"Smoothie tropical",      cal:620,protein:20,carbs:88,fat:16,desc:"Lait + mangue + banane + ananas + 50g avoine",types:["Fruits","Feculents"]},
  {id:301,slot:"dinner",name:"Poulet pates beurre",   cal:860,protein:50,carbs:92,fat:26,desc:"200g poulet + 180g pates + beurre + parmesan",types:["Viandes","Feculents"]},
  {id:302,slot:"dinner",name:"Steak puree maison",    cal:920,protein:48,carbs:84,fat:32,desc:"200g steak + puree maison + haricots verts + sauce",types:["Viandes","Feculents","Legumes"]},
  {id:303,slot:"dinner",name:"Raclette soiree",       cal:1050,protein:52,carbs:76,fat:52,desc:"Pommes de terre + charcuterie + raclette + cornichons",types:["Feculents","Viandes","Laitiers"]},
  {id:304,slot:"dinner",name:"Pates gratin",          cal:920,protein:38,carbs:102,fat:32,desc:"180g pates + creme + gruyere + lardons au four",types:["Feculents","Viandes","Laitiers"]},
  {id:305,slot:"dinner",name:"Burger soiree",         cal:1000,protein:48,carbs:92,fat:42,desc:"Steak + pain brioche + fromage fondu + bacon + frites",types:["Viandes","Feculents"]},
  {id:306,slot:"dinner",name:"Spaghetti carbonara",   cal:940,protein:38,carbs:102,fat:36,desc:"180g spaghetti + lardons + creme + oeufs + gruyere",types:["Feculents","Viandes"]},
  {id:307,slot:"dinner",name:"Pizza maison",          cal:900,protein:36,carbs:102,fat:30,desc:"Pate + sauce tomate + mozzarella + jambon + champignons",types:["Feculents","Viandes","Laitiers"]},
  {id:308,slot:"dinner",name:"Poulet roti dominical", cal:880,protein:55,carbs:72,fat:28,desc:"250g poulet roti + pommes de terre + legumes + sauce",types:["Viandes","Feculents","Legumes"]},
];

// Exercices sport classique
const SPORT_EXOS = [
  {id:"s1", name:"Pompes classiques",    muscle:"Pecs",    equip:"Corps",    sets:4,reps:"10-12",rest:75, cal:22,level:"debutant",    desc:"Position planche, mains largeur epaules. Descendre la poitrine au sol, coudes a 45 degres. Garder le corps parfaitement droit tout au long du mouvement."},
  {id:"s2", name:"Pompes larges",        muscle:"Pecs",    equip:"Corps",    sets:4,reps:"10-12",rest:75, cal:20,level:"debutant",    desc:"Mains plus ecartees que les epaules. Insiste sur l'ouverture des pecs. Bien sentir l'etirement en bas du mouvement."},
  {id:"s3", name:"Pompes declinees",     muscle:"Pecs",    equip:"Corps",    sets:4,reps:"10",   rest:90, cal:24,level:"intermediaire",desc:"Pieds sur une chaise ou lit. Corps incline vers le bas. Travaille le haut des pectoraux. Coudes a 45 degres du corps."},
  {id:"s4", name:"Pompes inclinees",     muscle:"Pecs",    equip:"Corps",    sets:3,reps:"12",   rest:75, cal:18,level:"debutant",    desc:"Mains posees sur une chaise. Corps penche vers l'avant. Cible le bas des pectoraux. Ideal pour debutant qui debute les pompes."},
  {id:"s5", name:"Pompes diamant",       muscle:"Triceps", equip:"Corps",    sets:3,reps:"8-10", rest:75, cal:16,level:"intermediaire",desc:"Pouces et index forment un triangle sous la poitrine. Cible intensement les triceps. Descendre lentement, remonter en puissance."},
  {id:"s6", name:"Pompes explosives",    muscle:"Pecs",    equip:"Corps",    sets:4,reps:"8",    rest:90, cal:28,level:"avance",      desc:"Descendre normalement puis pousser avec force maximale. Les mains doivent decoller du sol. Atterrissage souple. Force et puissance."},
  {id:"s7", name:"Pike push-up",         muscle:"Epaules", equip:"Corps",    sets:4,reps:"10",   rest:75, cal:18,level:"debutant",    desc:"Hanches hautes en V inverse. Flechir les coudes pour amener la tete vers le sol. Simule le developpe militaire. Epaules en feu."},
  {id:"s8", name:"Dips sur chaise",      muscle:"Triceps", equip:"Corps",    sets:4,reps:"12-15",rest:75, cal:18,level:"debutant",    desc:"Mains sur le bord d'une chaise, pieds tendus devant. Descendre en flechissant les coudes. Coudes proches du corps. Amplitude complete."},
  {id:"s9", name:"Tractions australiennes",muscle:"Dos",   equip:"Corps",    sets:4,reps:"10-12",rest:90, cal:28,level:"debutant",    desc:"Sous une table ou barre basse. Corps incline droit. Tirer la poitrine vers la barre. Serrer les omoplates en haut. Dos plat."},
  {id:"s10",name:"Superman",             muscle:"Dos",     equip:"Corps",    sets:3,reps:"15",   rest:45, cal:8, level:"debutant",    desc:"Allonge face au sol. Lever simultanement bras et jambes. Maintenir 2 secondes en haut. Renforce le bas du dos et les lombaires."},
  {id:"s11",name:"Pont fessier",         muscle:"Fessiers",equip:"Corps",    sets:4,reps:"20",   rest:45, cal:12,level:"debutant",    desc:"Allonge sur le dos, pieds a plat. Lever le bassin en contractant les fessiers. Maintenir 1 seconde en haut. Descendre lentement."},
  {id:"s12",name:"Squats poids du corps",muscle:"Jambes",  equip:"Corps",    sets:4,reps:"15-20",rest:60, cal:22,level:"debutant",    desc:"Pieds largeur epaules. Descendre comme assis sur une chaise. Genoux dans l'axe des pieds. Dos droit. Pousser sur les talons."},
  {id:"s13",name:"Fentes alternees",     muscle:"Jambes",  equip:"Corps",    sets:4,reps:"12/j", rest:60, cal:25,level:"debutant",    desc:"Avancer un pied, descendre le genou arriere vers le sol. Genou avant a 90 degres. Dos droit. Alterner jambe droite gauche."},
  {id:"s14",name:"Squats bulgares",      muscle:"Jambes",  equip:"Corps",    sets:4,reps:"10/j", rest:90, cal:30,level:"intermediaire",desc:"Pied arriere sur une chaise. Descendre le genou avant. Genoux alignes. Excellent pour equilibre et force unilaterale. Difficulte elevee."},
  {id:"s15",name:"Gainage planche",      muscle:"Abdos",   equip:"Corps",    sets:3,reps:"45 sec",rest:45,cal:8, level:"debutant",    desc:"Appui sur avant-bras et orteils. Corps parfaitement droit de la tete aux pieds. Ventre rentre fort. Fessiers serres. Ne laisse pas tomber les hanches."},
  {id:"s16",name:"Mountain climbers",    muscle:"Abdos",   equip:"Corps",    sets:3,reps:"20",   rest:45, cal:20,level:"intermediaire",desc:"Position planche haute. Ramener les genoux vers la poitrine alternativement en rythme soutenu. Ventre contracte. Cardio et abdos."},
  {id:"s17",name:"Crunchs",              muscle:"Abdos",   equip:"Corps",    sets:3,reps:"20",   rest:45, cal:8, level:"debutant",    desc:"Allonge sur le dos, mains derriere la nuque sans tirer. Soulever les epaules en contractant les abdos. Expirer en montant."},
  {id:"s18",name:"Leg raise",            muscle:"Abdos",   equip:"Corps",    sets:3,reps:"15",   rest:45, cal:10,level:"intermediaire",desc:"Allonge sur le dos, jambes tendues. Lever les jambes a 90 degres. Descendre lentement sans toucher le sol. Abdos inferieurs intenses."},
  {id:"s19",name:"Burpees",              muscle:"Full Body",equip:"Corps",   sets:3,reps:"10",   rest:90, cal:40,level:"intermediaire",desc:"Debout, descendre en squat, poser les mains, sauter en position pompe, faire une pompe, ramener les pieds, sauter en l'air bras leves. Cardio extreme."},
  {id:"s20",name:"Squats sautes",        muscle:"Full Body",equip:"Corps",   sets:3,reps:"12",   rest:75, cal:30,level:"intermediaire",desc:"Squat normal puis detente explosive vers le haut. Atterrissage souple en flechissant les genoux. Enchainer sans pause. Puissance jambes."},
  // Halteres
  {id:"h1", name:"Dev. militaire halteres",muscle:"Epaules",equip:"Halteres",sets:4,reps:"10-12",rest:90,cal:20,level:"debutant",   desc:"Assis ou debout. Halteres a hauteur d'epaules. Pousser vers le haut sans verrouiller les coudes. Descendre lentement. Halteres de 10kg chacun."},
  {id:"h2", name:"Elevations laterales",   muscle:"Epaules",equip:"Halteres",sets:4,reps:"12-15",rest:60,cal:14,level:"debutant",   desc:"Bras le long du corps. Lever les halteres sur les cotes jusqu'a l'horizontal. Coudes legerement flechis. Descendre sous controle. Brulure epaules garantie."},
  {id:"h3", name:"Elevations frontales",   muscle:"Epaules",equip:"Halteres",sets:3,reps:"12",   rest:60,cal:12,level:"debutant",   desc:"Halteres devant les cuisses. Lever alternativement un bras vers l'avant jusqu'a l'horizontal. Dos droit, ne pas se balancer."},
  {id:"h4", name:"Curl biceps",            muscle:"Biceps", equip:"Halteres",sets:4,reps:"12-15",rest:60,cal:14,level:"debutant",   desc:"Halteres en main, bras tendus le long du corps. Flechir les coudes pour amener les halteres vers les epaules. Coudes fixes contre le corps. Squeeze en haut."},
  {id:"h5", name:"Curl marteau",           muscle:"Biceps", equip:"Halteres",sets:3,reps:"12",   rest:60,cal:12,level:"debutant",   desc:"Meme mouvement que curl classique mais poignets neutres (pouces vers le haut). Travaille biceps brachial et brachioradial. Force des avant-bras."},
  {id:"h6", name:"Extension triceps",      muscle:"Triceps",equip:"Halteres",sets:3,reps:"12-15",rest:60,cal:14,level:"debutant",   desc:"Assis, un haltere a deux mains au-dessus de la tete. Flechir les coudes pour descendre l'haltere derriere la tete. Remonter en contractant les triceps."},
  {id:"h7", name:"Rowing haltere",         muscle:"Dos",    equip:"Halteres",sets:4,reps:"10-12",rest:75,cal:18,level:"debutant",   desc:"Un genou sur le banc ou chaise. Tirer l'haltere vers la hanche en gardant le dos plat. Serrer l'omoplate en haut. Alterner cote gauche et droit."},
  {id:"h8", name:"Squats goblet",          muscle:"Jambes", equip:"Halteres",sets:4,reps:"12-15",rest:75,cal:26,level:"debutant",   desc:"Tenir l'haltere a deux mains contre la poitrine. Descendre en squat profond. Le poids aide a garder le dos droit. Excellent pour debutant."},
  {id:"h9", name:"Fentes halteres",        muscle:"Jambes", equip:"Halteres",sets:4,reps:"10/j", rest:75,cal:28,level:"debutant",   desc:"Halteres dans chaque main. Faire une grande enjambee, descendre le genou arriere. Dos droit. Le poids additionnel intensifie le travail musculaire."},
  {id:"h10",name:"Shrugs epaules",         muscle:"Epaules",equip:"Halteres",sets:3,reps:"15",   rest:45,cal:10,level:"debutant",   desc:"Halteres dans chaque main. Hausser les epaules vers les oreilles. Maintenir 1 seconde. Descendre lentement. Cible les trapeze superieurs."},
];

// Callisthenie
const CALI_EXERCISES = [
  // Corps pur
  {id:"c1", name:"L-sit (chaises)",       muscle:"Abdos/Triceps",equip:"Corps",   sets:3,reps:"10 sec",rest:60, cal:8, level:"intermediaire",desc:"Assis entre deux chaises. Bras tendus, soulever les fesses et garder les jambes horizontales. Force abdominale et triceps extreme. Progresser par paliers de 5 secondes."},
  {id:"c2", name:"Handstand (mur)",       muscle:"Epaules/Core", equip:"Corps",   sets:3,reps:"20 sec",rest:90, cal:10,level:"avance",      desc:"Faire l'arbre droit contre le mur. Poignets bien chauds avant. Corps gaine, regard vers le sol. Progresser: tenir 5 sec, puis 10, puis 20."},
  {id:"c3", name:"Pistol squat aide",     muscle:"Jambes",       equip:"Corps",   sets:3,reps:"6/jambe",rest:90,cal:28,level:"intermediaire",desc:"Squat unilateral. S'aider d'un montant de porte pour l'equilibre. Jambe libre tendue devant. Descendre le plus bas possible. Force et equilibre extremes."},
  {id:"c4", name:"Tractions (barre)",     muscle:"Dos/Biceps",   equip:"Corps",   sets:4,reps:"5-8",   rest:120,cal:32,level:"avance",      desc:"Barre de traction ou barre de porte. Partir bras tendus. Tirer jusqu'au menton au-dessus de la barre. Descendre lentement. Roi des exercices dos."},
  {id:"c5", name:"Planche (progressif)",  muscle:"Epaules/Core", equip:"Corps",   sets:3,reps:"5 sec",  rest:90, cal:12,level:"avance",      desc:"Position planche sur les mains en avant du corps. Corps incline. But: corps horizontal. Progresser: tester 2 sec, augmenter. Force extremement exigeante."},
  {id:"c6", name:"Muscle-up negatif",     muscle:"Dos/Pecs",     equip:"Corps",   sets:3,reps:"4",      rest:120,cal:20,level:"avance",      desc:"Partir au-dessus de la barre (sauter) et descendre lentement en passant de traction a dips. Prepare au vrai muscle-up. Exige force et coordination."},
  {id:"c7", name:"Nordic curl",           muscle:"Ischio",       equip:"Corps",   sets:3,reps:"5-6",   rest:120,cal:20,level:"avance",      desc:"A genoux, chevilles bloquees sous une chaise. Descendre lentement le buste vers le sol en resisant avec les ischio-jambiers. Tres difficile. Excentrique pur."},
  {id:"c8", name:"Archer push-up",        muscle:"Pecs",         equip:"Corps",   sets:3,reps:"6/cote",rest:90, cal:26,level:"avance",      desc:"Pompe avec un bras qui se tend completement sur le cote. Tout le poids sur l'autre bras. Progression vers le pompe a un bras. Force unilaterale pecs."},
  {id:"c9", name:"Typewriter pull-up",    muscle:"Dos",          equip:"Corps",   sets:3,reps:"4",      rest:120,cal:24,level:"avance",      desc:"En position haute de traction, bouger lateralement d'un cote a l'autre. Force de maintien extreme. Necessite de matriser les tractions classiques."},
  {id:"c10",name:"Wall sit",              muscle:"Jambes",       equip:"Corps",   sets:3,reps:"45 sec", rest:60, cal:10,level:"debutant",    desc:"Dos contre le mur, cuisses paraleles au sol, angle 90 degres. Tenir la position. Bruler des quadriceps sans bouger. Mental autant que physique."},
  {id:"c11",name:"Dips entre chaises",    muscle:"Triceps/Pecs", equip:"Corps",   sets:4,reps:"10-12", rest:75, cal:22,level:"intermediaire",desc:"Deux chaises de meme hauteur. Mains sur chaque chaise. Descendre entre les deux. Corps droit ou incline pour cibler triceps ou pecs. Amplitude complete."},
  {id:"c12",name:"Hollow body hold",      muscle:"Core",         equip:"Corps",   sets:3,reps:"20 sec", rest:45, cal:8, level:"intermediaire",desc:"Allonge sur le dos. Creuser le ventre, bras et jambes leves a 30 degres. Corps en forme de banane creuse. Base de toute callisthenie serieuse."},
  // Elastiques
  {id:"e1", name:"Rowing elastique",      muscle:"Dos",          equip:"Elastique",sets:4,reps:"12-15",rest:60,cal:16,level:"debutant",    desc:"Elastique fixe a une poignee de porte. Tirer vers le ventre en ecartant les coudes. Serrer les omoplates en fin de mouvement. Equivalent rowing machine."},
  {id:"e2", name:"Dev. elastique",        muscle:"Pecs",         equip:"Elastique",sets:4,reps:"12",   rest:60,cal:14,level:"debutant",    desc:"Elastique dans le dos passant sous les aisselles. Pousser vers l'avant. Simule le developpe couche. Excellente alternative sans banc ni barre."},
  {id:"e3", name:"Curl elastique",        muscle:"Biceps",       equip:"Elastique",sets:3,reps:"15",   rest:45,cal:10,level:"debutant",    desc:"Marcher sur l'elastique. Flechir les coudes. Resistance constante tout au long du mouvement contrairement aux halteres. Tres efficace."},
  {id:"e4", name:"Extension elastique",   muscle:"Triceps",      equip:"Elastique",sets:3,reps:"15",   rest:45,cal:10,level:"debutant",    desc:"Elastique fixe en haut. Tirer vers le bas en etendant les bras. Coudes fixes contre le corps. Mimique la poulie haute. Triceps au maximum."},
  {id:"e5", name:"Squat elastique",       muscle:"Jambes",       equip:"Elastique",sets:4,reps:"15",   rest:60,cal:20,level:"debutant",    desc:"Elastique sous les pieds, extremites dans chaque main ou sur les epaules. Squat normal avec resistance additionnelle. Intensifie le travail des quadriceps."},
  {id:"e6", name:"Dev. militaire elast.", muscle:"Epaules",      equip:"Elastique",sets:4,reps:"12",   rest:60,cal:14,level:"debutant",    desc:"Marcher sur l'elastique. Tirer vers le haut en poussant au-dessus de la tete. Equivalent developpe militaire. Debutant friendly."},
  {id:"e7", name:"Face pull elastique",   muscle:"Epaules/Dos",  equip:"Elastique",sets:3,reps:"15",   rest:45,cal:12,level:"debutant",    desc:"Elastique a hauteur de visage. Tirer vers le visage en ecartant les mains. Corrige la posture, renforce les deltoides posterieurs. Sante des epaules."},
  {id:"e8", name:"Fentes elastique",      muscle:"Jambes",       equip:"Elastique",sets:3,reps:"10/j", rest:60,cal:22,level:"debutant",    desc:"Elastique sous le pied avant, extremite sur l'epaule. Faire une fente. La resistance augmente quand tu te releves. Excellent complement aux fentes classiques."},
  // Sangles TRX
  {id:"t1", name:"TRX Rowing",            muscle:"Dos/Biceps",   equip:"Sangles",  sets:4,reps:"10-12",rest:75,cal:22,level:"debutant",    desc:"Sangles fixees a la porte en haut. Corps incline en arriere, bras tendus. Tirer le corps vers les mains en serrant les omoplates. Difficulte ajustee par l'angle du corps."},
  {id:"t2", name:"TRX Pompes",            muscle:"Pecs",         equip:"Sangles",  sets:3,reps:"10-12",rest:75,cal:20,level:"intermediaire",desc:"Pieds dans les sangles, mains au sol. Faire des pompes. L'instabilite des sangles recrute enormement le core. Plus difficile que pompes classiques."},
  {id:"t3", name:"TRX Squat",             muscle:"Jambes",       equip:"Sangles",  sets:4,reps:"15",   rest:60,cal:22,level:"debutant",    desc:"Tenir les sangles face a la porte. Faire un squat en s'aidant des sangles pour l'equilibre. Permet une profondeur plus grande. Genoux et chevilles sains."},
  {id:"t4", name:"TRX Planche",           muscle:"Core",         equip:"Sangles",  sets:3,reps:"20 sec",rest:45,cal:10,level:"intermediaire",desc:"Pieds dans les sangles, mains au sol en position planche. L'instabilite demande une contraction du core extreme. Bien superieur a la planche classique."},
  {id:"t5", name:"TRX Bicep curl",        muscle:"Biceps",       equip:"Sangles",  sets:3,reps:"12",   rest:60,cal:12,level:"debutant",    desc:"Face a la porte, sangles en mains. Se laisser partir en arriere puis tirer avec les biceps. Poids du corps comme resistance. Ajuster difficulte par l'angle."},
  {id:"t6", name:"TRX Mountain climber",  muscle:"Core/Full Body",equip:"Sangles", sets:3,reps:"20",   rest:60,cal:24,level:"intermediaire",desc:"Pieds dans les sangles en planche haute. Ramener les genoux vers la poitrine alternativement. L'instabilite des sangles multiplie l'effort du core. Brutal."},
  {id:"t7", name:"TRX Fentes",            muscle:"Jambes",       equip:"Sangles",  sets:3,reps:"10/j", rest:75,cal:24,level:"intermediaire",desc:"Pied arriere dans les sangles. Faire une fente avant. La sangle en suspension rend l'exercice beaucoup plus instable et difficile. Equilibre extreme."},
  {id:"t8", name:"TRX Gainage lateral",   muscle:"Core",         equip:"Sangles",  sets:3,reps:"20 sec/cote",rest:45,cal:10,level:"intermediaire",desc:"Un pied dans les sangles, corps de cote en gainage lateral. L'instabilite force une contraction extreme du core. Bien superieur gainage lateral classique."},
];

const MEAL_SLOTS = [
  {id:"breakfast",label:"Petit-dejeuner",icon:"",color:"#f59e0b",time:"07:30"},
  {id:"lunch",    label:"Dejeuner",       icon:"",color:"#10b981",time:"12:30"},
  {id:"snack",    label:"Gouter",         icon:"",color:"#8b5cf6",time:"16:30"},
  {id:"dinner",   label:"Diner",          icon:"",color:"#ef4444",time:"19:30"},
];

const MACRO_DEFS = [
  {k:"cal",    label:"Calories", unit:"kcal",color:"#f97316",target:PROFILE.dailyCal},
  {k:"protein",label:"Prot.",    unit:"g",   color:"#ef4444",target:PROFILE.dailyProtein},
  {k:"carbs",  label:"Gluc.",    unit:"g",   color:"#f59e0b",target:PROFILE.dailyCarbs},
  {k:"fat",    label:"Lip.",     unit:"g",   color:"#8b5cf6",target:PROFILE.dailyFat},
  {k:"fiber",  label:"Fibres",   unit:"g",   color:"#10b981",target:PROFILE.dailyFiber},
  {k:"sugar",  label:"Sucres",   unit:"g",   color:"#ec4899",target:PROFILE.dailySugar},
];

// -- Composant App principal ---------------------------------------------------
export default function App() {
  // Disclaimer
  const [showApp, setShowApp] = useState(() => {
    try { return localStorage.getItem("gainmode_disclaimer") === "accepted"; }
    catch { return false; }
  });

  // Etat principal
  const [tab,  setTab]  = useState("journal");
  const [date, setDate] = useState(todayStr());
  const [dayData, setDayData] = useState({});
  const [customFoods, setCustomFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger donnees depuis IndexedDB
  useEffect(() => {
    (async () => {
      try {
        const dd = await idbGet("dayData");
        const cf = await idbGet("customFoods");
        if (dd) setDayData(dd);
        if (cf) setCustomFoods(cf);
      } catch(e) {}
      setLoading(false);
    })();
  }, []);

  // Sauvegarder dayData
  useEffect(() => {
    if (!loading) idbSet("dayData", dayData).catch(()=>{});
  }, [dayData, loading]);

  // Sauvegarder customFoods
  useEffect(() => {
    if (!loading) idbSet("customFoods", customFoods).catch(()=>{});
  }, [customFoods, loading]);

  const acceptDisclaimer = () => {
    try { localStorage.setItem("gainmode_disclaimer","accepted"); } catch {}
    setShowApp(true);
  };

  const day = dayData[date] || {meals:{breakfast:[],lunch:[],snack:[],dinner:[]},weight:null,sleep:null,exercises:[]};

  const updateDay = patch => setDayData(prev => ({
    ...prev,
    [date]: {meals:{breakfast:[],lunch:[],snack:[],dinner:[]},exercises:[],...prev[date],...patch}
  }));

  const allFoods = [...BASE_FOODS, ...customFoods];
  const dayMealsFlat = Object.values(day.meals||{}).flat();
  const totals = sumM(dayMealsFlat);
  const exCalBurned = (day.exercises||[]).reduce((s,e)=>s+(e.cal||0),0);
  const adjustedCal = PROFILE.dailyCal + exCalBurned;
  const allDates = Object.keys(dayData).sort();
  const last14 = Array.from({length:14},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-13+i);
    return d.toISOString().slice(0,10);
  });

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#050510",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#f97316",fontSize:24,fontWeight:900}}>GainMode</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#050510",color:"#f1f5f9",fontFamily:"system-ui,sans-serif",maxWidth:600,margin:"0 auto"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#f97316;border-radius:2px;}
        input,select,textarea{outline:none;font-family:inherit;}
        button{font-family:inherit;cursor:pointer;}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .anim{animation:slideUp .22s ease}
      `}</style>

      {/* DISCLAIMER OVERLAY */}
      {!showApp && (
        <div style={{position:"fixed",inset:0,background:"#050510",zIndex:9999,overflowY:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{maxWidth:400,width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{marginBottom:12}}>
                <rect width="56" height="56" rx="14" fill="#f97316"/>
                <text x="28" y="40" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="28" fill="white">GM</text>
              </svg>
              <div style={{fontSize:28,fontWeight:900,color:"#f97316",letterSpacing:3}}>GainMode</div>
              <div style={{fontSize:11,color:"#6b7280",letterSpacing:2,marginTop:4}}>BUILT DIFFERENT</div>
            </div>
            <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:800,color:"#f97316",marginBottom:14,textAlign:"center"}}>Avertissement</div>
              {[
                ["Pas un avis medical","Ne remplace pas un medecin, nutritionniste ou coach diplome."],
                ["Donnees indicatives","Les valeurs caloriques sont des estimations approximatives."],
                ["Usage personnel","Creee pour usage prive. Toute utilisation par un tiers est sous sa responsabilite."],
                ["Consulte un pro","Avant tout changement alimentaire ou sportif, consulte un professionnel."],
              ].map(([t,d])=>(
                <div key={t} style={{background:"#1e293b",borderRadius:10,padding:"10px 12px",borderLeft:"3px solid #f97316",marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#f97316",marginBottom:2}}>{t}</div>
                  <div style={{fontSize:11,color:"#6b7280",lineHeight:1.5}}>{d}</div>
                </div>
              ))}
              <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"10px 0",marginTop:4}}>
                <input type="checkbox" id="dcb" style={{width:18,height:18,accentColor:"#f97316",flexShrink:0,marginTop:2}}/>
                <span style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>Je comprends que GainMode est un outil indicatif personnel et non un substitut a un suivi medical ou sportif professionnel.</span>
              </label>
            </div>
            <button onClick={()=>{
              const cb = document.getElementById("dcb");
              if(cb?.checked) acceptDisclaimer();
              else alert("Cochez la case pour continuer.");
            }} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#f97316,#fbbf24)",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:14,letterSpacing:1}}>
              Acceder a GainMode
            </button>
            <div style={{fontSize:10,color:"#374151",textAlign:"center",marginTop:10}}>Apparait une seule fois. En cas de doute, consultez un professionnel de sante.</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{padding:"16px 16px 12px",background:"#0a0a1a",borderBottom:"1px solid #1f2937",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <rect width="36" height="36" rx="10" fill="#f97316"/>
            <text x="18" y="26" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="20" fill="white">GM</text>
          </svg>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#f97316",letterSpacing:2}}>GainMode</div>
            <div style={{fontSize:9,color:"#6b7280",letterSpacing:1}}>Built Different</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#f97316"}}>{adjustedCal}</div>
          <div style={{fontSize:9,color:"#6b7280"}}>kcal / jour</div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{display:"flex",background:"#0a0a1a",borderBottom:"1px solid #1f2937",position:"sticky",top:0,zIndex:10}}>
        {[
          {id:"journal",label:"Journal",icon:""},
          {id:"menus",  label:"Menus",  icon:""},
          {id:"sport",  label:"Sport",  icon:""},
          {id:"stats",  label:"Stats",  icon:""},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"10px 4px",border:"none",background:"none",
            color:tab===t.id?"#f97316":"#4b5563",
            borderBottom:tab===t.id?"2px solid #f97316":"2px solid transparent",
            transition:"all .2s",fontSize:9,fontWeight:700,letterSpacing:.5
          }}>
            <span style={{fontSize:18}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* PAGES */}
      <main style={{padding:"14px 12px 80px"}} className="fu" key={tab}>
        {tab==="journal" && <JournalTab date={date} setDate={setDate} day={day} updateDay={updateDay} allFoods={allFoods} customFoods={customFoods} setCustomFoods={setCustomFoods} dayTotals={dayTotals} targetCal={targetCal} exBurned={exBurned}/>}
        {tab==="menus"   && <MenusTab day={day} updateDay={updateDay}/>}
        {tab==="sport"   && <ExerciseList exercises={EXERCISES}      title="Musculation"  day={day} updateDay={updateDay} muscleColor={muscleColor} levelColor={levelColor}/>}
        {tab==="cali"    && <ExerciseList exercises={CALI_EXERCISES} title="Callisthenie" day={day} updateDay={updateDay} muscleColor={muscleColor} levelColor={levelColor}/>}
        {tab==="stats"   && <StatsTab db={db} last14={last14} allDates={allDates} setDate={setDate} setTab={setTab}/>}
      </main>
    </div>
  );
}

// -- JOURNAL TAB ---------------------------------------------------------------
function JournalTab({day,date,setDate,updateDay,totals,adjustedCal,exCalBurned,allFoods,customFoods,setCustomFoods}) {
  const [openSlot, setOpenSlot]   = useState(null);
  const [search,   setSearch]     = useState("");
  const [catFilter,setCatFilter]  = useState("Tous");
  const [selFood,  setSelFood]    = useState(null);
  const [grams,    setGrams]      = useState("100");
  const [showAdd,  setShowAdd]    = useState(false);
  const [newFood,  setNewFood]    = useState({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:"",sugar:""});
  const [editItem, setEditItem]   = useState(null);
  const [editGrams,setEditGrams]  = useState("");
  const [sleepVal, setSleepVal]   = useState("");
  const [weightVal,setWeightVal]  = useState("");

  const cats = ["Tous", ...Array.from(new Set(allFoods.map(f=>f.cat)))];
  const filtered = allFoods.filter(f => {
    const qOk = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const cOk = catFilter==="Tous" || f.cat===catFilter;
    return qOk && cOk;
  }).slice(0,40);

  const addFood = (slotId) => {
    if(!selFood) return;
    const g = parseFloat(grams)||100;
    const m = calcM(selFood, g);
    const entry = {id:Date.now(), name:selFood.name, grams:g, displayQty:`${g}g`, ...m};
    const meals = {...(day.meals||{})};
    meals[slotId] = [...(meals[slotId]||[]), entry];
    updateDay({meals});
    setSelFood(null); setSearch(""); setGrams("100"); setOpenSlot(null);
  };

  const removeFood = (slotId, itemId) => {
    const meals = {...(day.meals||{})};
    meals[slotId] = (meals[slotId]||[]).filter(i=>i.id!==itemId);
    updateDay({meals});
  };

  const saveEdit = (slotId, itemId) => {
    const g = parseFloat(editGrams)||100;
    const food = allFoods.find(f=>f.name===(editItem?.name));
    const meals = {...(day.meals||{})};
    meals[slotId] = (meals[slotId]||[]).map(i => {
      if(i.id!==itemId) return i;
      if(food) return {id:i.id, name:i.name, grams:g, displayQty:`${g}g`, ...calcM(food,g)};
      return {...i, grams:g, displayQty:`${g}g`};
    });
    updateDay({meals}); setEditItem(null);
  };

  const saveNewFood = () => {
    if(!newFood.name||!newFood.cal) return;
    const food = {
      id:"custom_"+Date.now(), name:newFood.name,
      cal:parseFloat(newFood.cal)||0, protein:parseFloat(newFood.protein)||0,
      carbs:parseFloat(newFood.carbs)||0, fat:parseFloat(newFood.fat)||0,
      fiber:parseFloat(newFood.fiber)||0, sugar:parseFloat(newFood.sugar)||0,
      cat:"Mes aliments"
    };
    setCustomFoods(prev=>[...prev, food]);
    setNewFood({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:"",sugar:""});
    setShowAdd(false);
    setSelFood(food); setGrams("100");
  };

  const pct = k => Math.min(100, Math.round((totals[k]||0) / (k==="cal"?adjustedCal:MACRO_DEFS.find(m=>m.k===k)?.target||1) * 100));
  const sugarOver = (totals.sugar||0) > PROFILE.dailySugar;

  return (
    <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}} className="anim">
      {/* Date nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d.toISOString().slice(0,10));}}
          style={{background:"#1f2937",border:"none",color:"#f1f5f9",borderRadius:8,padding:"6px 14px",fontSize:20}}><</button>
        <div style={{textAlign:"center"}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{background:"#1f2937",border:"1px solid #374151",color:"#f1f5f9",borderRadius:8,padding:"5px 10px",fontSize:13}}/>
          <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{fmtDate(date)}</div>
        </div>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d.toISOString().slice(0,10));}}
          style={{background:"#1f2937",border:"none",color:"#f1f5f9",borderRadius:8,padding:"6px 14px",fontSize:20}}>></button>
      </div>

      {/* Sommeil + Poids */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {label:" Sommeil",key:"sleep",unit:"h",val:day.sleep,setter:setSleepVal,input:sleepVal,save:()=>{if(sleepVal){updateDay({sleep:parseFloat(sleepVal)});setSleepVal("");}}},
          {label:" Poids",key:"weight",unit:"kg",val:day.weight,setter:setWeightVal,input:weightVal,save:()=>{if(weightVal){updateDay({weight:parseFloat(weightVal)});setWeightVal("");}}},
        ].map(item=>(
          <div key={item.key} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{item.label}</div>
            {item.val ? (
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:20,fontWeight:900,color:"#f97316"}}>{item.val}{item.unit}</span>
                <button onClick={()=>updateDay({[item.key]:null})} style={{background:"none",border:"none",color:"#6b7280",fontSize:12}}>x</button>
              </div>
            ):(
              <div style={{display:"flex",gap:6}}>
                <input type="number" step=".5" placeholder="0" value={item.input}
                  onChange={e=>item.setter(e.target.value)}
                  style={{flex:1,background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"5px 8px",fontSize:14,minWidth:0}}/>
                <button onClick={item.save} style={{background:"#f97316",border:"none",color:"#fff",borderRadius:6,padding:"5px 10px",fontWeight:700,fontSize:12}}>OK</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Macros resume */}
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Aujourd'hui</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
          {MACRO_DEFS.map(m=>{
            const val = Math.round(totals[m.k]||0);
            const tgt = m.k==="cal"?adjustedCal:m.target;
            const p   = Math.min(100,Math.round(val/tgt*100));
            return (
              <div key={m.k}>
                <div style={{height:4,background:"#1f2937",borderRadius:2,overflow:"hidden",marginBottom:3}}>
                  <div style={{height:"100%",width:p+"%",background:m.color,borderRadius:2,transition:"width .5s"}}/>
                </div>
                <div style={{fontSize:10,color:"#6b7280"}}>{m.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:m.color}}>{val}<span style={{fontSize:9,color:"#6b7280",marginLeft:1}}>{m.unit}</span></div>
                <div style={{fontSize:9,color:"#374151"}}>/ {tgt}{m.unit}</div>
              </div>
            );
          })}
        </div>
        <div style={{background: adjustedCal-totals.cal>0?"#1a0a0030":"#0a1a0a30",border:`1px solid ${adjustedCal-totals.cal>0?"#f9731660":"#10b98160"}`,borderRadius:8,padding:"7px 12px",fontSize:12,textAlign:"center"}}>
          {adjustedCal-totals.cal>0
            ? <>Il reste <strong style={{color:"#f97316"}}>{Math.round(adjustedCal-totals.cal)} kcal</strong> a ingerer{exCalBurned>0&&<span style={{color:"#a78bfa"}}> (+{exCalBurned} sport)</span>}</>
            : <span style={{color:"#4ade80"}}>Objectif calorique atteint !</span>
          }
        </div>
        {sugarOver && (
          <div style={{background:"#7f1d1d",border:"1px solid #ef4444",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#fca5a5",marginTop:8,display:"flex",gap:6,alignItems:"center"}}>
            <span>!</span>
            <span>Limite sucres depassee : <strong>{Math.round(totals.sugar)}g</strong> / {PROFILE.dailySugar}g. Evite les sucres ce soir.</span>
          </div>
        )}
      </div>

      {/* Repas */}
      {MEAL_SLOTS.map(slot=>{
        const items = (day.meals||{})[slot.id]||[];
        const slotTot = sumM(items);
        const isOpen = openSlot===slot.id;
        return (
          <div key={slot.id} style={{background:"#0f172a",border:`1px solid ${isOpen?slot.color+"60":"#1f2937"}`,borderRadius:12,overflow:"hidden",transition:"border .2s"}}>
            {/* Slot header */}
            <button onClick={()=>setOpenSlot(isOpen?null:slot.id)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:12,
              padding:"14px 16px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"
            }}>
              <span style={{fontSize:22}}>{slot.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{slot.label}</div>
                <div style={{fontSize:10,color:"#6b7280"}}>{slot.time} . {items.length} aliment{items.length!==1?"s":""}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:900,color:slot.color}}>{Math.round(slotTot.cal)}</div>
                <div style={{fontSize:9,color:"#6b7280"}}>kcal</div>
              </div>
              <span style={{color:"#6b7280",fontSize:16,marginLeft:4}}>{isOpen?"^":"v"}</span>
            </button>

            {/* Items list */}
            {items.length>0&&(
              <div style={{borderTop:"1px solid #111827"}}>
                {items.map(item=>(
                  <div key={item.id}>
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid #111827"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                        <div style={{fontSize:11,color:"#6b7280"}}>{item.displayQty} . <span style={{color:"#ef4444"}}>{item.protein}g prot</span> . <span style={{color:"#f59e0b"}}>{item.carbs}g gluc</span></div>
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:"#f97316"}}>{item.cal} kcal</div>
                      <button onClick={()=>{setEditItem(item);setEditGrams(String(item.grams||100));}}
                        style={{background:"#1e3a5f",color:"#60a5fa",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>
                        Edit
                      </button>
                      <button onClick={()=>removeFood(slot.id,item.id)}
                        style={{background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:6,padding:"3px 7px",fontSize:10}}>x</button>
                    </div>
                    {/* Edit row */}
                    {editItem?.id===item.id&&(
                      <div style={{background:"#1e293b",padding:"10px 16px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"#9ca3af"}}>Modifier grammes :</span>
                        <input type="number" value={editGrams} onChange={e=>setEditGrams(e.target.value)}
                          style={{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"4px 8px",width:70,fontSize:13}}/>
                        <span style={{fontSize:11,color:"#6b7280"}}>g</span>
                        <button onClick={()=>saveEdit(slot.id,item.id)}
                          style={{background:"#10b981",border:"none",color:"#fff",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700}}>OK</button>
                        <button onClick={()=>setEditItem(null)}
                          style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:6,padding:"5px 10px",fontSize:11}}>Annuler</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Search + add */}
            {isOpen&&(
              <div style={{borderTop:"1px solid #1f2937",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
                {/* Tabs base / nouveau */}
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>setShowAdd(false)}
                    style={{flex:1,background:!showAdd?"#f97316":"#1f2937",border:"none",color:!showAdd?"#fff":"#9ca3af",borderRadius:8,padding:"7px",fontSize:12,fontWeight:700}}>
                    Base de donnees
                  </button>
                  <button onClick={()=>setShowAdd(true)}
                    style={{flex:1,background:showAdd?"#f97316":"#1f2937",border:"none",color:showAdd?"#fff":"#9ca3af",borderRadius:8,padding:"7px",fontSize:12,fontWeight:700}}>
                    + Nouvel aliment
                  </button>
                </div>

                {!showAdd?(
                  <>
                    <input placeholder="Rechercher..." value={search} onChange={e=>{setSearch(e.target.value);setSelFood(null);}}
                      style={{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:8,padding:"8px 12px",fontSize:13}}/>
                    {/* Cat filter */}
                    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
                      {cats.map(c=>(
                        <button key={c} onClick={()=>setCatFilter(c)}
                          style={{border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,
                            background:catFilter===c?"#f97316":"#1f2937",color:catFilter===c?"#fff":"#9ca3af"}}>
                          {c}
                        </button>
                      ))}
                    </div>
                    {/* Food list */}
                    <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                      {filtered.map(f=>(
                        <button key={f.id} onClick={()=>{setSelFood(f);setGrams("100");}}
                          style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                            padding:"8px 10px",background:selFood?.id===f.id?"#1e3a2a":"#111827",
                            border:`1px solid ${selFood?.id===f.id?"#10b981":"#1f2937"}`,
                            borderRadius:8,color:"#f1f5f9",textAlign:"left",width:"100%"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600}}>{f.name}</div>
                            <div style={{fontSize:10,color:"#6b7280"}}>{f.cat}</div>
                          </div>
                          <div style={{textAlign:"right",fontSize:11}}>
                            <div style={{color:"#f97316",fontWeight:700}}>{f.cal} kcal</div>
                            <div style={{color:"#6b7280"}}>/100g</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* Qty + preview */}
                    {selFood&&(
                      <div style={{background:"#1e293b",borderRadius:10,padding:12,display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#10b981"}}>{selFood.name}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#6b7280"}}>Quantite :</span>
                          <input type="number" value={grams} onChange={e=>setGrams(e.target.value)}
                            style={{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"4px 8px",width:70,fontSize:13}}/>
                          <span style={{fontSize:11,color:"#6b7280"}}>g</span>
                        </div>
                        {(()=>{const g=parseFloat(grams)||100;const m=calcM(selFood,g);return(
                          <div style={{fontSize:11,color:"#9ca3af",display:"flex",gap:8,flexWrap:"wrap"}}>
                            <span style={{color:"#f97316",fontWeight:700}}>{m.cal} kcal</span>
                            <span style={{color:"#ef4444"}}>{m.protein}g prot</span>
                            <span style={{color:"#f59e0b"}}>{m.carbs}g gluc</span>
                            <span style={{color:"#8b5cf6"}}>{m.fat}g lip</span>
                          </div>
                        );})()}
                        <button onClick={()=>addFood(slot.id)}
                          style={{background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,fontSize:13}}>
                          Ajouter a {slot.label}
                        </button>
                      </div>
                    )}
                  </>
                ):(
                  /* Nouvel aliment */
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{fontSize:11,color:"#6b7280"}}>Valeurs pour 100g</div>
                    {[
                      {key:"name",   label:"Nom de l'aliment",type:"text",   full:true},
                      {key:"cal",    label:"Calories (kcal)", type:"number"},
                      {key:"protein",label:"Proteines (g)",   type:"number"},
                      {key:"carbs",  label:"Glucides (g)",    type:"number"},
                      {key:"fat",    label:"Lipides (g)",     type:"number"},
                      {key:"fiber",  label:"Fibres (g)",      type:"number"},
                      {key:"sugar",  label:"Sucres (g)",      type:"number"},
                    ].map(f=>(
                      <div key={f.key} style={{display:"flex",flexDirection:"column",gap:3}}>
                        <label style={{fontSize:10,color:"#6b7280"}}>{f.label}</label>
                        <input type={f.type} value={newFood[f.key]}
                          onChange={e=>setNewFood(p=>({...p,[f.key]:e.target.value}))}
                          placeholder={f.type==="number"?"0":""}
                          style={{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"7px 10px",fontSize:13}}/>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:4}}>
                      <button onClick={saveNewFood}
                        style={{flex:1,background:"#10b981",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,fontSize:13}}>
                        Enregistrer + Ajouter
                      </button>
                      <button onClick={()=>setShowAdd(false)}
                        style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"9px 14px",fontSize:13}}>
                        Annuler
                      </button>
                    </div>
                    <div style={{fontSize:10,color:"#6b7280",textAlign:"center"}}>L'aliment sera sauvegarde dans "Mes aliments"</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Sport logge aujourd'hui */}
      {(day.exercises||[]).length>0&&(
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#ef4444",marginBottom:10}}>Sport loggue aujourd'hui</div>
          {(day.exercises||[]).map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #111827"}}>
              <span style={{fontSize:13}}>{e.name}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{color:"#ef4444",fontWeight:700,fontSize:13}}>-{e.cal} kcal</span>
                <button onClick={()=>{const exercises=(day.exercises||[]).filter((_,idx)=>idx!==i);updateDay({exercises});}}
                  style={{background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:6,padding:"2px 8px",fontSize:11}}>x</button>
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:"#f.slice(0,30).map(f=>(
                        <button key={f.id} onClick={()=>{setSelFood(f);setGrams("100");setStep("qty");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#111827",border:"1px solid #1f2937",borderRadius:8,padding:"8px 12px",textAlign:"left",width:"100%"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{f.name}</div>
                            <div style={{fontSize:10,color:"#6b7280"}}>{f.cat}</div>
                          </div>
                          <div style={{textAlign:"right",fontSize:11}}>
                            <div style={{color:"#f97316",fontWeight:700}}>{f.cal}</div>
                            <div style={{color:"#6b7280"}}>/ 100g</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>setShowManual(true)} style={{width:"100%",marginTop:10,background:"#1f2937",border:"1px dashed #374151",color:"#9ca3af",borderRadius:8,padding:"9px",fontSize:12,fontWeight:700}}>+ Ajouter un nouvel aliment</button>
                  </>
                )}
                {step==="qty"&&selFood&&!showManual&&(
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
                    {(()=>{const g=parseFloat(grams)||100;const m=calcM(selFood,g);return(<div style={{background:"#111827",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",gap:10,flexWrap:"wrap",fontSize:12}}><span style={{color:"#f97316",fontWeight:700}}>{m.cal} kcal</span><span style={{color:"#ef4444"}}>{m.protein}g prot</span><span style={{color:"#f59e0b"}}>{m.carbs}g gluc</span><span style={{color:"#8b5cf6"}}>{m.fat}g lip</span></div>);})()}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>addFood(slot.id)} style={{flex:1,background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13}}>Ajouter</button>
                      <button onClick={()=>{setStep("list");setSelFood(null);}} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"10px 14px",fontSize:13}}>Retour</button>
                    </div>
                  </div>
                )}
                {showManual&&(
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#f97316",marginBottom:12}}>Nouvel aliment - valeurs pour 100g</div>
                    <input placeholder="Nom de l'aliment" value={manual.name} onChange={e=>setManual(p=>({...p,name:e.target.value}))} style={{width:"100%",background:"#111827",border:"1px solid #374151",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:8}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                      {[{key:"cal",label:"Calories"},{key:"protein",label:"Proteines"},{key:"carbs",label:"Glucides"},{key:"fat",label:"Lipides"},{key:"fiber",label:"Fibres"},{key:"sugar",label:"Sucres"}].map(f=>(
                        <div key={f.key}>
                          <div style={{fontSize:9,color:"#6b7280",marginBottom:3}}>{f.label}</div>
                          <input type="number" value={manual[f.key]} onChange={e=>setManual(p=>({...p,[f.key]:e.target.value}))} style={{background:"#111827",border:"1px solid #374151",borderRadius:6,padding:"6px 8px",fontSize:13,width:"100%"}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>Sera sauvegarde dans votre base personnelle (resiste au vider cache).</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>saveManual(slot.id)} style={{flex:1,background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13}}>Sauvegarder et ajouter</button>
                      <button onClick={()=>setShowManual(false)} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"10px 14px",fontSize:13}}>Annuler</button>
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
          <div style={{fontSize:11,color:"#a78bfa",marginTop:6}}>Total : {exBurned} kcal brulees</div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MENUS
// =============================================================================
function MenusTab({day,updateDay}){
  const [slotF,setSlotF]=useState("Tous");
  const [typeF,setTypeF]=useState("Tous");
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState(null);
  const [added,setAdded]=useState(null);
  const slots=["Tous","Petit-dejeuner","Dejeuner","Gouter","Diner"];
  const types=["Tous",...Array.from(new Set(MENUS.map(m=>m.type)))];
  const filtered=MENUS.filter(m=>(slotF==="Tous"||m.slot===slotF)&&(typeF==="Tous"||m.type===typeF)&&(!search||m.name.toLowerCase().includes(search.toLowerCase())||m.desc.toLowerCase().includes(search.toLowerCase())));
  const sc={"Petit-dejeuner":"#f59e0b",Dejeuner:"#10b981",Gouter:"#8b5cf6",Diner:"#ef4444"};
  const si={"Petit-dejeuner":"breakfast",Dejeuner:"lunch",Gouter:"snack",Diner:"dinner"};
  const add=(menu,sl)=>{
    const id=si[sl];if(!id)return;
    const entry={id:Date.now(),name:menu.name,grams:1,cal:menu.cal,protein:menu.protein,carbs:menu.carbs,fat:menu.fat,fiber:2,sugar:Math.round(menu.carbs*0.25)};
    const meals={...(day.meals||{})};meals[id]=[...(meals[id]||[]),entry];
    updateDay({meals});setAdded(menu.id+sl);setTimeout(()=>setAdded(null),2000);setOpen(null);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:13,fontWeight:700}}>Idees de repas</div>
      <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:"#0f172a",border:"1px solid #374151",borderRadius:10,padding:"9px 12px",fontSize:13,width:"100%"}}/>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {slots.map(s=><button key={s} onClick={()=>setSlotF(s)} style={{background:slotF===s?"#f97316":"#1f2937",border:"none",color:slotF===s?"#fff":"#9ca3af",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{s}</button>)}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {types.map(t=><button key={t} onClick={()=>setTypeF(t)} style={{background:typeF===t?"#3b82f6":"#1f2937",border:"none",color:typeF===t?"#fff":"#9ca3af",borderRadius:6,padding:"5px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{t}</button>)}
      </div>
      <div style={{fontSize:10,color:"#6b7280"}}>{filtered.length} menus</div>
      {filtered.map(menu=>{
        const col=sc[menu.slot]||"#f97316";const isO=open===menu.id;
        return(
          <div key={menu.id} style={{background:"#0f172a",borderRadius:12,border:`1px solid ${isO?col+"50":"#1f2937"}`,borderLeft:`3px solid ${col}`,overflow:"hidden"}}>
            <button onClick={()=>setOpen(isO?null:menu.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700}}>{menu.name}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{menu.slot} . {menu.type}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:900,color:col}}>{menu.cal}</div>
                <div style={{fontSize:9,color:"#6b7280"}}>kcal</div>
              </div>
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
                  {["Petit-dejeuner","Dejeuner","Gouter","Diner"].map(sl=>{const k=menu.id+sl;return(
                    <button key={sl} onClick={()=>add(menu,sl)} style={{background:added===k?"#10b981":(sc[sl]||"#f97316"),border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,transition:"background .3s"}}>
                      {added===k?"Ajoute !":"+"+sl.slice(0,4)+"."}
                    </button>
                  );})}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// EXERCISE LIST
// =============================================================================
function ExerciseList({exercises,title,day,updateDay,muscleColor,levelColor}){
  const [mf,setMf]=useState("Tous");
  const [ef,setEf]=useState("Tous");
  const [lf,setLf]=useState("Tous");
  const [open,setOpen]=useState(null);
  const muscles=["Tous",...Array.from(new Set(exercises.map(e=>e.muscle)))];
  const equips= ["Tous",...Array.from(new Set(exercises.map(e=>e.equip)))];
  const levels= ["Tous","Debutant","Intermediaire","Avance"];
  const filtered=exercises.filter(e=>(mf==="Tous"||e.muscle===mf)&&(ef==="Tous"||e.equip===ef)&&(lf==="Tous"||e.level===lf));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:13,fontWeight:700}}>{title}</div>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
        {muscles.map(m=><button key={m} onClick={()=>setMf(m)} style={{background:mf===m?(muscleColor[m]||"#f97316"):"#1f2937",border:"none",color:mf===m?"#fff":"#9ca3af",borderRadius:6,padding:"5px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{m}</button>)}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {equips.map(e=><button key={e} onClick={()=>setEf(e)} style={{background:ef===e?"#3b82f6":"#1f2937",border:"none",color:ef===e?"#fff":"#9ca3af",borderRadius:6,padding:"4px 9px",fontSize:10,fontWeight:700}}>{e}</button>)}
        {levels.map(l=><button key={l} onClick={()=>setLf(l)} style={{background:lf===l?(levelColor[l]||"#374151"):"#1f2937",border:"none",color:lf===l?"#fff":"#9ca3af",borderRadius:6,padding:"4px 9px",fontSize:10,fontWeight:700}}>{l==="Tous"?"Tous niv.":l}</button>)}
      </div>
      <div style={{fontSize:10,color:"#6b7280"}}>{filtered.length} exercices</div>
      {filtered.map(ex=>{
        const mc=muscleColor[ex.muscle]||"#f97316";const isO=open===ex.id;
        return(
          <div key={ex.id} style={{background:"#0f172a",borderRadius:12,border:`1px solid ${isO?mc+"50":"#1f2937"}`,borderLeft:`3px solid ${mc}`,overflow:"hidden"}}>
            <button onClick={()=>setOpen(isO?null:ex.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",color:"#f1f5f9",textAlign:"left"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700}}>{ex.name}</div>
                <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{background:mc+"30",color:mc,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{ex.muscle}</span>
                  <span style={{background:"#1f2937",color:"#9ca3af",borderRadius:4,padding:"1px 6px",fontSize:9}}>{ex.equip}</span>
                  <span style={{background:(levelColor[ex.level]||"#374151")+"30",color:levelColor[ex.level]||"#e2e8f0",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{ex.level}</span>
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
                <ExTimer ex={ex} day={day} updateDay={updateDay}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// TIMER
// =============================================================================
function ExTimer({ex,day,updateDay}){
  const [phase,setPhase]=useState("idle");
  const [secs,setSecs]=useState(0);
  const [target,setTarget]=useState(0);
  const [curSet,setCurSet]=useState(1);
  const [paused,setPaused]=useState(false);
  const ref=useRef(null);
  const bell=()=>{
    try{const c=new(window.AudioContext||window.webkitAudioContext)();[880,660,880].forEach((f,i)=>{const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=f;g.gain.setValueAtTime(0.5,c.currentTime+i*0.2);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.2+0.4);o.start(c.currentTime+i*0.2);o.stop(c.currentTime+i*0.2+0.5);});}catch{}
    try{navigator.vibrate([150,80,150]);}catch{}
  };
  useEffect(()=>{
    if((phase==="work"||phase==="rest")&&!paused){
      ref.current=setInterval(()=>{
        setSecs(s=>{
          if(s<=1){
            clearInterval(ref.current);bell();
            if(phase==="work"){
              if(curSet<ex.sets){setPhase("rest");const r=ex.rest;setSecs(r);setTarget(r);}
              else{setPhase("done");}
            }else{
              const n=curSet+1;setCurSet(n);
              if(n<=ex.sets){setPhase("work");setSecs(30);setTarget(30);}
              else{setPhase("done");}
            }
            return 0;
          }
          return s-1;
        });
      },1000);
    }else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[phase,paused,curSet,ex.sets,ex.rest]);
  const start=()=>{setPhase("work");setSecs(30);setTarget(30);setCurSet(1);setPaused(false);};
  const stop=()=>{setPhase("idle");setSecs(0);setCurSet(1);setPaused(false);clearInterval(ref.current);};
  const log=()=>{const exercises=[...(day.exercises||[]),{name:ex.name,cal:ex.cal*ex.sets}];updateDay({exercises});stop();};
  const pct=target>0?(secs/target):0;
  const col=phase==="rest"?"#3b82f6":secs<=5?"#ef4444":secs<=10?"#f59e0b":"#10b981";
  const r=36;const circ=2*Math.PI*r;
  if(phase==="idle")return(
    <button onClick={start} style={{width:"100%",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",color:"#fff",borderRadius:10,padding:"11px",fontWeight:800,fontSize:14}}>
      Demarrer . {ex.sets} series de {ex.reps} . {ex.rest}s repos
    </button>
  );
  if(phase==="done")return(
    <div style={{textAlign:"center",padding:"8px 0"}}>
      <div style={{fontSize:20,marginBottom:4}}>Bravo !</div>
      <div style={{fontSize:13,color:"#10b981",fontWeight:700,marginBottom:12}}>{ex.sets} series . ~{ex.cal*ex.sets} kcal</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button onClick={log} style={{background:"#10b981",border:"none",color:"#fff",borderRadius:10,padding:"10px 18px",fontWeight:800,fontSize:13}}>Logger dans le journal</button>
        <button onClick={stop} style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:10,padding:"10px 14px",fontSize:13}}>Fermer</button>
      </div>
    </div>
  );
  return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>{phase==="work"?"EFFORT":"REPOS"} . Serie {curSet}/{ex.sets}{phase==="work"&&` . ${ex.reps} reps`}</div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="6"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" style={{transition:"stroke-dasharray .9s,stroke .3s"}}/>
          <text x="50" y="44" textAnchor="middle" fill={col} fontSize="22" fontWeight="900">{secs}</text>
          <text x="50" y="60" textAnchor="middle" fill="#6b7280" fontSize="10">sec</text>
        </svg>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8}}>
        <button onClick={()=>setPaused(p=>!p)} style={{background:paused?"#10b981":"#f59e0b",border:"none",color:"#fff",borderRadius:10,padding:"10px 22px",fontWeight:800,fontSize:14}}>{paused?"Reprendre":"Pause"}</button>
        <button onClick={stop} style={{background:"#ef4444",border:"none",color:"#fff",borderRadius:10,padding:"10px 18px",fontWeight:800,fontSize:14}}>Stop</button>
      </div>
      {phase==="work"&&(
        <button onClick={()=>{if(curSet<ex.sets){setPhase("rest");const r=ex.rest;setSecs(r);setTarget(r);setCurSet(c=>c+1);setPaused(false);}else{setPhase("done");}}}
          style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:8,padding:"7px 16px",fontSize:11}}>
          Serie terminee
        </button>
      )}
    </div>
  );
}

// =============================================================================
// STATS
// =============================================================================
function StatsTab({db,last14,allDates,setDate,setTab}){
  const weightPoints=allDates.map(d=>({d,w:db[d]?.weight})).filter(x=>x.w);
  const calData=last14.map(d=>{const items=Object.values(db[d]?.meals||{}).flat();return{d,cal:sumM(items).cal};});
  const sleepData=last14.map(d=>({d,s:db[d]?.sleep||0}));
  const Card=({title,sub,children})=>(
    <div style={{background:"#0f172a",borderRadius:14,padding:14,border:"1px solid #1f2937"}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{title}</div>
      {sub&&<div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>{sub}</div>}
      {children}
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card title="Poids" sub={`${PROFILE.startWeight}kg vers objectif ${PROFILE.targetWeight}kg`}>
        {weightPoints.length<2?<div style={{fontSize:12,color:"#6b7280",padding:"16px 0",textAlign:"center"}}>Enregistre ton poids depuis le Journal.</div>:(()=>{
          const vals=[...weightPoints.map(x=>x.w),PROFILE.startWeight,PROFILE.targetWeight];
          const minV=Math.min(...vals)-0.5,maxV=Math.max(...vals)+0.5,range=maxV-minV;
          const W=340,H=120;const px=i=>(i/(weightPoints.length-1))*W;const py=v=>H-((v-minV)/range)*H;
          const line=weightPoints.map((x,i)=>`${i===0?"M":"L"}${px(i)},${py(x.w)}`).join(" ");
          const tY=py(PROFILE.targetWeight);
          return(
            <svg width="100%" viewBox={`0 0 ${W} ${H+18}`} style={{overflow:"visible",marginTop:8}}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".3"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></linearGradient></defs>
              {[0,.5,1].map(f=><line key={f} x1="0" x2={W} y1={f*H} y2={f*H} stroke="#1f2937" strokeWidth="1"/>)}
              <line x1="0" x2={W} y1={tY} y2={tY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3"/>
              <text x="3" y={tY-4} fill="#10b981" fontSize="9">Objectif {PROFILE.targetWeight}kg</text>
              <path d={line+" L"+W+","+H+" L0,"+H+" Z"} fill="url(#wg)"/>
              <path d={line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round"/>
              {weightPoints.map((x,i)=>(
                <g key={i}>
                  <circle cx={px(i)} cy={py(x.w)} r="4" fill="#f97316" stroke="#08080f" strokeWidth="2"/>
                  <text x={px(i)} y={py(x.w)-7} fill="#f97316" fontSize="9" textAnchor="middle">{x.w}</text>
                  {i%Math.max(1,Math.floor(weightPoints.length/5))===0&&<text x={px(i)} y={H+14} fill="#6b7280" fontSize="8" textAnchor="middle">{fmtDate(x.d).slice(0,6)}</text>}
                </g>
              ))}
            </svg>
          );
        })()}
      </Card>
      <Card title="Calories - 14 jours" sub={`Objectif ${PROFILE.dailyCal} kcal/jour`}>
        {!calData.some(x=>x.cal>0)?<div style={{fontSize:12,color:"#6b7280",padding:"16px 0",textAlign:"center"}}>Ajoute des aliments dans le Journal.</div>:(()=>{
          const maxC=Math.max(...calData.map(x=>x.cal),PROFILE.dailyCal);
          return(
            <svg width="100%" viewBox="0 0 340 120" style={{overflow:"visible",marginTop:8}}>
              <line x1="0" x2="340" y1={100-(PROFILE.dailyCal/maxC)*100} y2={100-(PROFILE.dailyCal/maxC)*100} stroke="#f97316" strokeWidth="1.2" strokeDasharray="4,3"/>
              {calData.map((x,i)=>{const bW=340/14-2,bx=i*(340/14)+1,h=x.cal?Math.max(3,(x.cal/maxC)*100):0,col=x.cal>=PROFILE.dailyCal*0.9?"#10b981":x.cal>0?"#f59e0b":"#1f2937";return(<g key={x.d}><rect x={bx} y={100-h} width={bW} height={h} fill={col} rx="2"/>{x.cal>0&&<text x={bx+bW/2} y={100-h-3} fill={col} fontSize="7" textAnchor="middle">{x.cal}</text>}{i%2===0&&<text x={bx+bW/2} y={116} fill="#6b7280" fontSize="7" textAnchor="middle">{fmtDate(x.d).slice(0,5)}</text>}</g>);})}
            </svg>
          );
        })()}
      </Card>
      <Card title="Sommeil - 14 jours" sub="Vert 8h+ | Orange 6-8h | Rouge moins de 6h">
        {!sleepData.some(x=>x.s>0)?<div style={{fontSize:12,color:"#6b7280",padding:"16px 0",textAlign:"center"}}>Enregistre ton sommeil depuis le Journal.</div>:(()=>{
          const maxS=Math.max(...sleepData.map(x=>x.s),10);
          return(
            <svg width="100%" viewBox="0 0 340 120" style={{overflow:"visible",marginTop:8}}>
              <line x1="0" x2="340" y1={100-(8/maxS)*100} y2={100-(8/maxS)*100} stroke="#10b981" strokeWidth="1.2" strokeDasharray="4,3"/>
              <text x="2" y={100-(8/maxS)*100-3} fill="#10b981" fontSize="8">8h</text>
              {sleepData.map((x,i)=>{const bW=340/14-2,bx=i*(340/14)+1,h=x.s?Math.max(3,(x.s/maxS)*100):0,col=x.s>=8?"#10b981":x.s>=6?"#f59e0b":x.s>0?"#ef4444":"#1f2937";return(<g key={x.d}><rect x={bx} y={100-h} width={bW} height={h} fill={col} rx="2"/>{x.s>0&&<text x={bx+bW/2} y={100-h-3} fill={col} fontSize="7" textAnchor="middle">{x.s}h</text>}{i%2===0&&<text x={bx+bW/2} y={116} fill="#6b7280" fontSize="7" textAnchor="middle">{fmtDate(x.d).slice(0,5)}</text>}</g>);})}
            </svg>
          );
        })()}
      </Card>
      <div style={{background:"#0f172a",borderRadius:14,border:"1px solid #1f2937",overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #1f2937",fontSize:13,fontWeight:700}}>Historique</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:"#111827"}}>{["Date","Kcal","Prot","Poids","Sommeil"].map(h=><th key={h} style={{padding:"7px 8px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>
              {[...allDates].reverse().slice(0,20).map(d=>{
                const e=db[d]||{};const items=Object.values(e.meals||{}).flat();const t=sumM(items);
                return(<tr key={d} style={{borderBottom:"1px solid #111827",cursor:"pointer"}} onClick={()=>{setDate(d);setTab("journal");}}>
                  <td style={{padding:"7px 8px",fontSize:10}}>{fmtDate(d)}</td>
                  <td style={{padding:"7px 8px",color:t.cal>=PROFILE.dailyCal*0.9?"#4ade80":"#f87171",fontWeight:700}}>{t.cal||"-"}</td>
                  <td style={{padding:"7px 8px",color:"#ef4444"}}>{t.protein||"-"}g</td>
                  <td style={{padding:"7px 8px",color:"#f97316"}}>{e.weight?e.weight+"kg":"-"}</td>
                  <td style={{padding:"7px 8px",color:e.sleep>=7?"#4ade80":"#f87171"}}>{e.sleep?e.sleep+"h":"-"}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
