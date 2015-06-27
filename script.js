var allSchools = [];
var labelCol = 'SCHNAME';
var valueOptions = ['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ', 'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ'];


var finishLoading = function() {
    var loading = document.getElementById('loading');
    loading.parentNode.removeChild(loading);
    var mainContent = document.getElementById('main-content');
    mainContent.style.visibility= 'visible';
}

var selectedLEA = function() {
    return document.getElementById('LEA').value;
}

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
}

var selectedValue = function() {
    return document.getElementById('Measure').value;
}

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
}

var updateBar = function() {
    selectedSchools = _.where(allSchools, { LEA: selectedLEA() });
    selectedSchools = _.sortBy(selectedSchools, selectedValue());
    drawBar(selectedSchools, labelCol, selectedValue());
}

document.getElementById('LEA').onchange = updateBar;
document.getElementById('Measure').onchange = updateBar;

var drawBar = function(records, labelCol, selectedValue) {
    var dataStrings = _.pluck(records, selectedValue);
    var dataInts = dataStrings.map(function(item) {
        return parseFloat(item) || 0;
    });

    var chart = new Highcharts.Chart({
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
                text: selectedValue
            }
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
