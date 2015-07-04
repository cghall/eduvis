define(['knockout', 'underscore', 'text!./chart-description.html', 'knockout-postbox'], function(ko, _, templateMarkup) {

    function ChartDescription(params) {
        var self = this;

        this.metaData = ko.observable().subscribeTo("metaData", true);
        this.selectedMeasure = ko.observable().subscribeTo("selectedMeasure", true);

        this.selectedMeasureDescription = ko.computed(function() {
            var measure = _.findWhere(self.metaData(), { 'column': self.selectedMeasure() });
            return measure ? measure['long_description'] : '...';
        });
    }

    return { viewModel: ChartDescription, template: templateMarkup };

});
