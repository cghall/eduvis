var drawBar = function(records, label_col, value_col) {
    var data = {
        labels: _.pluck(records, label_col),
        datasets: [
            {
                data: _.pluck(records, value_col)
            }
        ]
    };

    var ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx).Bar(data, {});
};

var example_label_col = 'SCHNAME';
var example_value_col = 'PTAC5EM_PTQ_parsed';
var example_filter = function(school) {
    return school['LEA'] == 208 && school['PTAC5EM_PTQ_parsed'] < 0.6;
};

papaConfig = {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(result) {
        var schools = _.filter(result.data, example_filter);
        drawBar(schools, example_label_col, example_value_col);
    }
};

Papa.parse('School_data.csv', papaConfig);