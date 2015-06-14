var drawBar = function(records) {
    console.log(records);
    filteredData = _.filter(records.data, function(school) {
        return school['LEA'] == 208;
    });
    
    var data = {
        labels: _.pluck(filteredData, 'SCHNAME'),
        datasets: [
            {
                data: _.pluck(filteredData, 'PTAC5EM_PTQ_parsed')
            }
        ]
    };

    var ctx = document.getElementById("myChart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data, {});
};

Papa.parse('http://cghall.github.io/eduvis/School_data.csv',
           {download: true, header: true, complete: drawBar, skipEmptyLines: true});