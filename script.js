var csvString = "SCHNAME,PTAC5EM_PTQ_parsed\n\
The Elmgreen School,0.31\n\
Saint Gabriel's College,0.49\n\
Evelyn Grace Academy,0.52\n\
Lilian Baylis Technology School,0.52\n\
Norwood School,0.57\n\
Platanos College,0.57\n\
Lambeth Academy,0.58\n\
Dunraven School,0.6\n\
London Nautical School,0.63\n\
Archbishop Tenison's School,0.64\n\
St Martin in the Fields High School for Girls,0.68\n\
Bishop Thomas Grant Catholic Secondary School,0.72\n\
La Retraite Roman Catholic Girls' School,0.8"

Papa.parse('http://cghall.github.io/eduvis/Lambeth_GCSE_score.csv', {download: true, header: true});

var csv = Papa.parse(csvString, {header: true});

filteredData = _.filter(csv.data, function(school) {
    return school['PTAC5EM_PTQ_parsed'] < 0.6;
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
