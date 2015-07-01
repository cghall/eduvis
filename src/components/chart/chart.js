define(['knockout', 'highcharts', 'underscore', 'text!./chart.html'], function(ko, Highcharts, _, templateMarkup) {

    function Chart(params) {
        var self = this;

        this.measure = params.measure;
        this.lea = params.lea;
        this.schoolNames = params.schoolNames;
        this.schoolSeries = params.schoolSeries;

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
