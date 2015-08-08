define(['knockout', 'underscore', 'data-model', 'text!./selection.html', 'knockout-popover'],
    function (ko, _, dataModel, templateMarkup) {

        function Selection() {
            var self = this;

            this.viewLevel = dataModel.viewLevel;
            this.dataLevel = dataModel.dataLevel;

            this.tooManySchools = dataModel.tooManySchools;

            this.regionOptions = dataModel.regions;
            this.selectedRegion = dataModel.selectedRegion;

            this.leaOptions = dataModel.leas;
            this.selectedLea = dataModel.selectedLea;

            this.focusedSchool = dataModel.focusedSchool;

            this.selectedSchoolsExcludedNames = ko.pureComputed(function () {
                return _(dataModel.schoolsWithoutData())
                    .pluck('SCHNAME')
                    .sortBy(_.identity)
                    .value()
                    .join('<br>');
            });

            this.selectedSchoolsIncludedAlphabetical = ko.pureComputed(function () {
                return _.sortBy(dataModel.schools(), 'SCHNAME');
            });

            this.updateFromLeaChange = function () {
               if (self.dataLevel() === 'School' && self.viewLevel() === 'Region' && self.selectedLea()) {
                   self.viewLevel('LEA');
               }
            };

            this.updateFromWithinChange = ko.computed(function () {
                if (self.dataLevel() === 'LEA' && self.viewLevel() === 'LEA') {
                    self.viewLevel('Region');
                }
                if (self.dataLevel() == 'School' && !self.selectedLea()) {
                    self.viewLevel('Region');
                }
            });
        }

        return {viewModel: Selection, template: templateMarkup};

    });
