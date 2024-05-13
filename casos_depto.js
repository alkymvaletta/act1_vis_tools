document.addEventListener("DOMContentLoaded", function () {
  Promise.all([
    d3.json("colombia-map.geojson"),
    d3.csv("covid_2023_ref.csv"),
  ]).then(function (data) {
    const geoData = data[0];
    const covidData = data[1];
    console.log("GeoJSON data:", geoData); // Agregado para verificar los datos geojson
    console.log("COVID-19 data:", covidData); // Agregado para verificar los datos de COVID-19
    initializeControls(covidData);
    updateVisualizations(covidData, geoData);
  });

  function initializeControls(covidData) {
    // Aquí puedes inicializar cualquier control de interfaz que necesites, como botones, filtros, etc.
  }

  function updateVisualizations(covidData, geoData) {
    const width = 800;
    const height = 600;

    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    console.log("Projection:", projection); // Agregado para verificar la proyección

    const path = d3.geoPath().projection(projection);

     
      //Código gráfico de barras
      const casesByDepartment = {}; // Nuevo: Estructura para almacenar el recuento de casos por departamento

  covidData.forEach((d) => {
    const department = d["Nombre departamento"];
    casesByDepartment[department] = (casesByDepartment[department] || 0) + 1; // Incrementa el recuento de casos para este departamento
  });

  // Convertir el objeto en un array de objetos para facilitar el procesamiento posterior
  const casesArray = Object.keys(casesByDepartment).map((department) => ({
    department,
    cases: casesByDepartment[department],
  }));

  // Ordenar el array por el número de casos (de mayor a menor)
  casesArray.sort((a, b) => b.cases - a.cases);

  // Definir los márgenes y dimensiones del gráfico de barras
  const margin = { top: 20, right: 20, bottom: 30, left: 80 };
  const barWidth = width - margin.left - margin.right;
  const barHeight = height - margin.top - margin.bottom;

  // Crear el contenedor del gráfico de barras
  const barChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Definir la escala para el eje y (número de casos)
  const yScale = d3
    .scaleBand()
    .domain(casesArray.map((d) => d.department))
    .range([0, barHeight])
    .padding(0.1);

  // Definir la escala para el eje x (número de casos)
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(casesArray, (d) => d.cases)])
    .range([0, barWidth]);

  // Agregar las barras al gráfico de barras
  barChart
    .selectAll(".bar")
    .data(casesArray)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", (d) => yScale(d.department))
    .attr("width", (d) => xScale(d.cases))
    .attr("height", yScale.bandwidth())
    .attr("fill", "steelblue");

  // Agregar el eje y al gráfico de barras
  barChart.append("g").call(d3.axisLeft(yScale));

  // Agregar el eje x al gráfico de barras
  barChart
    .append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(xScale).ticks(5));

  // Agregar etiquetas a las barras
  barChart
    .selectAll("text")
    .data(casesArray)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.cases) + 5)
    .attr("y", (d) => yScale(d.department) + yScale.bandwidth() / 2)
    .attr("dy", ".35em")
    .text((d) => d.cases)
    .attr("fill", "white");


      
  }
});
