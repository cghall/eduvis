define(["knockout", "jquery", "underscore", "papaparse", "cookie-manager"],
    function (ko, $, _, Papa, cm) {

        var parseQueryString = function (a) {
            a = a.split('&');
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split('=', 2);
                if (p.length == 1)
                    b[p[0]] = "";
                else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        };
        var queryStringOptions = parseQueryString(window.location.search.substr(1));

        function DataModel() {
            var self = this;
            cm.enableCookieWriting(false);

            this.schoolDataLoaded = ko.observable(false);
            this.allData = ko.observable([]);
            this.metaData = ko.observable([]);
            this.downloadSchoolData();

            this.isBarSelected = ko.observable(true);
            this.isTableSelected = ko.observable(false);
            this.isMapSelected = ko.observable(false);

            this.viewLevel = ko.observable("Region");
            this.dataLevel = ko.observable("LEA");

            this.regions = ko.pureComputed(function () {
                return _(self.allData())
                    .pluck('REGION')
                    .sortBy(_.identity)
                    .uniq(true)
                    .value();
            });
            this.selectedRegion = ko.observable();

            this.selectedLea = ko.observable()
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});
            this.focusedSchool = ko.observable();

            this.leas = ko.computed(function () {
                return _(self.allData())
                    .filter(function(school) {
                        var region = self.selectedRegion();
                        return !region || (region && school.REGION === region);
                    })
                    .pluck('LEA')
                    .sortBy(_.identity)
                    .uniq(true)
                    .value();
            });

            this.includeLaMaintained = ko.observable(false);
            this.includeAcademies = ko.observable(false);
            this.includeFreeSchools = ko.observable(false);

            this.fsmMin = ko.observable(0);
            this.fsmMax = ko.observable(100);
            this.apsMin = ko.observable(15);
            this.apsMax = ko.observable(30);

            this.measures = ko.pureComputed(function () {
                return _(self.metaData())
                    .pluck('metric')
                    .filter(_.identity)
                    .sortBy(_.identity)
                    .uniq(true)
                    .value();
            });
            this.selectedMeasure = ko.observable()
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.pupilGroups = ko.pureComputed(function () {
                return _(self.metaData())
                    .where({metric: self.selectedMeasure()})
                    .pluck('pupils')
                    .sortBy(_.identity)
                    .value();
            });
            this.selectedPupilGroup = ko.observable();

            this.selectedMetric = ko.computed({
                read: function () {
                    var measure = _.findWhere(self.metaData(),
                        {metric: self.selectedMeasure(), pupils: self.selectedPupilGroup()});
                    return measure && measure.column
                },
                write: function (column) {
                    var measure = _.findWhere(self.metaData(), {column: column});
                    self.selectedMeasure(measure && measure.metric);
                    self.selectedPupilGroup(measure && measure.pupils);
                },
                owner: self
            });

            this.schoolsWithoutData = ko.observable([]);

            this.isWithinFsmAndApsLimits = ko.pureComputed(function () {
                return function (school) {
                    return school.PTFSMCLA >= self.fsmMin() && school.PTFSMCLA <= self.fsmMax()
                        && school.KS2APS >= self.apsMin() && school.KS2APS <= self.apsMax();
                };
            })
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.tooManySchools = ko.observable(false);

            this.schools = ko.computed({
                read: function () {
                    var hasNumericData = function (school) {
                        var measure = school[self.selectedMetric()];
                        return measure !== '' && $.isNumeric(measure);
                    };

                    var filtered = self.allData();

                    if (self.viewLevel() == 'Region' && self.selectedRegion()) {
                        filtered = _.where(self.allData(), { REGION: self.selectedRegion() });
                    } else if (self.viewLevel() == 'LEA') {
                        filtered = _.where(self.allData(), { LEA: self.selectedLea() })
                    }

                    var partitioned = _.partition(filtered, hasNumericData);

                    var schoolsWithData = partitioned[0], schoolsWithoutData = partitioned[1];
                    self.schoolsWithoutData(schoolsWithoutData);

                    var groups = [
                        {group: 'Academies', include: self.includeAcademies()},
                        {group: 'Free Schools', include: self.includeFreeSchools()},
                        {group: 'LA maintained schools', include: self.includeLaMaintained()}
                    ];
                    var includedGroups = _(groups)
                        .where({include: true})
                        .pluck('group')
                        .value();

                    var schools = _(schoolsWithData)
                        .filter(function (school) {
                            return _.contains(includedGroups, school.EstablishmentGroup);
                        })
                        .filter(self.isWithinFsmAndApsLimits())
                        .value();

                    if (schools.length > 300) {
                        self.tooManySchools(true);
                        if (self.isBarSelected() && self.dataLevel() === 'School') {
                            return [];
                        }
                    }
                    self.tooManySchools(false);
                    return schools;
                },
                deferEvaluation: true
            })
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 100}});

            this.focusedLea = ko.observable();

            this.focusedEntity = ko.pureComputed(function () {
                if (self.dataLevel() == 'Region') {
                    return self.selectedRegion();
                } else if (self.dataLevel() == 'LEA') {
                    return self.selectedLea();
                } else {
                    return self.focusedSchool();
                }
            });

            this.entities = ko.computed(function () {
                if (self.dataLevel() == 'School') {
                    return self.schools();
                } else if (self.selectedMetric()){
                    //var focusedGroup = self.dataLevel() === 'LEA' ? self.focusedLea() : self.selectedRegion();
                    var grouping = self.dataLevel() === 'LEA' ? 'LEA' : 'REGION';

                    var byGroup = _.groupBy(self.schools(), grouping);

                    var divisor = _.findWhere(self.metaData(), {column: self.selectedMetric()}).group_divisor;
                    var weightedMetric = self.selectedMetric() + '_weighted';


                    var groups = [];

                    $.each(byGroup, function(groupName, schools) {

                        var weightedMetricSum = _.reduce(schools, function(memo, school){
                            var value = $.isNumeric(school[weightedMetric]) ? school[weightedMetric] : 0;
                            return memo + value;
                        }, 0);
                        var divisorSum = _.reduce(schools, function(memo, school){
                            var value = $.isNumeric(school[weightedMetric]) ? school[divisor] : 0;
                            return memo + value;
                        }, 0);

                        var group = { SCHNAME: groupName };
                        var multiplier = self.selectedMeasureSuffix() === '%' ? 100 : 1;
                        group[self.selectedMetric()] = Math.round((weightedMetricSum / divisorSum) * multiplier);
                        groups.push(group);
                    });

                    return groups;
                }
            });

            this.measureMin = ko.pureComputed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.lower;
            });

            this.measureMax = ko.pureComputed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.upper;
            });

            this.selectedMeasureSuffix = ko.pureComputed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.suffix;
            });

            this.selectionSummary = ko.pureComputed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                var measureShort = measure && measure.metric;
                if (self.viewLevel() === 'Region') {
                    var region = self.selectedRegion() ? self.selectedRegion() : 'all regions';
                    var groupedBy = self.dataLevel() === 'LEA' ? ' grouped by local authority' : '';
                    return measureShort + ' for ' + region + groupedBy;
                }
                var lea = self.selectedLea() ? self.selectedLea() : 'all regions in the Great Britain';
                return measureShort + ' for ' + lea;
            });

            this.allDataSelectedMetric = ko.pureComputed(function () {
                return _.chain(self.allData())
                    .pluck(self.selectedMetric())
                    .filter($.isNumeric)
                    .sortBy(_.identity)
                    .value();
            });

            this.schoolCount = ko.pureComputed(function () {
                return self.allDataSelectedMetric().length;
            });

            this.showNationalAverage = ko.observable();
            this.showTop10Percent = ko.observable();
            this.showBottom10Percent = ko.observable();

            var average = function (numbers) {
                var sum = 0;
                for (var i = 0; i < numbers.length; i++) {
                    sum += numbers[i] || 0;
                }
                return sum / numbers.length;
            };

            this.nationalAverage = ko.pureComputed(function () {
                if (self.showNationalAverage()) {
                    return average(self.allDataSelectedMetric());
                }
            });

            this.top10Percent = ko.pureComputed(function () {
                if (self.showTop10Percent()) {
                    return self.allDataSelectedMetric()[Math.floor(self.schoolCount() * 0.9)]
                }
            });

            this.bottom10Percent = ko.pureComputed(function () {
                if (self.showBottom10Percent()) {
                    return self.allDataSelectedMetric()[Math.floor(self.schoolCount() * 0.1)];
                }
            });

            this.verticalChart = ko.observable(false);

            this.updateCookie = ko.computed(this._updateCookie, this)
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 500}});
        }

        DataModel.prototype._updateCookie = function () {
            cm.extendCookie('graph', {
                selectedRegion: this.selectedRegion(),
                selectedLea: this.selectedLea(),
                viewLevel: this.viewLevel(),
                dataLevel: this.dataLevel(),
                focusedSchool: this.focusedSchool() && this.focusedSchool()['SCHNAME'],
                selectedMetric: this.selectedMetric(),

                excludeLaMaintained: !this.includeLaMaintained(),
                excludeAcademies: !this.includeAcademies(),
                excludeFreeSchools: !this.includeFreeSchools(),

                fsmMin: this.fsmMin(),
                fsmMax: this.fsmMax(),
                apsMin: this.apsMin(),
                apsMax: this.apsMax(),

                showNationalAverage: this.showNationalAverage(),
                showTop10Percent: this.showTop10Percent(),
                showBottom10Percent: this.showBottom10Percent(),

                verticalChart: this.verticalChart(),
                isBarSelected: this.isBarSelected(),
                isTableSelected: this.isTableSelected(),
                isMapSelected: this.isMapSelected()
            });
        };

        DataModel.prototype.downloadSchoolData = function () {
            var self = this;

            var papaConfig = {
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true
            };

            var metaComplete = function (result) {
                self.metaData(result.data);
            };

            var dataComplete = function (result) {
                self.schoolDataLoaded(true);
                self.allData(result.data);
                self.setFromSelectionOptions(queryStringOptions);
                history.pushState({}, '', [location.protocol, '//', location.host, location.pathname].join(''));
            };

            var metaPapaConfig = _.extend({complete: metaComplete}, papaConfig);
            var dataPapaConfig = _.extend({complete: dataComplete}, papaConfig);

            $(document).ready(function () {
                $.ajax({
                    type: "GET",
                    url: "data-out/final_data.csv",
                    dataType: "text",
                    success: function (data) {
                        Papa.parse(data, dataPapaConfig);
                    }
                });

                $.ajax({
                    type: "GET",
                    url: "data-src/meta_file.csv",
                    dataType: "text",
                    success: function (data) {
                        Papa.parse(data, metaPapaConfig);
                    }
                });
            });
        };

        DataModel.prototype.setFromSelectionOptions = function (options) {
            var cookieOptions = cm.readCookie('graph');
            options = $.isEmptyObject(options) ? cookieOptions : options;

            if ('selectedRegion' in options) {
                this.selectedRegion(options.selectedRegion);
            }
            if ('selectedLea' in options) {
                this.selectedLea(options.selectedLea);
            }
            if ('selectedMetric' in options) {
                this.selectedMetric(options.selectedMetric);
            }
            if ('focusedSchool' in options) {
                this.focusedSchool(_.findWhere(this.allData(), {SCHNAME: options.focusedSchool}));
            }
            if ('fsmMin' in options) {
                this.fsmMin(options.fsmMin);
            }
            if ('fsmMin' in options) {
                this.fsmMin(options.fsmMin);
            }
            if ('fsmMax' in options) {
                this.fsmMax(options.fsmMax);
            }
            if ('apsMin' in options) {
                this.apsMin(options.apsMin);
            }
            if ('apsMax' in options) {
                this.apsMax(options.apsMax);
            }
            if ('viewLevel' in options) {
                this.viewLevel(options.viewLevel);
            }
            if ('dataLevel' in options) {
                this.dataLevel(options.dataLevel);
            }

            this.includeLaMaintained(!('excludeLaMaintained' in options));
            this.includeAcademies(!('excludeAcademies' in options));
            this.includeFreeSchools(!('excludeFreeSchools' in options));

            this.isTableSelected('isTableSelected' in options);
            this.isMapSelected('isMapSelected' in options);
            this.isBarSelected(!(this.isTableSelected() || this.isMapSelected()));

            this.showNationalAverage('showNationalAverage' in options && options.showNationalAverage);
            this.showTop10Percent('showTop10Percent' in options && options.showTop10Percent);
            this.showBottom10Percent('showBottom10Percent' in options && options.showBottom10Percent);

            this.verticalChart('verticalChart' in options);

            cm.enableCookieWriting(true);
        };

        return new DataModel();

    });
