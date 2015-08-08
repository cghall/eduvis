define(['knockout', 'data-model', 'jquery', 'text!./tableview.html', 'datatables'], function(ko, dataModel, $, templateMarkup) {

    function Tableview(params) {

        var self = this;

        this.table = undefined;

        this.tooManySchools = dataModel.tooManySchools;

        this.entities = dataModel.entities;

        this.selectionSummary = dataModel.selectionSummary;
        this.filterSummary = dataModel.filterSummary;

        this.sortedEntities = ko.pureComputed(function () {
            return _.sortBy(dataModel.entities(), dataModel.selectedMetric());
        });

        this.updateTable = ko.computed(function () {
            var selectedMeasure = dataModel.selectedMeasure();
            var dataLevel = dataModel.dataLevel();
            var selectedMetric = dataModel.selectedMetric();
            var measureSuffix = dataModel.selectedMeasureSuffix() ? ' (' + dataModel.selectedMeasureSuffix() + ')': '';

            if (params.isSelected() && self.entities()) {
                var entityNames = {
                    Region: 'Region',
                    LEA: 'Local authority',
                    School: 'School'
                };

                var columns = [
                    {
                        data: 'SCHNAME',
                        title: entityNames[dataLevel]
                    },
                    {
                        data: selectedMetric,
                        title: selectedMeasure + measureSuffix
                    }
                ];

                var tableElem = $('#myTable');
                if (self.table) {
                    var table = tableElem.DataTable();
                    table.destroy()
                }
                self.table = tableElem.dataTable({
                    "data": self.entities(),
                    "columns": columns
                });
            }
        }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 150}});;
    }

    return { viewModel: Tableview, template: templateMarkup };

});
