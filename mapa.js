document.addEventListener("DOMContentLoaded", function () {
  Promise.all([
    d3.json("colombia-map.geojson"),
    d3.csv("covid_2023_ref.csv"),
  ]).then(function (data) {
    const geoData = data[0];
    const covidData = data[1];
    initializeControls(covidData);
    updateVisualizations(covidData, geoData);
  });

  function initializeControls(covidData) {}

  function updateVisualizations(covidData, geoData) {
    const width = 800;
    const height = 600;

    const container = d3.select("#mapa");

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoMercator().fitSize([width, height], geoData);

    const path = d3.geoPath().projection(projection);

    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "tan")
      .attr("stroke", "white");

    const casesByCoordinates = {};
    const departmentsByCoordinates = {};
    const totalCases = covidData.length; // Total de casos en el dataset
    covidData.forEach((d) => {
      const key = `${d.Longitud},${d.Latitud}`;
      casesByCoordinates[key] = (casesByCoordinates[key] || 0) + 1;
      departmentsByCoordinates[key] = d["Nombre departamento"];
    });

    const maxCases = d3.max(Object.values(casesByCoordinates));
    const radiusScale = d3.scaleSqrt().domain([0, maxCases]).range([3, 20]);
    const thresholds = [maxCases * 0.2, maxCases * 0.8];
    const colors = ["green", "yellow", "red"];
    const colorScale = d3.scaleThreshold().domain(thresholds).range(colors);

    svg
      .selectAll("circle")
      .data(Object.entries(casesByCoordinates))
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[0];
      })
      .attr("cy", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[1];
      })
      .attr("r", (d) => radiusScale(d[1]))
      .attr("fill", (d) => colorScale(d[1]))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mousemove", function (event, d) {
        const coords = d[0].split(",");
        const totalCasesInArea = d[1];
        const department = departmentsByCoordinates[d[0]];
        const percentage = ((totalCasesInArea / totalCases) * 100).toFixed(2);
        showTooltip(
          event.pageX,
          event.pageY,
          department,
          totalCasesInArea,
          percentage
        );
      })
      .on("mouseout", function () {
        hideTooltip();
      });

    function showTooltip(x, y, department, totalCasesInArea, percentage) {
      let tooltip = d3.select(".tooltip");
      if (tooltip.size() === 0) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "5px")
          .style("pointer-events", "none");
      }

      tooltip
        .style("left", x + "px")
        .style("top", y + "px")
        .html(
          `<strong>${department}</strong><br>Total de casos: ${totalCasesInArea}<br>Porcentaje del total: ${percentage}%`
        );
    }

    function hideTooltip() {
      d3.select(".tooltip").remove();
    }

    svg
      .selectAll("text")
      .data(Object.entries(casesByCoordinates))
      .enter()
      .append("text")
      .attr("x", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[0] + 5;
      })
      .attr("y", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[1] + 5;
      })
      .attr("font-size", "10px")
      .attr("fill", "black")
      .text((d) => departmentsByCoordinates[d[0]]);
  }
});
