// Grafico de distribución de fallecidos 
// Definir el ancho y alto de tu gráfico
var width = 600;
var height = 400;
var radius = Math.min(width, height) / 2;


// Seleccionar el contenedor del gráfico
var svg = d3.select("#grafico")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Leer el archivo CSV
d3.csv("covid_2023_ref.csv").then(function(data) {
    // Filtrar los datos para obtener solo recuperados y fallecidos
    var recuperados = data.filter(function(d) {
        return d.Recuperado === "Recuperado";
    }).length;

    var fallecidos = data.filter(function(d) {
        return d.Muerte_covid === "TRUE";
    }).length;

    var dataset = [
        { etiqueta: "Recuperados", valor: recuperados },
        { etiqueta: "Fallecidos", valor: fallecidos }
    ];

    // Crear una función de color
    var color = d3.scaleOrdinal(["#9bce9d", "#605252"]);

    // Crear el generador de arcos
    var arc = d3.arc()
        .innerRadius(75)
        .outerRadius(radius);

    // Crear el generador de pie
    var pie = d3.pie()
        .value(function(d) { return d.valor; });

    // Construir los arcos
    var arcs = svg.selectAll("arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Dibujar los arcos
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(i); });

    // Agregar etiquetas
    arcs.append("text")
        .attr("transform", function(d) {
            var centroid = arc.centroid(d);
            return "translate(" + centroid[0] + "," + centroid[1] + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.data.etiqueta; });
    
});


// Grafico de contagios por edades

// Leer el archivo CSV
d3.csv("covid_2023_ref.csv").then(function(data) {
    // Filtrar los datos para obtener solo los casos confirmados
    var casosConfirmados = data.filter(function(d) {
        return d.Muerte_covid === "TRUE" || d.Recuperado === "Recuperado";
    });

    // Definir los intervalos de edades
    var intervalosEdad = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90+"];

    // Contar los contagios en cada intervalo de edad
    var conteoPorIntervalo = {};
    intervalosEdad.forEach(function(intervalo) {
        conteoPorIntervalo[intervalo] = 0;
    });

    casosConfirmados.forEach(function(caso) {
        var edad = +caso.Edad;
        var intervalo = Math.floor(edad / 10) * 10; // Obtener el intervalo de edad
        if (intervalo >= 90) {
            intervalo = "90+";
        } else {
            intervalo = intervalo + "-" + (intervalo + 9);
        }
        conteoPorIntervalo[intervalo]++;
    });

    // Crear un array de objetos con la estructura necesaria para el gráfico de pastel
    var datasetPie = Object.keys(conteoPorIntervalo).map(function(key) {
        return { etiqueta: key, valor: conteoPorIntervalo[key] };
    });

    // Crear una función de color
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Seleccionar el contenedor del gráfico
    var svgPie = d3.select("#grafico-edades")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Crear el generador de arco
    var arc = d3.arc()
        .innerRadius(75)
        .outerRadius(radius);

    // Crear el generador de pie
    var pie = d3.pie()
        .value(function(d) { return d.valor; });

    // Construir los arcos del gráfico de pastel
    var arcs = svgPie.selectAll("arc")
        .data(pie(datasetPie))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Dibujar los arcos del gráfico de pastel
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(i); });

    // Agregar etiquetas al gráfico de pastel
    arcs.append("text")
        .attr("transform", function(d) {
            var centroid = arc.centroid(d);
            return "translate(" + centroid[0] + "," + centroid[1] + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.data.etiqueta; });
    
    
});


// Gráfico de distribución de muertes por meses

