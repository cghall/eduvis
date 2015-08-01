define(['knockout', 'highcharts', 'underscore', 'data-model', 'text!./chart.html'],
    function (ko, Highcharts, _, dataModel, templateMarkup) {

        function Chart(params) {
            var self = this;

            this.sortedEntities = ko.pureComputed(function () {
                return _.sortBy(dataModel.entities(), dataModel.selectedMetric());
            });

            this.entityNames = ko.pureComputed(function () {
                return _.pluck(self.sortedEntities(), 'SCHNAME');
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.entitySeries = ko.pureComputed(function () {
                return _.map(self.sortedEntities(), function (entity) {
                    var color = entity === dataModel.focusedEntity() ? '#e99002' : '#00539C';
                    return {y: entity[dataModel.selectedMetric()], color: color}
                });
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.chart = ko.observable();

            this.updateBar = ko.computed(function () {
                var measure = dataModel.selectedMetric();
                var schoolNames = self.entityNames();
                var schoolSeries = self.entitySeries();
                var verticalChart = dataModel.verticalChart();

                var checkExist = setInterval(function () {
                    if (!params.isSelected()) {
                        return;
                    }

                    if (document.getElementById('myChart')) {

                        var chartOptions = {
                            chart: {
                                renderTo: 'myChart',
                                zoomType: 'x'
                            },
                            title: {
                                text: dataModel.selectionSummary(),
                                style: {
                                    fontSize: 15,
                                    fontWeight: "bold"
                                }
                            },
                            xAxis: {
                                categories: schoolNames,
                                min: 0,
                                max: Math.min(schoolNames.length - 1, 20)
                            },
                            yAxis: {
                                labels: {
                                    format: '{value}' + dataModel.selectedMeasureSuffix()
                                },
                                title: {
                                    text: null
                                },
                                min: dataModel.measureMin(),
                                max: dataModel.measureMax()
                            },
                            plotOptions: {
                                series: {
                                    cursor: 'pointer',
                                    point: {
                                        events: {
                                            click: function () {
                                                if (dataModel.viewLevel() === "LEA") {
                                                    dataModel.selectedLea(this.category);
                                                    dataModel.viewLevel("School");
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                showInLegend: false,
                                name: dataModel.selectedMeasure(),
                                data: schoolSeries,
                                animation: {
                                    duration: 0
                                }
                            }],
                            tooltip: {
                                valueSuffix: dataModel.selectedMeasureSuffix()
                            }
                        };

                        if (verticalChart) {
                            chartOptions.chart.type = 'column';
                            chartOptions.navigator = {
                                enabled: true,
                                    series: {
                                    type: 'column'
                                }
                            };
                            chartOptions.subtitle = {
                                text: "Use the navigation bar at the bottom to zoom and scroll."
                            };
                        } else {
                            chartOptions.chart.type = 'bar';
                            chartOptions.scrollbar = {
                                enabled: true
                            };
                            chartOptions.subtitle = {
                                text: "Click and drag to zoom. Use the scroll bar at the bottom to scroll. Click 'Reset Zoom' to reset selection."
                            };
                        }

                        var chart = new Highcharts.Chart(chartOptions);

                        self.chart(chart);

                        clearInterval(checkExist);
                    }
                }, 30);
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 150}});


            this.nationalAverageLine = ko.pureComputed(function () {
                return dataModel.showNationalAverage() && {
                        id: 'nat',
                        color: 'rgb(255, 204, 0)',
                        width: 2,
                        value: dataModel.nationalAverage(),
                        zIndex: 5,
                        label: {
                            align: 'center',
                            verticalAlign: 'middle',
                            text: 'national'
                        }
                    };
            });

            this.top10Line = ko.pureComputed(function () {
                return dataModel.showTop10Percent() && {
                        id: 'top',
                        color: 'rgb(51, 204, 51)',
                        width: 2,
                        value: dataModel.top10Percent(),
                        zIndex: 5,
                        label: {
                            text: 'top 10%',
                            align: 'right',
                            verticalAlign: 'bottom',
                            y: -5
                        }
                    };
            });

            this.bottom10Line = ko.pureComputed(function () {
                return dataModel.showBottom10Percent() && {
                        id: 'bot',
                        color: 'rgb(255, 51, 0)',
                        width: 2,
                        value: dataModel.bottom10Percent(),
                        zIndex: 5,
                        label: {
                            text: 'bottom 10%',
                            verticalAlign: 'top'
                        }
                    };
            });

            this.averagePlotLines = ko.pureComputed(function () {
                var plotLines = [self.nationalAverageLine(), self.top10Line(), self.bottom10Line()];
                plotLines = _.without(plotLines, false);
                return _.without(plotLines, undefined);
            });

            this.updatePlotLines = ko.computed(function () {
                if (!self.chart() || !self.chart().yAxis || !self.averagePlotLines()) {
                    return;
                }

                ['nat', 'top', 'bot'].forEach(function (lineId) {
                    self.chart().yAxis[0].removePlotLine(lineId);
                });
                self.averagePlotLines().forEach(function (line) {
                    self.chart().yAxis[0].addPlotLine(line);
                });
            });
        }

        return {viewModel: Chart, template: templateMarkup};

    });
