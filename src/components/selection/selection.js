define(['knockout', 'underscore', 'cookie-manager', 'text!./selection.html', 'knockout-postbox', 'knockout-popover'],
    function (ko, _, cm, templateMarkup) {

        function Selection() {
            var self = this;

            this.allData = ko.observable().subscribeTo("allData", true);
            this.metaData = ko.observable().subscribeTo("metaData", true);

            this.metricOptions = ko.computed(function() {
                return _.chain(self.metaData())
                    .pluck('metric')
                    .filter(_.identity)
                    .sortBy(_.identity)
                    .uniq()
                    .value();
            });

            this.selectedMetric = ko.observable();

            this.pupilGroupOptions = ko.computed(function() {
                return _.chain(self.metaData())
                    .where({metric: self.selectedMetric()})
                    .pluck('pupils')
                    .sortBy(_.identity)
                    .value();
            });

            this.selectedPupilGroup = ko.observable();

            this.selectedMeasure = ko.observable()
                .syncWith("selectedMeasure", true)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.selectedMeasure = ko.computed({
                read: function() {
                    var measure = _.findWhere(self.metaData(),
                        {metric: self.selectedMetric(), pupils: self.selectedPupilGroup()});
                    return measure && measure.column
                },
                write: function(column) {
                    var measure = _.findWhere(self.metaData(), {column: column});
                    self.selectedMetric(measure && measure.metric);
                    self.selectedPupilGroup(measure && measure.pupils);
                },
                owner: self
            }).syncWith("selectedMeasure", true)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.selectedMeasureSuffix = ko.computed(function() {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMeasure()});
                return measure && measure.suffix;
            }).publishOn("selectedMeasureSuffix");

            this.measureMin = ko.computed(function() {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMeasure()});
                return measure && measure.lower/100;
            }).publishOn("selectedMeasureMin");

            this.measureMax = ko.computed(function() {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMeasure()});
                return measure && measure.upper/100;
            }).publishOn("selectedMeasureMax");

            this.selectedLea = ko.observable().syncWith("selectedLea", true)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.selectionSummary = ko.computed(function() {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMeasure()});
                var measureShort = measure && measure.metric;
                return measureShort + ' for LEA ' + self.selectedLea();
            }).publishOn("selectionSummary");

            this.focusedSchool = ko.observable()
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            ko.postbox.subscribe("focusedSchool", function(schoolName) {
                self.focusedSchool(_.findWhere(self.allData(), {SCHNAME: schoolName}));
            }, true);

            this.updateCookie = ko.computed(function () {
                cm.extendCookie('graph', {
                    measure: self.selectedMeasure(),
                    lea: self.selectedLea(),
                    focusedSchool: self.focusedSchool() && self.focusedSchool()['SCHNAME']
                });
            });

            this.leaOptions = ko.computed(function () {
                var leaOptions = _.uniq(_.pluck(self.allData(), 'LEA'));
                leaOptions.sort();
                return leaOptions;
            });

            this.selectedSchools = ko.computed(function () {
                var selectedSchools = _.where(self.allData(), {LEA: self.selectedLea()});
                return _.sortBy(selectedSchools, self.selectedMeasure());
            });

            this.selectedSchoolsExcluded = ko.observable([]);

            this.selectedSchoolsExcludedNames = ko.computed(function () {
                var names = _.pluck(self.selectedSchoolsExcluded(), 'SCHNAME');
                names.sort();
                return names.join('<hr>');
            });

            this.selectedSchoolsIncluded = ko.computed(function () {
                var hasData = function (school) {
                    return school[self.selectedMeasure()] !== '';
                };

                var allSchools = _.partition(self.selectedSchools(), hasData);
                var included = allSchools[0];
                var excluded = allSchools[1];

                self.selectedSchoolsExcluded(excluded);
                return included;
            });

            this.selectedSchoolsNames = ko.computed(function () {
                return _.pluck(self.selectedSchoolsIncluded(), 'SCHNAME');
            }).publishOn("selectedSchoolsNames")
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.selectedSchoolsSeriesWithColour = ko.computed(function () {
                return _.map(self.selectedSchoolsIncluded(), function(school) {
                    return school === self.focusedSchool()
                        ? {y: school[self.selectedMeasure()], color: 'orange'}
                        : school[self.selectedMeasure()]
                });
            }).publishOn("selectedSchoolsSeries")
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});
        }

        return {viewModel: Selection, template: templateMarkup};

    });
