var drawBar = function(records, label_col, value_col){
    var data = {
        labels: _.pluck(filteredRecords, label_col),
        datasets: [
            {
                data: _.pluck(filteredRecords, value_col)
            }
        ]
    };
    var ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx).Bar(data, {});
};

var label_col = 'SCHNAME';
var value_col = 'PTAC5EM_PTQ';
var LEA = 'Southwark (210)';
var filter = function(school) {
    return school['LEA'] == LEA;
};

function getLEA(sel) {
    var LEA = sel.value;
    console.log(LEA)
    drawBar(schools, label_col, value_col);
}

papaConfig = {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(result) {
        var schools = _.filter(result.data, filter);
        drawBar(schools, label_col, value_col);
    }
};

Papa.parse('School_data.csv', papaConfig);