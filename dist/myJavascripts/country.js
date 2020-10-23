const countryCode = getCountryCode();
const API_URL = `https://covid19-api.org/api/timeline/${countryCode}`;
let covidData = [];
let flag = false;

writeCountryNameInTitle(countryCode);
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

function getCountryCode() {
   const url = window.location.href;
   const flagIndex = url.indexOf("?"); // we want to know the ? index in the url
   const countryCode = url.substring(flagIndex + 1, flagIndex + 3); // get the country code after the ? flag
   //console.log(countryCode);

   return countryCode;
}

function getPopulation() {
   const url = window.location.href;
   const flagIndex = url.indexOf(";"); // we want to know the ; index in the url
   const population = url.substring(flagIndex + 1); // get the population after the ; flag
   console.log(population);

   return population;
}

function writeCountryNameInTitle(countryCode) {
   const mainTitleElem = document.getElementById("mainTitle");
   const countryName = getCountryName(countryCode);

   mainTitleElem.append(countryName);
}

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
   //let covidData = [];
   let newCases = 0, recovered = 0, death = 0, differences = 0;
   let totalCases = [], totalRecovered = [], totalDeath = [], activeCases = [];
   let counter = 0;
   let date;

   for (let i = size - 1; i >= 0; i--) {
      //for (let i = 0; i < size; i++) {
      totalCases[counter] = data[i].cases;
      totalRecovered[counter] = data[i].recovered;
      totalDeath[counter] = data[i].deaths;
      activeCases[counter] = totalCases[counter] - totalRecovered[counter] - totalDeath[counter];
      date = changeDateFormat(data[i].last_update.substring(0, 10))

      // if it is not the first day, then we need to compare to the previous day
      if (counter > 0) {
         newCases = totalCases[counter] - totalCases[counter - 1];
         recovered = totalRecovered[counter] - totalRecovered[counter - 1];
         death = totalDeath[counter] - totalDeath[counter - 1];
         differences = activeCases[counter] - activeCases[counter - 1];
         //newCases[i - 1] == 0 ? (growthFactor = "NaN") : growthFactor = parseFloat((newCases[i] / newCases[i - 1]).toFixed(3));
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
         date: date
         /*growthFactor: growthFactor */
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
      //data.growthFactor
   ]).draw("full-reset");
}

function displaySummary(data, size) {
   const casesElem = document.getElementById("cases");
   const recoveredElem = document.getElementById("recovered");
   const deathsElem = document.getElementById("deaths");
   const activeCasesElem = document.getElementById("activeCases");
   const infectedElem = document.getElementById("infected");
   const differencesElem = document.getElementById("differences");
   const recovRateElem = document.getElementById("recovRate");
   const fatalityRateElem = document.getElementById("fatalityRate");
   const activeCasesPercentElem = document.getElementById("activeCasesPercent");
   const latest = size - 1;

   let infectedRate = data[latest].totalCases / getPopulation() * 100;
   let recovRate = data[latest].totalRecovered / data[latest].totalCases * 100;
   let fatalityRate = data[latest].totalDeath / data[latest].totalCases * 100;
   let activeCasesPercent = data[latest].activeCases / data[latest].totalCases * 100;
   let diff = "";

   let totalCases = formatNumber(data[latest].totalCases);
   let newCases = formatNumber(data[latest].new_case);
   let totalRecovered = formatNumber(data[latest].totalRecovered);
   let recovered = formatNumber(data[latest].recovered);
   let totalDeath = formatNumber(data[latest].totalDeath);
   let death = formatNumber(data[latest].death);
   let activeCases = formatNumber(data[latest].activeCases);

   infectedElem.innerHTML = (infectedRate).toFixed(2) + "%";
   recovRateElem.innerHTML = (recovRate).toFixed(2) + "%";
   fatalityRateElem.innerHTML = (fatalityRate).toFixed(2) + "%";
   activeCasesPercentElem.innerHTML = (activeCasesPercent).toFixed(2) + "%";

   data[latest].new_case > 0 ?
      (casesElem.innerHTML = `${totalCases} (&#8679;${newCases})`) :
      (casesElem.innerHTML = `${totalCases} (${newCases})`)

   data[latest].recovered > 0 ?
      (recoveredElem.innerHTML = `${totalRecovered} (&#8679;${recovered})`) :
      (recoveredElem.innerHTML = `${totalRecovered} (${recovered})`);

   data[latest].death > 0 ?
      (deathsElem.innerHTML = `${totalDeath} (&#8679;${death})`) :
      (deathsElem.innerHTML = `${totalDeath} (${death})`);

   data[latest].differences == 0 ?
      (differencesElem.value = 0) :
   data[latest].differences > 0 ?
      (differencesElem.value = `&#8679;${formatNumber(data[latest].differences)}`) :
      (diff = formatNumber(data[latest].differences).toString(), differencesElem.value = `&#8681;${diff.substr(1)}`);

   activeCasesElem.innerHTML = `${activeCases} (${differencesElem.value})`;
}