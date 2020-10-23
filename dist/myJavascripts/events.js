const janListElem = document.getElementById("janList");
const febListElem = document.getElementById("febList");
const marchListElem = document.getElementById("marchList");
const aprilListElem = document.getElementById("aprilList");
const mayListElem = document.getElementById("mayList");

const janItemElem = document.getElementsByClassName("janItem");
const febItemElem = document.getElementsByClassName("febItem");
const marchItemElem = document.getElementsByClassName("marchItem");
const aprilItemElem = document.getElementsByClassName("aprilItem");
const mayItemElem = document.getElementsByClassName("mayItem");

const dateElem = document.getElementsByClassName("date text-muted mb-none");
const eventElem = document.getElementsByClassName("event");

let febFlag = false;
let marchFlag = false;
let aprilFlag = false;
let mayFlag = false;

const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1jYmfWfwL2Xz8ENmJRqakI1GQ1GQIxnicg6Zsh8JUMyo/edit?usp=sharing';

window.addEventListener('DOMContentLoaded', init);

// init Tabletop by passing sheet url to get data from the sheet, then call the processData func
function init() {
   Tabletop.init({
      key: publicSpreadsheetUrl,
      callback: processData,
      simpleSheet: true
   })
}

function processData(data, tabletop) {
   let size = data.length;
   //console.log(data);

   for (let i = 0; i < size; i++) {
      displayEvent(data[i], i);
   }
}

function displayEvent(data, i) {
   switch (data.month) {
      case "january":
         if (i > 0) {
            const clone = janItemElem[0].cloneNode(true);
            janListElem.appendChild(clone);
         }
         dateElem[i].innerHTML = data.date;
         eventElem[i].innerHTML = data.events;
         break;

      case "february":
         if (febFlag == true) {
            const clone = febItemElem[0].cloneNode(true);
            febListElem.appendChild(clone);
         }
         dateElem[i].innerHTML = data.date;
         eventElem[i].innerHTML = data.events;
         febFlag = true;
         break;

      case "march":
         if (marchFlag == true) {
            const clone = marchItemElem[0].cloneNode(true);
            marchListElem.appendChild(clone);
         }
         dateElem[i].innerHTML = data.date;
         eventElem[i].innerHTML = data.events;
         marchFlag = true;
         break;

      case "april":
         if (aprilFlag == true) {
            const clone = aprilItemElem[0].cloneNode(true);
            aprilListElem.appendChild(clone);
         }
         dateElem[i].innerHTML = data.date;
         eventElem[i].innerHTML = data.events;
         aprilFlag = true;
         break;
         
      case "may":
         if (mayFlag == true) {
            const clone = mayItemElem[0].cloneNode(true);
            mayListElem.appendChild(clone);
         }
         dateElem[i].innerHTML = data.date;
         eventElem[i].innerHTML = data.events;
         mayFlag = true;
         break;
   }
}