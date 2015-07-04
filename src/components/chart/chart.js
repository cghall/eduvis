define(['knockout', 'highcharts', 'underscore', 'text!./chart.html', 'knockout-postbox'], function(ko, Highcharts, _, templateMarkup) {

    function Chart() {
        var self = this;

        this.measure = ko.observable().subscribeTo("selectedMeasure", true);
        this.lea = ko.observable().subscribeTo("selectedLea", true);
        this.schoolNames = ko.observable().subscribeTo("selectedSchoolsNames", true);
        this.schoolSeries = ko.observable().subscribeTo("selectedSchoolsSeries", true);
        this.averagePlotLines = ko.observable().subscribeTo("averagePlotLines", true);

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
                            type: 'bar'
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

        this.updatePlotLines = ko.computed(function () {
            if (!self.columnChart() || !self.columnChart().yAxis || !self.averagePlotLines()) {
                return;
            }

            ['nat', 'top', 'bot'].forEach(function (lineId) {
                self.columnChart().yAxis[0].removePlotLine(lineId);
            });
            self.averagePlotLines().forEach(function (line) {
                self.columnChart().yAxis[0].addPlotLine(line);
            });
        });
    }

    return { viewModel: Chart, template: templateMarkup};

});
