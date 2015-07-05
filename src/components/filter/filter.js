define(['knockout', 'underscore', 'cookie-manager', 'text!./filter.html', 'knockout-jqueryui/slider', 'knockout-postbox'],
    function (ko, _, cm, templateMarkup) {

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function Filter() {
            var self = this;

            this.fsmFilterOn = ko.observable().syncWith("fsmFilterOn", true);

            this.fsmMinNumberInput = ko.observable(0);
            this.fsmMaxNumberInput = ko.observable(100);

            this.fsmMin = ko.observable(0)
                .syncWith("fsmMin", true)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 100}});

            this.fsmMax = ko.observable(100)
                .syncWith("fsmMax", true)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 100}});

            this.updateFromFsm = ko.computed(function() {
                var x = self.fsmMin(), y = self.fsmMax();
                self.fsmMin(Math.min(x, y));
                self.fsmMax(Math.max(x, y));
                self.fsmMinNumberInput(Math.min(x, y));
                self.fsmMaxNumberInput(Math.max(x, y));
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

            this.apsFilterOn = ko.observable().syncWith("apsFilterOn", true);

            this.apsMinNumberInput = ko.observable(15);
            this.apsMaxNumberInput = ko.observable(30);

            this.apsMinPercent = ko.observable(0).syncWith("apsMinPercent", true);
            this.apsMaxPercent = ko.observable(100).syncWith("apsMaxPercent", true);

            this.apsMin = ko.computed(function() {
                return 15 + Math.round(self.apsMinPercent()/100. * 15);
            }).publishOn("apsMin")
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 100}});

            this.apsMax = ko.computed(function() {
                return 15 + Math.round(self.apsMaxPercent()/100. * 15);
            }).publishOn("apsMax")
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 100}});

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

            this.updateCookie = ko.computed(function () {
                cm.extendCookie('graph', {
                    fsmFilterOn: self.fsmFilterOn(),
                    fsmMin: self.fsmMin(),
                    fsmMax: self.fsmMax(),
                    apsFilterOn: self.apsFilterOn(),
                    apsMinPercent: self.apsMinPercent(),
                    apsMaxPercent: self.apsMaxPercent()
                });
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});
        }

        return {viewModel: Filter, template: templateMarkup};

    });
