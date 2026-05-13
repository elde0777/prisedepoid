import { useState, useEffect, useRef } from "react";

/* PRISE DE POID
      60kg vers 70kg - Ectomorphe - Sans IA
*/

// -- Profil ------------------------------------------------------------------
const PROFILE = {
  startWeight: 60, targetWeight: 70, height: 180, age: 30,
  goalMonths: 6,
  dailyCal: 3400, dailyProtein: 160, dailyCarbs: 430,
  dailyFat: 105, dailyFiber: 35, dailySugar: 80,
};

// -- Base de données alimentaire (500+ aliments) -----------------------------
// Valeurs pour 100g sauf si portion définie
const FOOD_DB = [
  // -- FÉCULENTS & CÉRÉALES ------------------------------------------------
  { id:1,   name:"Riz blanc cuit",             cal:130, protein:2.7, carbs:28,  fat:0.3, fiber:0.4, sugar:0,   cat:"Féculents" },
  { id:2,   name:"Riz brun cuit",              cal:112, protein:2.6, carbs:23,  fat:0.9, fiber:1.8, sugar:0.4, cat:"Féculents" },
  { id:3,   name:"Riz basmati cuit",           cal:121, protein:2.7, carbs:26,  fat:0.3, fiber:0.4, sugar:0,   cat:"Féculents" },
  { id:4,   name:"Riz jasmin cuit",            cal:129, protein:2.5, carbs:28,  fat:0.2, fiber:0.4, sugar:0,   cat:"Féculents" },
  { id:5,   name:"Riz complet cuit",           cal:111, protein:2.6, carbs:23,  fat:0.9, fiber:1.8, sugar:0.3, cat:"Féculents" },
  { id:6,   name:"Pâtes cuites (nature)",      cal:158, protein:5.5, carbs:31,  fat:0.9, fiber:1.8, sugar:0.6, cat:"Féculents" },
  { id:7,   name:"Pâtes complètes cuites",     cal:149, protein:5.8, carbs:29,  fat:0.9, fiber:3.5, sugar:0.7, cat:"Féculents" },
  { id:8,   name:"Spaghetti cuits",            cal:157, protein:5.8, carbs:30,  fat:0.9, fiber:1.8, sugar:0.5, cat:"Féculents" },
  { id:9,   name:"Penne cuites",               cal:158, protein:5.5, carbs:31,  fat:0.9, fiber:1.8, sugar:0.6, cat:"Féculents" },
  { id:10,  name:"Macaroni cuits",             cal:154, protein:5.4, carbs:30,  fat:0.8, fiber:1.6, sugar:0.6, cat:"Féculents" },
  { id:11,  name:"Nouilles chinoises cuites",  cal:138, protein:4.5, carbs:28,  fat:0.5, fiber:0.8, sugar:0.2, cat:"Féculents" },
  { id:12,  name:"Pomme de terre cuite",       cal:86,  protein:1.8, carbs:20,  fat:0.1, fiber:1.8, sugar:0.9, cat:"Féculents" },
  { id:13,  name:"Purée maison",               cal:95,  protein:2.2, carbs:18,  fat:2,   fiber:1.5, sugar:1.5, cat:"Féculents" },
  { id:14,  name:"Frites (four)",              cal:155, protein:2.8, carbs:27,  fat:4.5, fiber:2.5, sugar:0.3, cat:"Féculents" },
  { id:15,  name:"Patate douce cuite",         cal:86,  protein:1.6, carbs:20,  fat:0.1, fiber:3,   sugar:4.2, cat:"Féculents" },
  { id:16,  name:"Pain complet",               cal:247, protein:9,   carbs:41,  fat:3.5, fiber:7,   sugar:4,   cat:"Féculents", portion:{name:"tranche",g:30} },
  { id:17,  name:"Pain blanc (baguette)",      cal:275, protein:9.4, carbs:56,  fat:1.2, fiber:2.7, sugar:2.5, cat:"Féculents", portion:{name:"tranche",g:25} },
  { id:18,  name:"Pain de mie blanc",          cal:260, protein:8,   carbs:47,  fat:4,   fiber:2,   sugar:5,   cat:"Féculents", portion:{name:"tranche",g:30} },
  { id:19,  name:"Pain de mie complet",        cal:236, protein:8.5, carbs:42,  fat:3.5, fiber:5,   sugar:4,   cat:"Féculents", portion:{name:"tranche",g:30} },
  { id:20,  name:"Pain brioché",               cal:340, protein:9,   carbs:52,  fat:10,  fiber:1.5, sugar:15,  cat:"Féculents", portion:{name:"tranche",g:40} },
  { id:21,  name:"Baguette",                   cal:275, protein:9.2, carbs:55,  fat:1.2, fiber:2.7, sugar:2.5, cat:"Féculents", portion:{name:"quart",g:60} },
  { id:22,  name:"Flocons d'avoine",           cal:389, protein:17,  carbs:66,  fat:7,   fiber:11,  sugar:1,   cat:"Féculents" },
  { id:23,  name:"Quinoa cuit",                cal:120, protein:4.4, carbs:22,  fat:1.9, fiber:2.8, sugar:0.9, cat:"Féculents" },
  { id:24,  name:"Boulgour cuit",              cal:83,  protein:3,   carbs:18,  fat:0.2, fiber:2.5, sugar:0.2, cat:"Féculents" },
  { id:25,  name:"Semoule cuite",              cal:112, protein:3.8, carbs:23,  fat:0.2, fiber:1.4, sugar:0.5, cat:"Féculents" },
  { id:26,  name:"Polenta cuite",              cal:70,  protein:1.5, carbs:15,  fat:0.5, fiber:0.8, sugar:0.5, cat:"Féculents" },
  { id:27,  name:"Lentilles cuites",           cal:116, protein:9,   carbs:20,  fat:0.4, fiber:7.9, sugar:1.8, cat:"Féculents" },
  { id:28,  name:"Lentilles vertes cuites",    cal:116, protein:9.1, carbs:20,  fat:0.4, fiber:7.6, sugar:1.5, cat:"Féculents" },
  { id:29,  name:"Pois chiches cuits",         cal:164, protein:8.9, carbs:27,  fat:2.6, fiber:7.6, sugar:4.8, cat:"Féculents" },
  { id:30,  name:"Haricots rouges cuits",      cal:127, protein:8.7, carbs:22,  fat:0.5, fiber:6.4, sugar:0.3, cat:"Féculents" },
  { id:31,  name:"Haricots blancs cuits",      cal:139, protein:9.7, carbs:25,  fat:0.5, fiber:6.3, sugar:0.4, cat:"Féculents" },
  { id:32,  name:"Fèves cuites",               cal:88,  protein:7.9, carbs:13,  fat:0.4, fiber:5.4, sugar:1.7, cat:"Féculents" },
  { id:33,  name:"Tortilla blé (grande)",      cal:306, protein:8.5, carbs:51,  fat:7,   fiber:3,   sugar:3,   cat:"Féculents", portion:{name:"tortilla",g:60} },
  { id:34,  name:"Riz soufflé (galette)",      cal:387, protein:7,   carbs:85,  fat:1.5, fiber:1.5, sugar:0.5, cat:"Féculents", portion:{name:"galette",g:9} },
  // -- VIANDES ------------------------------------------------------------
  { id:100, name:"Blanc de poulet",            cal:110, protein:23,  carbs:0,   fat:1.2, fiber:0, sugar:0, cat:"Viandes" },
  { id:101, name:"Cuisse de poulet (sans peau)",cal:155,protein:22, carbs:0,   fat:7.5, fiber:0, sugar:0, cat:"Viandes" },
  { id:102, name:"Cuisse de poulet (avec peau)",cal:215,protein:18, carbs:0,   fat:16,  fiber:0, sugar:0, cat:"Viandes" },
  { id:103, name:"Escalope de poulet",         cal:108, protein:23,  carbs:0,   fat:1.2, fiber:0, sugar:0, cat:"Viandes" },
  { id:104, name:"Poulet rôti",                cal:185, protein:27,  carbs:0,   fat:8.5, fiber:0, sugar:0, cat:"Viandes" },
  { id:105, name:"Steak haché 5%",             cal:158, protein:20,  carbs:0,   fat:8.4, fiber:0, sugar:0, cat:"Viandes", portion:{name:"steak",g:130} },
  { id:106, name:"Steak haché 10%",            cal:196, protein:18,  carbs:0,   fat:13,  fiber:0, sugar:0, cat:"Viandes", portion:{name:"steak",g:130} },
  { id:107, name:"Steak haché 15%",            cal:235, protein:17,  carbs:0,   fat:18,  fiber:0, sugar:0, cat:"Viandes", portion:{name:"steak",g:130} },
  { id:108, name:"Steak haché 20%",            cal:275, protein:15,  carbs:0,   fat:24,  fiber:0, sugar:0, cat:"Viandes", portion:{name:"steak",g:130} },
  { id:109, name:"Bœuf - entrecôte",           cal:222, protein:20,  carbs:0,   fat:15,  fiber:0, sugar:0, cat:"Viandes" },
  { id:110, name:"Bœuf - rumsteak",            cal:158, protein:22,  carbs:0,   fat:7.5, fiber:0, sugar:0, cat:"Viandes" },
  { id:111, name:"Bœuf - filet",               cal:144, protein:22,  carbs:0,   fat:6,   fiber:0, sugar:0, cat:"Viandes" },
  { id:112, name:"Bœuf - basse côte",          cal:250, protein:18,  carbs:0,   fat:20,  fiber:0, sugar:0, cat:"Viandes" },
  { id:113, name:"Bœuf haché (cuit)",          cal:240, protein:21,  carbs:0,   fat:17,  fiber:0, sugar:0, cat:"Viandes" },
  { id:114, name:"Veau - escalope",            cal:106, protein:22,  carbs:0,   fat:1.9, fiber:0, sugar:0, cat:"Viandes" },
  { id:115, name:"Veau - côte",                cal:180, protein:20,  carbs:0,   fat:11,  fiber:0, sugar:0, cat:"Viandes" },
  { id:116, name:"Porc - filet mignon",        cal:147, protein:22,  carbs:0,   fat:6.2, fiber:0, sugar:0, cat:"Viandes" },
  { id:117, name:"Porc - côtelette",           cal:200, protein:21,  carbs:0,   fat:13,  fiber:0, sugar:0, cat:"Viandes" },
  { id:118, name:"Porc - épaule",              cal:195, protein:20,  carbs:0,   fat:12,  fiber:0, sugar:0, cat:"Viandes" },
  { id:119, name:"Porc - travers (ribs)",      cal:280, protein:18,  carbs:0,   fat:23,  fiber:0, sugar:0, cat:"Viandes" },
  { id:120, name:"Jambon blanc (tranche)",     cal:107, protein:17,  carbs:1.1, fat:3.5, fiber:0, sugar:0.8,cat:"Viandes", portion:{name:"tranche",g:40} },
  { id:121, name:"Jambon cru (tranche)",       cal:196, protein:18,  carbs:0.3, fat:13,  fiber:0, sugar:0,  cat:"Viandes", portion:{name:"tranche",g:25} },
  { id:122, name:"Lardons fumés (poêlés)",     cal:365, protein:13,  carbs:0,   fat:35,  fiber:0, sugar:0,  cat:"Viandes" },
  { id:123, name:"Saucisse de Francfort",      cal:280, protein:12,  carbs:3,   fat:25,  fiber:0, sugar:1,  cat:"Viandes", portion:{name:"saucisse",g:60} },
  { id:124, name:"Saucisse de Strasbourg",     cal:290, protein:11,  carbs:2,   fat:27,  fiber:0, sugar:1,  cat:"Viandes", portion:{name:"saucisse",g:75} },
  { id:125, name:"Merguez",                    cal:296, protein:14,  carbs:1,   fat:26,  fiber:0, sugar:0,  cat:"Viandes", portion:{name:"merguez",g:70} },
  { id:126, name:"Chipolata",                  cal:285, protein:13,  carbs:2,   fat:25,  fiber:0, sugar:1,  cat:"Viandes", portion:{name:"chipolata",g:70} },
  { id:127, name:"Chorizo",                    cal:455, protein:24,  carbs:2,   fat:40,  fiber:0, sugar:0.5,cat:"Viandes" },
  { id:128, name:"Salami",                     cal:425, protein:22,  carbs:1.5, fat:37,  fiber:0, sugar:0.5,cat:"Viandes" },
  { id:129, name:"Bresaola",                   cal:151, protein:29,  carbs:0.5, fat:3,   fiber:0, sugar:0,  cat:"Viandes" },
  { id:130, name:"Canard - filet",             cal:190, protein:25,  carbs:0,   fat:10,  fiber:0, sugar:0,  cat:"Viandes" },
  { id:131, name:"Dinde - escalope",           cal:104, protein:23,  carbs:0,   fat:1,   fiber:0, sugar:0,  cat:"Viandes" },
  { id:132, name:"Agneau - gigot",             cal:218, protein:22,  carbs:0,   fat:14,  fiber:0, sugar:0,  cat:"Viandes" },
  // -- ŒUFS & PRODUITS LAITIERS --------------------------------------------
  { id:200, name:"Œuf entier (moyen)",         cal:155, protein:13,  carbs:1.1, fat:11,  fiber:0, sugar:1.1, cat:"Œufs & Laitiers", portion:{name:"œuf",g:55} },
  { id:201, name:"Blanc d'œuf",                cal:52,  protein:11,  carbs:0.7, fat:0.2, fiber:0, sugar:0.7, cat:"Œufs & Laitiers", portion:{name:"blanc",g:35} },
  { id:202, name:"Jaune d'œuf",                cal:358, protein:16,  carbs:0.6, fat:32,  fiber:0, sugar:0.6, cat:"Œufs & Laitiers", portion:{name:"jaune",g:20} },
  { id:203, name:"Lait entier",                cal:61,  protein:3.2, carbs:4.8, fat:3.5, fiber:0, sugar:4.8, cat:"Œufs & Laitiers", portion:{name:"verre 200ml",g:200} },
  { id:204, name:"Lait demi-écrémé",           cal:46,  protein:3.2, carbs:4.8, fat:1.5, fiber:0, sugar:4.8, cat:"Œufs & Laitiers", portion:{name:"verre 200ml",g:200} },
  { id:205, name:"Lait écrémé",                cal:35,  protein:3.4, carbs:5,   fat:0.1, fiber:0, sugar:5,   cat:"Œufs & Laitiers" },
  { id:206, name:"Lait de soja nature",        cal:44,  protein:3.6, carbs:2.8, fat:2,   fiber:0.5,sugar:1.5,cat:"Œufs & Laitiers" },
  { id:207, name:"Lait d'avoine",              cal:47,  protein:1,   carbs:9,   fat:0.8, fiber:0.5,sugar:4,  cat:"Œufs & Laitiers" },
  { id:208, name:"Yaourt nature entier",       cal:61,  protein:3.5, carbs:4.7, fat:3.2, fiber:0, sugar:4.7, cat:"Œufs & Laitiers", portion:{name:"pot",g:125} },
  { id:209, name:"Yaourt grec (10%)",          cal:130, protein:5,   carbs:3.8, fat:10,  fiber:0, sugar:3.8, cat:"Œufs & Laitiers", portion:{name:"pot",g:150} },
  { id:210, name:"Yaourt grec 0%",             cal:59,  protein:10,  carbs:3.6, fat:0.4, fiber:0, sugar:3.6, cat:"Œufs & Laitiers", portion:{name:"pot",g:150} },
  { id:211, name:"Fromage blanc 0%",           cal:45,  protein:8,   carbs:4,   fat:0.2, fiber:0, sugar:4,   cat:"Œufs & Laitiers" },
  { id:212, name:"Fromage blanc 3%",           cal:66,  protein:7,   carbs:4,   fat:3,   fiber:0, sugar:4,   cat:"Œufs & Laitiers" },
  { id:213, name:"Fromage blanc 40%",          cal:116, protein:6.5, carbs:3.8, fat:8.5, fiber:0, sugar:3.8, cat:"Œufs & Laitiers" },
  { id:214, name:"Petit-suisse nature",        cal:104, protein:8.5, carbs:3.5, fat:6.5, fiber:0, sugar:3.5, cat:"Œufs & Laitiers", portion:{name:"petit-suisse",g:60} },
  { id:215, name:"Skyr nature",                cal:63,  protein:11,  carbs:4,   fat:0.2, fiber:0, sugar:4,   cat:"Œufs & Laitiers", portion:{name:"pot",g:150} },
  { id:216, name:"Crème fraîche épaisse 30%",  cal:292, protein:2.1, carbs:2.8, fat:30,  fiber:0, sugar:2.8, cat:"Œufs & Laitiers" },
  { id:217, name:"Crème fraîche légère 15%",   cal:162, protein:2.9, carbs:3.5, fat:15,  fiber:0, sugar:3.5, cat:"Œufs & Laitiers" },
  { id:218, name:"Crème liquide entière",      cal:330, protein:2.4, carbs:3,   fat:35,  fiber:0, sugar:3,   cat:"Œufs & Laitiers" },
  { id:219, name:"Beurre",                     cal:717, protein:0.6, carbs:0.6, fat:81,  fiber:0, sugar:0.6, cat:"Œufs & Laitiers", portion:{name:"noix (10g)",g:10} },
  { id:220, name:"Gruyère râpé",               cal:413, protein:29,  carbs:0.4, fat:33,  fiber:0, sugar:0.2, cat:"Œufs & Laitiers" },
  { id:221, name:"Emmental",                   cal:380, protein:28,  carbs:0.5, fat:29,  fiber:0, sugar:0.5, cat:"Œufs & Laitiers" },
  { id:222, name:"Comté",                      cal:413, protein:29,  carbs:0.4, fat:33,  fiber:0, sugar:0.2, cat:"Œufs & Laitiers" },
  { id:223, name:"Mozzarella",                 cal:280, protein:18,  carbs:2,   fat:22,  fiber:0, sugar:1,   cat:"Œufs & Laitiers" },
  { id:224, name:"Raclette",                   cal:350, protein:24,  carbs:0.5, fat:28,  fiber:0, sugar:0.5, cat:"Œufs & Laitiers" },
  { id:225, name:"Fromage ail & fines herbes", cal:290, protein:7,   carbs:4,   fat:27,  fiber:0, sugar:2,   cat:"Œufs & Laitiers" },
  { id:226, name:"Protéine whey (dose)",       cal:370, protein:75,  carbs:8,   fat:5,   fiber:1, sugar:4,   cat:"Œufs & Laitiers", portion:{name:"dose 30g",g:30} },
  { id:227, name:"Protéine caséine (dose)",    cal:360, protein:72,  carbs:9,   fat:4,   fiber:1, sugar:4,   cat:"Œufs & Laitiers", portion:{name:"dose 30g",g:30} },
  // -- FRUITS ------------------------------------------------------------
  { id:300, name:"Banane",                     cal:89,  protein:1.1, carbs:23,  fat:0.3, fiber:2.6,sugar:12,  cat:"Fruits", portion:{name:"banane",g:120} },
  { id:301, name:"Pomme",                      cal:52,  protein:0.3, carbs:14,  fat:0.2, fiber:2.4,sugar:10,  cat:"Fruits", portion:{name:"pomme",g:150} },
  { id:302, name:"Orange",                     cal:47,  protein:0.9, carbs:12,  fat:0.1, fiber:2.4,sugar:9,   cat:"Fruits", portion:{name:"orange",g:180} },
  { id:303, name:"Poire",                      cal:57,  protein:0.4, carbs:15,  fat:0.1, fiber:3.1,sugar:10,  cat:"Fruits", portion:{name:"poire",g:160} },
  { id:304, name:"Pêche",                      cal:39,  protein:0.9, carbs:10,  fat:0.3, fiber:1.5,sugar:8,   cat:"Fruits", portion:{name:"pêche",g:150} },
  { id:305, name:"Nectarine",                  cal:44,  protein:1,   carbs:11,  fat:0.3, fiber:1.7,sugar:8,   cat:"Fruits", portion:{name:"nectarine",g:140} },
  { id:306, name:"Abricot",                    cal:48,  protein:1.4, carbs:11,  fat:0.4, fiber:2,  sugar:9,   cat:"Fruits", portion:{name:"abricot",g:40} },
  { id:307, name:"Prune",                      cal:46,  protein:0.7, carbs:11,  fat:0.3, fiber:1.4,sugar:10,  cat:"Fruits", portion:{name:"prune",g:60} },
  { id:308, name:"Raisin",                     cal:69,  protein:0.7, carbs:18,  fat:0.2, fiber:0.9,sugar:16,  cat:"Fruits" },
  { id:309, name:"Cerises",                    cal:63,  protein:1,   carbs:16,  fat:0.2, fiber:2.1,sugar:13,  cat:"Fruits" },
  { id:310, name:"Fraises",                    cal:32,  protein:0.7, carbs:7.7, fat:0.3, fiber:2,  sugar:4.9, cat:"Fruits" },
  { id:311, name:"Framboises",                 cal:52,  protein:1.2, carbs:12,  fat:0.7, fiber:6.5,sugar:4.4, cat:"Fruits" },
  { id:312, name:"Myrtilles",                  cal:57,  protein:0.7, carbs:14,  fat:0.3, fiber:2.4,sugar:10,  cat:"Fruits" },
  { id:313, name:"Kiwi",                       cal:61,  protein:1.1, carbs:15,  fat:0.5, fiber:3,  sugar:9,   cat:"Fruits", portion:{name:"kiwi",g:80} },
  { id:314, name:"Mangue",                     cal:60,  protein:0.8, carbs:15,  fat:0.4, fiber:1.6,sugar:14,  cat:"Fruits" },
  { id:315, name:"Ananas",                     cal:50,  protein:0.5, carbs:13,  fat:0.1, fiber:1.4,sugar:10,  cat:"Fruits" },
  { id:316, name:"Pastèque",                   cal:30,  protein:0.6, carbs:7.6, fat:0.2, fiber:0.4,sugar:6,   cat:"Fruits" },
  { id:317, name:"Melon",                      cal:34,  protein:0.8, carbs:8,   fat:0.2, fiber:0.9,sugar:7.5, cat:"Fruits", portion:{name:"tranche",g:150} },
  { id:318, name:"Avocat",                     cal:160, protein:2,   carbs:9,   fat:15,  fiber:7,  sugar:0.7, cat:"Fruits", portion:{name:"demi",g:100} },
  { id:319, name:"Citron",                     cal:29,  protein:1.1, carbs:9,   fat:0.3, fiber:2.8,sugar:2.5, cat:"Fruits", portion:{name:"citron",g:80} },
  { id:320, name:"Clémentine",                 cal:47,  protein:0.9, carbs:12,  fat:0.2, fiber:1.7,sugar:9.5, cat:"Fruits", portion:{name:"clémentine",g:70} },
  { id:321, name:"Dattes séchées",             cal:277, protein:1.8, carbs:75,  fat:0.2, fiber:7,  sugar:66,  cat:"Fruits", portion:{name:"datte",g:15} },
  { id:322, name:"Figues séchées",             cal:249, protein:3.3, carbs:64,  fat:0.9, fiber:9.8,sugar:48,  cat:"Fruits", portion:{name:"figue",g:20} },
  { id:323, name:"Raisins secs",               cal:299, protein:3.1, carbs:79,  fat:0.5, fiber:3.7,sugar:59,  cat:"Fruits" },
  // -- LÉGUMES ------------------------------------------------------------
  { id:400, name:"Tomates",                    cal:18,  protein:0.9, carbs:3.9, fat:0.2, fiber:1.2,sugar:2.6, cat:"Légumes" },
  { id:401, name:"Tomates cerises",            cal:18,  protein:0.9, carbs:3.9, fat:0.2, fiber:1.2,sugar:2.8, cat:"Légumes" },
  { id:402, name:"Tomates pelées en boite",    cal:20,  protein:0.9, carbs:4,   fat:0.2, fiber:1.2,sugar:3,   cat:"Légumes" },
  { id:403, name:"Carottes",                   cal:41,  protein:0.9, carbs:10,  fat:0.2, fiber:2.8,sugar:4.7, cat:"Légumes" },
  { id:404, name:"Courgettes",                 cal:17,  protein:1.2, carbs:3.1, fat:0.3, fiber:1,  sugar:2.5, cat:"Légumes" },
  { id:405, name:"Poivron rouge",              cal:31,  protein:1,   carbs:6,   fat:0.3, fiber:2.1,sugar:4.2, cat:"Légumes" },
  { id:406, name:"Poivron vert",               cal:20,  protein:0.9, carbs:4.6, fat:0.2, fiber:1.7,sugar:2.4, cat:"Légumes" },
  { id:407, name:"Oignon",                     cal:40,  protein:1.1, carbs:9.3, fat:0.1, fiber:1.7,sugar:4.2, cat:"Légumes" },
  { id:408, name:"Ail",                        cal:149, protein:6.4, carbs:33,  fat:0.5, fiber:2.1,sugar:1,   cat:"Légumes" },
  { id:409, name:"Salade verte",               cal:15,  protein:1.4, carbs:2.2, fat:0.2, fiber:1.5,sugar:1.2, cat:"Légumes" },
  { id:410, name:"Épinards",                   cal:23,  protein:2.9, carbs:3.6, fat:0.4, fiber:2.2,sugar:0.4, cat:"Légumes" },
  { id:411, name:"Brocoli",                    cal:34,  protein:2.8, carbs:7,   fat:0.4, fiber:2.6,sugar:1.7, cat:"Légumes" },
  { id:412, name:"Chou-fleur",                 cal:25,  protein:1.9, carbs:5,   fat:0.3, fiber:2,  sugar:1.9, cat:"Légumes" },
  { id:413, name:"Champignons de Paris",       cal:22,  protein:3.1, carbs:3.3, fat:0.3, fiber:1,  sugar:1.5, cat:"Légumes" },
  { id:414, name:"Maïs en boite",              cal:86,  protein:3.2, carbs:19,  fat:1.2, fiber:2.7,sugar:3.2, cat:"Légumes" },
  { id:415, name:"Petits pois",                cal:81,  protein:5.4, carbs:14,  fat:0.4, fiber:5.7,sugar:5.7, cat:"Légumes" },
  { id:416, name:"Haricots verts",             cal:31,  protein:1.8, carbs:7,   fat:0.1, fiber:3.4,sugar:3.3, cat:"Légumes" },
  { id:417, name:"Asperges",                   cal:20,  protein:2.2, carbs:3.9, fat:0.1, fiber:2.1,sugar:1.9, cat:"Légumes" },
  { id:418, name:"Aubergine",                  cal:25,  protein:1,   carbs:6,   fat:0.2, fiber:3,  sugar:3.5, cat:"Légumes" },
  { id:419, name:"Poireau",                    cal:31,  protein:1.5, carbs:7,   fat:0.3, fiber:1.8,sugar:3.9, cat:"Légumes" },
  { id:420, name:"Céleri branche",             cal:16,  protein:0.7, carbs:3,   fat:0.2, fiber:1.6,sugar:1.8, cat:"Légumes" },
  { id:421, name:"Concombre",                  cal:15,  protein:0.6, carbs:3.6, fat:0.1, fiber:0.5,sugar:1.7, cat:"Légumes" },
  { id:422, name:"Radis",                      cal:16,  protein:0.7, carbs:3.4, fat:0.1, fiber:1.6,sugar:1.9, cat:"Légumes" },
  // -- GRAISSES, HUILES & SAUCES -------------------------------------------
  { id:500, name:"Huile d'olive",              cal:884, protein:0,   carbs:0,   fat:100, fiber:0, sugar:0,   cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:10} },
  { id:501, name:"Huile de tournesol",         cal:884, protein:0,   carbs:0,   fat:100, fiber:0, sugar:0,   cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:10} },
  { id:502, name:"Huile de coco",              cal:884, protein:0,   carbs:0,   fat:100, fiber:0, sugar:0,   cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:10} },
  { id:503, name:"Huile de colza",             cal:884, protein:0,   carbs:0,   fat:100, fiber:0, sugar:0,   cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:10} },
  { id:504, name:"Beurre de cacahuète",        cal:597, protein:25,  carbs:20,  fat:51,  fiber:6, sugar:9,   cat:"Graisses & Sauces" },
  { id:505, name:"Beurre d'amande",            cal:614, protein:21,  carbs:19,  fat:56,  fiber:7, sugar:4,   cat:"Graisses & Sauces" },
  { id:506, name:"Tahini (purée sésame)",      cal:595, protein:17,  carbs:21,  fat:54,  fiber:9, sugar:0.5, cat:"Graisses & Sauces" },
  { id:507, name:"Mayonnaise",                 cal:680, protein:1.3, carbs:2.6, fat:75,  fiber:0, sugar:1.2, cat:"Graisses & Sauces" },
  { id:508, name:"Mayonnaise légère",          cal:320, protein:2,   carbs:8,   fat:31,  fiber:0, sugar:2,   cat:"Graisses & Sauces" },
  { id:509, name:"Ketchup",                    cal:112, protein:1.6, carbs:26,  fat:0.2, fiber:0.5,sugar:23, cat:"Graisses & Sauces" },
  { id:510, name:"Moutarde",                   cal:66,  protein:4.4, carbs:6.4, fat:3.3, fiber:3, sugar:2.5, cat:"Graisses & Sauces" },
  { id:511, name:"Sauce tomate",               cal:39,  protein:1.5, carbs:8,   fat:0.2, fiber:1.5,sugar:6,  cat:"Graisses & Sauces" },
  { id:512, name:"Sauce bolognaise",           cal:95,  protein:6,   carbs:8,   fat:4,   fiber:1, sugar:5,   cat:"Graisses & Sauces" },
  { id:513, name:"Sauce soja",                 cal:53,  protein:8.1, carbs:4.9, fat:0.1, fiber:0, sugar:1,   cat:"Graisses & Sauces" },
  { id:514, name:"Miel",                       cal:304, protein:0.3, carbs:82,  fat:0,   fiber:0.2,sugar:82, cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:20} },
  { id:515, name:"Confiture",                  cal:260, protein:0.4, carbs:65,  fat:0.1, fiber:0.8,sugar:62, cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:20} },
  { id:516, name:"Nutella",                    cal:530, protein:6.3, carbs:57,  fat:31,  fiber:2, sugar:56,  cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:20} },
  { id:517, name:"Sirop d'érable",             cal:260, protein:0,   carbs:67,  fat:0,   fiber:0, sugar:60,  cat:"Graisses & Sauces", portion:{name:"cuillère à soupe",g:20} },
  { id:518, name:"Sauce César",                cal:310, protein:2,   carbs:4,   fat:32,  fiber:0, sugar:2,   cat:"Graisses & Sauces" },
  { id:519, name:"Vinaigrette",                cal:400, protein:0.2, carbs:3,   fat:43,  fiber:0, sugar:2,   cat:"Graisses & Sauces" },
  // -- BOISSONS -----------------------------------------------------------
  { id:600, name:"Eau",                        cal:0,   protein:0,   carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"verre",g:250} },
  { id:601, name:"Café (espresso)",            cal:2,   protein:0.3, carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"tasse",g:30} },
  { id:602, name:"Café au lait entier",        cal:65,  protein:3.4, carbs:5.1, fat:3.8, fiber:0, sugar:5.1, cat:"Boissons", portion:{name:"mug",g:250} },
  { id:603, name:"Thé nature",                 cal:1,   protein:0,   carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"tasse",g:200} },
  { id:604, name:"Jus d'orange frais",         cal:45,  protein:0.7, carbs:10,  fat:0.2, fiber:0.2,sugar:8,  cat:"Boissons", portion:{name:"verre",g:200} },
  { id:605, name:"Jus de pomme",               cal:46,  protein:0.1, carbs:11,  fat:0.1, fiber:0.1,sugar:10, cat:"Boissons", portion:{name:"verre",g:200} },
  { id:606, name:"Coca-Cola",                  cal:42,  protein:0,   carbs:10.6,fat:0,   fiber:0, sugar:10.6,cat:"Boissons", portion:{name:"canette 33cl",g:330} },
  { id:607, name:"Coca-Cola Zéro",             cal:1,   protein:0,   carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"canette 33cl",g:330} },
  { id:608, name:"Jus multivitaminé",          cal:50,  protein:0.5, carbs:12,  fat:0.1, fiber:0.3,sugar:10, cat:"Boissons", portion:{name:"verre",g:200} },
  { id:609, name:"Smoothie banane-lait",       cal:92,  protein:3.5, carbs:18,  fat:1.8, fiber:1, sugar:14,  cat:"Boissons", portion:{name:"verre",g:250} },
  { id:610, name:"Boisson protéinée maison",   cal:280, protein:28,  carbs:35,  fat:3,   fiber:2, sugar:20,  cat:"Boissons", portion:{name:"shaker 400ml",g:400} },
  { id:611, name:"Gainer maison (lait+banane+avoine)",cal:400,protein:18,carbs:70,fat:6, fiber:4, sugar:22,  cat:"Boissons", portion:{name:"shaker 500ml",g:500} },
  { id:612, name:"Bière blonde (25cl)",        cal:43,  protein:0.5, carbs:3.5, fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"verre 25cl",g:250} },
  { id:613, name:"Jus d'ananas",               cal:53,  protein:0.4, carbs:13,  fat:0.1, fiber:0.2,sugar:10, cat:"Boissons", portion:{name:"verre",g:200} },
  // -- NOIX & FRUITS SECS --------------------------------------------------
  { id:700, name:"Amandes",                    cal:579, protein:21,  carbs:22,  fat:50,  fiber:12, sugar:4,  cat:"Noix & Oléagineux", portion:{name:"poignée (25g)",g:25} },
  { id:701, name:"Noix",                       cal:654, protein:15,  carbs:14,  fat:65,  fiber:6.7,sugar:2.6,cat:"Noix & Oléagineux", portion:{name:"poignée (25g)",g:25} },
  { id:702, name:"Cacahuètes grillées",        cal:567, protein:26,  carbs:16,  fat:49,  fiber:8.5,sugar:4,  cat:"Noix & Oléagineux", portion:{name:"poignée (25g)",g:25} },
  { id:703, name:"Noix de cajou",              cal:553, protein:18,  carbs:30,  fat:44,  fiber:3.3,sugar:6,  cat:"Noix & Oléagineux", portion:{name:"poignée (25g)",g:25} },
  { id:704, name:"Pistaches",                  cal:560, protein:20,  carbs:28,  fat:45,  fiber:10, sugar:7,  cat:"Noix & Oléagineux", portion:{name:"poignée (25g)",g:25} },
  { id:705, name:"Graines de tournesol",       cal:584, protein:21,  carbs:20,  fat:51,  fiber:8.6,sugar:2.6,cat:"Noix & Oléagineux" },
  { id:706, name:"Graines de chia",            cal:486, protein:17,  carbs:42,  fat:31,  fiber:34, sugar:0,  cat:"Noix & Oléagineux" },
  { id:707, name:"Graines de lin",             cal:534, protein:18,  carbs:29,  fat:42,  fiber:27, sugar:1.6,cat:"Noix & Oléagineux" },
  { id:708, name:"Noix de coco râpée",         cal:354, protein:3.3, carbs:15,  fat:33,  fiber:9,  sugar:6,  cat:"Noix & Oléagineux" },
  // -- SNACKS & SUCRERIES -------------------------------------------------
  { id:800, name:"Chocolat noir 70%",          cal:546, protein:4.9, carbs:60,  fat:31,  fiber:7,  sugar:48, cat:"Snacks & Sucreries", portion:{name:"carré (10g)",g:10} },
  { id:801, name:"Chocolat au lait",           cal:535, protein:7.7, carbs:60,  fat:30,  fiber:2.5,sugar:52, cat:"Snacks & Sucreries", portion:{name:"carré (10g)",g:10} },
  { id:802, name:"Chips nature",               cal:536, protein:7,   carbs:53,  fat:35,  fiber:3.8,sugar:0.5,cat:"Snacks & Sucreries", portion:{name:"poignée (30g)",g:30} },
  { id:803, name:"Granola",                    cal:400, protein:10,  carbs:65,  fat:12,  fiber:7,  sugar:22, cat:"Snacks & Sucreries" },
  { id:804, name:"Muesli nature",              cal:350, protein:10,  carbs:62,  fat:6,   fiber:8,  sugar:18, cat:"Snacks & Sucreries" },
  { id:805, name:"Barre protéinée (60g)",      cal:350, protein:25,  carbs:35,  fat:8,   fiber:3,  sugar:18, cat:"Snacks & Sucreries", portion:{name:"barre",g:60} },
  { id:806, name:"Céréales Corn Flakes",       cal:357, protein:7.5, carbs:84,  fat:0.9, fiber:3,  sugar:8,  cat:"Snacks & Sucreries", portion:{name:"bol (40g)",g:40} },
  { id:807, name:"Céréales Miel Pops",         cal:380, protein:6,   carbs:84,  fat:1.5, fiber:2,  sugar:36, cat:"Snacks & Sucreries", portion:{name:"bol (40g)",g:40} },
  { id:808, name:"Biscuits secs (Lu, BN...)",    cal:480, protein:7,   carbs:70,  fat:20,  fiber:2,  sugar:28, cat:"Snacks & Sucreries", portion:{name:"2 biscuits",g:20} },
  { id:809, name:"Croissant",                  cal:406, protein:8.2, carbs:46,  fat:21,  fiber:2,  sugar:10, cat:"Snacks & Sucreries", portion:{name:"croissant",g:60} },
  { id:810, name:"Pain au chocolat",           cal:390, protein:7,   carbs:44,  fat:20,  fiber:2,  sugar:15, cat:"Snacks & Sucreries", portion:{name:"pain au choc.",g:80} },
  { id:811, name:"Madeleine",                  cal:420, protein:7,   carbs:55,  fat:19,  fiber:1,  sugar:28, cat:"Snacks & Sucreries", portion:{name:"madeleine",g:35} },
  { id:812, name:"Gâteau yaourt maison",       cal:310, protein:6,   carbs:45,  fat:12,  fiber:1,  sugar:28, cat:"Snacks & Sucreries", portion:{name:"part",g:80} },
  { id:813, name:"Bonbons",                    cal:330, protein:7,   carbs:77,  fat:0,   fiber:0,  sugar:60, cat:"Snacks & Sucreries", portion:{name:"poignée (30g)",g:30} },
  { id:814, name:"Riz au lait (pot)",          cal:118, protein:3.5, carbs:20,  fat:2.5, fiber:0,  sugar:14, cat:"Snacks & Sucreries", portion:{name:"pot 200g",g:200} },
  { id:815, name:"Compote pomme (gourde)",     cal:44,  protein:0.3, carbs:11,  fat:0,   fiber:1.2,sugar:10, cat:"Snacks & Sucreries", portion:{name:"gourde 90g",g:90} },
  // -- PLATS COMPOSÉS -----------------------------------------------------
  { id:900, name:"Pizza margherita (part)",    cal:250, protein:10,  carbs:31,  fat:9,   fiber:2,  sugar:3,  cat:"Plats & Recettes", portion:{name:"part (150g)",g:150} },
  { id:901, name:"Burger maison",              cal:300, protein:18,  carbs:28,  fat:13,  fiber:2,  sugar:5,  cat:"Plats & Recettes", portion:{name:"burger",g:200} },
  { id:902, name:"Omelette 3 œufs",           cal:200, protein:18,  carbs:2,   fat:14,  fiber:0,  sugar:1,  cat:"Plats & Recettes", portion:{name:"omelette",g:180} },
  { id:903, name:"Crêpe nature",               cal:209, protein:6,   carbs:32,  fat:7,   fiber:1,  sugar:5,  cat:"Plats & Recettes", portion:{name:"crêpe",g:80} },
  { id:904, name:"Pancake maison",             cal:227, protein:6,   carbs:28,  fat:10,  fiber:1,  sugar:8,  cat:"Plats & Recettes", portion:{name:"pancake",g:70} },
  { id:905, name:"Sandwich jambon-beurre",     cal:290, protein:14,  carbs:35,  fat:10,  fiber:2,  sugar:3,  cat:"Plats & Recettes", portion:{name:"sandwich",g:170} },
  { id:906, name:"Wrap poulet-légumes",        cal:240, protein:16,  carbs:28,  fat:7,   fiber:3,  sugar:4,  cat:"Plats & Recettes", portion:{name:"wrap",g:200} },
  { id:907, name:"Riz cantonais maison",       cal:175, protein:6,   carbs:30,  fat:4,   fiber:1,  sugar:2,  cat:"Plats & Recettes" },
  { id:908, name:"Pâtes carbonara maison",     cal:265, protein:11,  carbs:30,  fat:12,  fiber:1,  sugar:1,  cat:"Plats & Recettes" },
  { id:909, name:"Pâtes bolognaise",           cal:180, protein:10,  carbs:28,  fat:4,   fiber:2,  sugar:4,  cat:"Plats & Recettes" },
  { id:910, name:"Steak-frites",               cal:270, protein:18,  carbs:22,  fat:11,  fiber:2,  sugar:0.5,cat:"Plats & Recettes", portion:{name:"assiette",g:350} },
  { id:911, name:"Poulet-riz-légumes",         cal:165, protein:18,  carbs:18,  fat:3,   fiber:2,  sugar:2,  cat:"Plats & Recettes", portion:{name:"assiette",g:350} },
  { id:912, name:"Soupe de légumes",           cal:45,  protein:2,   carbs:8,   fat:1,   fiber:2.5,sugar:4,  cat:"Plats & Recettes", portion:{name:"bol",g:300} },
  { id:913, name:"Quiche lorraine (part)",     cal:330, protein:11,  carbs:20,  fat:24,  fiber:1,  sugar:2,  cat:"Plats & Recettes", portion:{name:"part",g:150} },
  { id:914, name:"Taboulé maison",             cal:130, protein:3.5, carbs:22,  fat:4,   fiber:2,  sugar:3,  cat:"Plats & Recettes" },
  { id:915, name:"Gratin dauphinois",          cal:170, protein:4,   carbs:18,  fat:9,   fiber:1.5,sugar:2,  cat:"Plats & Recettes" },
  { id:916, name:"Raclette (assiette complète)",cal:620,protein:38,  carbs:25,  fat:42,  fiber:2,  sugar:2,  cat:"Plats & Recettes", portion:{name:"assiette",g:400} },
];

