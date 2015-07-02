define(['knockout', 'cookie-manager', 'text!./display-options.html', 'knockout-postbox'], function (ko, cm, templateMarkup) {

    var average = function(numbers) {
        var sum = 0;
        for (var i = 0; i < numbers.length; i++) {
            sum += numbers[i] || 0;
        }
        return sum / numbers.length;
    };

    function DisplayOptions(params) {
        var self = this;

        this.selectedMeasure = ko.observable().subscribeTo("selectedMeasure", true);
        this.allData = ko.observable().subscribeTo("allData", true);

        this.schoolCount = ko.computed(function() {
            return self.allData().length;
        });

        this.showNationalAverage = ko.observable().syncWith("showNationalAverage", true);
        this.showTop10Percent = ko.observable().syncWith("showTop10", true);
        this.showBottom10Percent = ko.observable().syncWith("showBottom10", true);

        this.updateCookie = ko.computed(function() {
            cm.extendCookie('graph', {
                showNatAvg: self.showNationalAverage(),
                showTop10: self.showTop10Percent(),
                showBottom10: self.showBottom10Percent()
            });
        });

        this.allDataSelectedMeasure = ko.computed(function() {
            var series = _.pluck(self.allData(), self.selectedMeasure());
            series.sort();
            return series;
        });

        this.nationalAverageLine = ko.computed(function () {
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

        this.top10Line = ko.computed(function () {
            return self.showTop10Percent() && {
                    id: 'top',
                    color: 'rgb(51, 204, 51)',
                    width: 2,
                    value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount() * 0.9)],
                    zIndex: 5,
                    label: {
                        text: 'top 10%',
                        align: 'right',
                        verticalAlign: 'bottom',
                        y: -5
                    }
                };
        });

        this.bottom10Line = ko.computed(function () {
            return self.showBottom10Percent() && {
                    id: 'bot',
                    color: 'rgb(255, 51, 0)',
                    width: 2,
                    value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount() * 0.1)],
                    zIndex: 5,
                    label: {
                        text: 'bottom 10%',
                        verticalAlign: 'top'
                    }
                };
        });

        this.averagePlotLines = ko.computed(function () {
            var plotLines = [self.nationalAverageLine(), self.top10Line(), self.bottom10Line()];
            return _.without(plotLines, false);
        }).publishOn("averagePlotLines");
    }

    return {viewModel: DisplayOptions, template: templateMarkup};

});
