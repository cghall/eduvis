define(["knockout", "data-model", "text!./home.html"], function(ko, dataModel, homeTemplate) {

    function HomeViewModel() {
        var self = this;

        this.schoolDataLoaded = dataModel.schoolDataLoaded;

        this.verticalChart = dataModel.verticalChart;

        this.setVertical = function() {
            self.verticalChart(true);
        };

        this.setHorizontal = function() {
            self.verticalChart(false);
        };

        this.isBarSelected = dataModel.isBarSelected;
        this.isTableSelected = dataModel.isTableSelected;
        this.isMapSelected = dataModel.isMapSelected;

        this.selectBar = function () {
            this.isBarSelected(true);
            this.isTableSelected(false);
            this.isMapSelected(false);
        };

        this.selectTable = function () {
            this.isBarSelected(false);
            this.isTableSelected(true);
            this.isMapSelected(false);
        };

        this.selectMap = function () {
            this.isBarSelected(false);
            this.isTableSelected(false);
            this.isMapSelected(true);
        };
    }

    return { viewModel: HomeViewModel, template: homeTemplate };

});
