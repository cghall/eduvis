var allSchools = [];
var labelCol = 'SCHNAME';
var valueOptions = ['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ', 'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ'];
var chart;


var finishLoading = function() {
    var loading = document.getElementById('loading');
    loading.parentNode.removeChild(loading);
    var mainContent = document.getElementById('main-content');
    mainContent.style.visibility= 'visible';
};

var selectedLEA = function() {
    return document.getElementById('LEA').value;
};

var updateLeaOptions = function() {
    var select = document.getElementById('LEA'); 
    var options = _.uniq(_.pluck(allSchools, 'LEA')); 
    options.sort();

    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
};

var currentDataAscending = function() {
    var dataStrings = _.pluck(allSchools, selectedValue());
    var dataInts = dataStrings.map(function(item) {
        return parseFloat(item) || 0;
    });
    dataInts.sort()
    return dataInts;
};

var selectedValue = function() {
    return document.getElementById('Measure').value;
};

var updateValueOptions = function() {
    var select = document.getElementById('Measure'); 
    var options = valueOptions; 
    options.sort();

    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
};

var updateBar = function() {
    selectedSchools = _.where(allSchools, { LEA: selectedLEA() });
    selectedSchools = _.sortBy(selectedSchools, selectedValue());
    drawBar(selectedSchools, labelCol);
};

document.getElementById('LEA').onchange = updateBar;
document.getElementById('Measure').onchange = updateBar;

var average = function(numbers) {
    var sum = 0;
    for( var i = 0; i < numbers.length; i++) {
         sum += numbers[i];
    }
    return sum / numbers.length;
}

var averagePlotLines = function() {
    var plotLines = [];
    var dataAscending = currentDataAscending();
    if (document.getElementById("nat-avg").checked) {
        plotLines.push({
            id: 'nat',
            color: '#FF0000',
            width: 2,
            value: average(dataAscending),
            zIndex: 5,
            label: {
                align: 'center',
                verticalAlign: 'middle',
                text: 'national'
            }
        });
    }
    if (document.getElementById("top-avg").checked) {
        plotLines.push({
            id: 'top',
            color: '#0000FF',
            width: 2,
            value: dataAscending[dataAscending.length - Math.floor(dataAscending.length/10)],
            zIndex: 5,
            label: {
                verticalAlign: 'top',
                text: 'top 10%'
            }
        });
    }
    if (document.getElementById("bot-avg").checked) {
        plotLines.push({
            id: 'bot',
            color: '#00FF00',
            width: 2,
            value: dataAscending[Math.floor(dataAscending.length/10)],
            zIndex: 5,
            label: {
                align: 'right',
                verticalAlign: 'bottom',
                text: 'bottom 10%',
                y: -5
            }
        });
    }
    return plotLines;
};

var updatePlotLines = function() {
    ['nat', 'top', 'bot'].forEach(function(lineId) {
        chart.yAxis[0].removePlotLine(lineId);
    });
    averagePlotLines().forEach(function(line) {
        chart.yAxis[0].addPlotLine(line);
    });
};

document.getElementById("nat-avg").onchange = updatePlotLines;
document.getElementById("top-avg").onchange = updatePlotLines;
document.getElementById("bot-avg").onchange = updatePlotLines;

var drawBar = function(records, labelCol) {
    var dataStrings = _.pluck(records, selectedValue());
    var dataInts = dataStrings.map(function(item) {
        return parseFloat(item) || 0;
    });

    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'myChart',
            type: 'bar'
        },
        title: {
            text: 'Result heading'
        },
        xAxis: {
            categories: _.pluck(records, labelCol)
        },
        yAxis: {
            title: {
                text: selectedValue()
            },
            plotLines: averagePlotLines(selectedValue),
            max: 1
        },
        series: [{
            showInLegend: false,
            name: selectedValue,
            data: dataInts
        }]
    });
};


papaConfig = {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(result) {
        allSchools = result.data;
        updateLeaOptions();
        updateValueOptions();
        updateBar();
        finishLoading();
    }
};

Papa.parse('School_data.csv', papaConfig);
