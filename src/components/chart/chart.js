define(['knockout', 'highcharts', 'underscore', 'data-model', 'text!./chart.html'],
    function (ko, Highcharts, _, dataModel, templateMarkup) {

        function Chart() {
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

            this.columnChart = ko.observable();

            this.isBarSelected = ko.observable(true);
            this.isTableSelected = ko.observable(false);
            this.isMapSelected = ko.observable(false);

            this.selectBar = function () {
                this.isBarSelected(true);
                this.isTableSelected(false);
                this.isMapSelected(false);
            };

            this.selectTable = function () {
                this.isBarSelected(false);
                this.isTableSelected(true);
                this.isMapSelected(false);
            };

            this.selectMap = function () {
                this.isBarSelected(false);
                this.isTableSelected(false);
                this.isMapSelected(true);
            };

            this.updateBar = ko.computed(function () {
                var measure = dataModel.selectedMetric();
                var schoolNames = self.entityNames();
                var schoolSeries = self.entitySeries();

                var checkExist = setInterval(function () {
                    if (!self.isBarSelected()) {
                        return;
                    }

                    if (document.getElementById('myChart')) {

                        var chart = new Highcharts.Chart({
                            chart: {
                                renderTo: 'myChart',
                                type: 'bar'
                            },
                            title: {
                                text: dataModel.selectionSummary(),
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
                                    format: '{value}' + dataModel.selectedMeasureSuffix()
                                },
                                title: {
                                    text: measure
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
                                name: measure,
                                data: schoolSeries,
                                animation: {
                                    duration: 300
                                }
                            }],
                            tooltip: {
                                valueSuffix: dataModel.selectedMeasureSuffix()
                            }
                        });
                        self.columnChart(chart);

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

        return {viewModel: Chart, template: templateMarkup};

    });
