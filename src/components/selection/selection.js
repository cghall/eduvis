define(['knockout', 'underscore', 'data-model', 'text!./selection.html', 'knockout-popover'],
    function (ko, _, dataModel, templateMarkup) {

        function Selection() {
            var self = this;

            this.viewLevel = dataModel.viewLevel;

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
        }

        return {viewModel: Selection, template: templateMarkup};

    });
