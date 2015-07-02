define(['knockout', 'highcharts', 'underscore', 'text!./chart.html', 'knockout-postbox'], function(ko, Highcharts, _, templateMarkup) {

    function Chart() {
        var self = this;

        this.measure = ko.observable().subscribeTo("selectedMeasure", true);
        this.lea = ko.observable().subscribeTo("selectedLea", true);
        this.schoolNames = ko.observable().subscribeTo("selectedSchoolsNames", true);
        this.schoolSeries = ko.observable().subscribeTo("selectedSchoolsSeries", true);

        this.columnChart = ko.observable();

        this.updateBar = ko.computed( function() {
            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'myChart',
                    type: 'bar',
                    marginLeft: 300
                },
                title: {
                    text: self.measure() + ' for LEA ' + self.lea()
                },
                xAxis: {
                    categories: self.schoolNames()
                },
                yAxis: {
                    title: {
                        text: self.measure()
                    },
                    max: 1
                },
                series: [{
                    showInLegend: false,
                    name: self.measure(),
                    data: self.schoolSeries(),
                    animation: {
                        duration: 300
                    }
                }]
            });
            self.columnChart(chart);
        });
    }
  
    return { viewModel: Chart, template: templateMarkup };

});
