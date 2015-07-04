define(['knockout', 'highcharts', 'underscore', 'text!./chart.html', 'knockout-postbox'], function(ko, Highcharts, _, templateMarkup) {

    function Chart() {
        var self = this;

        this.measure = ko.observable().subscribeTo("selectedMeasure", true);
        this.selectionSummary = ko.observable().subscribeTo("selectionSummary", true);
        this.measureSuffix = ko.observable().subscribeTo("selectedMeasureSuffix", true);
        this.lea = ko.observable().subscribeTo("selectedLea", true);
        this.schoolNames = ko.observable().subscribeTo("selectedSchoolsNames", true);
        this.schoolSeries = ko.observable().subscribeTo("selectedSchoolsSeries", true);
        this.averagePlotLines = ko.observable().subscribeTo("averagePlotLines", true);

        this.measureMin = ko.observable().subscribeTo("selectedMeasureMin", true);
        this.measureMax = ko.observable().subscribeTo("selectedMeasureMax", true);

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
                            text: self.selectionSummary(),
                            style: {
                                fontSize: 15,
                                fontWeight: "bold"
                            }
                        },
                        xAxis: {
                            categories: schoolNames
                        },
                        yAxis: {
                            labels: {
                                format: '{value}' + self.measureSuffix()
                            },
                            title: {
                                text: measure
                            },
                            min: self.measureMin(),
                            max: self.measureMax()
                        },
                        series: [{
                            showInLegend: false,
                            name: measure,
                            data: schoolSeries,
                            animation: {
                                duration: 300
                            }
                        }],
                        tooltip: {
                            valueSuffix: self.measureSuffix()
                        }
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