// Leer el archivo CSV
d3.csv("covid_2023_ref.csv").then(function(data) {
    // Filtrar los datos para obtener solo los casos de muerte por COVID-19
    var muertesCovid = data.filter(function(d) {
        return d.Muerte_covid === "TRUE";
    });

    // Crear un objeto para contar las muertes por mes
    var conteoPorMes = {};
    muertesCovid.forEach(function(caso) {
        var fechaMuerte = new Date(caso["Fecha de muerte"]);
        var mes = fechaMuerte.getMonth(); // Obtener el mes (0-11)
        var nombreMes = obtenerNombreMes(mes); // Obtener el nombre del mes
        if (!conteoPorMes[nombreMes]) {
            conteoPorMes[nombreMes] = 0;
        }
        conteoPorMes[nombreMes]++;
    });

    // Crear un array de objetos con la estructura necesaria para el gráfico de pastel
    var datasetPieMuertes = Object.keys(conteoPorMes).map(function(mes) {
        return { etiqueta: mes, valor: conteoPorMes[mes] };
    });

    // Crear una función de color
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Seleccionar el contenedor del gráfico
    var svgPieMuertes = d3.select("#grafico-muertes")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Crear el generador de arco
    var arc = d3.arc()
        .innerRadius(75)
        .outerRadius(radius);

    // Crear el generador de pie
    var pie = d3.pie()
        .value(function(d) { return d.valor; });

    // Construir los arcos del gráfico de pastel
    var arcs = svgPieMuertes.selectAll("arc")
        .data(pie(datasetPieMuertes))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Dibujar los arcos del gráfico de pastel
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(i); });

    // Agregar eventos de mouseover y mouseout a los arcos
    arcs.on("mouseover", function(d) {
            var etiqueta = d.data.etiqueta;
            var valor = d.data.valor;
            d3.select(this).append("text")
                .text(etiqueta + ": " + valor)
                .attr("text-anchor", "middle")
                .attr("dy", ".35em");
        })
        .on("mouseout", function() {
            d3.select(this).select("text").remove();
        });

});

// Función para obtener el nombre del mes a partir de su número
function obtenerNombreMes(numeroMes) {
    var meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses[numeroMes];
}


// Distribución de muertes por rango etarios

// Leer el archivo CSV
d3.csv("covid_2023_ref.csv").then(function(data) {
    // Filtrar los datos para obtener solo los casos de muerte por COVID-19
    var muertesCovid = data.filter(function(d) {
        return d.Muerte_covid === "TRUE";
    });

    // Definir los rangos etarios
    var rangosEtarios = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90+"];

    // Contar las muertes en cada rango etario
    var conteoPorRango = {};
    rangosEtarios.forEach(function(rango) {
        conteoPorRango[rango] = 0;
    });

    muertesCovid.forEach(function(caso) {
        var edad = +caso.Edad;
        var rango;
        if (edad < 10) {
            rango = "0-9";
        } else if (edad >= 90) {
            rango = "90+";
        } else {
            var inicio = Math.floor(edad / 10) * 10;
            rango = inicio + "-" + (inicio + 9);
        }
        conteoPorRango[rango]++;
    });

    // Crear un array de objetos con la estructura necesaria para el gráfico de pastel
    var datasetPieMuertes = rangosEtarios.map(function(rango) {
        return { etiqueta: rango, valor: conteoPorRango[rango] };
    });

    // Crear una función de color
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Seleccionar el contenedor del gráfico
    var svgPieMuertes = d3.select("#grafico-rangos")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Crear el generador de arco
    var arc = d3.arc()
        .innerRadius(75)
        .outerRadius(radius);

    // Crear el generador de pie
    var pie = d3.pie()
        .value(function(d) { return d.valor; });

    // Construir los arcos del gráfico de pastel
    var arcs = svgPieMuertes.selectAll("arc")
        .data(pie(datasetPieMuertes))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Dibujar los arcos del gráfico de pastel
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(i); });

    // Agregar etiquetas al gráfico de pastel
    
    
    arcs.on("mouseover", function(d) {
            var etiqueta = d.data.etiqueta;
            var valor = d.data.valor;
            d3.select(this).append("text")
                .text(etiqueta + ": " + valor)
                .attr("text-anchor", "middle")
                .attr("dy", ".35em");
        })
        .on("mouseout", function() {
            d3.select(this).select("text").remove();
        });

    

});





