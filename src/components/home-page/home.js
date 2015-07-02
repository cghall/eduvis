define(["knockout", "text!./home.html", "knockout-postbox", "data-load"], function(ko, homeTemplate) {

    function HomeViewModel() {
        this.schoolDataLoaded = ko.observable().subscribeTo("schoolDataLoaded", true);
    }

    return { viewModel: HomeViewModel, template: homeTemplate };

});
