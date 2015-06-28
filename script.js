var average = function(numbers) {
    var sum = 0;
    for (var i = 0; i < numbers.length; i++) {
         sum += numbers[i] || 0;
    }
    return sum / numbers.length;
}

var viewModel = function() {
    var self = this;

    self.columnChart = ko.observable();
    self.schoolDataLoaded = ko.observable(false);
    self.allData = ko.observable({});
    self.metaData = ko.observable({});
    self.schoolCount = ko.computed(function() {
        return self.allData().length;
    });

    self.measureOptions = ko.observableArray(['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ',
                                              'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ']);

    self.leaOptions = ko.computed(function() {
        var leaOptions = _.uniq(_.pluck(self.allData(), 'LEA'));
        leaOptions.sort();
        return leaOptions;
    });

    self.selectedMeasure = ko.observable();
    self.selectedLea = ko.observable();

    self.selectedMeasureDescription = ko.computed(function() {
        var measure = _.findWhere(self.metaData(), { 'Metafile heading': self.selectedMeasure() });
        return measure ? measure['Metafile description'] : '...';
    });

    self.showNationalAverage = ko.observable(false);
    self.showTop10Percent = ko.observable(false);
    self.showBottom10Percent = ko.observable(false);

    self.allDataSelectedMeasure = ko.computed(function() {
        var series = _.pluck(self.allData(), self.selectedMeasure());
        series.sort();
        return series;
    });

    self.selectedSchools = ko.computed(function() {
        var selectedSchools = _.where(self.allData(), { LEA: self.selectedLea() });
        return _.sortBy(selectedSchools, self.selectedMeasure());
    });

    self.selectedSchoolsNames = ko.computed(function() {
        return _.pluck(self.selectedSchools(), 'SCHNAME');
    });

    self.selectedSchoolsNamesAlphabetical = ko.computed(function() {
        var names = self.selectedSchoolsNames().slice(0);
        names.sort();
        return names;
    });

    self.selectedSchoolsSeries = ko.computed(function() {
        var series = _.pluck(self.selectedSchools(), self.selectedMeasure());
        return series;
    });

    self.focusedSchool = ko.observable();

    self.focusedSchoolIndex = ko.computed(function() {
        return self.selectedSchoolsNames().indexOf(self.focusedSchool());
    });

    self.selectedSchoolsSeriesWithColour = ko.computed(function() {
        var data = self.selectedSchoolsSeries().slice(0);
        if (self.focusedSchoolIndex() >= 0 && data[self.focusedSchoolIndex()]) {
            data[self.focusedSchoolIndex()] = { y: data[self.focusedSchoolIndex()], color: 'orange' };
        }
        return data;
    });

    self.updateBar = ko.computed( function() {
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'myChart',
                type: 'bar',
                marginLeft: 300
            },
            title: {
                text: self.selectedMeasure() + ' for LEA ' + self.selectedLea()
            },
            xAxis: {
                categories: self.selectedSchoolsNames()
            },
            yAxis: {
                title: {
                    text: self.selectedMeasure()
                },
                max: 1
            },
            series: [{
                showInLegend: false,
                name: self.selectedMeasure(),
                data: self.selectedSchoolsSeriesWithColour(),
                animation: {
                    duration: 300
                }
            }]
        });
        self.columnChart(chart);
    });

    self.nationalAverageLine = ko.computed(function() {
        return self.showNationalAverage() && {
            id: 'nat',
            color: 'rgb(255, 204, 0)',
            width: 2,
            value: average(self.allDataSelectedMeasure()),
            zIndex: 5,
            label: {
                align: 'center',
                verticalAlign: 'middle',
                text: 'national'
            }
        };
    });

    self.top10Line = ko.computed(function() {
        return self.showTop10Percent() && {
            id: 'top',
            color: 'rgb(51, 204, 51)',
            width: 2,
            value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount()*0.9)],
            zIndex: 5,
            label: {
                text: 'top 10%',
                align: 'right',
                verticalAlign: 'bottom',
                y: -5
            }
        };
    });

    self.bottom10Line = ko.computed(function() {
        return self.showBottom10Percent() && {
            id: 'bot',
            color: 'rgb(255, 51, 0)',
            width: 2,
            value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount()*0.1)],
            zIndex: 5,
            label: {
                text: 'bottom 10%',
                verticalAlign: 'top',
            }
        };
    });

    self.averagePlotLines = ko.computed(function() {
        var plotLines = [self.nationalAverageLine(), self.top10Line(), self.bottom10Line()];
        return _.without(plotLines, false);
    });

    self.updatePlotLines = ko.computed(function() {
        ['nat', 'top', 'bot'].forEach(function(lineId) {
            self.columnChart().yAxis[0].removePlotLine(lineId);
        });
        self.averagePlotLines().forEach(function(line) {
            self.columnChart().yAxis[0].addPlotLine(line);
        });
    });

};

var viewModel = new viewModel();

ko.applyBindings(viewModel);

papaConfig = {
    download: true,
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
};

var metaComplete = function(result) {
    viewModel.metaData(result.data);
}

var dataComplete = function(result) {
    viewModel.schoolDataLoaded(true);
    viewModel.allData(result.data);
}

var metaPapaConfig = _.extend({ complete: metaComplete }, papaConfig);

var dataPapaConfig = _.extend({ complete: dataComplete }, papaConfig);

Papa.parse('ks4_meta.csv', metaPapaConfig);

Papa.parse('School_data.csv', dataPapaConfig);