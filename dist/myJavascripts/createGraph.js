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