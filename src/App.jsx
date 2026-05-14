import React, { useState, useEffect } from "react";

/* GainMode
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
  // -- CAFÉS ----------------------------------------------------------------
  { id:1000, name:"Café allongé",          cal:4,   protein:0.4, carbs:0.6, fat:0,   fiber:0, sugar:0,   cat:"Cafés & Thés", portion:{name:"tasse",g:120} },
  { id:1001, name:"Café expresso",         cal:2,   protein:0.3, carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Cafés & Thés", portion:{name:"tasse",g:30} },
  { id:1002, name:"Café cappuccino",       cal:74,  protein:3.8, carbs:7,   fat:3,   fiber:0, sugar:6,   cat:"Cafés & Thés", portion:{name:"tasse",g:180} },
  { id:1003, name:"Café latte",            cal:120, protein:6,   carbs:10,  fat:5,   fiber:0, sugar:10,  cat:"Cafés & Thés", portion:{name:"grand verre",g:300} },
  { id:1004, name:"Café noisette",         cal:20,  protein:0.8, carbs:1.5, fat:0.8, fiber:0, sugar:1.5, cat:"Cafés & Thés", portion:{name:"tasse",g:60} },
  { id:1005, name:"Café frappé sucré",     cal:110, protein:2,   carbs:20,  fat:2,   fiber:0, sugar:19,  cat:"Cafés & Thés", portion:{name:"verre",g:250} },
  { id:1006, name:"Café au lait entier",   cal:65,  protein:3.4, carbs:5.1, fat:3.8, fiber:0, sugar:5.1, cat:"Cafés & Thés", portion:{name:"mug",g:250} },
  { id:1007, name:"Thé nature",            cal:1,   protein:0,   carbs:0,   fat:0,   fiber:0, sugar:0,   cat:"Cafés & Thés", portion:{name:"tasse",g:200} },
  { id:1008, name:"Thé au lait",           cal:35,  protein:1.5, carbs:3.5, fat:1.5, fiber:0, sugar:3.5, cat:"Cafés & Thés", portion:{name:"tasse",g:200} },
  { id:1009, name:"Chocolat chaud",        cal:150, protein:5,   carbs:22,  fat:5,   fiber:1, sugar:20,  cat:"Cafés & Thés", portion:{name:"mug",g:250} },
  // -- FAST FOOD -------------------------------------------------------------
  { id:1100, name:"Big Mac",               cal:503, protein:25,  carbs:44,  fat:25,  fiber:3, sugar:9,   cat:"Fast Food", portion:{name:"burger",g:200} },
  { id:1101, name:"Frites grandes",        cal:448, protein:5.9, carbs:57,  fat:21,  fiber:5, sugar:0.5, cat:"Fast Food", portion:{name:"grande",g:154} },
  { id:1102, name:"Kebab poulet",          cal:280, protein:22,  carbs:32,  fat:7,   fiber:2, sugar:4,   cat:"Fast Food", portion:{name:"kebab",g:280} },
  { id:1103, name:"Pizza 4 fromages",      cal:295, protein:14,  carbs:30,  fat:13,  fiber:2, sugar:3,   cat:"Fast Food", portion:{name:"part",g:150} },
  { id:1104, name:"Hot dog",               cal:290, protein:11,  carbs:25,  fat:16,  fiber:1, sugar:5,   cat:"Fast Food", portion:{name:"hot dog",g:130} },
  { id:1105, name:"Nuggets x6",            cal:270, protein:15,  carbs:17,  fat:15,  fiber:1, sugar:0.5, cat:"Fast Food", portion:{name:"6 pieces",g:100} },
  { id:1106, name:"Tacos garni",           cal:350, protein:20,  carbs:40,  fat:12,  fiber:3, sugar:5,   cat:"Fast Food", portion:{name:"tacos",g:250} },
  { id:1107, name:"Panini jambon-fromage", cal:340, protein:16,  carbs:38,  fat:13,  fiber:2, sugar:3,   cat:"Fast Food", portion:{name:"panini",g:200} },
  // -- POISSONS --------------------------------------------------------------
  { id:1200, name:"Saumon cuit",           cal:208, protein:20,  carbs:0,   fat:13,  fiber:0, sugar:0,   cat:"Poissons" },
  { id:1201, name:"Thon en boite (eau)",   cal:116, protein:26,  carbs:0,   fat:0.8, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1202, name:"Cabillaud cuit",        cal:82,  protein:18,  carbs:0,   fat:0.7, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1203, name:"Crevettes cuites",      cal:99,  protein:21,  carbs:0.9, fat:1.1, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1204, name:"Sardines en boite",     cal:208, protein:25,  carbs:0,   fat:12,  fiber:0, sugar:0,   cat:"Poissons" },
  // -- DESSERTS --------------------------------------------------------------
  { id:1300, name:"Tiramisu",              cal:310, protein:5.5, carbs:32,  fat:18,  fiber:0.5,sugar:22, cat:"Desserts", portion:{name:"part",g:120} },
  { id:1301, name:"Mousse chocolat",       cal:280, protein:5,   carbs:28,  fat:17,  fiber:1, sugar:24,  cat:"Desserts", portion:{name:"verrine",g:100} },
  { id:1302, name:"Glace vanille",         cal:207, protein:3.5, carbs:23,  fat:11,  fiber:0, sugar:20,  cat:"Desserts", portion:{name:"boule",g:80} },
  { id:1303, name:"Fondant chocolat",      cal:380, protein:6,   carbs:42,  fat:22,  fiber:3, sugar:32,  cat:"Desserts", portion:{name:"part",g:80} },
  { id:1304, name:"Brownie maison",        cal:420, protein:5,   carbs:48,  fat:24,  fiber:3, sugar:35,  cat:"Desserts", portion:{name:"carré",g:80} },
  { id:1305, name:"Cheesecake",            cal:320, protein:6,   carbs:30,  fat:20,  fiber:0.5,sugar:22, cat:"Desserts", portion:{name:"part",g:120} },
  // -- COMPLÉMENTS -----------------------------------------------------------
  { id:1402, name:"Gainer prise de masse", cal:400, protein:30,  carbs:60,  fat:5,   fiber:2, sugar:15,  cat:"Compléments", portion:{name:"dose 100g",g:100} },
  { id:1403, name:"Barre energetique",     cal:380, protein:8,   carbs:60,  fat:10,  fiber:3, sugar:28,  cat:"Complements", portion:{name:"barre",g:65} },
  // -- FROMAGES AUTORISES -------------------------------------------------------
  { id:1500, name:"Gruyere fondu tranche",    cal:290, protein:18, carbs:1,   fat:24,  fiber:0, sugar:0.5, cat:"Fromages", portion:{name:"tranche",g:30} },
  { id:1501, name:"Raclette tranche",         cal:350, protein:24, carbs:0.5, fat:28,  fiber:0, sugar:0.5, cat:"Fromages", portion:{name:"tranche",g:30} },
  { id:1502, name:"Fromage ail fines herbes", cal:290, protein:7,  carbs:4,   fat:27,  fiber:0, sugar:2,   cat:"Fromages", portion:{name:"portion",g:30} },
  { id:1503, name:"Emmental tranche",         cal:380, protein:28, carbs:0.5, fat:29,  fiber:0, sugar:0.5, cat:"Fromages", portion:{name:"tranche",g:30} },
  { id:1504, name:"Comte tranche",            cal:413, protein:29, carbs:0.4, fat:33,  fiber:0, sugar:0.2, cat:"Fromages", portion:{name:"tranche",g:30} },
  { id:1505, name:"Mozzarella boule",         cal:280, protein:18, carbs:2,   fat:22,  fiber:0, sugar:1,   cat:"Fromages", portion:{name:"boule",g:125} },
  { id:1506, name:"Parmesan rape",            cal:431, protein:38, carbs:0,   fat:29,  fiber:0, sugar:0,   cat:"Fromages" },
  { id:1507, name:"Cheddar tranche",          cal:402, protein:25, carbs:1.3, fat:33,  fiber:0, sugar:0.5, cat:"Fromages", portion:{name:"tranche",g:25} },
  { id:1508, name:"Gouda tranche",            cal:356, protein:25, carbs:2.2, fat:27,  fiber:0, sugar:2,   cat:"Fromages", portion:{name:"tranche",g:25} },
  { id:1509, name:"Boursin ail fines herbes", cal:340, protein:7,  carbs:2,   fat:33,  fiber:0, sugar:1,   cat:"Fromages", portion:{name:"portion",g:30} },
  { id:1510, name:"Fromage frais nature",     cal:98,  protein:6,  carbs:3.8, fat:7,   fiber:0, sugar:3,   cat:"Fromages" },
  // -- YAOURTS SUCRES -----------------------------------------------------------
  { id:1520, name:"Yaourt vanille sucre",     cal:95,  protein:3.5, carbs:15, fat:2.5, fiber:0, sugar:13,  cat:"Laitiers Sucres", portion:{name:"pot",g:125} },
  { id:1521, name:"Yaourt fraise sucre",      cal:92,  protein:3.5, carbs:16, fat:1.8, fiber:0, sugar:14,  cat:"Laitiers Sucres", portion:{name:"pot",g:125} },
  { id:1522, name:"Yaourt grec miel",         cal:120, protein:8,   carbs:12, fat:4,   fiber:0, sugar:11,  cat:"Laitiers Sucres", portion:{name:"pot",g:150} },
  { id:1523, name:"Fromage blanc sucre",      cal:95,  protein:6,   carbs:12, fat:2.5, fiber:0, sugar:11,  cat:"Laitiers Sucres", portion:{name:"pot",g:100} },
  { id:1524, name:"Creme dessert chocolat",   cal:140, protein:3.5, carbs:22, fat:4.5, fiber:0.5,sugar:18, cat:"Laitiers Sucres", portion:{name:"pot",g:125} },
  { id:1525, name:"Riz au lait pot",          cal:118, protein:3.5, carbs:20, fat:2.5, fiber:0, sugar:14,  cat:"Laitiers Sucres", portion:{name:"pot",g:200} },
  { id:1526, name:"Creme dessert vanille",    cal:130, protein:3,   carbs:20, fat:4,   fiber:0, sugar:17,  cat:"Laitiers Sucres", portion:{name:"pot",g:125} },
  { id:1527, name:"Yaourt citron sucre",      cal:90,  protein:3.5, carbs:15, fat:1.8, fiber:0, sugar:13,  cat:"Laitiers Sucres", portion:{name:"pot",g:125} },
  { id:1528, name:"Skyr vanille",             cal:80,  protein:11,  carbs:7,  fat:0.2, fiber:0, sugar:6,   cat:"Laitiers Sucres", portion:{name:"pot",g:150} },
  { id:1529, name:"Petits filous fraise",     cal:80,  protein:5,   carbs:11, fat:1.5, fiber:0, sugar:10,  cat:"Laitiers Sucres", portion:{name:"pot",g:54} },
  // -- CONDIMENTS & EPICES ------------------------------------------------------
  { id:1540, name:"Sauce soja sucree",        cal:73,  protein:4,   carbs:14, fat:0.1, fiber:0, sugar:12,  cat:"Condiments" },
  { id:1541, name:"Sauce teriyaki",           cal:89,  protein:3,   carbs:18, fat:0.2, fiber:0, sugar:16,  cat:"Condiments" },
  { id:1542, name:"Sauce huitre",             cal:51,  protein:1,   carbs:11, fat:0.3, fiber:0, sugar:5,   cat:"Condiments" },
  { id:1543, name:"Sauce barbecue",           cal:172, protein:1.5, carbs:40, fat:0.5, fiber:0.5,sugar:36, cat:"Condiments" },
  { id:1544, name:"Curry en poudre",          cal:15,  protein:0.6, carbs:2,  fat:0.5, fiber:1, sugar:0,   cat:"Condiments" },
  { id:1545, name:"Paprika",                  cal:12,  protein:0.5, carbs:2,  fat:0.3, fiber:1, sugar:0.5, cat:"Condiments" },
  { id:1546, name:"Cumin",                    cal:15,  protein:0.7, carbs:2,  fat:0.5, fiber:1, sugar:0,   cat:"Condiments" },
  { id:1547, name:"Herbes de Provence",       cal:12,  protein:0.5, carbs:2,  fat:0.3, fiber:1, sugar:0,   cat:"Condiments" },
  { id:1548, name:"Sauce Worcester",          cal:78,  protein:1.2, carbs:18, fat:0.1, fiber:0, sugar:16,  cat:"Condiments" },
  { id:1549, name:"Sauce Tabasco",            cal:12,  protein:0.5, carbs:1.5,fat:0.2, fiber:0.3,sugar:0.5,cat:"Condiments" },
  { id:1550, name:"Vinaigre balsamique",      cal:88,  protein:0.5, carbs:17, fat:0,   fiber:0, sugar:15,  cat:"Condiments" },
  { id:1551, name:"Coriandre fraiche",        cal:23,  protein:2.1, carbs:3.7,fat:0.5, fiber:2.8,sugar:0.9,cat:"Condiments" },
  { id:1552, name:"Persil frais",             cal:36,  protein:3,   carbs:6,  fat:0.8, fiber:3.3,sugar:0.9,cat:"Condiments" },
  { id:1553, name:"Basilic frais",            cal:22,  protein:3.2, carbs:2.7,fat:0.6, fiber:1.6,sugar:0.3,cat:"Condiments" },
  { id:1554, name:"Thym",                     cal:101, protein:5.6, carbs:24, fat:1.7, fiber:14, sugar:0,  cat:"Condiments" },
  { id:1555, name:"Cannelle",                 cal:20,  protein:0.3, carbs:6,  fat:0.1, fiber:4,  sugar:0.2,cat:"Condiments" },
  // -- PAINS & VIENNOISERIES ----------------------------------------------------
  { id:1560, name:"Bagel nature",             cal:270, protein:10, carbs:53, fat:2,   fiber:2, sugar:5,   cat:"Pains", portion:{name:"bagel",g:105} },
  { id:1561, name:"Naan nature",              cal:310, protein:8,  carbs:55, fat:6,   fiber:2, sugar:4,   cat:"Pains", portion:{name:"naan",g:80} },
  { id:1562, name:"Pita",                     cal:275, protein:9,  carbs:53, fat:2,   fiber:3, sugar:2,   cat:"Pains", portion:{name:"pita",g:65} },
  { id:1563, name:"Pain burger brioche",      cal:300, protein:8,  carbs:50, fat:7,   fiber:2, sugar:8,   cat:"Pains", portion:{name:"pain",g:80} },
  { id:1564, name:"Crackers (3 pcs)",         cal:420, protein:8,  carbs:68, fat:12,  fiber:3, sugar:2,   cat:"Pains", portion:{name:"3 crackers",g:30} },
  { id:1565, name:"Pain aux cereales",        cal:255, protein:9,  carbs:44, fat:4,   fiber:5, sugar:4,   cat:"Pains", portion:{name:"tranche",g:35} },
  { id:1566, name:"Pain de seigle",           cal:259, protein:8.5,carbs:48, fat:1.7, fiber:6, sugar:1,   cat:"Pains", portion:{name:"tranche",g:30} },
  { id:1567, name:"Wrap ble complet",         cal:260, protein:8,  carbs:44, fat:6,   fiber:5, sugar:3,   cat:"Pains", portion:{name:"wrap",g:60} },
  // -- POISSONS & FRUITS DE MER SUPPLEMENTAIRES ---------------------------------
  { id:1570, name:"Thon frais cuit",          cal:184, protein:30, carbs:0,  fat:6,   fiber:0, sugar:0,   cat:"Poissons" },
  { id:1571, name:"Saumon fume",              cal:172, protein:25, carbs:0,  fat:8,   fiber:0, sugar:0,   cat:"Poissons" },
  { id:1572, name:"Dorade cuite",             cal:121, protein:22, carbs:0,  fat:3.5, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1573, name:"Lieu noir cuit",           cal:90,  protein:20, carbs:0,  fat:1,   fiber:0, sugar:0,   cat:"Poissons" },
  { id:1574, name:"Colin cuit",               cal:90,  protein:19, carbs:0,  fat:1.2, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1575, name:"Sole cuite",               cal:86,  protein:18, carbs:0,  fat:1.3, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1576, name:"Thon germon boite huile",  cal:200, protein:26, carbs:0,  fat:11,  fiber:0, sugar:0,   cat:"Poissons" },
  { id:1577, name:"Anchois boite",            cal:210, protein:29, carbs:0,  fat:10,  fiber:0, sugar:0,   cat:"Poissons" },
  { id:1578, name:"Coquilles Saint-Jacques",  cal:88,  protein:17, carbs:3,  fat:0.9, fiber:0, sugar:0,   cat:"Poissons" },
  { id:1579, name:"Moules cuites",            cal:86,  protein:12, carbs:4,  fat:2.2, fiber:0, sugar:0,   cat:"Poissons" },
  // -- VIANDES SUPPLEMENTAIRES --------------------------------------------------
  { id:1580, name:"Blanc de dinde tranche",   cal:104, protein:23, carbs:0,  fat:1,   fiber:0, sugar:0,   cat:"Viandes", portion:{name:"tranche",g:40} },
  { id:1581, name:"Roti de boeuf cuit",       cal:175, protein:26, carbs:0,  fat:7.5, fiber:0, sugar:0,   cat:"Viandes" },
  { id:1582, name:"Poulet tikka",             cal:165, protein:25, carbs:5,  fat:5,   fiber:0.5,sugar:3,  cat:"Viandes" },
  { id:1583, name:"Boudin blanc",             cal:220, protein:14, carbs:5,  fat:16,  fiber:0, sugar:1,   cat:"Viandes", portion:{name:"boudin",g:90} },
  { id:1584, name:"Saucisse de Morteau",      cal:340, protein:18, carbs:1,  fat:30,  fiber:0, sugar:0,   cat:"Viandes", portion:{name:"tranche",g:80} },
  { id:1585, name:"Jambon de Bayonne",        cal:190, protein:21, carbs:0,  fat:12,  fiber:0, sugar:0,   cat:"Viandes", portion:{name:"tranche",g:25} },
  { id:1586, name:"Andouillette grille",      cal:290, protein:16, carbs:2,  fat:25,  fiber:0, sugar:0,   cat:"Viandes", portion:{name:"andouillette",g:150} },
  { id:1587, name:"Filet de canard",          cal:190, protein:25, carbs:0,  fat:10,  fiber:0, sugar:0,   cat:"Viandes" },
  { id:1588, name:"Lapin cuit",               cal:162, protein:25, carbs:0,  fat:7,   fiber:0, sugar:0,   cat:"Viandes" },
  { id:1589, name:"Veau blanquette",          cal:185, protein:20, carbs:3,  fat:10,  fiber:0, sugar:1,   cat:"Viandes" },
  // -- FECULENTS SUPPLEMENTAIRES ------------------------------------------------
  { id:1600, name:"Gnocchis cuits",           cal:162, protein:3.5, carbs:33, fat:1.5, fiber:1.5,sugar:0.5,cat:"Feculents" },
  { id:1601, name:"Orge perle cuit",          cal:123, protein:2.3, carbs:28, fat:0.4, fiber:3.8,sugar:0.4,cat:"Feculents" },
  { id:1602, name:"Millet cuit",              cal:119, protein:3.5, carbs:24, fat:1,   fiber:1.3,sugar:0,  cat:"Feculents" },
  { id:1603, name:"Sarrasin cuit",            cal:92,  protein:3.4, carbs:20, fat:0.6, fiber:2.7,sugar:0.9,cat:"Feculents" },
  { id:1604, name:"Riz de konjac",            cal:8,   protein:0,   carbs:2,  fat:0,   fiber:2,  sugar:0,  cat:"Feculents", portion:{name:"sachet",g:200} },
  { id:1605, name:"Tagliatelles cuites",      cal:155, protein:5.5, carbs:30, fat:0.9, fiber:1.8,sugar:0.5,cat:"Feculents" },
  { id:1606, name:"Rigatoni cuits",           cal:158, protein:5.5, carbs:31, fat:0.9, fiber:1.8,sugar:0.6,cat:"Feculents" },
  { id:1607, name:"Fregola cuite",            cal:165, protein:5.8, carbs:33, fat:0.8, fiber:2,  sugar:0.5,cat:"Feculents" },
  { id:1608, name:"Pain de mais (tranche)",   cal:265, protein:6,   carbs:53, fat:3.5, fiber:3,  sugar:6,  cat:"Feculents", portion:{name:"tranche",g:35} },
  // -- FRUITS SUPPLEMENTAIRES ---------------------------------------------------
  { id:1620, name:"Papaye",                   cal:43,  protein:0.5, carbs:11, fat:0.3, fiber:1.7,sugar:8,  cat:"Fruits" },
  { id:1621, name:"Grenade",                  cal:83,  protein:1.7, carbs:19, fat:1.2, fiber:4,  sugar:14, cat:"Fruits", portion:{name:"demi grenade",g:150} },
  { id:1622, name:"Litchi",                   cal:66,  protein:0.8, carbs:17, fat:0.4, fiber:1.3,sugar:15, cat:"Fruits" },
  { id:1623, name:"Goyave",                   cal:68,  protein:2.6, carbs:14, fat:1,   fiber:5.4,sugar:9,  cat:"Fruits" },
  { id:1624, name:"Noix de coco fraiche",     cal:354, protein:3.3, carbs:15, fat:33,  fiber:9,  sugar:6,  cat:"Fruits" },
  { id:1625, name:"Figue fraiche",            cal:74,  protein:0.8, carbs:19, fat:0.3, fiber:2.9,sugar:16, cat:"Fruits", portion:{name:"figue",g:50} },
  { id:1626, name:"Physalis",                 cal:53,  protein:1.9, carbs:11, fat:0.7, fiber:3.9,sugar:8,  cat:"Fruits" },
  { id:1627, name:"Mirabelles",               cal:57,  protein:0.5, carbs:14, fat:0.2, fiber:1.5,sugar:12, cat:"Fruits" },
  { id:1628, name:"Quetsches",                cal:47,  protein:0.7, carbs:11, fat:0.3, fiber:1.4,sugar:10, cat:"Fruits" },
  { id:1629, name:"Groseilles",               cal:56,  protein:1.4, carbs:14, fat:0.2, fiber:4.3,sugar:8,  cat:"Fruits" },
  { id:1630, name:"Cassis",                   cal:63,  protein:1.4, carbs:15, fat:0.4, fiber:5.3,sugar:8,  cat:"Fruits" },
  { id:1631, name:"Mure sauvage",             cal:43,  protein:1.4, carbs:10, fat:0.5, fiber:5.3,sugar:5,  cat:"Fruits" },
  { id:1632, name:"Cranberry sechee",         cal:308, protein:0.1, carbs:82, fat:1.4, fiber:5.7,sugar:73, cat:"Fruits", portion:{name:"poignee",g:30} },
  // -- LEGUMES SUPPLEMENTAIRES --------------------------------------------------
  { id:1650, name:"Artichaut cuit",           cal:53,  protein:3.5, carbs:11, fat:0.2, fiber:5.4,sugar:1,  cat:"Legumes", portion:{name:"artichaut",g:120} },
  { id:1651, name:"Fenouil cru",              cal:31,  protein:1.2, carbs:7,  fat:0.2, fiber:3.1,sugar:3.9,cat:"Legumes" },
  { id:1652, name:"Betterave cuite",          cal:44,  protein:1.7, carbs:10, fat:0.1, fiber:2,  sugar:8,  cat:"Legumes" },
  { id:1653, name:"Navet cuit",               cal:28,  protein:0.9, carbs:6,  fat:0.1, fiber:1.8,sugar:3.8,cat:"Legumes" },
  { id:1654, name:"Panais cuit",              cal:71,  protein:1.8, carbs:17, fat:0.3, fiber:4.4,sugar:5,  cat:"Legumes" },
  { id:1655, name:"Topinambour cuit",         cal:73,  protein:2,   carbs:17, fat:0.1, fiber:1.6,sugar:10, cat:"Legumes" },
  { id:1656, name:"Courge butternut",         cal:45,  protein:1,   carbs:12, fat:0.1, fiber:2,  sugar:5,  cat:"Legumes" },
  { id:1657, name:"Potiron cuit",             cal:26,  protein:1,   carbs:7,  fat:0.1, fiber:0.5,sugar:3,  cat:"Legumes" },
  { id:1658, name:"Epinards surgeles cuits",  cal:23,  protein:2.9, carbs:3.6,fat:0.4, fiber:2.2,sugar:0.4,cat:"Legumes" },
  { id:1659, name:"Chou kale",                cal:50,  protein:4.3, carbs:10, fat:0.9, fiber:2,  sugar:2.3,cat:"Legumes" },
  { id:1660, name:"Chou rouge",               cal:31,  protein:1.4, carbs:7,  fat:0.2, fiber:2.1,sugar:3.8,cat:"Legumes" },
  { id:1661, name:"Chou blanc",               cal:25,  protein:1.3, carbs:6,  fat:0.1, fiber:2.5,sugar:3,  cat:"Legumes" },
  { id:1662, name:"Brocoli surgele cuit",     cal:27,  protein:2.5, carbs:5,  fat:0.3, fiber:2.6,sugar:1.5,cat:"Legumes" },
  { id:1663, name:"Poivron jaune",            cal:27,  protein:1,   carbs:6.3,fat:0.3, fiber:0.9,sugar:4.7,cat:"Legumes" },
  { id:1664, name:"Poivron orange",           cal:31,  protein:1,   carbs:7,  fat:0.3, fiber:2.1,sugar:5,  cat:"Legumes" },
  { id:1665, name:"Germes de soja",           cal:30,  protein:3,   carbs:5.9,fat:0.2, fiber:1.8,sugar:3.6,cat:"Legumes" },
  { id:1666, name:"Endive",                   cal:17,  protein:0.9, carbs:3.5,fat:0.1, fiber:1.8,sugar:1.7,cat:"Legumes" },
  { id:1667, name:"Roquette",                 cal:25,  protein:2.6, carbs:3.7,fat:0.7, fiber:1.6,sugar:2,  cat:"Legumes" },
  { id:1668, name:"Mache",                    cal:21,  protein:2,   carbs:3.6,fat:0.4, fiber:1.8,sugar:0.5,cat:"Legumes" },
  { id:1669, name:"Cresson",                  cal:22,  protein:2.3, carbs:3.3,fat:0.3, fiber:0.5,sugar:0.5,cat:"Legumes" },
  { id:1670, name:"Pousses d'epinards",       cal:23,  protein:2.9, carbs:3.6,fat:0.4, fiber:2.2,sugar:0.4,cat:"Legumes" },
  // -- BOISSONS SUPPLEMENTAIRES -------------------------------------------------
  { id:1680, name:"Eau gazeuse",              cal:0,   protein:0,   carbs:0,  fat:0,   fiber:0, sugar:0,   cat:"Boissons", portion:{name:"verre",g:250} },
  { id:1681, name:"Limonade",                 cal:35,  protein:0,   carbs:8.7,fat:0,   fiber:0, sugar:8.7, cat:"Boissons", portion:{name:"verre",g:250} },
  { id:1682, name:"Jus de raisin",            cal:60,  protein:0.4, carbs:15, fat:0.1, fiber:0.1,sugar:14, cat:"Boissons", portion:{name:"verre",g:200} },
  { id:1683, name:"Lait ribot (fermente)",    cal:38,  protein:3.3, carbs:4.8,fat:0.9, fiber:0, sugar:4.8, cat:"Boissons", portion:{name:"verre",g:200} },
  { id:1684, name:"Kombucha nature",          cal:13,  protein:0,   carbs:3,  fat:0,   fiber:0, sugar:2.5, cat:"Boissons", portion:{name:"bouteille",g:330} },
  { id:1685, name:"Jus de grenade",           cal:54,  protein:0.4, carbs:13, fat:0.3, fiber:0.1,sugar:12, cat:"Boissons", portion:{name:"verre",g:200} },
  { id:1686, name:"Jus de carotte",           cal:40,  protein:0.9, carbs:9.3,fat:0.2, fiber:0.4,sugar:6,  cat:"Boissons", portion:{name:"verre",g:200} },
  { id:1687, name:"Jus de tomate",            cal:17,  protein:0.8, carbs:4,  fat:0.1, fiber:0.4,sugar:3,  cat:"Boissons", portion:{name:"verre",g:200} },
  { id:1688, name:"Boisson energisante",      cal:45,  protein:0,   carbs:11, fat:0,   fiber:0, sugar:11,  cat:"Boissons", portion:{name:"canette",g:250} },
  { id:1689, name:"Smoothie fruits rouges",   cal:65,  protein:1,   carbs:16, fat:0.3, fiber:1.5,sugar:13, cat:"Boissons", portion:{name:"verre",g:250} },
  // -- NOIX & OLEAGINEUX SUPPLEMENTAIRES ----------------------------------------
  { id:1700, name:"Noix de macadamia",        cal:718, protein:8,   carbs:14, fat:76,  fiber:9, sugar:4,   cat:"Noix & Oleagineux", portion:{name:"poignee",g:25} },
  { id:1701, name:"Noisettes",                cal:628, protein:15,  carbs:17, fat:61,  fiber:10,sugar:4.3, cat:"Noix & Oleagineux", portion:{name:"poignee",g:25} },
  { id:1702, name:"Noix de pecan",            cal:691, protein:9,   carbs:14, fat:72,  fiber:10,sugar:4,   cat:"Noix & Oleagineux", portion:{name:"poignee",g:25} },
  { id:1703, name:"Noix du bresil",           cal:659, protein:14,  carbs:12, fat:67,  fiber:7.5,sugar:2.3,cat:"Noix & Oleagineux", portion:{name:"3 noix",g:30} },
  { id:1704, name:"Noix de pin",              cal:673, protein:14,  carbs:13, fat:68,  fiber:3.7,sugar:3.6,cat:"Noix & Oleagineux" },
  { id:1705, name:"Pignons de pin",           cal:673, protein:14,  carbs:13, fat:68,  fiber:3.7,sugar:3.6,cat:"Noix & Oleagineux", portion:{name:"poignee",g:20} },
  { id:1706, name:"Graines de courge",        cal:559, protein:30,  carbs:11, fat:49,  fiber:6, sugar:1,   cat:"Noix & Oleagineux", portion:{name:"poignee",g:25} },
  { id:1707, name:"Graines de sesame",        cal:573, protein:18,  carbs:23, fat:50,  fiber:12,sugar:0.3, cat:"Noix & Oleagineux" },
  { id:1708, name:"Graines de chanvre",       cal:553, protein:32,  carbs:9,  fat:49,  fiber:4, sugar:1,   cat:"Noix & Oleagineux" },
  { id:1709, name:"Cacahuetes grillees",      cal:567, protein:26,  carbs:16, fat:49,  fiber:8.5,sugar:4,  cat:"Noix & Oleagineux", portion:{name:"poignee",g:25} },
  // -- SNACKS SUPPLEMENTAIRES ---------------------------------------------------
  { id:1720, name:"Pop corn sale",            cal:375, protein:11,  carbs:74, fat:5,   fiber:15,sugar:0.9, cat:"Snacks & Sucreries", portion:{name:"bol",g:40} },
  { id:1721, name:"Crackers riz souffle",     cal:387, protein:7,   carbs:85, fat:1.5, fiber:1.5,sugar:0.5,cat:"Snacks & Sucreries", portion:{name:"galette",g:9} },
  { id:1722, name:"Barre de cereales",        cal:400, protein:5,   carbs:72, fat:10,  fiber:4, sugar:30,  cat:"Snacks & Sucreries", portion:{name:"barre",g:40} },
  { id:1723, name:"Madeleine maison",         cal:420, protein:7,   carbs:55, fat:19,  fiber:1, sugar:28,  cat:"Snacks & Sucreries", portion:{name:"madeleine",g:35} },
  { id:1724, name:"Pain d'epices",            cal:335, protein:5,   carbs:74, fat:1.5, fiber:2, sugar:42,  cat:"Snacks & Sucreries", portion:{name:"tranche",g:30} },
  { id:1725, name:"Speculoos",                cal:484, protein:6,   carbs:74, fat:18,  fiber:2, sugar:38,  cat:"Snacks & Sucreries", portion:{name:"2 biscuits",g:20} },
  { id:1726, name:"Gateau au yaourt",         cal:310, protein:6,   carbs:45, fat:12,  fiber:1, sugar:28,  cat:"Snacks & Sucreries", portion:{name:"part",g:80} },
  { id:1727, name:"Financier amande",         cal:460, protein:9,   carbs:52, fat:24,  fiber:2, sugar:35,  cat:"Snacks & Sucreries", portion:{name:"financier",g:40} },
  { id:1728, name:"Religieuse chocolat",      cal:280, protein:5,   carbs:36, fat:13,  fiber:1, sugar:22,  cat:"Snacks & Sucreries", portion:{name:"religieuse",g:100} },
  { id:1729, name:"Eclair cafe",              cal:270, protein:5,   carbs:34, fat:12,  fiber:0.5,sugar:20, cat:"Snacks & Sucreries", portion:{name:"eclair",g:90} },
  { id:1730, name:"Paris-Brest",              cal:380, protein:6,   carbs:38, fat:22,  fiber:1, sugar:26,  cat:"Snacks & Sucreries", portion:{name:"part",g:100} },
  // -- PLATS SUPPLEMENTAIRES ----------------------------------------------------
  { id:1750, name:"Boeuf bourguignon",        cal:185, protein:18,  carbs:8,  fat:9,   fiber:1.5,sugar:3,  cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1751, name:"Blanquette de veau",       cal:195, protein:18,  carbs:10, fat:10,  fiber:1, sugar:2,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1752, name:"Couscous complet",         cal:280, protein:16,  carbs:38, fat:8,   fiber:3, sugar:4,   cat:"Plats & Recettes", portion:{name:"assiette",g:350} },
  { id:1753, name:"Tajine poulet citron",     cal:220, protein:22,  carbs:15, fat:9,   fiber:2, sugar:5,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1754, name:"Pad thai crevettes",       cal:290, protein:18,  carbs:38, fat:8,   fiber:2, sugar:6,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1755, name:"Ramen maison",             cal:350, protein:20,  carbs:48, fat:9,   fiber:2, sugar:4,   cat:"Plats & Recettes", portion:{name:"bol",g:400} },
  { id:1756, name:"Bibimbap",                 cal:320, protein:18,  carbs:48, fat:7,   fiber:3, sugar:5,   cat:"Plats & Recettes", portion:{name:"bol",g:350} },
  { id:1757, name:"Shakshuka",                cal:180, protein:12,  carbs:12, fat:9,   fiber:2.5,sugar:7,  cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1758, name:"Salade nicoise",           cal:280, protein:20,  carbs:18, fat:14,  fiber:3, sugar:4,   cat:"Plats & Recettes", portion:{name:"salade",g:300} },
  { id:1759, name:"Boeuf stroganoff",         cal:250, protein:22,  carbs:10, fat:14,  fiber:1, sugar:3,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1760, name:"Sushi (6 pieces)",         cal:290, protein:14,  carbs:48, fat:3,   fiber:1, sugar:8,   cat:"Plats & Recettes", portion:{name:"6 sushis",g:200} },
  { id:1761, name:"Gyozas (6 pieces)",        cal:270, protein:12,  carbs:32, fat:9,   fiber:2, sugar:3,   cat:"Plats & Recettes", portion:{name:"6 gyozas",g:150} },
  { id:1762, name:"Souvlaki",                 cal:320, protein:25,  carbs:28, fat:12,  fiber:2, sugar:3,   cat:"Plats & Recettes", portion:{name:"portion",g:250} },
  { id:1763, name:"Chili con carne",          cal:230, protein:18,  carbs:22, fat:8,   fiber:5, sugar:4,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1764, name:"Fajitas poulet",           cal:310, protein:24,  carbs:32, fat:10,  fiber:3, sugar:5,   cat:"Plats & Recettes", portion:{name:"2 fajitas",g:250} },
  { id:1765, name:"Enchiladas",               cal:340, protein:18,  carbs:38, fat:12,  fiber:3, sugar:5,   cat:"Plats & Recettes", portion:{name:"2 enchiladas",g:300} },
  { id:1766, name:"Hachis parmentier",        cal:195, protein:14,  carbs:18, fat:7,   fiber:2, sugar:2,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  { id:1767, name:"Pot-au-feu",               cal:165, protein:18,  carbs:10, fat:6,   fiber:2, sugar:3,   cat:"Plats & Recettes", portion:{name:"assiette",g:350} },
  { id:1768, name:"Cassoulet",                cal:290, protein:20,  carbs:25, fat:12,  fiber:4, sugar:2,   cat:"Plats & Recettes", portion:{name:"assiette",g:350} },
  { id:1769, name:"Poulet basquaise",         cal:220, protein:24,  carbs:12, fat:9,   fiber:2, sugar:5,   cat:"Plats & Recettes", portion:{name:"assiette",g:300} },
  // -- DESSERTS SUPPLEMENTAIRES -------------------------------------------------
  { id:1780, name:"Creme catalane",           cal:230, protein:4,   carbs:28, fat:11,  fiber:0, sugar:24,  cat:"Desserts", portion:{name:"ramequin",g:120} },
  { id:1781, name:"Profiteroles",             cal:350, protein:7,   carbs:35, fat:20,  fiber:1, sugar:22,  cat:"Desserts", portion:{name:"3 profiteroles",g:100} },
  { id:1782, name:"Tarte tatin",              cal:290, protein:3,   carbs:42, fat:13,  fiber:2, sugar:28,  cat:"Desserts", portion:{name:"part",g:120} },
  { id:1783, name:"Clafoutis cerises",        cal:190, protein:6,   carbs:28, fat:7,   fiber:1, sugar:20,  cat:"Desserts", portion:{name:"part",g:120} },
  { id:1784, name:"Panna cotta",              cal:210, protein:3,   carbs:22, fat:13,  fiber:0, sugar:18,  cat:"Desserts", portion:{name:"verrine",g:120} },
  { id:1785, name:"Sorbet citron",            cal:105, protein:0.3, carbs:28, fat:0,   fiber:0.5,sugar:26, cat:"Desserts", portion:{name:"boule",g:80} },
  { id:1786, name:"Sorbet mangue",            cal:110, protein:0.5, carbs:28, fat:0,   fiber:1, sugar:25,  cat:"Desserts", portion:{name:"boule",g:80} },
  { id:1787, name:"Glace chocolat",           cal:220, protein:4,   carbs:26, fat:11,  fiber:1, sugar:22,  cat:"Desserts", portion:{name:"boule",g:80} },
  { id:1788, name:"Mille-feuille",            cal:410, protein:5,   carbs:50, fat:21,  fiber:1, sugar:30,  cat:"Desserts", portion:{name:"part",g:120} },
  { id:1789, name:"Opera",                    cal:390, protein:5,   carbs:42, fat:22,  fiber:1, sugar:32,  cat:"Desserts", portion:{name:"part",g:100} },
];

// -- MENUS COMPLETS (classés par repas) --------------------------------------
const MENUS_DB = [
  // PETIT-DÉJEUNER
  { id:1, slot:"breakfast", name:"Petit-dej express",       cal:520, protein:18, carbs:70, fat:18, desc:"Café allongé + 2 tartines pain complet beurre + banane", tags:["rapide","budget"] },
  { id:2, slot:"breakfast", name:"Petit-dej protéiné",      cal:680, protein:42, carbs:55, fat:22, desc:"3 oeufs brouillés + 2 tranches jambon + 2 tartines + café", tags:["protéines","sport"] },
  { id:3, slot:"breakfast", name:"Porridge prise de masse", cal:750, protein:28, carbs:95, fat:22, desc:"80g avoine + lait entier + banane + beurre cacahuète + miel", tags:["masse","glucides"] },
  { id:4, slot:"breakfast", name:"Pancakes maison",         cal:820, protein:25, carbs:105,fat:28, desc:"4 pancakes + sirop érable + 2 oeufs + verre lait entier", tags:["gourmand","weekend"] },
  { id:5, slot:"breakfast", name:"Shake ectomorphe matin",  cal:900, protein:38, carbs:120,fat:28, desc:"Lait 400ml + 2 bananes + 80g avoine + beurre cacahuète + miel", tags:["masse","shake","rapide"] },
  { id:6, slot:"breakfast", name:"Petit-dej continental",   cal:580, protein:20, carbs:75, fat:22, desc:"Croissant + 2 tartines confiture + jus orange + café au lait", tags:["classique","café"] },
  { id:7, slot:"breakfast", name:"Bowl yaourt granola",     cal:620, protein:22, carbs:82, fat:20, desc:"Yaourt grec + granola 60g + fruits rouges + miel + café", tags:["frais","léger"] },
  { id:8, slot:"breakfast", name:"Pain perdu",              cal:750, protein:22, carbs:95, fat:28, desc:"3 tranches pain brioché + oeuf + lait cuites au beurre + miel", tags:["gourmand","weekend"] },
  { id:9, slot:"breakfast", name:"Omelette matin",          cal:540, protein:32, carbs:30, fat:28, desc:"3 oeufs + jambon + 2 tartines + café noisette", tags:["protéines","rapide"] },
  { id:10, slot:"breakfast", name:"Céréales + lait",        cal:490, protein:14, carbs:78, fat:12, desc:"Bol céréales 60g + 250ml lait entier + banane + café", tags:["classique","rapide"] },
  { id:11, slot:"breakfast", name:"Tartines avocat-oeuf",   cal:560, protein:22, carbs:45, fat:28, desc:"2 tartines pain complet + avocat écrasé + 2 oeufs pochés + café", tags:["healthy"] },
  { id:12, slot:"breakfast", name:"Smoothie bowl masse",    cal:680, protein:24, carbs:90, fat:20, desc:"Banane + mangue + lait + granola + noix de coco + miel", tags:["fruits","masse"] },
  { id:13, slot:"breakfast", name:"Brioche Nutella",        cal:790, protein:18, carbs:110,fat:28, desc:"3 tranches brioche + Nutella + lait entier + banane", tags:["gourmand","calorie"] },
  { id:14, slot:"breakfast", name:"Overnight oats masse",   cal:720, protein:30, carbs:90, fat:22, desc:"Avoine 80g + lait + yaourt grec + fruits + chia + miel (veille)", tags:["préparation","masse"] },
  { id:15, slot:"breakfast", name:"Tartines beurre cacahuète", cal:700, protein:28, carbs:82, fat:28, desc:"3 tartines pain complet + beurre cacahuète + miel + lait 300ml", tags:["masse","budget","rapide"] },
  { id:16, slot:"breakfast", name:"Gaufres maison",         cal:760, protein:20, carbs:98, fat:28, desc:"2 gaufres + sirop + beurre + jus orange + café", tags:["weekend","gourmand"] },
  { id:17, slot:"breakfast", name:"French toast",           cal:820, protein:24, carbs:100,fat:30, desc:"3 tranches pain trempées oeuf + lait + cuites beurre + sirop érable", tags:["gourmand","weekend"] },
  { id:18, slot:"breakfast", name:"Café + croissant beurre",cal:480, protein:10, carbs:55, fat:24, desc:"Grand café au lait + 2 croissants beurre + jus orange", tags:["café","classique","rapide"] },
  { id:19, slot:"breakfast", name:"Petit-dej turc",         cal:640, protein:28, carbs:60, fat:28, desc:"Oeufs brouillés + tomates + concombre + pain + fromage + thé", tags:["original","protéines"] },
  { id:20, slot:"breakfast", name:"Shake whey-lait",        cal:560, protein:50, carbs:60, fat:12, desc:"Dose whey + 350ml lait entier + banane + 2 càs avoine", tags:["protéines","sport","rapide"] },
  // DÉJEUNER
  { id:101, slot:"lunch", name:"Riz poulet classique",      cal:850, protein:55, carbs:95, fat:18, desc:"200g blanc poulet + 150g riz + légumes sautés + sauce soja", tags:["masse","protéines","budget"] },
  { id:102, slot:"lunch", name:"Pâtes bolognaise",          cal:920, protein:48, carbs:105,fat:24, desc:"180g pâtes + 200g viande hachée + sauce tomate + gruyère", tags:["classique","budget","masse"] },
  { id:103, slot:"lunch", name:"Steak haché-frites",        cal:980, protein:42, carbs:85, fat:42, desc:"2 steaks hachés + 200g frites + ketchup + salade", tags:["classique","gourmand"] },
  { id:104, slot:"lunch", name:"Kebab maison",              cal:850, protein:38, carbs:88, fat:30, desc:"Pain pita + poulet mariné + sauce blanche + crudités + frites", tags:["gourmand","original"] },
  { id:105, slot:"lunch", name:"Riz aux oeufs sauté",       cal:780, protein:30, carbs:90, fat:28, desc:"150g riz + 4 oeufs + lardons + sauce soja + petits pois", tags:["rapide","budget"] },
  { id:106, slot:"lunch", name:"Poulet rôti-purée",         cal:920, protein:52, carbs:85, fat:30, desc:"250g poulet rôti + purée maison + haricots verts + sauce", tags:["classique","masse"] },
  { id:107, slot:"lunch", name:"Burger maison complet",     cal:1050,protein:50, carbs:95, fat:42, desc:"Steak + pain + gruyère fondu + oeuf + sauce + frites", tags:["gourmand","masse","weekend"] },
  { id:108, slot:"lunch", name:"Pâtes carbonara",           cal:960, protein:38, carbs:105,fat:38, desc:"180g pâtes + lardons + crème + oeufs + gruyère", tags:["classique","rapide"] },
  { id:109, slot:"lunch", name:"Riz cantonais",             cal:820, protein:28, carbs:98, fat:28, desc:"200g riz + 2 oeufs + jambon + petits pois + sauce soja", tags:["rapide","original"] },
  { id:110, slot:"lunch", name:"Steak-pâtes beurre",        cal:900, protein:50, carbs:95, fat:22, desc:"200g steak + 150g pâtes + beurre + parmesan", tags:["simple","masse","protéines"] },
  { id:111, slot:"lunch", name:"Gratin de pâtes",           cal:880, protein:38, carbs:90, fat:35, desc:"180g pâtes + béchamel + jambon + gruyère fondu au four", tags:["gourmand","réconfortant"] },
  { id:112, slot:"lunch", name:"Poulet curry-riz",          cal:860, protein:48, carbs:90, fat:22, desc:"200g poulet + 150g riz + sauce curry + crème + oignon", tags:["saveur","masse"] },
  { id:113, slot:"lunch", name:"Assiette mexicaine",        cal:920, protein:40, carbs:100,fat:30, desc:"Riz + haricots rouges + viande hachée épicée + maïs + tortilla", tags:["original","masse"] },
  { id:114, slot:"lunch", name:"Pâtes pesto-poulet",        cal:840, protein:45, carbs:88, fat:28, desc:"180g pâtes + 150g poulet + pesto + tomates cerises", tags:["saveur","rapide"] },
  { id:115, slot:"lunch", name:"Omelette géante",           cal:720, protein:45, carbs:35, fat:42, desc:"5 oeufs + pommes de terre + lardons + oignon", tags:["protéines","oeufs"] },
  { id:116, slot:"lunch", name:"Wraps poulet-avocat",       cal:780, protein:42, carbs:72, fat:28, desc:"2 wraps + poulet + avocat + tomates + salade + sauce", tags:["fresh","protéines"] },
  { id:117, slot:"lunch", name:"Sauté de porc-pâtes",       cal:900, protein:46, carbs:95, fat:30, desc:"200g filet porc + 150g pâtes + crème + moutarde + champignons", tags:["classique","saveur"] },
  { id:118, slot:"lunch", name:"Bowl protéiné masse",       cal:820, protein:58, carbs:72, fat:25, desc:"Riz brun + poulet + oeufs durs + avocat + légumes + sauce soja", tags:["healthy","masse","protéines"] },
  { id:119, slot:"lunch", name:"Lasagnes maison",           cal:950, protein:42, carbs:88, fat:38, desc:"Lasagnes bolognaise + béchamel + gruyère + salade", tags:["classique","weekend"] },
  { id:120, slot:"lunch", name:"Tacos maison",              cal:960, protein:40, carbs:105,fat:30, desc:"3 tacos + viande hachée + frites + sauce + fromage", tags:["tendance","gourmand"] },
  // GOÛTER
  { id:201, slot:"snack", name:"Shake masse classique",     cal:620, protein:30, carbs:80, fat:18, desc:"400ml lait entier + 2 bananes + 3 càs beurre cacahuète + miel", tags:["masse","shake","rapide"] },
  { id:202, slot:"snack", name:"Pain beurre de cacahuète",  cal:520, protein:22, carbs:60, fat:22, desc:"3 tartines pain complet + beurre cacahuète + miel + lait 200ml", tags:["budget","rapide","masse"] },
  { id:203, slot:"snack", name:"Yaourt + fruits + granola", cal:440, protein:16, carbs:62, fat:12, desc:"2 yaourts grecs + granola 40g + banane + miel", tags:["frais","léger"] },
  { id:204, slot:"snack", name:"Shake protéiné sport",      cal:560, protein:48, carbs:55, fat:12, desc:"Dose whey 30g + lait entier 300ml + barre protéinée", tags:["protéines","sport","rapide"] },
  { id:205, slot:"snack", name:"Tartines Nutella",          cal:580, protein:12, carbs:82, fat:22, desc:"3 tartines pain + Nutella + verre lait entier", tags:["gourmand","rapide"] },
  { id:206, slot:"snack", name:"Fromage blanc + céréales",  cal:420, protein:22, carbs:58, fat:8,  desc:"200g fromage blanc + céréales + miel + fruits", tags:["léger","protéines"] },
  { id:207, slot:"snack", name:"Smoothie banane-avoine",    cal:550, protein:18, carbs:85, fat:12, desc:"300ml lait + banane + 40g avoine + yaourt + miel mixés", tags:["shake","masse","rapide"] },
  { id:208, slot:"snack", name:"Noix et fruits secs",       cal:380, protein:10, carbs:42, fat:20, desc:"Noix + amandes + raisins secs + dattes + cacahuètes", tags:["budget","rapide","sain"] },
  { id:209, slot:"snack", name:"Crêpes confiture",          cal:560, protein:14, carbs:80, fat:18, desc:"2 crêpes + confiture ou Nutella + verre lait", tags:["classique","gourmand"] },
  { id:210, slot:"snack", name:"Smoothie masse tropical",   cal:680, protein:22, carbs:95, fat:18, desc:"Lait entier + mangue + banane + ananas + gainer 50g", tags:["tropical","masse","shake"] },
  // DÎNER
  { id:301, slot:"dinner", name:"Poulet-pâtes-beurre",      cal:900, protein:52, carbs:98, fat:28, desc:"200g poulet + 180g pâtes + beurre + parmesan + herbes", tags:["classique","masse","simple"] },
  { id:302, slot:"dinner", name:"Steak-purée maison",       cal:950, protein:50, carbs:88, fat:35, desc:"200g steak + grande purée maison beurre + haricots verts", tags:["classique","français","masse"] },
  { id:303, slot:"dinner", name:"Riz sauté complet",        cal:880, protein:38, carbs:100,fat:25, desc:"200g riz + poulet + légumes variés + sauce soja + oeuf", tags:["asiatique","masse","rapide"] },
  { id:304, slot:"dinner", name:"Raclette soirée",          cal:1100,protein:55, carbs:80, fat:55, desc:"Pommes de terre + charcuterie + raclette + cornichons", tags:["convivial","gourmand","weekend"] },
  { id:305, slot:"dinner", name:"Pâtes au gratin",          cal:960, protein:40, carbs:108,fat:35, desc:"180g pâtes + crème + gruyère + lardons au four", tags:["réconfortant","masse"] },
  { id:306, slot:"dinner", name:"Burger soirée",            cal:1050,protein:50, carbs:98, fat:45, desc:"Steak + pain brioche + fromage fondu + bacon + frites + sauce", tags:["gourmand","weekend","masse"] },
  { id:307, slot:"dinner", name:"Poulet rôti dominical",    cal:920, protein:58, carbs:78, fat:30, desc:"250g poulet rôti + pommes de terre + légumes rôtis + sauce", tags:["classique","dimanche"] },
  { id:308, slot:"dinner", name:"Spaghetti carbonara",      cal:980, protein:40, carbs:108,fat:38, desc:"180g spaghetti + lardons + crème + oeufs + gruyère", tags:["classique","rapide","masse"] },
  { id:309, slot:"dinner", name:"Tacos soirée",             cal:1000,protein:42, carbs:110,fat:32, desc:"3 tacos + viande hachée épicée + frites + sauce + salade", tags:["tendance","gourmand","masse"] },
  { id:310, slot:"dinner", name:"Lasagnes classiques",      cal:960, protein:44, carbs:90, fat:40, desc:"Lasagnes bolognaise maison + béchamel + gruyère + salade", tags:["classique","weekend"] },
  { id:311, slot:"dinner", name:"Wok boeuf-légumes",        cal:820, protein:45, carbs:85, fat:25, desc:"200g boeuf + nouilles + poivrons + courgette + sauce huître", tags:["asiatique","rapide","saveur"] },
  { id:312, slot:"dinner", name:"Pizza maison",             cal:950, protein:38, carbs:108,fat:32, desc:"Pâte + sauce tomate + mozzarella + jambon + champignons", tags:["gourmand","weekend","masse"] },
  { id:313, slot:"dinner", name:"Côtes de porc-frites",     cal:980, protein:48, carbs:88, fat:40, desc:"2 côtes porc + frites four + sauce barbecue + salade", tags:["classique","gourmand"] },
  { id:314, slot:"dinner", name:"Pâtes pesto-jambon",       cal:820, protein:38, carbs:92, fat:28, desc:"180g pâtes + jambon + pesto + tomates cerises + parmesan", tags:["rapide","simple","saveur"] },
  { id:315, slot:"dinner", name:"Poulet tikka masala",      cal:840, protein:50, carbs:80, fat:25, desc:"200g poulet + sauce tikka + riz basmati + naan", tags:["indien","saveur","original"] },
  { id:316, slot:"dinner", name:"Omelette pommes de terre", cal:780, protein:42, carbs:55, fat:40, desc:"5 oeufs + 3 pommes de terre + lardons + gruyère fondu + salade", tags:["oeufs","classique","budget"] },
  { id:317, slot:"dinner", name:"Gratin dauphinois-côte",   cal:950, protein:45, carbs:82, fat:45, desc:"Côtelette de porc + gratin dauphinois + salade verte", tags:["classique","réconfortant"] },
  { id:318, slot:"dinner", name:"Riz cantonais dîner",      cal:820, protein:30, carbs:95, fat:25, desc:"Riz + oeufs + lardons + crevettes + sauce soja + légumes", tags:["asiatique","saveur"] },
  { id:319, slot:"dinner", name:"Poulet basquaise",         cal:820, protein:50, carbs:68, fat:28, desc:"200g poulet + poivrons + tomates + oignon + riz", tags:["français","saveur"] },
  { id:320, slot:"dinner", name:"Porc-semoule",             cal:860, protein:48, carbs:88, fat:25, desc:"200g filet porc + 150g semoule + sauce tomate + légumes", tags:["varié","masse"] },
];

// -- Bibliothèque d'exercices -----------------------------------------------
const EXERCISES_DB = [
  // PECS
  { id:"e1",  name:"Pompes classiques",        muscle:"Pecs",     equipment:"Corps",    sets:4, reps:"10-12", rest:75,  cal:22, level:"debutant",     tip:"Corps planche, coudes a 45 degres" },
  { id:"e2",  name:"Pompes larges",            muscle:"Pecs",     equipment:"Corps",    sets:4, reps:"10-12", rest:75,  cal:20, level:"debutant",     tip:"Mains 2x largeur epaules, etire bien les pecs" },
  { id:"e3",  name:"Pompes déclinées",         muscle:"Pecs",     equipment:"Corps",    sets:4, reps:"10",    rest:90,  cal:24, level:"intermediaire",tip:"Pieds sur chaise, angle 30 degres" },
  { id:"e4",  name:"Pompes inclinées",         muscle:"Pecs",     equipment:"Corps",    sets:3, reps:"12",    rest:75,  cal:18, level:"debutant",     tip:"Mains sur chaise, bas des pecs" },
  { id:"e5",  name:"Pompes diamant",           muscle:"Triceps",  equipment:"Corps",    sets:3, reps:"8-10",  rest:75,  cal:16, level:"intermediaire",tip:"Pouces et index forment un diamant" },
  { id:"e6",  name:"Pompes explosives",        muscle:"Pecs",     equipment:"Corps",    sets:4, reps:"8",     rest:90,  cal:28, level:"avance",       tip:"Mains decollent du sol, force maximale" },
  { id:"e7",  name:"Pompes archer",            muscle:"Pecs",     equipment:"Corps",    sets:3, reps:"6/cote",rest:90,  cal:26, level:"avance",       tip:"Bras tendu sur le cote, charge le pec" },
  // EPAULES
  { id:"e8",  name:"Pike push-up",             muscle:"Epaules",  equipment:"Corps",    sets:4, reps:"10",    rest:75,  cal:18, level:"debutant",     tip:"Hanches hautes, tete vers le sol" },
  { id:"e9",  name:"Elévations latérales",     muscle:"Epaules",  equipment:"Halteres", sets:4, reps:"12-15", rest:60,  cal:14, level:"debutant",     tip:"Bras tendus, monter jusqu'a epaule" },
  { id:"e10", name:"Développé militaire",      muscle:"Epaules",  equipment:"Halteres", sets:4, reps:"10-12", rest:90,  cal:20, level:"debutant",     tip:"Pousser vers le haut, coudes avant" },
  { id:"e11", name:"Elévations frontales",     muscle:"Epaules",  equipment:"Halteres", sets:3, reps:"12",    rest:60,  cal:12, level:"debutant",     tip:"Bras tendus vers l'avant, angle 90 degres" },
  { id:"e12", name:"Oiseau (deltoide post)",   muscle:"Epaules",  equipment:"Halteres", sets:3, reps:"12-15", rest:60,  cal:12, level:"intermediaire",tip:"Penche en avant, bras s'ouvrent" },
  { id:"e13", name:"Handstand hold (mur)",     muscle:"Epaules",  equipment:"Corps",    sets:3, reps:"20sec", rest:90,  cal:10, level:"avance",       tip:"Poignets chauds, ventre rentre" },
  // TRICEPS
  { id:"e14", name:"Dips sur chaise",          muscle:"Triceps",  equipment:"Corps",    sets:4, reps:"12-15", rest:75,  cal:18, level:"debutant",     tip:"Coudes pres du corps, descendre bas" },
  { id:"e15", name:"Extension triceps",        muscle:"Triceps",  equipment:"Halteres", sets:3, reps:"12-15", rest:60,  cal:14, level:"debutant",     tip:"Coude fixe, etendre bras vers le haut" },
  { id:"e16", name:"Kickback triceps",         muscle:"Triceps",  equipment:"Halteres", sets:3, reps:"12-15", rest:60,  cal:12, level:"debutant",     tip:"Bras parallele au sol, etendre" },
  { id:"e17", name:"Dips lesté sac",           muscle:"Triceps",  equipment:"Corps",    sets:4, reps:"10-12", rest:90,  cal:22, level:"intermediaire",tip:"Sac sur les cuisses pour ajouter charge" },
  // DOS / BICEPS
  { id:"e18", name:"Tractions australiennes",  muscle:"Dos",      equipment:"Corps",    sets:4, reps:"10-12", rest:90,  cal:28, level:"debutant",     tip:"Table basse ou barre basse, corps droit" },
  { id:"e19", name:"Superman",                 muscle:"Dos",      equipment:"Corps",    sets:3, reps:"15",    rest:45,  cal:8,  level:"debutant",     tip:"Ventre au sol, lever bras et jambes" },
  { id:"e20", name:"Rowing halterees",         muscle:"Dos",      equipment:"Halteres", sets:4, reps:"10-12", rest:75,  cal:18, level:"debutant",     tip:"Penche avant, tirer vers la hanche" },
  { id:"e21", name:"Curl biceps",              muscle:"Biceps",   equipment:"Halteres", sets:4, reps:"12-15", rest:60,  cal:14, level:"debutant",     tip:"Coudes fixes, pleine amplitude" },
  { id:"e22", name:"Curl marteau",             muscle:"Biceps",   equipment:"Halteres", sets:3, reps:"12",    rest:60,  cal:12, level:"debutant",     tip:"Poignets neutres, contraction maximale" },
  { id:"e23", name:"Tractions (barre porte)",  muscle:"Dos",      equipment:"Corps",    sets:4, reps:"5-8",   rest:120, cal:32, level:"avance",       tip:"Grip large pour le dos, barre de porte" },
  { id:"e24", name:"Isometrie porte (dos)",    muscle:"Dos",      equipment:"Corps",    sets:3, reps:"20sec", rest:60,  cal:8,  level:"debutant",     tip:"Tirer la poignee de porte, dos droit" },
  // JAMBES / FESSIERS
  { id:"e25", name:"Squats poids du corps",    muscle:"Jambes",   equipment:"Corps",    sets:4, reps:"15-20", rest:60,  cal:22, level:"debutant",     tip:"Genoux dans l'axe pieds, descente lente" },
  { id:"e26", name:"Fentes alternées",         muscle:"Jambes",   equipment:"Corps",    sets:4, reps:"12/jambe",rest:60,cal:25, level:"debutant",     tip:"Genou avant a 90 degres, dos droit" },
  { id:"e27", name:"Squats bulgares",          muscle:"Jambes",   equipment:"Corps",    sets:4, reps:"10/jambe",rest:90,cal:30, level:"intermediaire",tip:"Pied arriere sur chaise, genoux aligne" },
  { id:"e28", name:"Pont fessier",             muscle:"Fessiers", equipment:"Corps",    sets:4, reps:"20",    rest:45,  cal:12, level:"debutant",     tip:"Serrer fessiers en haut, tenir 1 sec" },
  { id:"e29", name:"Pistol squat assisté",     muscle:"Jambes",   equipment:"Corps",    sets:3, reps:"6/jambe",rest:90,cal:28, level:"avance",       tip:"Tenir un montant, jambe avant" },
  { id:"e30", name:"Squats goblet",            muscle:"Jambes",   equipment:"Halteres", sets:4, reps:"12-15", rest:75,  cal:26, level:"debutant",     tip:"Haltere contre poitrine, profondeur max" },
  { id:"e31", name:"Fentes avec halteres",     muscle:"Jambes",   equipment:"Halteres", sets:4, reps:"10/jambe",rest:75,cal:28, level:"debutant",     tip:"Halteres sur les cotes, dos droit" },
  { id:"e32", name:"Mollets debout",           muscle:"Mollets",  equipment:"Corps",    sets:4, reps:"20-25", rest:45,  cal:10, level:"debutant",     tip:"Amplitude complete, pause en haut" },
  { id:"e33", name:"Fentes sautées",           muscle:"Jambes",   equipment:"Corps",    sets:3, reps:"8/jambe",rest:75,cal:32, level:"intermediaire",tip:"Atterrissage souple, explosivite max" },
  // ABDOS / CORE
  { id:"e34", name:"Gainage planche",          muscle:"Abdos",    equipment:"Corps",    sets:3, reps:"30-45sec",rest:45,cal:8,  level:"debutant",     tip:"Ventre rentre, fessiers serres" },
  { id:"e35", name:"Crunchs",                  muscle:"Abdos",    equipment:"Corps",    sets:3, reps:"20",    rest:45,  cal:8,  level:"debutant",     tip:"Pas de coup de nuque, contraction abdos" },
  { id:"e36", name:"Mountain climbers",        muscle:"Abdos",    equipment:"Corps",    sets:3, reps:"20",    rest:45,  cal:20, level:"intermediaire",tip:"Rapide, genoux vers poitrine" },
  { id:"e37", name:"Gainage lateral",          muscle:"Abdos",    equipment:"Corps",    sets:3, reps:"25sec/cote",rest:45,cal:8,level:"intermediaire",tip:"Hanche ne touche pas le sol" },
  { id:"e38", name:"Russian twist",            muscle:"Abdos",    equipment:"Halteres", sets:3, reps:"20",    rest:45,  cal:12, level:"intermediaire",tip:"Pieds leves, rotation max de chaque cote" },
  { id:"e39", name:"Leg raise",                muscle:"Abdos",    equipment:"Corps",    sets:3, reps:"15",    rest:45,  cal:10, level:"intermediaire",tip:"Jambes tendues, descente controlee" },
  // CARDIO / FULL BODY
  { id:"e40", name:"Burpees",                  muscle:"Full Body",equipment:"Corps",    sets:3, reps:"10",    rest:90,  cal:40, level:"intermediaire",tip:"Controle le mouvement, qualite > vitesse" },
  { id:"e41", name:"Squat sauté",              muscle:"Full Body",equipment:"Corps",    sets:3, reps:"12",    rest:75,  cal:30, level:"intermediaire",tip:"Atterrissage souple, genoux flechi" },
  { id:"e42", name:"Jumping jacks",            muscle:"Full Body",equipment:"Corps",    sets:3, reps:"30",    rest:45,  cal:18, level:"debutant",     tip:"Rythme soutenu, bras tendus" },
];

// -- Programme 4 jours/semaine FOCUS PECS/EPAULES/TRICEPS -------------------
const PROGRAM = [
  // SEMAINE 1
  { week:1, day:1, type:"Push", name:"Jour 1 - Push (Pecs + Epaules + Triceps)", exIds:["e1","e2","e8","e14","e10"] },
  { week:1, day:2, type:"Repos", name:"Repos actif", exIds:[] },
  { week:1, day:3, type:"Pull", name:"Jour 2 - Pull (Dos + Biceps)", exIds:["e18","e19","e20","e21","e24"] },
  { week:1, day:4, type:"Repos", name:"Repos actif", exIds:[] },
  { week:1, day:5, type:"Legs", name:"Jour 3 - Jambes + Abdos", exIds:["e25","e26","e28","e32","e34","e35"] },
  { week:1, day:6, type:"Repos", name:"Repos total", exIds:[] },
  { week:1, day:7, type:"Full", name:"Jour 4 - Full Body + Halteres", exIds:["e3","e9","e15","e30","e31","e38"] },
  // SEMAINE 2
  { week:2, day:1, type:"Push", name:"Jour 1 - Push intensif", exIds:["e1","e5","e10","e11","e14","e15"] },
  { week:2, day:2, type:"Repos", name:"Repos actif", exIds:[] },
  { week:2, day:3, type:"Pull", name:"Jour 2 - Pull + Biceps", exIds:["e18","e20","e21","e22","e19"] },
  { week:2, day:4, type:"Repos", name:"Repos actif", exIds:[] },
  { week:2, day:5, type:"Legs", name:"Jour 3 - Jambes halteres", exIds:["e27","e30","e31","e28","e32","e34"] },
  { week:2, day:6, type:"Repos", name:"Repos total", exIds:[] },
  { week:2, day:7, type:"Full", name:"Jour 4 - Circuit complet", exIds:["e6","e8","e12","e16","e33","e36"] },
  // SEMAINE 3
  { week:3, day:1, type:"Push", name:"Jour 1 - Push force", exIds:["e1","e3","e8","e10","e14","e17"] },
  { week:3, day:2, type:"Repos", name:"Repos actif", exIds:[] },
  { week:3, day:3, type:"Pull", name:"Jour 2 - Pull lourd", exIds:["e18","e20","e21","e22","e23"] },
  { week:3, day:4, type:"Repos", name:"Repos actif", exIds:[] },
  { week:3, day:5, type:"Legs", name:"Jour 3 - Jambes avancé", exIds:["e27","e29","e31","e28","e33","e34","e37"] },
  { week:3, day:6, type:"Repos", name:"Repos total", exIds:[] },
  { week:3, day:7, type:"Full", name:"Jour 4 - Full + Core", exIds:["e6","e9","e13","e16","e30","e38","e39"] },
  // SEMAINE 4
  { week:4, day:1, type:"Push", name:"Jour 1 - Push max", exIds:["e6","e7","e10","e12","e5","e17"] },
  { week:4, day:2, type:"Repos", name:"Repos actif", exIds:[] },
  { week:4, day:3, type:"Pull", name:"Jour 2 - Pull max", exIds:["e23","e18","e20","e21","e22"] },
  { week:4, day:4, type:"Repos", name:"Repos actif", exIds:[] },
  { week:4, day:5, type:"Legs", name:"Jour 3 - Jambes max", exIds:["e29","e27","e31","e33","e28","e34","e39"] },
  { week:4, day:6, type:"Repos", name:"Repos total", exIds:[] },
  { week:4, day:7, type:"Full", name:"Jour 4 - Decharge", exIds:["e1","e9","e21","e25","e28","e34"] },
];

// -- Helpers -----------------------------------------------------------------
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate  = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
const fmtShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
const KEY = "prisedepoid_v1";
const loadDB = () => { try { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : {}; } catch { return {}; } };
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

// ==================== DISCLAIMER SCREEN ====================================
function DisclaimerScreen({ onAccept }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <div style={{
      minHeight:"100vh", background:"#050510", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px", fontFamily:"system-ui,sans-serif"
    }}>
      <div style={{maxWidth:420, width:"100%"}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{fontSize:40, fontWeight:900, color:"#f97316", letterSpacing:4}}>GainMode</div>
          <div style={{fontSize:12, color:"#6b7280", letterSpacing:2, marginTop:4}}>BUILT DIFFERENT</div>
        </div>

        {/* Card */}
        <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:16, padding:24, marginBottom:20}}>
          <div style={{fontSize:16, fontWeight:800, color:"#f97316", marginBottom:16, textAlign:"center"}}>
            Avertissement important
          </div>

          <div style={{fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:16}}>
            GainMode est une application de suivi personnel creee a titre indicatif uniquement.
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12, marginBottom:16}}>
            {[
              ["Pas un avis medical", "Cette application ne remplace en aucun cas une consultation avec un medecin, un nutritionniste ou un coach sportif diplome."],
              ["Donnees approximatives", "Les valeurs caloriques et nutritionnelles sont des estimations. Elles ne constituent pas un bilan nutritionnel precis."],
              ["Usage strictement personnel", "Cette application a ete creee pour un usage personnel prive. Toute utilisation par un tiers sans autorisation explicite du createur est faite sous sa propre responsabilite."],
              ["Consulte un professionnel", "Avant tout changement alimentaire ou programme sportif significatif, consulte un professionnel de sante qualifie."],
            ].map(([title, text]) => (
              <div key={title} style={{background:"#1e293b", borderRadius:10, padding:"12px 14px", borderLeft:"3px solid #f97316"}}>
                <div style={{fontSize:12, fontWeight:700, color:"#f97316", marginBottom:4}}>{title}</div>
                <div style={{fontSize:12, color:"#6b7280", lineHeight:1.6}}>{text}</div>
              </div>
            ))}
          </div>

          {/* Checkbox */}
          <div style={{display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", padding:"8px 0"}}
            onClick={() => setChecked(c => !c)}>
            <div style={{
              width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1,
              background: checked ? "#f97316" : "#1f2937",
              border: `2px solid ${checked ? "#f97316" : "#374151"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .2s"
            }}>
              {checked && <span style={{color:"#fff", fontSize:14, fontWeight:900}}>OK</span>}
            </div>
            <span style={{fontSize:12, color:"#94a3b8", lineHeight:1.6}}>
              Je comprends que GainMode est un outil indicatif personnel et non un substitut a un suivi medical ou sportif professionnel. J'utilise cette application sous ma propre responsabilite.
            </span>
          </div>
        </div>

        {/* Accept button */}
        <button
          onClick={onAccept}
          disabled={!checked}
          style={{
            width:"100%", padding:"15px",
            background: checked ? "linear-gradient(135deg,#f97316,#fbbf24)" : "#1f2937",
            color: checked ? "#fff" : "#374151",
            border:"none", borderRadius:12,
            fontWeight:800, fontSize:15, letterSpacing:1,
            cursor: checked ? "pointer" : "not-allowed",
            transition:"all .3s"
          }}>
          {checked ? "Acceder a GainMode" : "Cochez la case pour continuer"}
        </button>

        <div style={{fontSize:10, color:"#374151", textAlign:"center", marginTop:12, lineHeight:1.5}}>
          Ce message n'apparaitra qu'une seule fois. En cas de doute sur ta sante, consulte toujours un professionnel.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Lire localStorage de facon synchrone pour eviter le flash noir
  const [disclaimer, setDisclaimer] = useState(() => {
    try { return localStorage.getItem("gainmode_disclaimer") !== "accepted"; }
    catch { return true; }
  });
  const [tab, setTab]   = useState("journal");
  const [db,  setDb]    = useState(loadDB);
  const [date, setDate] = useState(todayStr());
  const [openMeal, setOpenMeal]   = useState(null);
  const [search, setSearch]       = useState("");
  const [searchCat, setSearchCat] = useState("Tous");
  const [qtyMode, setQtyMode]     = useState("g");
  const [qtyVal, setQtyVal]       = useState("100");
  const [selectedFood, setSelectedFood] = useState(null);
  const [manualEntry, setManualEntry]   = useState(false);
  const [manual, setManual] = useState({ name:"", cal:"", protein:"", carbs:"", fat:"", fiber:"", sugar:"" });
  const [weightInput, setWeightInput]   = useState("");
  const [sleepInput, setSleepInput]     = useState("");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDayInWeek, setCurrentDayInWeek] = useState(1);
  const [loggedSessions, setLoggedSessions] = useState({});

  useEffect(() => saveDB(db), [db]);

  const acceptDisclaimer = () => {
    try { localStorage.setItem("gainmode_disclaimer", "accepted"); } catch {}
    setDisclaimer(false);
  };

  // Conditional render APRES tous les hooks
  if (disclaimer) {
    return <DisclaimerScreen onAccept={acceptDisclaimer} />;
  }

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

  const editItemQty = (mealId, itemId, newGrams) => {
    const meals = { ...(day.meals||{}) };
    meals[mealId] = (meals[mealId]||[]).map(item => {
      if (item.id !== itemId) return item;
      const food = FOOD_DB.find(f => f.name === item.name);
      if (!food) return { ...item, grams: newGrams, displayQty: newGrams+"g" };
      const macros = calcFoodMacros(food, newGrams);
      return { ...item, grams: newGrams, displayQty: newGrams+"g", ...macros };
    });
    updateDay({ meals });
  };

  const [editingItem, setEditingItem] = React.useState(null); // {mealId, itemId}
  const [editGrams, setEditGrams] = React.useState("");

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
        @keyframes slideInRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #f9731640}50%{box-shadow:0 0 24px #f97316aa}}
        @keyframes warningPulse{0%,100%{background:#7f1d1d}50%{background:#991b1b}}
        .slide-in{animation:slideInUp .25s cubic-bezier(.4,0,.2,1)}
        .tab-active-glow{box-shadow:0 2px 12px #f9731660 !important;}
      `}</style>

      {/* -- HEADER ------------------------------------------------------- */}
      <header style={S.header}>
        <div>
          <div style={S.logo}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight:8}}>
              <rect width="38" height="38" rx="10" fill="#f97316"/>
              <text x="19" y="27" textAnchor="middle" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="22" fill="white" letterSpacing="-2">GM</text>
            </svg>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:"#f97316",letterSpacing:2,lineHeight:1}}>GainMode</div>
            </div>
          </div>
          <div style={S.headerSub}>60 kg vers 70 kg . 6 mois . {adjustedCal} kcal/jour</div>
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
          {id:"menus",  icon:"",label:"Menus"},
          {id:"program",icon:"",label:"Sport"},
          {id:"stats",  icon:"",label:"Stats"},
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
          <div style={S.page} className="slide-in">
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
                          {items.map((item,i)=>{
                            const isEditing = editingItem?.mealId===slot.id && editingItem?.itemId===item.id;
                            return (
                              <React.Fragment key={item.id}>
                                <tr style={{background:i%2===0?"#111827":"#0f172a"}}>
                                  <td style={S.itd}>{item.name}</td>
                                  <td style={{...S.itd,color:"#9ca3af",fontSize:10}}>{item.displayQty}</td>
                                  <td style={{...S.itd,color:"#f97316",fontWeight:700}}>{item.cal}</td>
                                  <td style={{...S.itd,color:"#ef4444"}}>{item.protein}g</td>
                                  <td style={{...S.itd,color:"#f59e0b"}}>{item.carbs}g</td>
                                  <td style={{...S.itd,color:"#8b5cf6"}}>{item.fat}g</td>
                                  <td style={{...S.itd,color:"#10b981"}}>{item.fiber}g</td>
                                  <td style={{...S.itd,display:"flex",gap:3}}>
                                    <button style={{background:"#1e3a5f",color:"#60a5fa",border:"none",borderRadius:4,padding:"2px 5px",fontSize:10}}
                                      onClick={()=>{setEditingItem({mealId:slot.id,itemId:item.id});setEditGrams(String(item.grams||100));}}>
                                      Edit
                                    </button>
                                    <button style={S.removeBtn} onClick={()=>removeItem(slot.id,item.id)}>X</button>
                                  </td>
                                </tr>
                                {isEditing && (
                                  <tr style={{background:"#1e293b"}}>
                                    <td colSpan="8" style={{padding:"10px 12px"}}>
                                      <div style={{fontSize:11,color:"#f97316",fontWeight:700,marginBottom:8}}>Modifier {item.name}</div>
                                      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                                        <span style={{fontSize:11,color:"#9ca3af"}}>Quantite :</span>
                                        <input type="number" value={editGrams} onChange={e=>setEditGrams(e.target.value)}
                                          style={{background:"#111827",border:"1px solid #374151",color:"#f1f5f9",borderRadius:6,padding:"4px 8px",fontSize:13,width:65}}/>
                                        <span style={{fontSize:11,color:"#6b7280"}}>g</span>
                                      </div>
                                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                                        {[
                                          {label:"Cal",key:"cal",color:"#f97316"},
                                          {label:"Prot",key:"protein",color:"#ef4444"},
                                          {label:"Gluc",key:"carbs",color:"#f59e0b"},
                                          {label:"Lip",key:"fat",color:"#8b5cf6"},
                                          {label:"Fib",key:"fiber",color:"#10b981"},
                                          {label:"Suc",key:"sugar",color:"#ec4899"},
                                        ].map(field => (
                                          <div key={field.key} style={{display:"flex",flexDirection:"column",gap:2,alignItems:"center"}}>
                                            <span style={{fontSize:9,color:field.color,fontWeight:700}}>{field.label}</span>
                                            <input type="number" step="0.1"
                                              defaultValue={item[field.key]}
                                              id={`edit-${item.id}-${field.key}`}
                                              style={{background:"#111827",border:`1px solid ${field.color}40`,color:field.color,
                                                borderRadius:5,padding:"3px 5px",fontSize:11,width:52,textAlign:"center"}}/>
                                          </div>
                                        ))}
                                      </div>
                                      <div style={{display:"flex",gap:8}}>
                                        <button onClick={()=>{
                                          const meals = {...(day.meals||{})};
                                          meals[slot.id] = (meals[slot.id]||[]).map(it => {
                                            if (it.id !== item.id) return it;
                                            const getVal = (key) => {
                                              const el = document.getElementById("edit-"+item.id+"-"+key);
                                              return el ? (parseFloat(el.value)||0) : it[key];
                                            };
                                            return {...it, grams: parseFloat(editGrams)||it.grams, displayQty:(editGrams||it.grams)+"g",
                                              cal:getVal("cal"), protein:getVal("protein"), carbs:getVal("carbs"),
                                              fat:getVal("fat"), fiber:getVal("fiber"), sugar:getVal("sugar")};
                                          });
                                          updateDay({meals}); setEditingItem(null);
                                        }} style={{background:"#10b981",border:"none",color:"#fff",borderRadius:6,padding:"7px 14px",fontSize:12,fontWeight:700}}>
                                          Valider
                                        </button>
                                        <button onClick={()=>setEditingItem(null)}
                                          style={{background:"#374151",border:"none",color:"#9ca3af",borderRadius:6,padding:"7px 12px",fontSize:12}}>
                                          Annuler
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
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
          <ProgramTab day={day} updateDay={updateDay} />
        )}

        {/* ==================== STATS ==================================== */}
        {tab==="stats"&&(
          <div style={S.page} className="slide-in">
            {/* Weight chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}> Évolution du poids</div>
              <div style={S.chartSubtitle}>{PROFILE.startWeight} kg - objectif {PROFILE.targetWeight} kg</div>
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

            {/* Graphique Sommeil */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}> Sommeil - 14 derniers jours</div>
              <div style={S.chartSubtitle}>Objectif : 8h minimum</div>
              {(() => {
                const sleepData = last14.map(d => ({ d, s: db[d]?.sleep || 0 }));
                const hasSleep = sleepData.some(x => x.s > 0);
                if (!hasSleep) return (
                  <div style={S.chartEmpty}>
                    Enregistre ton sommeil chaque soir depuis l'onglet Journal pour voir ce graphique.
                  </div>
                );
                const maxS = Math.max(...sleepData.map(x => x.s), 10);
                return (
                  <svg width="100%" viewBox="0 0 360 130" style={{overflow:"visible",marginTop:12}}>
                    {/* Gridlines */}
                    {[0,0.25,0.5,0.75,1].map(f => (
                      <line key={f} x1="0" x2="360" y1={f*100} y2={f*100} stroke="#1f2937" strokeWidth="1"/>
                    ))}
                    {/* 8h target line */}
                    <line x1="0" x2="360" y1={100-(8/maxS)*100} y2={100-(8/maxS)*100}
                      stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3"/>
                    <text x="3" y={100-(8/maxS)*100-4} fill="#10b981" fontSize="8">8h ideal</text>
                    {/* 6h warning line */}
                    <line x1="0" x2="360" y1={100-(6/maxS)*100} y2={100-(6/maxS)*100}
                      stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
                    <text x="3" y={100-(6/maxS)*100-4} fill="#ef4444" fontSize="8">6h min</text>
                    {/* Bars */}
                    {sleepData.map((x,i) => {
                      const barW = 360/14 - 2;
                      const bx = i * (360/14) + 1;
                      const h = x.s ? Math.max(4, (x.s/maxS)*100) : 0;
                      const col = x.s >= 8 ? "#10b981" : x.s >= 6 ? "#f59e0b" : x.s > 0 ? "#ef4444" : "#1f2937";
                      return (
                        <g key={x.d}>
                          <rect x={bx} y={100-h} width={barW} height={h} fill={col} rx="3"/>
                          {x.s > 0 && (
                            <text x={bx+barW/2} y={100-h-4} fill={col} fontSize="7" textAnchor="middle">{x.s}h</text>
                          )}
                          {i % 2 === 0 && (
                            <text x={bx+barW/2} y={118} fill="#6b7280" fontSize="7" textAnchor="middle">
                              {fmtShort(x.d).slice(0,5)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
              {/* Legend */}
              <div style={{display:"flex",gap:16,marginTop:10,fontSize:11,flexWrap:"wrap"}}>
                <span style={{color:"#10b981",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:10,height:10,background:"#10b981",borderRadius:2,display:"inline-block"}}/>
                  8h+ Excellent
                </span>
                <span style={{color:"#f59e0b",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:10,height:10,background:"#f59e0b",borderRadius:2,display:"inline-block"}}/>
                  6-8h Correct
                </span>
                <span style={{color:"#ef4444",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:10,height:10,background:"#ef4444",borderRadius:2,display:"inline-block"}}/>
                  Moins 6h Insuffisant
                </span>
              </div>
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

        {/* ==================== MENUS ===================================== */}
        {tab==="menus"&&(
          <MenusTab addMenuToMeal={(slotId, entry) => { const meals = {...(day.meals||{})}; meals[slotId] = [...(meals[slotId]||[]), entry]; updateDay({meals}); }} />
        )}

        {tab==="tips"&&(
          <div style={S.page} className="slide-in">
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
                "Lait entier : 2x plus calorique que le demi-écrémé, même prix. Vise 500ml/jour.",
                "Avoine (1kg ~3€) : 389 kcal/100g + protéines. En 3 min au micro-ondes.",
                "Viande hachée 15% : 3x moins chère que le filet, plus calorique, autant de protéines.",
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

// ==================== MENUS TAB COMPONENT ==================================

// ==================== PROGRAM TAB COMPONENT ================================
function ProgramTab({ day, updateDay }) {
  const [currentWeek, setCurrentWeek] = React.useState(1);
  const [currentDayInWeek, setCurrentDayInWeek] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState("program");
  const [filterMuscle, setFilterMuscle] = React.useState("Tous");
  const [filterEquip, setFilterEquip] = React.useState("Tous");
  const [filterLevel, setFilterLevel] = React.useState("Tous");
  const [customExos, setCustomExos] = React.useState({});
  const [swapMode, setSwapMode] = React.useState(null);
  // Timer states
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerPaused, setTimerPaused] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(0);
  const [timerTarget, setTimerTarget] = React.useState(0);
  const [currentExIdx, setCurrentExIdx] = React.useState(0);
  const [currentSet, setCurrentSet] = React.useState(1);
  const timerRef = React.useRef(null);

  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.8, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 1.2);
    } catch(e) {}
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  };

  React.useEffect(() => {
    if (timerActive && !timerPaused) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            setTimerSeconds(0);
            playBell();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timerPaused]);

  const startTimer = (secs) => {
    setTimerSeconds(secs);
    setTimerTarget(secs);
    setTimerActive(true);
    setTimerPaused(false);
  };
  const stopTimer = () => { setTimerActive(false); setTimerSeconds(0); setTimerPaused(false); };
  const togglePause = () => setTimerPaused(p => !p);

  const programDay = PROGRAM.find(p => p.week === currentWeek && p.day === currentDayInWeek);
  const dayExercises = programDay ? programDay.exIds.map((id, i) => {
    const customKey = `${currentWeek}-${currentDayInWeek}-${i}`;
    const customId = customExos[customKey];
    return EXERCISES_DB.find(e => e.id === (customId || id));
  }).filter(Boolean) : [];
  const totalCalDay = dayExercises.reduce((s,e) => s + e.cal * e.sets, 0);

  const muscles = ["Tous", ...Array.from(new Set(EXERCISES_DB.map(e => e.muscle)))];
  const equips  = ["Tous", "Corps", "Halteres"];
  const levels  = ["Tous", "debutant", "intermediaire", "avance"];

  const filteredEx = EXERCISES_DB.filter(e => {
    const mOk = filterMuscle === "Tous" || e.muscle === filterMuscle;
    const eOk = filterEquip === "Tous" || e.equipment === filterEquip;
    const lOk = filterLevel === "Tous" || e.level === filterLevel;
    return mOk && eOk && lOk;
  });

  const logSession = () => {
    if (!dayExercises.length) return;
    const exercises = [...(day.exercises||[]), {
      name: programDay.name,
      cal: totalCalDay,
      week: currentWeek,
      day: currentDayInWeek
    }];
    updateDay({ exercises });
    if (currentDayInWeek < 7) setCurrentDayInWeek(d => d+1);
    else if (currentWeek < 4) { setCurrentWeek(w => w+1); setCurrentDayInWeek(1); }
  };

  const typeColor = { Push:"#f97316", Pull:"#3b82f6", Legs:"#10b981", Full:"#8b5cf6", Repos:"#374151" };
  const levelColor = { debutant:"#10b981", intermediaire:"#f59e0b", avance:"#ef4444" };
  const muscleColor = { Pecs:"#f97316", Epaules:"#3b82f6", Triceps:"#8b5cf6", Dos:"#10b981", Biceps:"#06b6d4", Jambes:"#f59e0b", Fessiers:"#ec4899", Mollets:"#84cc16", Abdos:"#ef4444", "Full Body":"#a78bfa" };

  return (
    <div style={{padding:"12px 12px 60px",display:"flex",flexDirection:"column",gap:10}}>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:6,background:"#0f172a",borderRadius:12,padding:6}}>
        <button onClick={()=>setActiveTab("program")}
          style={{flex:1,border:"none",borderRadius:8,padding:"8px",fontWeight:700,fontSize:12,
            background:activeTab==="program"?"#f97316":"transparent",color:activeTab==="program"?"#fff":"#6b7280"}}>
          Programme
        </button>
        <button onClick={()=>setActiveTab("exercises")}
          style={{flex:1,border:"none",borderRadius:8,padding:"8px",fontWeight:700,fontSize:12,
            background:activeTab==="exercises"?"#f97316":"transparent",color:activeTab==="exercises"?"#fff":"#6b7280"}}>
          Tous les exos
        </button>
      </div>

      {activeTab==="program" && (
        <>
          {/* Week selector */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {[1,2,3,4].map(w=>(
              <button key={w} onClick={()=>{setCurrentWeek(w);setCurrentDayInWeek(1);}}
                style={{border:"none",borderRadius:8,padding:"10px 4px",fontWeight:700,fontSize:12,
                  background:currentWeek===w?"#f97316":"#1f2937",color:currentWeek===w?"#fff":"#9ca3af"}}>
                Semaine {w}
              </button>
            ))}
          </div>

          {/* Day selector */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {["L","M","M","J","V","S","D"].map((d,i)=>{
              const dayNum=i+1;
              const prog=PROGRAM.find(p=>p.week===currentWeek&&p.day===dayNum);
              const isRest=prog?.type==="Repos";
              const isSelected=currentDayInWeek===dayNum;
              const tc = typeColor[prog?.type]||"#374151";
              return (
                <button key={i} onClick={()=>setCurrentDayInWeek(dayNum)}
                  style={{border:`1px solid ${isSelected?tc:"#1f2937"}`,borderRadius:8,padding:"7px 2px",
                    display:"flex",flexDirection:"column",alignItems:"center",
                    background:isSelected?tc:"#0f172a",color:isSelected?"#fff":isRest?"#374151":"#e2e8f0"}}>
                  <div style={{fontWeight:700,fontSize:13}}>{d}</div>
                  <div style={{fontSize:8,marginTop:2}}>{isRest?"Repos":prog?.type||""}</div>
                </button>
              );
            })}
          </div>

          {/* Session */}
          {programDay && (
            <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"12px 14px",background:"#111827",borderBottom:"1px solid #1f2937"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{programDay.name}</div>
                  <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Semaine {programDay.week} - Jour {programDay.day}</div>
                </div>
                {dayExercises.length > 0 && (
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"#ef4444",fontWeight:800,fontSize:16}}>~{totalCalDay}</div>
                    <div style={{fontSize:9,color:"#6b7280"}}>kcal brûlées</div>
                  </div>
                )}
              </div>

              {dayExercises.length === 0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 20px",textAlign:"center"}}>
                  <div style={{fontSize:36}}>Z</div>
                  <div style={{fontSize:15,fontWeight:700,marginTop:8}}>Jour de repos</div>
                  <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>Mange bien, dors 8h. La croissance se fait au repos.</div>
                </div>
              ) : (
                <>
                  {dayExercises.map((ex,i) => (
                    <div key={ex.id} style={{padding:"10px 14px",borderBottom:"1px solid #111827",
                      background:i%2===0?"#0f172a":"#111827",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:28,height:28,borderRadius:8,background:muscleColor[ex.muscle]||"#374151",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0}}>
                        {i+1}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:13,fontWeight:700}}>{ex.name}</div>
                          <div style={{fontSize:11,color:"#ef4444",fontWeight:700}}>~{ex.cal*ex.sets} kcal</div>
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                          <span style={{background:"#1f2937",borderRadius:5,padding:"2px 7px",fontSize:10,color:"#f97316",fontWeight:700}}>{ex.sets} séries</span>
                          <span style={{background:"#1f2937",borderRadius:5,padding:"2px 7px",fontSize:10,color:"#e2e8f0"}}>{ex.reps} reps</span>
                          <span style={{background:"#1f2937",borderRadius:5,padding:"2px 7px",fontSize:10,color:"#6b7280"}}>{ex.rest}s repos</span>
                          <span style={{background:(muscleColor[ex.muscle]||"#374151")+"30",borderRadius:5,padding:"2px 7px",fontSize:10,color:muscleColor[ex.muscle]||"#e2e8f0"}}>{ex.muscle}</span>
                          <span style={{background:ex.equipment==="Halteres"?"#3b82f620":"#10b98120",borderRadius:5,padding:"2px 7px",fontSize:10,color:ex.equipment==="Halteres"?"#60a5fa":"#4ade80"}}>{ex.equipment}</span>
                        </div>
                        <div style={{fontSize:11,color:"#f59e0b",marginTop:4}}>Tip: {ex.tip}</div>
                        {/* Swap button */}
                        <button onClick={()=>setSwapMode(swapMode===ex.id?null:ex.id)}
                          style={{background:"#1f2937",border:"1px solid #374151",color:"#6b7280",
                            borderRadius:6,padding:"3px 8px",fontSize:10,marginTop:6}}>
                          Changer cet exo
                        </button>
                        {swapMode===ex.id && (
                          <div style={{background:"#0a0a1a",border:"1px solid #374151",borderRadius:8,padding:8,marginTop:6}}>
                            <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>Remplacer par :</div>
                            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:160,overflowY:"auto"}}>
                              {EXERCISES_DB.filter(e2=>e2.muscle===ex.muscle && e2.id!==ex.id).map(e2=>(
                                <button key={e2.id}
                                  onClick={()=>{
                                    setCustomExos(prev=>({...prev,[`${currentWeek}-${currentDayInWeek}-${i}`]:e2.id}));
                                    setSwapMode(null);
                                  }}
                                  style={{background:"#1f2937",border:"none",color:"#e2e8f0",borderRadius:6,
                                    padding:"6px 10px",fontSize:11,textAlign:"left"}}>
                                  {e2.name} - {e2.level}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{padding:"12px 14px"}}>
                    <button onClick={logSession}
                      style={{width:"100%",background:"#10b981",border:"none",color:"#fff",borderRadius:8,
                        padding:"11px",fontWeight:700,fontSize:13}}>
                      Logger cette séance (+{totalCalDay} kcal ajoutées au journal)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Logged today */}
          {(day.exercises||[]).length > 0 && (
            <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"#f97316",marginBottom:10}}>Sport loggué aujourd'hui</div>
              {(day.exercises||[]).map((e,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #111827"}}>
                  <span style={{flex:1,fontSize:12}}>{e.name}</span>
                  <span style={{color:"#ef4444",fontWeight:700,fontSize:12}}>-{e.cal} kcal</span>
                  <button onClick={()=>{
                    const exercises=(day.exercises||[]).filter((_,idx)=>idx!==i);
                    updateDay({exercises});
                  }} style={{background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:4,padding:"2px 7px",fontSize:10}}>X</button>
                </div>
              ))}
              <div style={{fontSize:11,color:"#f97316",fontWeight:700,paddingTop:8}}>
                Total brûlé : {(day.exercises||[]).reduce((s,e)=>s+(e.cal||0),0)} kcal
              </div>
            </div>
          )}
        </>
      )}

      {activeTab==="exercises" && (
        <>
          {/* Muscles filter - scroll horizontal contenu, pas la page */}
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:-12,marginRight:-12,paddingLeft:12,paddingRight:12}}>
            <div style={{display:"flex",gap:5,width:"max-content",paddingBottom:4}}>
              {muscles.map(m=>(
                <button key={m} onClick={()=>setFilterMuscle(m)}
                  style={{border:"none",borderRadius:6,padding:"6px 11px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,
                    background:filterMuscle===m?(muscleColor[m]||"#f97316"):"#1f2937",
                    color:filterMuscle===m?"#fff":"#9ca3af"}}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          {/* Equip + Level filter - wrap propre */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {equips.map(e=>(
              <button key={e} onClick={()=>setFilterEquip(e)}
                style={{border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,
                  background:filterEquip===e?"#3b82f6":"#1f2937",color:filterEquip===e?"#fff":"#9ca3af"}}>
                {e}
              </button>
            ))}
            {levels.map(l=>(
              <button key={l} onClick={()=>setFilterLevel(l)}
                style={{border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,
                  background:filterLevel===l?(levelColor[l]||"#374151"):"#1f2937",color:filterLevel===l?"#fff":"#9ca3af"}}>
                {l==="Tous"?"Tous niveaux":l}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"#6b7280"}}>{filteredEx.length} exercices</div>

          {filteredEx.map(ex => (
            <div key={ex.id} style={{background:"#0f172a",border:`1px solid ${muscleColor[ex.muscle]||"#1f2937"}40`,
              borderLeft:`3px solid ${muscleColor[ex.muscle]||"#f97316"}`,borderRadius:10,padding:"11px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>{ex.name}</div>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{background:(muscleColor[ex.muscle]||"#374151")+"30",borderRadius:5,padding:"2px 7px",fontSize:10,color:muscleColor[ex.muscle]||"#e2e8f0",fontWeight:700}}>{ex.muscle}</span>
                    <span style={{background:ex.equipment==="Halteres"?"#3b82f620":"#10b98120",borderRadius:5,padding:"2px 7px",fontSize:10,color:ex.equipment==="Halteres"?"#60a5fa":"#4ade80"}}>{ex.equipment}</span>
                    <span style={{background:levelColor[ex.level]+"30",borderRadius:5,padding:"2px 7px",fontSize:10,color:levelColor[ex.level],fontWeight:700}}>{ex.level}</span>
                  </div>
                  <div style={{fontSize:11,color:"#f59e0b",marginTop:5}}>Tip: {ex.tip}</div>
                </div>
                <div style={{textAlign:"right",marginLeft:10}}>
                  <div style={{fontSize:11,color:"#f97316",fontWeight:700}}>{ex.sets}x{ex.reps}</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>{ex.rest}s repos</div>
                  <div style={{fontSize:11,color:"#ef4444",fontWeight:700,marginTop:2}}>~{ex.cal*ex.sets} kcal</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function MenusTab({ addMenuToMeal = () => {} }) {
  const [search, setSearch] = React.useState("");
  const [slot, setSlot] = React.useState("all");
  const [tag, setTag] = React.useState("all");
  const [selected, setSelected] = React.useState(null);

  const slots = [
    {id:"all",    label:"Tous"},
    {id:"breakfast", label:"Petit-dej"},
    {id:"lunch",  label:"Déjeuner"},
    {id:"snack",  label:"Goûter"},
    {id:"dinner", label:"Dîner"},
  ];

  const allTags = ["all","rapide","masse","protéines","budget","gourmand","classique","sport","healthy","weekend","shake"];

  const filtered = MENUS_DB.filter(m => {
    const matchSlot = slot === "all" || m.slot === slot;
    const matchTag  = tag === "all" || m.tags.includes(tag);
    const matchQ    = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchSlot && matchTag && matchQ;
  });

  const slotColor = {breakfast:"#f59e0b", lunch:"#10b981", snack:"#8b5cf6", dinner:"#ef4444"};
  const slotLabel = {breakfast:"Petit-dej", lunch:"Déjeuner", snack:"Goûter", dinner:"Dîner"};

  return (
    <div style={{padding:"12px 12px 60px",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Idées de repas</div>
        <div style={{fontSize:11,color:"#6b7280"}}>{MENUS_DB.length} menus complets avec calories et macros</div>
      </div>

      {/* Search */}
      <input
        placeholder="Rechercher un menu..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{background:"#0f172a",border:"1px solid #374151",color:"#f1f5f9",borderRadius:10,padding:"10px 14px",fontSize:13,width:"100%"}}
      />

      {/* Slot filter */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
        {slots.map(s => (
          <button key={s.id} onClick={() => setSlot(s.id)}
            style={{border:"none",borderRadius:8,padding:"6px 12px",fontWeight:700,fontSize:11,whiteSpace:"nowrap",
              background: slot===s.id ? "#f97316" : "#1f2937",
              color: slot===s.id ? "#fff" : "#9ca3af"}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
        {allTags.map(t => (
          <button key={t} onClick={() => setTag(t)}
            style={{border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",
              background: tag===t ? "#3b82f6" : "#111827",
              color: tag===t ? "#fff" : "#6b7280"}}>
            {t === "all" ? "Tous les tags" : t}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{fontSize:11,color:"#6b7280",paddingLeft:2}}>{filtered.length} menu{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</div>

      {/* Menu list */}
      {filtered.map(menu => (
        <div key={menu.id}
          style={{background:"#0f172a",border:`1px solid ${selected?.id===menu.id?"#f97316":"#1f2937"}`,borderLeft:`3px solid ${slotColor[menu.slot]||"#f97316"}`,borderRadius:12,overflow:"hidden",cursor:"pointer"}}
          onClick={() => setSelected(selected?.id===menu.id ? null : menu)}>
          <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>{menu.name}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{slotLabel[menu.slot]}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:900,color:"#f97316"}}>{menu.cal}</div>
              <div style={{fontSize:9,color:"#6b7280"}}>kcal</div>
            </div>
            <span style={{color:"#6b7280",fontSize:14}}>{selected?.id===menu.id ? "^" : "v"}</span>
          </div>

          {selected?.id===menu.id && (
            <div style={{padding:"0 14px 14px",borderTop:"1px solid #1f2937"}}>
              <p style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6,marginTop:10,marginBottom:10}}>{menu.desc}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                <span style={{background:"#ef444420",color:"#f87171",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>Prot: {menu.protein}g</span>
                <span style={{background:"#f59e0b20",color:"#fbbf24",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>Gluc: {menu.carbs}g</span>
                <span style={{background:"#8b5cf620",color:"#a78bfa",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>Lip: {menu.fat}g</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {menu.tags.map(t => (
                  <span key={t} style={{background:"#1f2937",borderRadius:6,padding:"2px 8px",fontSize:10,color:"#6b7280"}}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
