define(['knockout', 'underscore', 'cookie-manager', 'text!./filter.html', 'jquery-ui-touch', 'knockout-jqueryui/slider', 'knockout-postbox'],
    function (ko, _, cm, templateMarkup) {

      function Filter() {
        var self = this;

        this.fsmMin = ko.observable(0);
        this.fsmMax = ko.observable(100);
        this.fsmRange = ko.computed({
          read: function() {
            return [self.fsmMin(), self.fsmMax()];
          },
          write: function(newValue) {
            self.fsmMin(Math.min(newValue[0], newValue[1]));
            self.fsmMax(Math.max(newValue[0], newValue[1]));
          },
          owner: self
        });

        this.apsMinPercent = ko.observable(0);
        this.apsMaxPercent = ko.observable(100);

        this.apsMin = ko.computed(function() {
          return 15 + Math.round(self.apsMinPercent()/100. * 15);
        });

        this.apsMax = ko.computed(function() {
          return 15 + Math.round(self.apsMaxPercent()/100. * 15);
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