// -- Programme sport (jour par jour, 6 semaines) -----------------------------
const PROGRAM = [
  // SEMAINE 1
  { week:1, day:1, type:"Haut", name:"Séance A - Haut du corps", exercises:[
    { name:"Pompes sur genoux", sets:3, reps:"8-10", rest:90, cal:15, tip:"Dos droit, coudes à 45°" },
    { name:"Dips sur chaise", sets:3, reps:"8", rest:90, cal:12, tip:"Coudes près du corps" },
    { name:"Pompes larges", sets:2, reps:"8", rest:90, cal:10, tip:"Mains 2× largeur épaules" },
  ]},
  { week:1, day:2, type:"Repos", name:"Repos actif", exercises:[] },
  { week:1, day:3, type:"Bas", name:"Séance B - Bas du corps", exercises:[
    { name:"Squats poids du corps", sets:3, reps:"15", rest:60, cal:18, tip:"Genoux dans l'axe pieds" },
    { name:"Fentes alternées", sets:3, reps:"10/jambe", rest:60, cal:20, tip:"Genou avant à 90°" },
    { name:"Mollets sur marche", sets:3, reps:"20", rest:45, cal:9, tip:"Amplitude complète" },
  ]},
  { week:1, day:4, type:"Repos", name:"Repos actif", exercises:[] },
  { week:1, day:5, type:"Full", name:"Séance C - Full body léger", exercises:[
    { name:"Pompes classiques", sets:2, reps:"10", rest:75, cal:12, tip:"Corps planche parfaite" },
    { name:"Squats sautés", sets:2, reps:"10", rest:60, cal:20, tip:"Atterrissage silencieux" },
    { name:"Gainage planche", sets:3, reps:"20 sec", rest:45, cal:6, tip:"Ventre rentré, respire" },
  ]},
  { week:1, day:6, type:"Repos", name:"Repos total", exercises:[] },
  { week:1, day:7, type:"Repos", name:"Repos total", exercises:[] },
  // SEMAINE 2
  { week:2, day:1, type:"Haut", name:"Séance A - Haut du corps", exercises:[
    { name:"Pompes classiques", sets:3, reps:"10-12", rest:75, cal:18, tip:"Corps planche parfaite" },
    { name:"Dips sur chaise", sets:3, reps:"10", rest:90, cal:14, tip:"Coudes près du corps" },
    { name:"Pompes déclinées", sets:2, reps:"8", rest:90, cal:14, tip:"Pieds sur chaise" },
  ]},
  { week:2, day:2, type:"Repos", name:"Repos actif", exercises:[] },
  { week:2, day:3, type:"Bas", name:"Séance B - Bas du corps", exercises:[
    { name:"Squats sumo", sets:3, reps:"15", rest:60, cal:20, tip:"Pieds écartés, orteils dehors" },
    { name:"Fentes avant", sets:3, reps:"12/jambe", rest:60, cal:22, tip:"Garde le buste droit" },
    { name:"Pont fessier", sets:3, reps:"20", rest:45, cal:10, tip:"Serres les fessiers en haut" },
  ]},
  { week:2, day:4, type:"Repos", name:"Repos actif", exercises:[] },
  { week:2, day:5, type:"Full", name:"Séance C - Full body", exercises:[
    { name:"Pompes diamant", sets:3, reps:"8-10", rest:75, cal:14, tip:"Pouces qui se touchent" },
    { name:"Squats sautés", sets:3, reps:"10", rest:60, cal:25, tip:"Atterrissage silencieux" },
    { name:"Mountain climbers", sets:3, reps:"20", rest:45, cal:18, tip:"Genoux vers la poitrine" },
  ]},
  { week:2, day:6, type:"Repos", name:"Repos total", exercises:[] },
  { week:2, day:7, type:"Repos", name:"Repos total", exercises:[] },
  // SEMAINE 3
  { week:3, day:1, type:"Push", name:"Séance Push - Pectoraux/Épaules/Triceps", exercises:[
    { name:"Pompes classiques", sets:4, reps:"12", rest:75, cal:22, tip:"Corps planche parfaite" },
    { name:"Pike push-up", sets:3, reps:"10", rest:75, cal:16, tip:"Simule développé épaules" },
    { name:"Pompes déclinées", sets:3, reps:"10", rest:90, cal:18, tip:"Pieds sur chaise" },
    { name:"Dips sur chaise", sets:3, reps:"10-12", rest:90, cal:16, tip:"Triceps focus" },
  ]},
  { week:3, day:2, type:"Repos", name:"Repos actif", exercises:[] },
  { week:3, day:3, type:"Pull", name:"Séance Pull - Dos/Biceps", exercises:[
    { name:"Tractions australiennes", sets:4, reps:"10-12", rest:90, cal:28, tip:"Table basse ou barre basse" },
    { name:"Rowing sur chaise", sets:3, reps:"12", rest:75, cal:14, tip:"Coudes collés au corps" },
    { name:"Planche dorsale", sets:3, reps:"20 sec", rest:45, cal:6, tip:"Fessiers serrés" },
  ]},
  { week:3, day:4, type:"Jambes", name:"Séance Jambes", exercises:[
    { name:"Squats bulgares", sets:3, reps:"10/jambe", rest:90, cal:28, tip:"Pied arrière sur chaise" },
    { name:"Fentes sautées", sets:3, reps:"8/jambe", rest:75, cal:30, tip:"Explosivité max" },
    { name:"Mollets 1 jambe", sets:3, reps:"15/jambe", rest:45, cal:10, tip:"Amplitude complète" },
  ]},
  { week:3, day:5, type:"Full", name:"Séance Full body cardio", exercises:[
    { name:"Burpees", sets:3, reps:"8", rest:90, cal:35, tip:"Contrôle le mouvement" },
    { name:"Mountain climbers", sets:3, reps:"20", rest:45, cal:18, tip:"Cadence soutenue" },
    { name:"Gainage latéral", sets:3, reps:"20 sec/côté", rest:45, cal:8, tip:"Hanche ne touche pas" },
  ]},
  { week:3, day:6, type:"Repos", name:"Repos total", exercises:[] },
  { week:3, day:7, type:"Repos", name:"Repos total", exercises:[] },
  // SEMAINE 4
  { week:4, day:1, type:"Push", name:"Séance Push intensif", exercises:[
    { name:"Pompes explosives", sets:4, reps:"8", rest:90, cal:26, tip:"Mains décollent du sol" },
    { name:"Pompes déclinées", sets:4, reps:"12", rest:90, cal:22, tip:"Pieds haut sur chaise" },
    { name:"Pike push-up", sets:3, reps:"12", rest:75, cal:18, tip:"Amplitude max" },
    { name:"Pompes diamant", sets:3, reps:"10", rest:75, cal:16, tip:"Triceps complet" },
  ]},
  { week:4, day:2, type:"Repos", name:"Repos actif", exercises:[] },
  { week:4, day:3, type:"Pull", name:"Séance Pull intensif", exercises:[
    { name:"Tractions australiennes", sets:5, reps:"12", rest:90, cal:34, tip:"Serrez les omoplates" },
    { name:"Isométrie porte (dos)", sets:3, reps:"20 sec", rest:60, cal:10, tip:"Poignée de porte, tirez" },
    { name:"Superman", sets:3, reps:"15", rest:45, cal:8, tip:"Maintiens 1 sec en haut" },
  ]},
  { week:4, day:4, type:"Jambes", name:"Séance Jambes intensif", exercises:[
    { name:"Pistol squat assisté", sets:3, reps:"8/jambe", rest:90, cal:30, tip:"Tenez un montant" },
    { name:"Squats sautés (séries)", sets:4, reps:"12", rest:60, cal:40, tip:"Atterrissage souple" },
    { name:"Nordic curl partiel", sets:3, reps:"5-6", rest:120, cal:20, tip:"Ischio-jambiers max" },
  ]},
  { week:4, day:5, type:"Full", name:"Séance décharge", exercises:[
    { name:"Pompes classiques", sets:3, reps:"10", rest:75, cal:14, tip:"Technique parfaite" },
    { name:"Squats poids du corps", sets:3, reps:"15", rest:60, cal:18, tip:"Descente lente (3 sec)" },
    { name:"Gainage planche", sets:3, reps:"30 sec", rest:45, cal:9, tip:"Progression +10 sec" },
  ]},
  { week:4, day:6, type:"Repos", name:"Repos total", exercises:[] },
  { week:4, day:7, type:"Repos", name:"Repos total", exercises:[] },
];

