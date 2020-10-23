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