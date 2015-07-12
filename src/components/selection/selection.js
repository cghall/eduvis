define(['knockout', 'underscore', 'data-model', 'text!./selection.html', 'knockout-popover'],
    function (ko, _, dataModel, templateMarkup) {

        function Selection() {
            var self = this;

            this.allData =  dataModel.allData;

            this.leaOptions = dataModel.leas;
            this.selectedLea = dataModel.selectedLea;

            this.measureOptions = dataModel.measures;
            this.selectedMeasure = dataModel.selectedMeasure;
            this.pupilGroupOptions = dataModel.pupilGroups;
            this.selectedPupilGroup = dataModel.selectedPupilGroup;

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
