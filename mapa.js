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

    // Generar los elementos de trazado del mapa y cambiar el color
    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "tan") // Cambiar el color del mapa a un tono amarronado
      .attr("stroke", "white");

    // Paso 1: Crear una estructura de datos para almacenar el recuento de casos por par [longitud, latitud]
    const casesByCoordinates = {};
    const departmentsByCoordinates = {}; // Nuevo: Estructura para almacenar los nombres de los departamentos
    covidData.forEach((d) => {
      const key = `${d.Longitud},${d.Latitud}`;
      casesByCoordinates[key] = (casesByCoordinates[key] || 0) + 1;
      departmentsByCoordinates[key] = d["Nombre departamento"]; // Nuevo: Almacena el nombre del departamento
      console.log(
        "Coordenadas:",
        key,
        "Departamento:",
        d["Nombre departamento"]
      ); // Agregado para depurar
    });

    // Paso 3: Definir el tamaño de los círculos en función del recuento de casos
    const maxCases = d3.max(Object.values(casesByCoordinates));
    const radiusScale = d3.scaleSqrt().domain([0, maxCases]).range([3, 20]); // Define el rango de tamaños de los círculos

    // Define los límites para los rangos de casos
    const thresholds = [maxCases * 0.2, maxCases * 0.8];

    // Define los colores correspondientes a cada rango
    const colors = ["green", "yellow", "red"];

    // Define la escala de colores
    const colorScale = d3.scaleThreshold().domain(thresholds).range(colors);

    // Generar los círculos
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
      .attr("fill", (d) => colorScale(d[1])) // Asigna un color según el número de casos
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);

    // Agregar etiquetas de departamento
    svg
      .selectAll("text")
      .data(Object.entries(casesByCoordinates))
      .enter()
      .append("text")
      .attr("x", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[0] + 5; // Ajuste hacia la derecha
      })
      .attr("y", (d) => {
        const coords = d[0].split(",");
        return projection([+coords[0], +coords[1]])[1] + 5; // Ajuste hacia abajo
      })
      .attr("font-size", "10px")
      .attr("fill", "black")
      .text((d) => departmentsByCoordinates[d[0]]);
  }
});
