define(['knockout', 'highcharts', 'underscore', 'data-model', 'text!./chart.html', 'highcharts-export'],
    function (ko, Highcharts, _, dataModel, templateMarkup) {

        function Chart(params) {
            var self = this;

            this.tooManySchools = dataModel.tooManySchools;

            this.sortedEntities = ko.pureComputed(function () {
                return _.sortBy(dataModel.entities(), dataModel.selectedMetric());
            });

            this.entityNames = ko.pureComputed(function () {
                return _.pluck(self.sortedEntities(), 'SCHNAME');
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.entitySeries = ko.pureComputed(function () {
                return _.map(self.sortedEntities(), function (entity) {
                    var color = entity === dataModel.focusedEntity() || ('SCHNAME' in entity && entity.SCHNAME === dataModel.focusedEntity())
                        ? '#e99002' : '#00539C';
                    return {y: entity[dataModel.selectedMetric()], color: color}
                });
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.selectionSummary = dataModel.selectionSummary;

            this.chart = ko.observable();

            this.verticalChart = dataModel.verticalChart;

            this.filterSummary = dataModel.filterSummary;

            this.updateBar = ko.computed(function () {
                var schoolNames = self.entityNames();
                var schoolSeries = self.entitySeries();
                var verticalChart = self.verticalChart();
                var filterSummary = self.filterSummary();

                if (!params.isSelected()) {
                    return;
                }
                
                var checkExist = setInterval(function () {

                    if (!dataModel.tooManySchools() && document.getElementById('myChart')) {

                        var chartOptions = {
                            chart: {
                                renderTo: 'myChart',
                                zoomType: 'x'
                            },
                            title: {
                                text: self.selectionSummary(),
                                style: {
                                    fontSize: 15,
                                    fontWeight: "bold"
                                }
                            },
                            subtitle: {
                                text: filterSummary
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
                                max: dataModel.measureMax(),
                                gridLineColor: '#e9e9e9'
                            },
                            plotOptions: {
                                series: {
                                    cursor: 'pointer',
                                    point: {
                                        events: {
                                            click: function () {
                                                if (dataModel.viewLevel() === "Region") {
                                                    if (dataModel.dataLevel() === 'Region') {
                                                        dataModel.selectedRegion(this.category);
                                                        dataModel.dataLevel("LEA");
                                                    } else if (dataModel.dataLevel() === 'LEA') {
                                                        dataModel.selectedLea(this.category);
                                                        dataModel.viewLevel("LEA");
                                                        dataModel.dataLevel("School");
                                                    }
                                                } else if (dataModel.viewLevel() === "LEA") {
                                                    if (dataModel.dataLevel() === 'LEA') {
                                                        dataModel.selectedLea(this.category);
                                                        dataModel.dataLevel("School");
                                                    }
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
                                },
                                xAxis: {
                                    tickWidth: 0,
                                    lineWidth: 0,
                                    gridLineWidth: 1,
                                    tickPixelInterval: 200,
                                    labels: {
                                        enabled: false
                                    }
                                }
                            };
                        } else {
                            chartOptions.chart.type = 'bar';
                            chartOptions.scrollbar = {
                                enabled: true
                            };
                        }

                        var chart = new Highcharts.Chart(chartOptions);

                        self.chart(chart);

                        clearInterval(checkExist);
                    }
                }, 30);
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 150}});


            this.style = function() {
                return {
                    backgroundColor: 'white',
                    border: '1px solid #777777',
                    padding: '2px',
                    'border-radius': '5px',
                    opacity: '0.9'
                }
            };

            this.nationalAverageLine = ko.pureComputed(function () {
                return dataModel.showNationalAverage() && {
                        id: 'nat',
                        color: 'rgb(230, 170, 0)',
                        width: 2,
                        value: dataModel.nationalAverage(),
                        zIndex: 5,
                        dashStyle: 'dash',
                        label: {
                            align: 'center',
                            verticalAlign: 'middle',
                            text: 'national',
                            style: self.style(),
                            useHTML: true
                        }
                    };
            });

            this.top10Line = ko.pureComputed(function () {
                return dataModel.showTop10Percent() && {
                        id: 'top',
                        color: 'rgb(0, 163, 101)',
                        width: 2,
                        value: dataModel.top10Percent(),
                        zIndex: 5,
                        dashStyle: 'dash',
                        label: {
                            text: 'top 10%',
                            align: 'right',
                            verticalAlign: 'bottom',
                            y: -5,
                            style: self.style(),
                            useHTML: true
                        }
                    };
            });

            this.bottom10Line = ko.pureComputed(function () {
                return dataModel.showBottom10Percent() && {
                        id: 'bot',
                        color: 'rgb(149, 46, 0)',
                        width: 2,
                        value: dataModel.bottom10Percent(),
                        zIndex: 5,
                        dashStyle: 'dash',
                        label: {
                            text: 'bottom 10%',
                            verticalAlign: 'top',
                            style: self.style(),
                            useHTML: true
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
