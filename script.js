var allSchools = [];
var labelCol = 'SCHNAME';
var valueOptions = ['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ', 'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ'];
var barChart;

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
    //selectedSchools = _.filter(selectedSchools, _.isNaN(valueCol))
    drawBar(selectedSchools, labelCol, selectedValue());
}

document.getElementById('LEA').onchange = updateBar;
document.getElementById('Measure').onchange = updateBar;


var drawBar = function(records, labelCol, selectedValue) {
    var data = {
        labels: _.pluck(records, labelCol),
        datasets: [
            {
                data: _.pluck(records, selectedValue),
                fillColor: "rgba(34,83,120,1)",
            }
        ]
    };
    var ctx = document.getElementById("myChart").getContext("2d");

    if (barChart) {
        barChart.destroy();
    }
    barChart = new Chart(ctx).Bar(data, {
        scaleOverride: true,
        scaleSteps: 10,
        scaleStepWidth: 0.1,
        scaleStartValue: 0,
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
