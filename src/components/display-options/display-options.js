define(['knockout', 'data-model', 'text!./display-options.html'],
    function (ko, dataModel, templateMarkup) {

        function DisplayOptions() {
            var self = this;

            this.showNationalAverage = dataModel.showNationalAverage;
            this.showTop10Percent = dataModel.showTop10Percent;
            this.showBottom10Percent = dataModel.showBottom10Percent;
        }

        return {viewModel: DisplayOptions, template: templateMarkup};

    });