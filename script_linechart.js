// Paso 1: Cargar el archivo CSV y procesar los datos
d3.csv("covid_2023_ref2.csv").then(function(data) {

// Paso 2: Definir el criterio de filtrado y procesar los datos filtrados
var filtro = "TRUE"; // Para muertos por COVID19   
var datosFiltrados = data.filter(function(d) {
        return d.Muerte_covid === filtro && d.Fecha_de_muerte; // Reemplaza 'Muerte_covid' con el nombre de la columna que deseas filtrar
    });
    

// Paso 3: Procesar los datos para calcular el total de muertes por mes
var muertesPorMes = {};
datosFiltrados.forEach(function(d) {
        if (d.Fecha_de_muerte) {
            var partesFecha = d.Fecha_de_muerte.split("/");
            var mes = parseInt(partesFecha[1], 10);
            var clave = mes;
            if (muertesPorMes[clave]) {
                muertesPorMes[clave]++;
            } else {
                muertesPorMes[clave] = 1;
            }
        }
    });

// Paso 4: Convertir los datos a un formato adecuado para la gráfica de líneas
var datosLinea = Object.entries(muertesPorMes).map(([mes, muertes]) => ({ mes: parseInt(mes), muertes }));

// Paso 5: Configurar las dimensiones del gráfico
var margin = { top: 20, right: 30, bottom: 30, left: 40 };
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Paso 6: Crear las escalas y ejes
var x = d3.scaleLinear()
            .domain(d3.extent(datosLinea, d => d.mes))
            .range([margin.left, width - margin.right]);

var y = d3.scaleLinear()
            .domain([0, d3.max(datosLinea, d => d.muertes)])
            .range([height - margin.bottom, margin.top]);

var xAxis = d3.axisBottom(x)
        .tickFormat(function(d) {
            var monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            return monthNames[d - 1];
        });

var yAxis = d3.axisLeft(y);

    // Paso 7: Crear la línea
    var linea = d3.line()
            .x(d => x(d.mes))
            .y(d => y(d.muertes));

// Paso 8: Crear el SVG y dibujar el gráfico de líneas
var svg = d3.select("#chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Líneas horizontales
svg.selectAll("line.horizontalGrid").data(y.ticks(5)).enter()
    .append("line")
    .attr("class", "horizontalGrid")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", function(d){ return y(d);})
    .attr("y2", function(d){ return y(d);})
    .attr("fill", "none")
    .attr("stroke", "rgba(0,0,0,0.1)");

// Agregar título al gráfico
svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "18px") 
    .style("text-decoration", "underline")  
    .text("Decesos por COVID19 en Colombia");

svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Fallecidos");

// Agregar label al eje X
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .attr("text-anchor", "middle")
    .text("2023");
    
svg.append("path")
        .datum(datosLinea)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", linea);

// Obtener el valor de muertes correspondiente a enero y diciembre
var muertesEnero = datosLinea.find(d => d.mes === 1).muertes;
var muertesAbril = datosLinea.find(d => d.mes === 4).muertes;
var muertesJunio = datosLinea.find(d => d.mes === 6).muertes;
var muertesOct = datosLinea.find(d => d.mes === 10).muertes;
var muertesDiciembre = datosLinea.find(d => d.mes === 12).muertes;

// Agregar etiqueta al inicio de la línea
svg.append("text")
    .attr("x", x(datosLinea[0].mes))             
    .attr("y", y(muertesEnero))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .text(muertesEnero);
    
// Agregar etiqueta Abril
svg.append("text")
    .attr("x", x(datosLinea[3].mes))             
    .attr("y", y(muertesAbril))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .text(muertesAbril);
    
// Agregar etiqueta Junio
svg.append("text")
    .attr("x", x(datosLinea[5].mes))             
    .attr("y", y(muertesJunio))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .text(muertesJunio);
    
// Agregar etiqueta Octubre
svg.append("text")
    .attr("x", x(datosLinea[9].mes))             
    .attr("y", y(muertesOct))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .text(muertesOct);

// Agregar etiqueta al final de la línea
svg.append("text")
    .attr("x", x(datosLinea[datosLinea.length - 1].mes))             
    .attr("y", y(muertesDiciembre))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .text(muertesDiciembre);

// Paso 9: Crear la tabla de resumen de muertes por mes
var tabla = d3.select("#tabla-container").append("table")
     .attr("class", "tabla-muertes")
     .style("border-collapse", "collapse");

var thead = tabla.append("thead");
var tbody = tabla.append("tbody");

    // Encabezados de la tabla
    thead.append("tr")
     .selectAll("th")
     .data(["Mes", "Muertes"])
     .enter()
     .append("th")
     .text(function(columna) { return columna; });

    // Filas de la tabla
    var filas = tbody.selectAll("tr")
     .data(datosLinea)
     .enter()
     .append("tr")
     .style("background-color", function(d, i) {
        return i % 2 === 0 ? "#f2f2f2" : "white"; // Sombras intercaladas
    });

    // Celdas de la tabla
    var celdas = filas.selectAll("td")
     .data(function(d) {
        return [d.mes, d.muertes];
    })
     .enter()
     .append("td")
     .text(function(d) { return d; })
     .style("border", "1px solid #dddddd") // Líneas de borde
     .style("padding", "8px"); // Espaciado interno

}).catch(function(error) {
    // Manejo de errores
    console.log(error);
});