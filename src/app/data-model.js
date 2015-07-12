define(["knockout", "jquery", "underscore", "papaparse", "cookie-manager"],
    function (ko, $, _, Papa, cm) {

        var parseQueryString = function(a) {
            a = a.split('&');
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
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

            this.leas = ko.computed(function () {
                return _(self.allData())
                    .pluck('LEA')
                    .sortBy(_.identity)
                    .uniq(true)
                    .value();
            });

            this.selectedLea = ko.observable()
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});
            this.focusedSchool = ko.observable();

            this.fsmMin = ko.observable(0);
            this.fsmMax = ko.observable(100);
            this.apsMin = ko.observable(15);
            this.apsMax = ko.observable(30);

            this.measures = ko.computed(function () {
                return _(self.metaData())
                    .pluck('metric')
                    .filter(_.identity)
                    .sortBy(_.identity)
                    .uniq(true)
                    .value();
            });
            this.selectedMeasure = ko.observable()
                .extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 50}});

            this.pupilGroups = ko.computed(function () {
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

            this.schools = ko.computed(function () {
                var hasNumericData = function (school) {
                    var measure = school[self.selectedMetric()];
                    return measure !== '' && $.isNumeric(measure);
                };
                var isWithinFsmAndApsLimits = function(school) {
                    return school.PTFSMCLA >= self.fsmMin() && school.PTFSMCLA <= self.fsmMax()
                        && school.KS2APS >= self.apsMin() && school.KS2APS <= self.apsMax();
                };

                var partitioned = _(self.allData())
                    .where({LEA: self.selectedLea()})
                    .partition(hasNumericData)
                    .value();
                var schoolsWithData = partitioned[0], schoolsWithoutData = partitioned[1];
                self.schoolsWithoutData(schoolsWithoutData);

                return _.filter(schoolsWithData, isWithinFsmAndApsLimits);
            });

            this.measureMin = ko.computed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.lower;
            });

            this.measureMax = ko.computed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.upper;
            });

            this.selectedMeasureSuffix = ko.computed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                return measure && measure.suffix;
            });

            this.selectionSummary = ko.computed(function () {
                var measure = _.findWhere(self.metaData(), {column: self.selectedMetric()});
                var measureShort = measure && measure.metric;
                return measureShort + ' for LEA ' + self.selectedLea();
            });

            this.allDataSelectedMetric = ko.computed(function () {
                return _.chain(self.allData())
                    .pluck(self.selectedMetric())
                    .filter($.isNumeric)
                    .sortBy(_.identity)
                    .value();
            });

            this.schoolCount = ko.computed(function () {
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

            this.nationalAverage = ko.computed(function () {
                if (self.showNationalAverage()) {
                    return average(self.allDataSelectedMetric());
                }
            });

            this.top10Percent = ko.computed(function () {
                if (self.showTop10Percent()) {
                    return self.allDataSelectedMetric()[Math.floor(self.schoolCount() * 0.9)]
                }
            });

            this.bottom10Percent = ko.computed(function () {
                if (self.showBottom10Percent()) {
                    return self.allDataSelectedMetric()[Math.floor(self.schoolCount() * 0.1)];
                }
            });

            this.updateCookie = ko.computed(this._updateCookie, this);
        }

        DataModel.prototype._updateCookie = function() {
            cm.extendCookie('graph', {
                selectedLea: this.selectedLea(),
                focusedSchool: this.focusedSchool() && this.focusedSchool()['SCHNAME'],
                selectedMetric: this.selectedMetric(),

                fsmMin: this.fsmMin(),
                fsmMax: this.fsmMax(),
                apsMin: this.apsMin(),
                apsMax: this.apsMax(),

                showNationalAverage: this.showNationalAverage(),
                showTop10Percent: this.showTop10Percent(),
                showBottom10Percent: this.showBottom10Percent()
            });
        };

        DataModel.prototype.downloadSchoolData = function() {
            var self = this;

            var papaConfig = {
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true
            };

            var metaComplete = function(result) {
                self.metaData(result.data);
            };

            var dataComplete = function(result) {
                self.schoolDataLoaded(true);
                self.allData(result.data);
                self.setFromSelectionOptions(queryStringOptions);
                history.pushState({}, '', [location.protocol, '//', location.host, location.pathname].join(''));
            };

            var metaPapaConfig = _.extend({ complete: metaComplete }, papaConfig);
            var dataPapaConfig = _.extend({ complete: dataComplete }, papaConfig);

            $(document).ready(function() {
                $.ajax({
                    type: "GET",
                    url: "data-out/final_data.csv",
                    dataType: "text",
                    success: function(data) {
                        Papa.parse(data, dataPapaConfig);
                    }
                });

                $.ajax({
                    type: "GET",
                    url: "data-src/meta_file.csv",
                    dataType: "text",
                    success: function(data) {
                        Papa.parse(data, metaPapaConfig);
                    }
                });
            });
        };

        DataModel.prototype.setFromSelectionOptions = function(options)  {
            var cookieOptions = cm.readCookie('graph');
            options = $.isEmptyObject(options) ? cookieOptions : options;

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

            this.showNationalAverage('showNationalAverage' in options && options.showNationalAverage);
            this.showTop10Percent('showTop10Percent' in options && options.showTop10Percent);
            this.showBottom10Percent('showBottom10Percent' in options && options.showBottom10Percent);

            cm.enableCookieWriting(true);
        };

        return new DataModel();

    });
