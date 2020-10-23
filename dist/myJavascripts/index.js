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

// draw line graph for new cases, recoveries & deaths vs date
function drawGraph() {
   am4core.useTheme(am4themes_patterns);
   am4core.useTheme(am4themes_animated);

   const chart = am4core.create("chartdiv", am4charts.XYChart);
   const xAxis = chart.xAxes.push(new am4charts.DateAxis());
   const yAxis = chart.yAxes.push(new am4charts.ValueAxis());

   chart.data = covidData;
   xAxis.renderer.minGridDistance = 50;

   const graph1 = createGraph(chart, "line", "New Cases", "dv", "date", "new_case", "default");
   const graph2 = createGraph(chart, "line", "Recovered", "dv", "date", "recovered", "#32CD32");
   const graph3 = createGraph(chart, "line", "Deaths", "dv", "date", "death", "#DC143C");

   // Add scrollbar
   chart.scrollbarX = new am4charts.XYChartScrollbar();
   chart.scrollbarX.series.push(graph1);
   chart.scrollbarX.series.push(graph2);
   chart.scrollbarX.series.push(graph3);

   // Add cursor
   chart.cursor = new am4charts.XYCursor();
   chart.cursor.xAxis = xAxis;
   chart.legend = new am4charts.Legend();
   //chart.cursor.snapToSeries = series;         
   //series2.hidden = true;
}

// draw line graph for total infected vs total cases
function drawGraph2() {
   const chart = am4core.create("chartdiv2", am4charts.XYChart);
   const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
   const yAxis = chart.yAxes.push(new am4charts.ValueAxis());

   chart.data = covidData;
   xAxis.renderer.minGridDistance = 50;
   //yAxis.logarithmic = true;

   const graph = createGraph(chart, "line", "Total Infected", "vv", "totalCases", "new_case", "default");
   //const graph2 = createGraph(chart, "line", "Total Infected", "vv", "totalCases", "recovered", "default");

   // Add scrollbar
   chart.scrollbarX = new am4charts.XYChartScrollbar();
   chart.scrollbarX.series.push(graph);
   //chart.scrollbarX.series.push(graph2);

   // Add cursor & disable some elements
   chart.cursor = new am4charts.XYCursor();
   //chart.legend = new am4charts.Legend();
   chart.cursor.snapToSeries = graph;
   /* chart.cursor.lineX.disabled = true;
   chart.cursor.lineY.disabled = true; */
   xAxis.cursorTooltipEnabled = false;
   yAxis.cursorTooltipEnabled = false;
}

// draw line graph for active cases, total cases, total recovered & total death vs date
function drawGraph3() {
   const chart = am4core.create("chartdiv3", am4charts.XYChart);
   const xAxis = chart.xAxes.push(new am4charts.DateAxis());
   const yAxis = chart.yAxes.push(new am4charts.ValueAxis());

   chart.data = covidData;
   xAxis.renderer.minGridDistance = 50;

   const graph1 = createGraph(chart, "line", "Active Cases", "dv", "date", "activeCases", "default");
   const graph2 = createGraph(chart, "line", "Total Cases", "dv", "date", "totalCases", "#FFFF00");
   const graph3 = createGraph(chart, "line", "Total Recovered", "dv", "date", "totalRecovered", "#32CD32");
   const graph4 = createGraph(chart, "line", "Total Death", "dv", "date", "totalDeath", "#DC143C");

   // Add scrollbar
   chart.scrollbarX = new am4charts.XYChartScrollbar();
   chart.scrollbarX.series.push(graph1);
   chart.scrollbarX.series.push(graph2);
   chart.scrollbarX.series.push(graph3);
   // Add scrollbar
   chart.scrollbarX = new am4charts.XYChartScrollbar();
   chart.scrollbarX.series.push(graph1);
   chart.scrollbarX.series.push(graph2);
   chart.scrollbarX.series.push(graph3);
   chart.scrollbarX.series.push(graph4);

   // Add cursor
   chart.cursor = new am4charts.XYCursor();
   chart.cursor.xAxis = xAxis;
   chart.legend = new am4charts.Legend();

   graph2.hidden = true;
   graph3.hidden = true;
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

function changeDateFormat(date) {
   const year = date.substring(0, 4)
   const month = date.substring(5, 7)
   const day = date.substring(8, 10)
   let textMonth

   month == "01" ? textMonth = "Jan" :
   month == "02" ? textMonth = "Feb" :
   month == "03" ? textMonth = "Mar" :
   month == "04" ? textMonth = "Apr" :
   month == "05" ? textMonth = "May" :
   month == "06" ? textMonth = "Jun" :
   month == "07" ? textMonth = "Jul" :
   month == "08" ? textMonth = "Aug" :
   month == "09" ? textMonth = "Sep" :
   month == "10" ? textMonth = "Oct" :
   month == "11" ? textMonth = "Nov" :
   month == "12" ? textMonth = "Dec" :
   false;

   let reformatted = day + " " + textMonth + " " + year;

   return reformatted;
}

function formatNumber(num) {
   return num = numeral(num).format('0,0');
}