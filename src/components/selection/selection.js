define(['knockout', 'underscore', 'text!./selection.html'], function(ko, _, templateMarkup) {

    function Selection(params) {
        var self = this;

        this.selectionConfig = params.selectionConfig;
        this.allData = params.allData;
        this.metaData = params.metaData;

        this.selectedMeasure = params.selectedMeasure;
        this.selectedLea = params.lea;
        this.selectedSchoolsNames = params.schoolNames;
        this.selectedSchoolsSeries = params.schoolSeries;

        this.leaOptions = ko.observableArray([]);
        this.updateLeaOptions = ko.computed(function() {
            var leaOptions = _.uniq(_.pluck(self.allData(), 'LEA'));
            leaOptions.sort();
            self.leaOptions(leaOptions);
        });

        this.measureOptions = ko.observableArray(['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ',
                                                  'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ']);
        this.selectedMeasure = ko.observable();

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

        this.focusedSchool = ko.observable();

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
