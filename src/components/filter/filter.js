define(['knockout', 'underscore', 'cookie-manager', 'data-model', 'text!./filter.html', 'knockout-jqueryui/slider'],
    function (ko, _, cm, dataModel, templateMarkup) {

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function Filter() {
            var self = this;

            this.includeLaMaintained = dataModel.includeLaMaintained;
            this.includeAcademies = dataModel.includeAcademies;
            this.includeFreeSchools = dataModel.includeFreeSchools;

            this.fsmFilterOn = ko.observable(dataModel.fsmMin() !== 0 || dataModel.fsmMax() !== 100);

            this.fsmMinNumberInput = ko.observable(0);
            this.fsmMaxNumberInput = ko.observable(100);
            this.fsmMin = ko.observable(dataModel.fsmMin());
            this.fsmMax = ko.observable(dataModel.fsmMax());

            this.updateDataModelFsm = ko.computed(function () {
              dataModel.fsmMin(self.fsmFilterOn() ? self.fsmMin() : 0);
              dataModel.fsmMax(self.fsmFilterOn() ? self.fsmMax() : 100);
            });

            this.updateFromFsm = ko.computed(function() {
                var x = self.fsmMin(), y = self.fsmMax();
                var min = Math.min(x, y);
                var max = Math.max(x, y);
                self.fsmMin(min);
                self.fsmMax(max);
                self.fsmMinNumberInput(min);
                self.fsmMaxNumberInput(max);
            });

            this.updateFromFsmNumberInput = ko.computed(function() {
                var x = self.fsmMinNumberInput(), y = self.fsmMaxNumberInput();
                var min = Math.max(0, Math.min(x, y));
                var max = Math.min(100, Math.max(x, y));
                self.fsmMin(min);
                self.fsmMax(max);
                self.fsmMinNumberInput(min);
                self.fsmMaxNumberInput(max);
            });

            this.fsmRange = ko.computed({
                read: function() {
                    return [self.fsmMin(), self.fsmMax()];
                },
                write: function(newValue) {
                    if (isNumeric(newValue[0]) && isNumeric(newValue[1])) {
                        self.fsmMin(Math.min(newValue[0], newValue[1]));
                        self.fsmMax(Math.max(newValue[0], newValue[1]));
                    }
                },
                owner: self
            });

            this.apsFilterOn = ko.observable(dataModel.apsMin() !== 15 || dataModel.apsMax() !== 30);

            this.apsMinNumberInput = ko.observable(dataModel.apsMin());
            this.apsMaxNumberInput = ko.observable(dataModel.apsMax());

            this.apsMinPercent = ko.observable(Math.round((dataModel.apsMin() - 15) / 0.15));
            this.apsMaxPercent = ko.observable(Math.round((dataModel.apsMax() - 15) / 0.15));

            this.apsMin = ko.computed(function() {
                var min = 15 + Math.round(self.apsMinPercent() / 100. * 15);
                dataModel.apsMin(self.apsFilterOn() ? min : 15);
                return min;
            });

            this.apsMax = ko.computed(function() {
                var max = 15 + Math.round(self.apsMaxPercent() / 100. * 15);
                dataModel.apsMax(self.apsFilterOn() ? max : 30);
                return max;
            });

            this.updateFromAps = ko.computed(function() {
                var x = self.apsMin(), y = self.apsMax();
                self.apsMinNumberInput(Math.min(x, y));
                self.apsMaxNumberInput(Math.max(x, y));
            });

            this.updateFromApsNumberInput = ko.computed(function() {
                var x = self.apsMinNumberInput(), y = self.apsMaxNumberInput();
                var min = Math.max(15, Math.min(x, y));
                var max = Math.min(30, Math.max(x, y));
                var minPercent = Math.round((min - 15) / 0.15);
                var maxPercent = Math.round((max - 15) / 0.15);
                self.apsMinPercent(minPercent);
                self.apsMaxPercent(maxPercent);
                self.apsMinNumberInput(min);
                self.apsMaxNumberInput(max);
            });

            this.apsRange = ko.computed({
                read: function() {
                    return [self.apsMinPercent(), self.apsMaxPercent()];
                },
                write: function(newValue) {
                    self.apsMinPercent(Math.min(newValue[0], newValue[1]));
                    self.apsMaxPercent(Math.max(newValue[0], newValue[1]));
                },
                owner: self
            });
        }

        return {viewModel: Filter, template: templateMarkup};

    });
