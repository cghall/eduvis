var allSchools = [];
var labelCol = 'SCHNAME';
var valueCol = 'PTAC5EM_PTQ';
var barChart;

var selectedLEA = function() {
    return document.getElementById('LEA').value;
}

var updateBar = function() {
    selectedSchools = _.where(allSchools, { LEA: selectedLEA() });
    drawBar(selectedSchools, labelCol, valueCol);
}

document.getElementById('LEA').onchange = updateBar;


var drawBar = function(records, labelCol, valueCol) {
    var data = {
        labels: _.pluck(records, labelCol),
        datasets: [
            {
                data: _.pluck(records, valueCol)
            }
        ]
    };
    var ctx = document.getElementById("myChart").getContext("2d");

    if (barChart) {
        barChart.destroy();
    }
    barChart = new Chart(ctx).Bar(data, {});
};


papaConfig = {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(result) {
        allSchools = result.data;
        updateBar();
    }
};

Papa.parse('School_data.csv', papaConfig);