// -- Helpers -----------------------------------------------------------------
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate  = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
const fmtShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
const KEY = "prisedepoid_v1";
const loadDB = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saveDB = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const MEAL_SLOTS = [
  { id:"breakfast", label:"Petit-déjeuner", icon:"", color:"#f59e0b", time:"07:30" },
  { id:"lunch",     label:"Déjeuner",       icon:"", color:"#10b981", time:"12:30" },
  { id:"snack",     label:"Goûter",         icon:"", color:"#8b5cf6", time:"16:30" },
  { id:"dinner",    label:"Dîner",          icon:"", color:"#ef4444", time:"19:30" },
];

const MACROS = [
  { key:"cal",     label:"Calories", unit:"kcal", color:"#f97316", target: PROFILE.dailyCal },
  { key:"protein", label:"Protéines", unit:"g",   color:"#ef4444", target: PROFILE.dailyProtein },
  { key:"carbs",   label:"Glucides",  unit:"g",   color:"#f59e0b", target: PROFILE.dailyCarbs },
  { key:"fat",     label:"Lipides",   unit:"g",   color:"#8b5cf6", target: PROFILE.dailyFat },
  { key:"fiber",   label:"Fibres",    unit:"g",   color:"#10b981", target: PROFILE.dailyFiber },
  { key:"sugar",   label:"Sucres",    unit:"g",   color:"#ec4899", target: PROFILE.dailySugar },
];

