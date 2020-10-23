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

function createGraph(chart, type, cName, xyType, xAxis, yAxis, color) {
   let graph;

   type == "line" ? (graph = chart.series.push(new am4charts.LineSeries())) :
   type == "bar" ? (graph = chart.series.push(new am4charts.ColumnSeries())) :
   type == "filled line" ? (graph = chart.series.push(new am4charts.CurvedColumnSeries())) :
   false;

   xyType == "dv" ? (
      graph.dataFields.dateX = xAxis,
      graph.dataFields.valueY = yAxis,
      graph.tooltipText = `${cName}: {valueY}`) :
   xyType == "vv" ? (
      graph.dataFields.valueX = xAxis,
      graph.dataFields.valueY = yAxis,
      graph.tooltipText = `${yAxis}: {valueY} \n ${xAxis}: {valueX}`) :
   xyType == "cv" ? (
      graph.dataFields.categoryX = xAxis,
      graph.dataFields.valueY = yAxis,
      graph.tooltipText = `${yAxis}: {valueY} \n ${xAxis}: {categoryX}`) :
      false;

   graph.name = cName;
   graph.strokeWidth = 2;
   graph.minBulletDistance = 10;
   graph.tooltip.pointerOrientation = "vertical";
   graph.tooltip.background.cornerRadius = 20;
   graph.tooltip.background.fillOpacity = 0.5;
   graph.tooltip.label.padding(12, 12, 12, 12);

   color == "default" ? (false) :
      graph.stroke = am4core.color(color);

   return graph;
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