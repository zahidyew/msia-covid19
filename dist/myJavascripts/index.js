const API_URL = 'https://covid19-api.org/api/timeline/MY';
const population = 32255684;
let covidData = [];
let flag = false;

getRequest(API_URL);

// only when the user clicked the "Graphs" tab for 1st time will we draw the graphs
document.getElementById("graphs")
   .addEventListener("click", () => {
      if (flag === false) {
         drawGraph();
         drawGraph2();
         drawGraph3();
         flag = true
      }
   })

// use fetch api to get the covid data from an API
function getRequest(url) {
   fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
         //console.log(data);
         processData(data);
      })
      .catch((error) => {
         console.error('Error:', error);
      });
}

// process the raw data fetched from the API
function processData(data) {
   let size = data.length;
   let newCases = 0, recovered = 0, death = 0, differences = 0, populationInfected = 0;
   let totalCases = [], totalRecovered = [], totalDeath = [], activeCases = [];
   let counter = 0;
   let date;

   for (let i = size - 1; i >= 0; i--) {
      totalCases[counter] = data[i].cases;
      totalRecovered[counter] = data[i].recovered;
      totalDeath[counter] = data[i].deaths;
      activeCases[counter] = totalCases[counter] - totalRecovered[counter] - totalDeath[counter];
      populationInfected = parseFloat((totalCases[counter] / population * 100).toFixed(6));
      date = changeDateFormat(data[i].last_update.substring(0, 10))

      // if it is not the first day, then we need to compare to the previous day
      if (counter > 0) {
         newCases = totalCases[counter] - totalCases[counter - 1];
         recovered = totalRecovered[counter] - totalRecovered[counter - 1];
         death = totalDeath[counter] - totalDeath[counter - 1];
         differences = activeCases[counter] - activeCases[counter - 1];
      }

      // covidData is an array of objects
      covidData.push({
         totalCases: totalCases[counter],
         totalRecovered: totalRecovered[counter],
         totalDeath: totalDeath[counter],
         new_case: newCases,
         recovered: recovered,
         death: death,
         activeCases: activeCases[counter],
         differences: differences,
         populationInfected: populationInfected,
         date: date
      });
      counter++;
   }
   //console.log(covidData);
   useData(size);
}

function useData(size) {
   displaySummary(covidData, size);

   for (let i = 0; i < size; i++) {
      createRow(covidData[i], i + 1);
   }
   /* drawGraph(data);
   drawGraph2(data);
   drawGraph3(data); */
}

function createRow(data, num) {
   // since its a jquery table, gotta follow their method on adding new rows
   const t = $('#datatable-tabletools').DataTable();
   let diff;

   data.differences > 0 ?
      (diff = `+${formatNumber(data.differences)}`) :
      (diff = formatNumber(data.differences).toString());

   t.row.add([
      num,
      data.date,
      formatNumber(data.new_case),
      formatNumber(data.recovered),
      formatNumber(data.death),
      formatNumber(data.totalCases),
      formatNumber(data.totalRecovered),
      formatNumber(data.totalDeath),
      formatNumber(data.activeCases),
      diff,
      data.populationInfected + "%"
   ]).draw("full-reset");
}

function displaySummary(data, size) {
   const casesElem = document.getElementById("cases");
   const recoveredElem = document.getElementById("recovered");
   const deathsElem = document.getElementById("deaths");
   const activeCasesElem = document.getElementById("activeCases");
   const differencesElem = document.getElementById("differences");
   const infectedElem = document.getElementById("infected");
   const recovRateElem = document.getElementById("recovRate");
   const fatalityRateElem = document.getElementById("fatalityRate");
   const activeCasesPercentElem = document.getElementById("activeCasesPercent");
   const mcoDaysElem = document.getElementById("mcoDays");
   const since1stCaseElem = document.getElementById("since1stCase");
   //const mcoEndsElem = document.getElementById("mcoEnds");
   const latest = size - 1;

   let recovRate = data[latest].totalRecovered / data[latest].totalCases * 100;
   let fatalityRate = data[latest].totalDeath / data[latest].totalCases * 100;
   let activeCasesPercent = data[latest].activeCases / data[latest].totalCases * 100;
   let a = "";

   const daysSinceMco = calculateDaysSince("daysSinceMco");
   const daysSince1stCase = calculateDaysSince("daysSince1stCase");
   //const daysTillMco = Math.round(Math.abs((mcoEnds - today) / oneDay));

   infectedElem.innerHTML = "Approx. " + (data[latest].populationInfected).toFixed(3) + "%";
   recovRateElem.innerHTML = (recovRate).toFixed(2) + "%";
   fatalityRateElem.innerHTML = (fatalityRate).toFixed(2) + "%";
   activeCasesPercentElem.innerHTML = (activeCasesPercent).toFixed(2) + "%";

   data[latest].new_case > 0 ?
      (casesElem.innerHTML = `${formatNumber(data[latest].totalCases)} (&#8679;${data[latest].new_case})`) :
      (casesElem.innerHTML = `${formatNumber(data[latest].totalCases)} (${data[latest].new_case})`)

   data[latest].recovered > 0 ?
      (recoveredElem.innerHTML = `${formatNumber(data[latest].totalRecovered)} (&#8679;${data[latest].recovered})`) :
      (recoveredElem.innerHTML = `${formatNumber(data[latest].totalRecovered)} (${data[latest].recovered})`);

   data[latest].death > 0 ?
      (deathsElem.innerHTML = `${formatNumber(data[latest].totalDeath)} (&#8679;${data[latest].death})`) :
      (deathsElem.innerHTML = `${formatNumber(data[latest].totalDeath)} (${data[latest].death})`);

   data[latest].differences == 0 ?
      (differencesElem.value = 0) :
   data[latest].differences > 0 ?
      (differencesElem.value = `&#8679;${formatNumber(data[latest].differences)}`) :
      (a = formatNumber(data[latest].differences).toString(), differencesElem.value = `&#8681;${a.substr(1)}`);

   activeCasesElem.innerHTML = `${formatNumber(data[latest].activeCases)} (${differencesElem.value})`;
   mcoDaysElem.innerHTML = "" + daysSinceMco;
   since1stCaseElem.innerHTML = "" + daysSince1stCase;
   //mcoEndsElem.innerHTML = "" + daysTillMco;
}

function calculateDaysSince(type) {
   let today = new Date();
   const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
   let date, daysSince;

   if (type == "daysSinceMco") {
      date = new Date(2020, 2, 18);
      daysSince = Math.floor(Math.abs((today - date) / oneDay));
   }
   else if (type == "daysSince1stCase") {
      date = new Date(2020, 0, 25);
      daysSince = Math.floor(Math.abs((today - date) / oneDay));
   }

   return daysSince;
}