const zeroMacros = () => ({ cal:0, protein:0, carbs:0, fat:0, fiber:0, sugar:0 });

const calcFoodMacros = (food, grams) => ({
  cal:     Math.round(food.cal     * grams / 100),
  protein: Math.round(food.protein * grams / 100 * 10) / 10,
  carbs:   Math.round(food.carbs   * grams / 100 * 10) / 10,
  fat:     Math.round(food.fat     * grams / 100 * 10) / 10,
  fiber:   Math.round(food.fiber   * grams / 100 * 10) / 10,
  sugar:   Math.round(food.sugar   * grams / 100 * 10) / 10,
});

const sumMacros = (items) => items.reduce((acc, item) => {
  Object.keys(acc).forEach(k => acc[k] = Math.round((acc[k] + (item[k]||0)) * 10)/10);
  return acc;
}, zeroMacros());

// ===========================================================================
export default function App() {
  const [tab, setTab]   = useState("journal");
  const [db,  setDb]    = useState(loadDB);
  const [date, setDate] = useState(todayStr());

  // Journal states
  const [openMeal, setOpenMeal]   = useState(null);      // which meal slot is expanded
  const [search, setSearch]       = useState("");
  const [searchCat, setSearchCat] = useState("Tous");
  const [qtyMode, setQtyMode]     = useState("g");        // "g" | "portion"
  const [qtyVal, setQtyVal]       = useState("100");
  const [selectedFood, setSelectedFood] = useState(null);
  const [manualEntry, setManualEntry]   = useState(false);
  const [manual, setManual] = useState({ name:"", cal:"", protein:"", carbs:"", fat:"", fiber:"", sugar:"" });
  const [weightInput, setWeightInput]   = useState("");
  const [sleepInput, setSleepInput]     = useState("");

  // Program state
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDayInWeek, setCurrentDayInWeek] = useState(1);
  const [loggedSessions, setLoggedSessions] = useState({});

  useEffect(() => saveDB(db), [db]);

  const day = db[date] || { meals:{ breakfast:[], lunch:[], snack:[], dinner:[] }, weight:null, sleep:null, exercises:[] };

  const ensureDay = (d) => ({
    meals:{ breakfast:[], lunch:[], snack:[], dinner:[] },
    weight:null, sleep:null, exercises:[], ...d
  });

  const updateDay = (patch) =>
    setDb(p => ({ ...p, [date]: { ...ensureDay(p[date]), ...patch } }));

  // Totals
  const dayMealsFlat = Object.values(day.meals||{}).flat();
  const dayTotals = sumMacros(dayMealsFlat);
  const exCalBurned = (day.exercises||[]).reduce((s,e)=>s+(e.cal||0),0);
  const adjustedCal = PROFILE.dailyCal + exCalBurned;

  // Add food to meal
  const addFood = (mealId) => {
    if (!selectedFood) return;
    const grams = qtyMode === "g"
      ? parseFloat(qtyVal) || 100
      : selectedFood.portion ? (parseFloat(qtyVal)||1) * selectedFood.portion.g : parseFloat(qtyVal)||100;
    const macros = calcFoodMacros(selectedFood, grams);
    const entry = {
      id: Date.now(), name: selectedFood.name,
      grams, displayQty: qtyMode === "g" ? `${grams}g`
        : `${qtyVal} ${selectedFood.portion?.name || "portion"}`,
      ...macros
    };
    const meals = { ...(day.meals||{}) };
    meals[mealId] = [...(meals[mealId]||[]), entry];
    updateDay({ meals });
    setSelectedFood(null); setQtyVal("100"); setSearch("");
  };

  const addManual = (mealId) => {
    const entry = {
      id: Date.now(),
      name: manual.name || "Aliment personnalisé",
      grams: 100, displayQty: "1 portion",
      cal: parseFloat(manual.cal)||0, protein: parseFloat(manual.protein)||0,
      carbs: parseFloat(manual.carbs)||0, fat: parseFloat(manual.fat)||0,
      fiber: parseFloat(manual.fiber)||0, sugar: parseFloat(manual.sugar)||0,
    };
    const meals = { ...(day.meals||{}) };
    meals[mealId] = [...(meals[mealId]||[]), entry];
    updateDay({ meals });
    setManual({ name:"", cal:"", protein:"", carbs:"", fat:"", fiber:"", sugar:"" });
    setManualEntry(false);
  };

  const removeItem = (mealId, itemId) => {
    const meals = { ...(day.meals||{}) };
    meals[mealId] = (meals[mealId]||[]).filter(i=>i.id!==itemId);
    updateDay({ meals });
  };

  // Filtered foods
  const cats = ["Tous", ...Array.from(new Set(FOOD_DB.map(f=>f.cat)))];
  const filtered = FOOD_DB.filter(f => {
    const matchCat = searchCat === "Tous" || f.cat === searchCat;
    const matchQ   = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  }).slice(0, 30);

  // Program day
  const programDay = PROGRAM.find(p => p.week === currentWeek && p.day === currentDayInWeek);
  const logSession = () => {
    if (!programDay || !programDay.exercises.length) return;
    const cal = programDay.exercises.reduce((s,e)=>s+e.cal*e.sets,0);
    const exercises = [...(day.exercises||[]), { name:programDay.name, cal, week:currentWeek, day:currentDayInWeek }];
    updateDay({ exercises });
    // advance
    if (currentDayInWeek < 7) setCurrentDayInWeek(d=>d+1);
    else if (currentWeek < 4) { setCurrentWeek(w=>w+1); setCurrentDayInWeek(1); }
  };

  // Stats
  const allDates = Object.keys(db).sort();
  const weightPoints = allDates.map(d=>({ d, w:db[d]?.weight })).filter(x=>x.w);
  const last14 = Array.from({length:14},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-13+i);
    return d.toISOString().slice(0,10);
  });

  return (
    <div style={S.root}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#050510;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#f97316;border-radius:2px;}
        input,select,textarea{outline:none;font-family:inherit;}
        button{font-family:inherit;cursor:pointer;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* -- HEADER ------------------------------------------------------- */}
      <header style={S.header}>
        <div>
          <div style={S.logo}> <span style={{color:"#f97316",fontWeight:900,letterSpacing:2}}>PRISE DE POID</span> </div>
          <div style={S.headerSub}>60 kg -> 70 kg . 6 mois . {adjustedCal} kcal/jour</div>
        </div>
        <div style={S.headerStats}>
          <MacroRing value={dayTotals.cal} target={adjustedCal} color="#f97316" label="kcal" />
          <MacroRing value={dayTotals.protein} target={PROFILE.dailyProtein} color="#ef4444" label="prot." />
        </div>
      </header>

      {/* -- NAV ---------------------------------------------------------- */}
      <nav style={S.nav}>
        {[
          {id:"journal",icon:"",label:"Journal"},
          {id:"program",icon:"",label:"Programme"},
          {id:"stats",  icon:"",label:"Stats"},
          {id:"tips",   icon:"",label:"Conseils"},
        ].map(t=>(
          <button key={t.id} style={{...S.navBtn,...(tab===t.id?S.navActive:{})}} onClick={()=>setTab(t.id)}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:.5}}>{t.label}</span>
          </button>
        ))}
      </nav>

      <main style={S.main}>

        {/* ==================== JOURNAL ================================ */}
        {tab==="journal" && (
          <div style={S.page}>
            {/* Date nav */}
            <div style={S.dateRow}>
              <button style={S.dateArrow} onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d.toISOString().slice(0,10));}}>&lt;</button>
              <div style={{textAlign:"center"}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={S.dateInput}/>
                <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{fmtDate(date)}</div>
              </div>
              <button style={S.dateArrow} onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d.toISOString().slice(0,10));}}>&gt;</button>
            </div>

            {/* Sommeil + poids */}
            <div style={S.rowCards}>
              {/* Sommeil */}
              <div style={{...S.miniCard,flex:1}}>
                <div style={S.miniCardLabel}> Sommeil</div>
                {day.sleep ? (
                  <div style={{...S.miniCardVal,color:day.sleep>=7?"#4ade80":"#f87171"}}>
                    {day.sleep}h <button style={S.resetBtn} onClick={()=>updateDay({sleep:null})}>X</button>
                  </div>
                ) : (
                  <div style={S.inlineInput}>
                    <input type="number" min="3" max="12" step=".5" placeholder="7.5" value={sleepInput}
                      onChange={e=>setSleepInput(e.target.value)} style={S.tinyInput}/>
                    <span style={{color:"#6b7280",fontSize:12}}>h</span>
                    <button style={S.okBtn} onClick={()=>{if(sleepInput){updateDay({sleep:parseFloat(sleepInput)});setSleepInput("");}}}>OK</button>
                  </div>
                )}
              </div>
              {/* Poids */}
              <div style={{...S.miniCard,flex:1}}>
                <div style={S.miniCardLabel}> Poids</div>
                {day.weight ? (
                  <div style={{...S.miniCardVal,color:"#f97316"}}>
                    {day.weight} kg <button style={S.resetBtn} onClick={()=>updateDay({weight:null})}>X</button>
                  </div>
                ) : (
                  <div style={S.inlineInput}>
                    <input type="number" step=".1" placeholder="60.0" value={weightInput}
                      onChange={e=>setWeightInput(e.target.value)} style={S.tinyInput}/>
                    <span style={{color:"#6b7280",fontSize:12}}>kg</span>
                    <button style={S.okBtn} onClick={()=>{if(weightInput){updateDay({weight:parseFloat(weightInput)});setWeightInput("");}}}>OK</button>
                  </div>
                )}
              </div>
            </div>

            {/* Résumé macros du jour */}
            <div style={S.macroSummaryCard}>
              <div style={S.macroSummaryTitle}>
                Résumé du jour
                {exCalBurned>0&&<span style={S.exBadge}> +{exCalBurned} kcal sport</span>}
              </div>
              <div style={S.macroGrid}>
                {MACROS.map(m=>{
                  const val=dayTotals[m.key]||0;
                  const pct=Math.min(100,Math.round(val/m.target*100));
                  return (
                    <div key={m.key} style={S.macroCell}>
                      <div style={{...S.macroBar,background:"#1f2937"}}>
                        <div style={{...S.macroFill,width:`${pct}%`,background:m.color}}/>
                      </div>
                      <div style={S.macroLabel}>{m.label}</div>
                      <div style={{...S.macroVal,color:m.color}}>{val}<span style={S.macroUnit}>{m.unit}</span></div>
                      <div style={S.macroTarget}>/ {m.key==="cal"?adjustedCal:m.target}{m.unit}</div>
                    </div>
                  );
                })}
              </div>
              {/* Calories restantes */}
              <div style={{...S.remainBar,background: adjustedCal-dayTotals.cal>0?"#1a0a0020":"#0a1a0a20",borderColor: adjustedCal-dayTotals.cal>0?"#f97316":"#10b981"}}>
                {adjustedCal-dayTotals.cal>0
                  ? <span>Il te reste <strong style={{color:"#f97316"}}>{adjustedCal-dayTotals.cal} kcal</strong> à manger aujourd'hui</span>
                  : <span style={{color:"#4ade80"}}> Objectif calorique atteint !</span>
                }
              </div>
            </div>

            {/* Repas */}
            {MEAL_SLOTS.map(slot=>{
              const items = (day.meals||{})[slot.id]||[];
              const slotTotal = sumMacros(items);
              const isOpen = openMeal===slot.id;
              return (
                <div key={slot.id} style={{...S.mealCard,borderLeft:`3px solid ${slot.color}`}}>
                  {/* Header */}
                  <button style={S.mealHeader} onClick={()=>setOpenMeal(isOpen?null:slot.id)}>
                    <span style={{fontSize:22}}>{slot.icon}</span>
                    <div style={{flex:1,textAlign:"left"}}>
                      <div style={S.mealName}>{slot.label}</div>
                      <div style={S.mealTime}>{slot.time}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{...S.mealCal,color:slot.color}}>{slotTotal.cal} kcal</div>
                      <div style={S.mealMacroRow}>
                        <span style={{color:"#ef4444"}}>{slotTotal.protein}g prot</span>
                        <span style={{color:"#f59e0b",marginLeft:6}}>{slotTotal.carbs}g gluc</span>
                      </div>
                    </div>
                    <span style={{color:"#6b7280",marginLeft:8,fontSize:18}}>{isOpen?"^":"v"}</span>
                  </button>

                  {/* Items list */}
                  {items.length>0&&(
                    <div style={S.itemsList}>
                      <table style={S.itemsTable}>
                        <thead>
                          <tr style={{background:"#0a0a1a"}}>
                            <th style={S.ith}>Aliment</th>
                            <th style={S.ith}>Qté</th>
                            <th style={{...S.ith,color:"#f97316"}}>kcal</th>
                            <th style={{...S.ith,color:"#ef4444"}}>Prot</th>
                            <th style={{...S.ith,color:"#f59e0b"}}>Gluc</th>
                            <th style={{...S.ith,color:"#8b5cf6"}}>Lip</th>
                            <th style={{...S.ith,color:"#10b981"}}>Fib</th>
                            <th style={S.ith}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item,i)=>(
                            <tr key={item.id} style={{background:i%2===0?"#111827":"#0f172a"}}>
                              <td style={S.itd}>{item.name}</td>
                              <td style={{...S.itd,color:"#9ca3af",fontSize:10}}>{item.displayQty}</td>
                              <td style={{...S.itd,color:"#f97316",fontWeight:700}}>{item.cal}</td>
                              <td style={{...S.itd,color:"#ef4444"}}>{item.protein}g</td>
                              <td style={{...S.itd,color:"#f59e0b"}}>{item.carbs}g</td>
                              <td style={{...S.itd,color:"#8b5cf6"}}>{item.fat}g</td>
                              <td style={{...S.itd,color:"#10b981"}}>{item.fiber}g</td>
                              <td style={S.itd}>
                                <button style={S.removeBtn} onClick={()=>removeItem(slot.id,item.id)}>X</button>
                              </td>
                            </tr>
                          ))}
                          {/* Total row */}
                          <tr style={{background:"#1e293b",fontWeight:700}}>
                            <td style={{...S.itd,fontWeight:700}}>Total</td>
                            <td style={S.itd}></td>
                            <td style={{...S.itd,color:"#f97316",fontWeight:700}}>{slotTotal.cal}</td>
                            <td style={{...S.itd,color:"#ef4444",fontWeight:700}}>{slotTotal.protein}g</td>
                            <td style={{...S.itd,color:"#f59e0b",fontWeight:700}}>{slotTotal.carbs}g</td>
                            <td style={{...S.itd,color:"#8b5cf6",fontWeight:700}}>{slotTotal.fat}g</td>
                            <td style={{...S.itd,color:"#10b981",fontWeight:700}}>{slotTotal.fiber}g</td>
                            <td style={S.itd}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Expanded: food search + add */}
                  {isOpen&&(
                    <div style={S.addPanel}>
                      {/* Toggle manual / DB */}
                      <div style={S.addToggle}>
                        <button style={{...S.toggleBtn,background:!manualEntry?"#f97316":"#1f2937",color:!manualEntry?"#fff":"#9ca3af"}}
                          onClick={()=>setManualEntry(false)}> Base de données</button>
                        <button style={{...S.toggleBtn,background:manualEntry?"#f97316":"#1f2937",color:manualEntry?"#fff":"#9ca3af"}}
                          onClick={()=>setManualEntry(true)}> Saisie manuelle</button>
                      </div>

                      {!manualEntry ? (
                        <>
                          {/* Search */}
                          <input placeholder=" Rechercher un aliment..." value={search}
                            onChange={e=>{setSearch(e.target.value);setSelectedFood(null);}}
                            style={S.searchInput}/>
                          {/* Category filter */}
                          <div style={S.catRow}>
                            {cats.map(c=>(
                              <button key={c} style={{...S.catBtn,background:searchCat===c?"#f97316":"#1f2937",color:searchCat===c?"#fff":"#9ca3af"}}
                                onClick={()=>setSearchCat(c)}>{c}</button>
                            ))}
                          </div>
                          {/* Food list */}
                          <div style={S.foodList}>
                            {filtered.map(f=>(
                              <button key={f.id} style={{...S.foodItem,background:selectedFood?.id===f.id?"#1e3a2a":"#111827",border:`1px solid ${selectedFood?.id===f.id?"#10b981":"#1f2937"}`}}
                                onClick={()=>{setSelectedFood(f);setQtyMode(f.portion?"portion":"g");setQtyVal(f.portion?"1":"100");}}>
                                <div style={{flex:1,textAlign:"left"}}>
                                  <div style={{fontSize:12,fontWeight:600,color:selectedFood?.id===f.id?"#4ade80":"#e2e8f0"}}>{f.name}</div>
                                  <div style={{fontSize:10,color:"#6b7280"}}>{f.cat}</div>
                                </div>
                                <div style={{textAlign:"right",fontSize:11}}>
                                  <div style={{color:"#f97316",fontWeight:700}}>{f.cal} kcal</div>
                                  <div style={{color:"#6b7280"}}>/ 100g</div>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Qty + add */}
                          {selectedFood&&(
                            <div style={S.qtyPanel}>
                              <div style={S.qtyFoodName}>OK {selectedFood.name}</div>
                              <div style={S.qtyRow}>
                                {/* Mode toggle */}
                                <div style={S.qtyModeToggle}>
                                  <button style={{...S.qtyModeBtn,background:qtyMode==="g"?"#3b82f6":"#1f2937"}}
                                    onClick={()=>{setQtyMode("g");setQtyVal("100");}}>Grammes</button>
                                  {selectedFood.portion&&(
                                    <button style={{...S.qtyModeBtn,background:qtyMode==="portion"?"#3b82f6":"#1f2937"}}
                                      onClick={()=>{setQtyMode("portion");setQtyVal("1");}}>
                                      Portion ({selectedFood.portion.name} = {selectedFood.portion.g}g)
                                    </button>
                                  )}
                                </div>
                                <input type="number" min="1" value={qtyVal} onChange={e=>setQtyVal(e.target.value)}
                                  style={{...S.tinyInput,width:70,textAlign:"center"}}/>
                                <span style={{color:"#6b7280",fontSize:12}}>{qtyMode==="g"?"g":selectedFood.portion?.name||"portion"}</span>
                              </div>
                              {/* Preview */}
                              {(()=>{
                                const g=qtyMode==="g"?parseFloat(qtyVal)||100:(parseFloat(qtyVal)||1)*(selectedFood.portion?.g||100);
                                const m=calcFoodMacros(selectedFood,g);
                                return (
                                  <div style={S.qtyPreview}>
                                    <span style={{color:"#f97316",fontWeight:700}}>{m.cal} kcal</span>
                                    <span style={{color:"#ef4444",marginLeft:8}}>{m.protein}g prot</span>
                                    <span style={{color:"#f59e0b",marginLeft:8}}>{m.carbs}g gluc</span>
                                    <span style={{color:"#8b5cf6",marginLeft:8}}>{m.fat}g lip</span>
                                  </div>
                                );
                              })()}
                              <button style={S.addBtn} onClick={()=>addFood(slot.id)}>+ Ajouter à {slot.label}</button>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Manual entry */
                        <div style={S.manualPanel}>
                          <div style={S.manualGrid}>
                            {[
                              {key:"name",   label:"Nom",       type:"text",   placeholder:"Ex: Steak maison"},
                              {key:"cal",    label:"Calories",  type:"number", placeholder:"kcal"},
                              {key:"protein",label:"Protéines", type:"number", placeholder:"g"},
                              {key:"carbs",  label:"Glucides",  type:"number", placeholder:"g"},
                              {key:"fat",    label:"Lipides",   type:"number", placeholder:"g"},
                              {key:"fiber",  label:"Fibres",    type:"number", placeholder:"g"},
                              {key:"sugar",  label:"Sucres",    type:"number", placeholder:"g"},
                            ].map(f=>(
                              <div key={f.key} style={S.manualField}>
                                <label style={S.manualLabel}>{f.label}</label>
                                <input type={f.type} placeholder={f.placeholder} value={manual[f.key]}
                                  onChange={e=>setManual(p=>({...p,[f.key]:e.target.value}))}
                                  style={S.manualInput}/>
                              </div>
                            ))}
                          </div>
                          <button style={S.addBtn} onClick={()=>addManual(slot.id)}>+ Ajouter à {slot.label}</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sport loggué aujourd'hui */}
            {(day.exercises||[]).length>0&&(
              <div style={S.exCard}>
                <div style={S.exCardTitle}> Sport aujourd'hui - {exCalBurned} kcal brûlées</div>
                {(day.exercises||[]).map((e,i)=>(
                  <div key={i} style={S.exRow}>
                    <span style={{fontSize:13}}>{e.name}</span>
                    <span style={{color:"#ef4444",fontWeight:700,fontSize:13}}>-{e.cal} kcal</span>
                    <button style={S.removeBtn} onClick={()=>{
                      const exercises=(day.exercises||[]).filter((_,idx)=>idx!==i);
                      updateDay({exercises});
                    }}>X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== PROGRAMME =============================== */}
        {tab==="program"&&(
          <div style={S.page}>
            <div style={S.progHeader}>
              <div style={S.progTitle}>Programme 4 semaines . 100% maison</div>
              <div style={S.progSub}>Poids du corps . Débutant vers Intermédiaire</div>
            </div>

            {/* Week selector */}
            <div style={S.weekGrid}>
              {[1,2,3,4].map(w=>(
                <button key={w} style={{...S.weekBtn,background:currentWeek===w?"#f97316":"#1f2937",color:currentWeek===w?"#fff":"#9ca3af"}}
                  onClick={()=>{setCurrentWeek(w);setCurrentDayInWeek(1);}}>
                  Semaine {w}
                </button>
              ))}
            </div>

            {/* Day selector */}
            <div style={S.dayGrid}>
              {["L","M","M","J","V","S","D"].map((d,i)=>{
                const dayNum=i+1;
                const prog=PROGRAM.find(p=>p.week===currentWeek&&p.day===dayNum);
                const isRest=prog?.type==="Repos";
                const isSelected=currentDayInWeek===dayNum;
                return (
                  <button key={i} style={{...S.dayBtn,
                    background:isSelected?"#f97316":isRest?"#111827":"#1e293b",
                    color:isSelected?"#fff":isRest?"#374151":"#e2e8f0",
                    border:`1px solid ${isSelected?"#f97316":isRest?"#1f2937":"#334155"}`}}
                    onClick={()=>setCurrentDayInWeek(dayNum)}>
                    <div style={{fontWeight:700,fontSize:13}}>{d}</div>
                    <div style={{fontSize:9,marginTop:2}}>{isRest?"Repos":prog?.type||""}</div>
                  </button>
                );
              })}
            </div>

            {/* Session detail */}
            {programDay&&(
              <div style={S.sessionCard}>
                <div style={S.sessionHead}>
                  <div>
                    <div style={S.sessionName}>{programDay.name}</div>
                    <div style={S.sessionSub}>Semaine {programDay.week} . Jour {programDay.day}</div>
                  </div>
                  {programDay.exercises.length>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{color:"#ef4444",fontWeight:700}}>~{programDay.exercises.reduce((s,e)=>s+e.cal*e.sets,0)} kcal</div>
                      <div style={{fontSize:10,color:"#6b7280"}}>brûlées</div>
                    </div>
                  )}
                </div>

                {programDay.exercises.length===0?(
                  <div style={S.restCard}>
                    <div style={{fontSize:40}}></div>
                    <div style={{fontSize:16,fontWeight:700,marginTop:8}}>Jour de repos</div>
                    <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>La croissance musculaire se fait pendant le repos. Mange bien et dors 8h.</div>
                  </div>
                ):(
                  <>
                    <table style={S.exTable}>
                      <thead>
                        <tr style={{background:"#0a0a1a"}}>
                          <th style={S.exTh}>Exercice</th>
                          <th style={S.exTh}>Séries</th>
                          <th style={S.exTh}>Reps</th>
                          <th style={S.exTh}>Repos</th>
                          <th style={S.exTh}>kcal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programDay.exercises.map((ex,i)=>(
                          <tr key={i} style={{background:i%2===0?"#111827":"#0f172a"}}>
                            <td style={S.exTd}>
                              <div style={{fontWeight:600,fontSize:12}}>{ex.name}</div>
                              <div style={{fontSize:10,color:"#f59e0b"}}> {ex.tip}</div>
                            </td>
                            <td style={{...S.exTd,textAlign:"center",color:"#f97316",fontWeight:700}}>{ex.sets}</td>
                            <td style={{...S.exTd,textAlign:"center",fontSize:12}}>{ex.reps}</td>
                            <td style={{...S.exTd,textAlign:"center",color:"#6b7280",fontSize:12}}>{ex.rest}s</td>
                            <td style={{...S.exTd,textAlign:"center",color:"#ef4444",fontWeight:700}}>~{ex.cal*ex.sets}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{padding:"12px 14px"}}>
                      <button style={S.logBtn} onClick={logSession}>
                        OK Logger cette séance (+{programDay.exercises.reduce((s,e)=>s+e.cal*e.sets,0)} kcal sur le journal)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== STATS ==================================== */}
        {tab==="stats"&&(
          <div style={S.page}>
            {/* Weight chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}> Évolution du poids</div>
              <div style={S.chartSubtitle}>{PROFILE.startWeight} kg -> objectif {PROFILE.targetWeight} kg</div>
              {weightPoints.length<2?(
                <div style={S.chartEmpty}>Enregistre ton poids chaque matin pour voir le graphique apparaître ici.</div>
              ):(()=>{
                const vals=weightPoints.map(x=>x.w);
                const minV=Math.min(...vals,PROFILE.startWeight)-0.5;
                const maxV=Math.max(...vals,PROFILE.targetWeight)+0.5;
                const range=maxV-minV;
                const W=360,H=140;
                const px=i=>(i/(weightPoints.length-1))*W;
                const py=v=>H-((v-minV)/range)*H;
                const line=weightPoints.map((x,i)=>`${i===0?"M":"L"}${px(i)},${py(x.w)}`).join(" ");
                const area=line+` L${W},${H} L0,${H} Z`;
                const targetY=py(PROFILE.targetWeight);
                const startY=py(PROFILE.startWeight);
                return (
                  <svg width="100%" viewBox={`0 0 ${W} ${H+28}`} style={{overflow:"visible",marginTop:8}}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity=".35"/>
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[0,.25,.5,.75,1].map(f=>(
                      <line key={f} x1="0" x2={W} y1={f*H} y2={f*H} stroke="#1f2937" strokeWidth="1"/>
                    ))}
                    <line x1="0" x2={W} y1={targetY} y2={targetY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="6,3"/>
                    <text x="4" y={targetY-4} fill="#10b981" fontSize="9">Objectif {PROFILE.targetWeight}kg</text>
                    <line x1="0" x2={W} y1={startY} y2={startY} stroke="#f97316" strokeWidth="1" strokeDasharray="4,3" opacity=".4"/>
                    <path d={area} fill="url(#ag)"/>
                    <path d={line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round"/>
                    {weightPoints.map((x,i)=>(
                      <g key={i}>
                        <circle cx={px(i)} cy={py(x.w)} r="4" fill="#f97316" stroke="#050510" strokeWidth="2"/>
                        <text x={px(i)} y={py(x.w)-8} fill="#f97316" fontSize="9" textAnchor="middle">{x.w}kg</text>
                        {i%Math.max(1,Math.floor(weightPoints.length/7))===0&&(
                          <text x={px(i)} y={H+14} fill="#6b7280" fontSize="8" textAnchor="middle">{fmtShort(x.d)}</text>
                        )}
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>

            {/* Calories chart - last 14 days */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}> Calories - 14 derniers jours</div>
              {(() => {
                const calData = last14.map(d => {
                  const meals = db[d]?.meals||{};
                  const items = Object.values(meals).flat();
                  const total = sumMacros(items).cal;
                  return { d, cal: total };
                });
                const maxC = Math.max(...calData.map(x=>x.cal), PROFILE.dailyCal, 100);
                return (
                  <svg width="100%" viewBox="0 0 360 130" style={{overflow:"visible",marginTop:12}}>
                    <line x1="0" x2="360" y1={100-(PROFILE.dailyCal/maxC)*100} y2={100-(PROFILE.dailyCal/maxC)*100}
                      stroke="#f97316" strokeWidth="1.2" strokeDasharray="5,3"/>
                    <text x="2" y={100-(PROFILE.dailyCal/maxC)*100-3} fill="#f97316" fontSize="8">Objectif {PROFILE.dailyCal}</text>
                    {calData.map((x,i)=>{
                      const barW=360/14-2;
                      const bx=i*(360/14)+1;
                      const h=x.cal?Math.max(3,(x.cal/maxC)*100):0;
                      const col=x.cal>=PROFILE.dailyCal*0.9?"#10b981":x.cal>0?"#f59e0b":"#1f2937";
                      return (
                        <g key={x.d}>
                          <rect x={bx} y={100-h} width={barW} height={h} fill={col} rx="2"/>
                          {x.cal>0&&<text x={bx+barW/2} y={100-h-3} fill={col} fontSize="7" textAnchor="middle">{x.cal}</text>}
                          {i%2===0&&<text x={bx+barW/2} y={118} fill="#6b7280" fontSize="7" textAnchor="middle">{fmtShort(x.d).slice(0,5)}</text>}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            {/* Tableau détaillé */}
            <div style={S.tableCard}>
              <div style={S.chartTitle}> Tableau détaillé</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:"#111827"}}>
                      {["Date","Repas","kcal","Prot","Gluc","Lip","Fib","Poids","Sommeil"].map(h=>(
                        <th key={h} style={{padding:"7px 6px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...allDates].reverse().slice(0,20).map(d=>{
                      const entry=db[d]||{};
                      const items=Object.values(entry.meals||{}).flat();
                      const t=sumMacros(items);
                      const mealCount=items.length;
                      return (
                        <tr key={d} style={{background:d===date?"#1e293b":"transparent",cursor:"pointer",borderBottom:"1px solid #111827"}}
                          onClick={()=>{setDate(d);setTab("journal");}}>
                          <td style={{padding:"7px 6px",fontSize:11,whiteSpace:"nowrap"}}>{fmtShort(d)}</td>
                          <td style={{padding:"7px 6px",color:"#9ca3af"}}>{mealCount} alim.</td>
                          <td style={{padding:"7px 6px",color:t.cal>=PROFILE.dailyCal*0.9?"#4ade80":"#f87171",fontWeight:700}}>{t.cal||"-"}</td>
                          <td style={{padding:"7px 6px",color:"#ef4444"}}>{t.protein||"-"}g</td>
                          <td style={{padding:"7px 6px",color:"#f59e0b"}}>{t.carbs||"-"}g</td>
                          <td style={{padding:"7px 6px",color:"#8b5cf6"}}>{t.fat||"-"}g</td>
                          <td style={{padding:"7px 6px",color:"#10b981"}}>{t.fiber||"-"}g</td>
                          <td style={{padding:"7px 6px",color:"#f97316"}}>{entry.weight?`${entry.weight}kg`:"-"}</td>
                          <td style={{padding:"7px 6px",color:entry.sleep>=7?"#4ade80":"#f87171"}}>{entry.sleep?`${entry.sleep}h`:"-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CONSEILS ================================ */}
        {tab==="tips"&&(
          <div style={S.page}>
            {[
              { icon:"", title:"Ton profil ectomorphe", color:"#f97316", items:[
                "Tu brûles plus de calories au repos que la moyenne - c'est génétique, pas une fatalité.",
                "Ton corps résiste à la prise de poids -> il faut être agressif sur les calories CHAQUE jour.",
                "Tu prendras peu de gras, surtout du muscle si tu t'alimentes et t'entraînes correctement.",
                "La régularité est clé : une journée à 2 repas peut effacer 2 jours de progrès.",
              ]},
              { icon:"", title:"Passer de 2 à 4 repas (priorité absolue)", color:"#10b981", items:[
                "Tu faisais 2 repas/jour -> c'est la principale raison pour laquelle tu ne grossissais pas.",
                "Programme des alarmes pour chaque repas : 7h30, 12h30, 16h30, 19h30.",
                "Si tu n'as pas faim : remplace par un shake (lait entier 300ml + banane + 50g avoine + beurre de cacahuète = 650 kcal en 2 min).",
                "Ne saute jamais le petit-déjeuner : le corps est en mode catabolisme (dégradation) après 8h de jeûne.",
              ]},
              { icon:"", title:"Atteindre 3400 kcal avec 15-40€/semaine", color:"#3b82f6", items:[
                "Riz + poulet + œufs = la sainte trinité budget. Achète en grande quantité.",
                "Beurre de cacahuète : 600 kcal pour ~1€, protéines + graisses saines. Mange-en partout.",
                "Lait entier : 2× plus calorique que le demi-écrémé, même prix. Vise 500ml/jour.",
                "Avoine (1kg ~3€) : 389 kcal/100g + protéines. En 3 min au micro-ondes.",
                "Viande hachée 15% : 3× moins chère que le filet, plus calorique, autant de protéines.",
                "Bananes : 89 kcal pièce, ~0,20€. Idéal avant/après sport et au goûter.",
              ]},
              { icon:"", title:"Sport maison sans matériel", color:"#8b5cf6", items:[
                "Priorité aux exercices composés (pompes, squats, dips) sur des séries de 8-12 reps.",
                "Évite le cardio long (footing >20 min) : tu brûles les calories accumulées laborieusement.",
                "Repose 48h entre deux séances du même groupe musculaire - la croissance se fait au repos.",
                "Mange dans les 30 min après la séance : œufs + pain, ou yaourt grec + banane.",
                "Dors 8h minimum : l'hormone de croissance (GH) est sécrétée à 70% pendant le sommeil profond.",
              ]},
              { icon:"", title:"Sommeil irrégulier -> à corriger en priorité", color:"#ec4899", items:[
                "Sans 7-8h de sommeil, ton corps sécrète du cortisol qui détruit le muscle. C'est anti-masse.",
                "Couche-toi et lève-toi à heures fixes même le weekend (régulation de l'horloge circadienne).",
                "Mange quelque chose de protéiné avant de dormir : jambon, fromage blanc, yaourt grec.",
                "Éteins les écrans 1h avant de dormir : la lumière bleue bloque la mélatonine.",
              ]},
              { icon:"", title:"Comment peser et suivre tes progrès", color:"#f59e0b", items:[
                "Pèse-toi chaque lundi matin, à jeun, après les toilettes, avant de manger - même heure, mêmes conditions.",
                "Pas plus d'une fois par semaine : le poids fluctue de 0,5 à 2 kg dans la journée (eau, repas).",
                "Si tu ne grossis pas en 2 semaines : ajoute 200 kcal/jour jusqu'à ce que ça monte.",
                "Objectif réaliste ectomorphe : 0,5 à 1 kg par mois (surtout muscle, peu de gras).",
                "Prends une photo de face et de profil chaque mois : les changements visuels sont plus parlants que le poids.",
              ]},
            ].map((s,i)=>(
              <div key={i} style={{...S.tipSection,borderLeft:`3px solid ${s.color}`}}>
                <div style={{...S.tipTitle,color:s.color}}>{s.icon} {s.title}</div>
                {s.items.map((item,j)=>(
                  <div key={j} style={S.tipItem}>
                    <span style={{color:s.color,marginRight:8,flexShrink:0}}>&gt;</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

// Mini ring component
function MacroRing({value,target,color,label}){
  const pct=Math.min(100,Math.round(value/target*100));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#1f2937" strokeWidth="4"/>
        <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${pct*1.131} 113.1`} strokeLinecap="round"
          transform="rotate(-90 22 22)" style={{transition:"stroke-dasharray .5s"}}/>
        <text x="22" y="26" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{pct}%</text>
      </svg>
      <div style={{fontSize:9,color:"#6b7280"}}>{label}</div>
    </div>
  );
}

// -- Styles -------------------------------------------------------------------
const S = {
  root:{minHeight:"100vh",background:"#050510",color:"#f1f5f9",fontFamily:"system-ui,-apple-system,sans-serif",maxWidth:640,margin:"0 auto"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 10px",background:"linear-gradient(135deg,#0a0a1a,#0f172a)",borderBottom:"1px solid #1f2937"},
  logo:{fontSize:22,fontWeight:900,letterSpacing:1,marginBottom:2},
  proBadge:{background:"#f97316",color:"#000",fontSize:9,fontWeight:900,padding:"2px 5px",borderRadius:3,marginLeft:4,verticalAlign:"middle"},
  headerSub:{fontSize:10,color:"#6b7280"},
  headerStats:{display:"flex",gap:10},
  nav:{display:"flex",background:"#0a0a1a",borderBottom:"1px solid #1f2937",position:"sticky",top:0,zIndex:20},
  navBtn:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",background:"none",border:"none",color:"#4b5563",transition:"all .2s"},
  navActive:{color:"#f97316",borderBottom:"2px solid #f97316",background:"#0f172a"},
  main:{},
  page:{padding:"12px 12px 60px",display:"flex",flexDirection:"column",gap:10},
  dateRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:10},
  dateArrow:{background:"#1f2937",border:"none",color:"#f1f5f9",borderRadius:8,padding:"6px 14px",fontSize:20},
  dateInput:{background:"#1f2937",border:"1px solid #374151",color:"#f1f5f9",borderRadius:8,padding:"5px 10px",fontSize:13},
  rowCards:{display:"flex",gap:8},
  miniCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:"10px 12px"},
  miniCardLabel:{fontSize:11,color:"#6b7280",marginBottom:4},
  miniCardVal:{fontSize:18,fontWeight:700},
  inlineInput:{display:"flex",alignItems:"center",gap:6},
  tinyInput:{background:"#1f2937",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"4px 8px",fontSize:13,width:56},
  okBtn:{background:"#f97316",border:"none",color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700},
  resetBtn:{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:12,marginLeft:4},
  macroSummaryCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"},
  macroSummaryTitle:{fontSize:13,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8},
  exBadge:{background:"#7c3aed22",color:"#a78bfa",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700},
  macroGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10},
  macroCell:{},
  macroBar:{height:4,borderRadius:2,overflow:"hidden",marginBottom:3},
  macroFill:{height:"100%",borderRadius:2,transition:"width .5s"},
  macroLabel:{fontSize:10,color:"#6b7280"},
  macroVal:{fontSize:15,fontWeight:700,lineHeight:1},
  macroUnit:{fontSize:9,fontWeight:400,marginLeft:1},
  macroTarget:{fontSize:9,color:"#374151"},
  remainBar:{border:"1px solid",borderRadius:8,padding:"8px 12px",fontSize:12},
  mealCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,overflow:"hidden"},
  mealHeader:{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#111827",width:"100%",border:"none",color:"#f1f5f9",textAlign:"left"},
  mealName:{fontSize:14,fontWeight:700},
  mealTime:{fontSize:10,color:"#6b7280"},
  mealCal:{fontSize:16,fontWeight:700},
  mealMacroRow:{fontSize:10,marginTop:1},
  itemsList:{borderBottom:"1px solid #1f2937",overflowX:"auto"},
  itemsTable:{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:400},
  ith:{padding:"5px 6px",textAlign:"left",fontSize:10,fontWeight:700,color:"#9ca3af",whiteSpace:"nowrap"},
  itd:{padding:"6px 6px",borderBottom:"1px solid #1f2937",whiteSpace:"nowrap"},
  removeBtn:{background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:4,padding:"2px 6px",fontSize:10},
  addPanel:{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8,borderTop:"1px solid #1f2937"},
  addToggle:{display:"flex",gap:6},
  toggleBtn:{flex:1,border:"none",borderRadius:8,padding:"7px",fontSize:12,fontWeight:700},
  searchInput:{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%"},
  catRow:{display:"flex",gap:5,flexWrap:"wrap"},
  catBtn:{border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:600},
  foodList:{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto"},
  foodItem:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,width:"100%",border:"1px solid",textAlign:"left"},
  qtyPanel:{background:"#1e293b",borderRadius:10,padding:"12px",display:"flex",flexDirection:"column",gap:8},
  qtyFoodName:{fontSize:12,fontWeight:700,color:"#10b981"},
  qtyRow:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  qtyModeToggle:{display:"flex",gap:5},
  qtyModeBtn:{border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#fff"},
  qtyPreview:{fontSize:12,paddingTop:4},
  addBtn:{background:"#f97316",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,width:"100%"},
  manualPanel:{display:"flex",flexDirection:"column",gap:10},
  manualGrid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8},
  manualField:{display:"flex",flexDirection:"column",gap:3},
  manualLabel:{fontSize:11,color:"#9ca3af"},
  manualInput:{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"7px 10px",fontSize:13,width:"100%"},
  exCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"},
  exCardTitle:{fontSize:13,fontWeight:700,color:"#ef4444",marginBottom:8},
  exRow:{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #111827"},
  progHeader:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"},
  progTitle:{fontSize:15,fontWeight:800,marginBottom:4},
  progSub:{fontSize:11,color:"#6b7280"},
  weekGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6},
  weekBtn:{border:"none",borderRadius:8,padding:"10px 4px",fontWeight:700,fontSize:12},
  dayGrid:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4},
  dayBtn:{border:"1px solid",borderRadius:8,padding:"8px 2px",display:"flex",flexDirection:"column",alignItems:"center"},
  sessionCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,overflow:"hidden"},
  sessionHead:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#111827",borderBottom:"1px solid #1f2937"},
  sessionName:{fontSize:14,fontWeight:700},
  sessionSub:{fontSize:10,color:"#6b7280",marginTop:2},
  restCard:{display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 20px",color:"#f1f5f9",textAlign:"center"},
  exTable:{width:"100%",borderCollapse:"collapse"},
  exTh:{padding:"6px 8px",textAlign:"left",fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase"},
  exTd:{padding:"8px 8px",borderBottom:"1px solid #1f2937",verticalAlign:"top"},
  logBtn:{background:"#10b981",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,width:"100%"},
  chartCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"14px"},
  chartTitle:{fontSize:14,fontWeight:700},
  chartSubtitle:{fontSize:11,color:"#6b7280",marginTop:2},
  chartEmpty:{fontSize:12,color:"#6b7280",textAlign:"center",padding:"24px 0"},
  tableCard:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,overflow:"hidden"},
  tipSection:{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"},
  tipTitle:{fontSize:13,fontWeight:800,marginBottom:10},
  tipItem:{display:"flex",fontSize:12,color:"#94a3b8",lineHeight:1.6,paddingBottom:5,alignItems:"flex-start"},
};
