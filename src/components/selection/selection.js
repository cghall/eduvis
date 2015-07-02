define(['knockout', 'underscore', 'cookie-manager', 'text!./selection.html', 'knockout-postbox'], function(ko, _, cm, templateMarkup) {

    function Selection() {
        var self = this;

        this.allData = ko.observable().subscribeTo("allData", true);
        this.metaData = ko.observable().subscribeTo("metaData", true);

        this.selectedMeasure = ko.observable().syncWith("selectedMeasure", true)
            .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 50 } });

        this.selectedLea = ko.observable().syncWith("selectedLea", true)
            .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 50 } });

        this.selectedSchoolsNames = ko.observable([]).publishOn("selectedSchoolsNames")
            .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 50 } });

        this.selectedSchoolsSeries = ko.observable([]).publishOn("selectedSchoolsSeries")
            .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 50 } });

        this.focusedSchool = ko.observable().syncWith("focusedSchool", true);

        this.updateCookie = ko.computed(function() {
            cm.extendCookie('graph', {
                measure: self.selectedMeasure(),
                lea: self.selectedLea(),
                focusedSchool: self.focusedSchool()
            });
        });

        this.leaOptions = ko.computed(function() {
            var leaOptions = _.uniq(_.pluck(self.allData(), 'LEA'));
            leaOptions.sort();
            return leaOptions;
        });

        this.measureOptions = ko.observableArray(['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ',
                                                  'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ']);

        this.selectedSchools = ko.computed(function() {
            var selectedSchools = _.where(self.allData(), { LEA: self.selectedLea() });
            return _.sortBy(selectedSchools, self.selectedMeasure());
        });

        this.selectedSchoolsExcluded = ko.observable([]);

        this.selectedSchoolsExcludedNames = ko.computed(function() {
            var names = _.pluck(self.selectedSchoolsExcluded(), 'SCHNAME');
            names.sort();
            return names.join('<hr>');
        });

        this.selectedSchoolsIncluded = ko.computed(function() {
            var hasData = function(school) {
                return school[self.selectedMeasure()] !== '';
            };

            var allSchools = _.partition(self.selectedSchools(), hasData);
            var included = allSchools[0];
            var excluded = allSchools[1];

            self.selectedSchoolsExcluded(excluded);
            return included;
        });

        this.selectedSchoolsNamesAlphabetical = ko.computed(function() {
            var names = self.selectedSchoolsNames().slice(0);
            names.sort();
            return names;
        });

        this.focusedSchoolIndex = ko.computed(function() {
            return self.selectedSchoolsNames().indexOf(self.focusedSchool());
        });

        this.selectedSchoolsSeriesWithColour = ko.computed(function() {
            var data = _.pluck(self.selectedSchoolsIncluded(), self.selectedMeasure());
            if (self.focusedSchoolIndex() >= 0 && data[self.focusedSchoolIndex()]) {
                data[self.focusedSchoolIndex()] = { y: data[self.focusedSchoolIndex()], color: 'orange' };
            }
            return data;
        });

        this.updateNames = ko.computed(function() {
            self.selectedSchoolsNames(_.pluck(self.selectedSchoolsIncluded(), 'SCHNAME'));
        });

        this.updateSeries = ko.computed(function() {
            self.selectedSchoolsSeries(self.selectedSchoolsSeriesWithColour());
        });
    }
  
    return { viewModel: Selection, template: templateMarkup };

});
