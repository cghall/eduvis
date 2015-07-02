define(['knockout', 'highcharts', 'underscore', 'text!./chart.html', 'knockout-postbox'], function(ko, Highcharts, _, templateMarkup) {

    function Chart() {
        var self = this;

        this.measure = ko.observable().subscribeTo("selectedMeasure", true);
        this.lea = ko.observable().subscribeTo("selectedLea", true);
        this.schoolNames = ko.observable().subscribeTo("selectedSchoolsNames", true);
        this.schoolSeries = ko.observable().subscribeTo("selectedSchoolsSeries", true);

        this.columnChart = ko.observable();

        this.updateBar = ko.computed( function() {
            var lea = self.lea();
            var measure = self.measure();
            var schoolNames = self.schoolNames();
            var schoolSeries = self.schoolSeries();

            var checkExist = setInterval(function() {
                if (document.getElementById('myChart')) {

                    var chart = new Highcharts.Chart({
                        chart: {
                            renderTo: 'myChart',
                            type: 'bar',
                            marginLeft: 300
                        },
                        title: {
                            text: measure + ' for LEA ' + lea
                        },
                        xAxis: {
                            categories: schoolNames
                        },
                        yAxis: {
                            title: {
                                text: measure
                            },
                            max: 1
                        },
                        series: [{
                            showInLegend: false,
                            name: measure,
                            data: schoolSeries,
                            animation: {
                                duration: 300
                            }
                        }]
                    });
                    self.columnChart(chart);

                    clearInterval(checkExist);
                }
            }, 30);
        });
    }

    return { viewModel: Chart, template: templateMarkup};

});
