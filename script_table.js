// Paso 1: Cargar el archivo CSV
d3.csv("covid_2023_ref.csv")
  .then(function (data) {
    // Paso 2: Definir el criterio de filtrado
    var filtro = "TRUE"; // Reemplaza "TRUE" con tu criterio de filtrado
    var filtro2 = ""; // Filtro para región

    // Obtener la lista de regiones únicas
    var regiones = [...new Set(data.map((d) => d["Nombre departamento"]))];

    // Crear la lista desplegable con el nombre de las regiones
    var selectRegion = d3
      .select("#regionSelect")
      .append("select")
      .on("change", updateTable);

    selectRegion
      .selectAll("option")
      .data(regiones)
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      });

    // Función para actualizar la tabla según la región seleccionada
    function updateTable() {
      filtro2 = this.value;
      // Aplicar el filtrado basado en la región seleccionada
      var datosFiltrados2 = data.filter(function (d) {
        return (
          d["Muerte_covid"] === filtro && d["Nombre departamento"] === filtro2
        );
      });

      // Actualizar la tabla
      tbody.selectAll("*").remove(); // Limpiar la tabla antes de agregar los nuevos datos

      var rows = tbody
        .selectAll("tr")
        .data(datosFiltrados2)
        .enter()
        .append("tr");

      var cells = rows
        .selectAll("td")
        .data(function (row) {
          // Seleccionar solo las primeras 7 columnas
          var columnKeys = Object.keys(row).slice(2, 7);
          return columnKeys.map(function (key) {
            return row[key];
          });
        })
        .enter()
        .append("td")
        .text(function (d) {
          return d;
        });
    }

    // Paso 4: Crear la estructura básica de la tabla
    var table = d3.select("#filteredTable");
    var thead = table.select("thead").select("tr");
    var tbody = table.select("tbody");

    // Paso 5: Leer los datos filtrados del archivo CSV y agregarlos a la tabla
    // Asigna las claves de las columnas para crear las cabeceras de la tabla
    thead
      .selectAll("th")
      .data(Object.keys(data[0]).slice(2, 7)) // Seleccionar solo las primeras 7 columnas
      .enter()
      .append("th")
      .text(function (d) {
        return d;
      });
  })
  .catch(function (error) {
    // Manejo de errores
    console.log(error);
  });

// Función para limpiar la tabla
function limpiarTabla() {
  // Selecciona el tbody de la tabla y elimina su contenido
  var tbody = document.querySelector("#filteredTable tbody");
  tbody.innerHTML = "";
}
