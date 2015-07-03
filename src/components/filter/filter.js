define(['knockout', 'underscore', 'cookie-manager', 'text!./filter.html', 'knockout-jqueryui/slider', 'knockout-postbox'],
    function (ko, _, cm, templateMarkup) {

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function Filter() {
            var self = this;

            this.fsmFilterOn = ko.observable(false);

            this.fsmMin = ko.observable(0);
            this.fsmMax = ko.observable(100);
            this.fsmMinNumberInput = ko.observable(0);
            this.fsmMaxNumberInput = ko.observable(100);

            this.updateFromFsmNumberInput = ko.computed(function() {
                var x = self.fsmMinNumberInput(), y = self.fsmMaxNumberInput();
                self.fsmMin(Math.min(x, y));
                self.fsmMax(Math.max(x, y));
                self.fsmMinNumberInput(Math.min(x, y));
                self.fsmMaxNumberInput(Math.max(x, y));
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.updateFromFsm = ko.computed(function() {
                var x = self.fsmMin(), y = self.fsmMax();
                self.fsmMin(Math.min(x, y));
                self.fsmMax(Math.max(x, y));
                self.fsmMinNumberInput(Math.min(x, y));
                self.fsmMaxNumberInput(Math.max(x, y));
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

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

            this.apsFilterOn = ko.observable(false);

            this.apsMinPercent = ko.observable(0);
            this.apsMaxPercent = ko.observable(100);

            this.apsMin = ko.computed(function() {
                return 15 + Math.round(self.apsMinPercent()/100. * 15);
            });

            this.apsMax = ko.computed(function() {
                return 15 + Math.round(self.apsMaxPercent()/100. * 15);
            });

            this.apsMinNumberInput = ko.observable(15);
            this.apsMaxNumberInput = ko.observable(30);

            this.updateFromApsNumberInput = ko.computed(function() {
                var x = self.apsMinNumberInput(), y = self.apsMaxNumberInput();
                var xPercent = Math.round((self.apsMinNumberInput() - 15) / 0.15);
                var yPercent = Math.round((self.apsMaxNumberInput() - 15) / 0.15);
                self.apsMinPercent(Math.min(xPercent, yPercent));
                self.apsMaxPercent(Math.max(xPercent, yPercent));
                self.apsMinNumberInput(Math.min(x, y));
                self.apsMaxNumberInput(Math.max(x, y));
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.updateFromAps = ko.computed(function() {
                var x = self.apsMin(), y = self.apsMax();
                self.apsMinNumberInput(Math.min(x, y));
                self.apsMaxNumberInput(Math.max(x, y));
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

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
