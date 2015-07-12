define(["knockout", "data-model", "text!./home.html"], function(ko, dataModel, homeTemplate) {

    function HomeViewModel() {
        this.schoolDataLoaded = dataModel.schoolDataLoaded;
    }

    return { viewModel: HomeViewModel, template: homeTemplate };

});
