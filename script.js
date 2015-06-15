var drawBar = function(records) {
    console.log(records);

    console.log('filterting records...');    

    filteredData = _.filter(records.data, function(school) {
        return school['LEA'] === 'Lambeth (208)';
    });
    
    sortedData = _.sortBy(filteredData, 'PTAC5EM_PTQ');

    console.log('plucking data...');

    var data = {
        labels: _.pluck(sortedData, 'SCHNAME'),
        datasets: [
            {
                data: _.pluck(sortedData, 'PTAC5EM_PTQ')
            }
        ]
    };

    console.log('drawing chart...');

    var ctx = document.getElementById("myChart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data, {});
};

Papa.parse('http://cghall.github.io/eduvis/School_data.csv',
           {download: true, header: true, complete: drawBar, skipEmptyLines: true});