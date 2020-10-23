var countriesDetails = [];

getRequest("https://covid19-api.org/api/timeline", "summary");
getCountriesDetails('https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;population');

// get all countries' name, alpha2Code and population
function getCountriesDetails(url) {
   fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
         countriesDetails = data;
         //console.log(countriesDetails)
         // only after we get the countries' details, we fetch the countries' covid data
         getRequest("https://covid19-api.org/api/status", "table");
      })
      .catch((error) => {
         console.error('Error:', error);
      });
}

function getRequest(url, action) {
   fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
         action == "summary" ? (displaySummary(data)) :
            action == "table" ? (matchCountryWithItsPopulation(data)) :
               false;
      })
      .catch((error) => {
         console.error('Error:', error);
      });
}

function matchCountryWithItsPopulation(data) {
   const size = data.length;
   let num = 0;

   /* 
   data[i] is a country's covid data, we want to get the population for each country 
   which is fetched from another API and stored in countryDetails array.
   We do this by comparing the country code using .find
   Remember .find returns the value of the first element in the array that satisfies the provided testing func. 
   */
   for (let i = 0; i < size; i++) {
      if (data[i].cases !== 0) { // dont include the countries with no recorded case
         const currentCountry = countriesDetails.find(item => (item.alpha2Code === data[i].country));
         //console.log(currentCountry)

         num++;
         createRow(data[i], num, currentCountry.population);
      }
   }
}

function createRow(data, num, population) {
   const t = $('#datatable-tabletools').DataTable();

   let activeCases = data.cases - data.recovered - data.deaths;
   let recoveryRate = (data.recovered / data.cases * 100).toFixed(2);
   let fatalityRate = (data.deaths / data.cases * 100).toFixed(2);
   let infected = (data.cases / population * 100).toFixed(2);
   //console.log(infected)

   t.row.add([
      num,
      `<a href="country.html?${data.country};${population}">${getCountryName(data.country)}</a>`,
      formatNumber(data.cases),
      formatNumber(data.recovered),
      formatNumber(data.deaths),
      formatNumber(activeCases),
      `${recoveryRate}%`,
      `${fatalityRate}%`,
      `${infected}%`
   ]).draw("full-reset");
}

function displaySummary(data) {
   const result = data[0];
   const worldPopulation = 7646314700;
   const casesElem = document.getElementById("cases");
   const recoveredElem = document.getElementById("recovered");
   const deathsElem = document.getElementById("deaths");
   const activeCasesElem = document.getElementById("activeCases");
   const infectedElem = document.getElementById("infected");
   const recovRateElem = document.getElementById("recovRate");
   const fatalityRateElem = document.getElementById("fatalityRate");
   const activeCasesPercentElem = document.getElementById("activeCasesPercent");
   const daysElem = document.getElementById("days");

   let activeCases = result.total_cases - result.total_recovered - result.total_deaths;
   let recovRate = result.total_recovered / result.total_cases * 100;
   let fatalityRate = result.total_deaths / result.total_cases * 100;
   let activeCasesPercent = activeCases / result.total_cases * 100;
   let infected = result.total_cases / worldPopulation * 100;

   let today = new Date();
   const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
   const covidStarts = new Date(2019, 11, 8); // 0 is Jan //const covidStarts = new Date(2019, 10, 17);        
   let daysSinceCovid = Math.round(Math.abs((today - covidStarts) / oneDay));

   casesElem.innerHTML = formatNumber(result.total_cases);
   recoveredElem.innerHTML = formatNumber(result.total_recovered);
   deathsElem.innerHTML = formatNumber(result.total_deaths);
   activeCasesElem.innerHTML = formatNumber(activeCases);
   recovRateElem.innerHTML = (recovRate).toFixed(2) + "%";
   fatalityRateElem.innerHTML = (fatalityRate).toFixed(2) + "%";
   activeCasesPercentElem.innerHTML = (activeCasesPercent).toFixed(2) + "%";
   infectedElem.innerHTML = "Approx. " + (infected).toFixed(3) + "%";
   daysElem.innerHTML = "" + daysSinceCovid;
}

//sort numbers in Descending order.
/* function sortByProperty(property){
   return function(a,b){
      if(a[property] > b[property]) // return negative num, then a,b
         return -1;
      else if(a[property] < b[property]) // return positive num, then b,a
         return 1;

      return 0;
   }
} */