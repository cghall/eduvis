define(['knockout', 'underscore', 'data-model', 'text!./chart-description.html'], function(ko, _, dataModel, templateMarkup) {

    function ChartDescription() {
        var self = this;

        this.selectedMeasureDescription = ko.pureComputed(function() {
            var measure = _.findWhere(dataModel.metaData(), { 'column': dataModel.selectedMetric() });
            return measure ? measure['long_description'] : '...';
        });
    }

    return { viewModel: ChartDescription, template: templateMarkup };

});
