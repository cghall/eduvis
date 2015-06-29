function bakeCookie(name, value) {
    document.cookie = [name, '=', JSON.stringify(value) + ';'].join('');
}

function readCookie(name) {
    var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    return result;
}

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

var average = function(numbers) {
    var sum = 0;
    for (var i = 0; i < numbers.length; i++) {
         sum += numbers[i] || 0;
    }
    return sum / numbers.length;
};

var viewModel = function() {
    var self = this;

    self.columnChart = ko.observable();
    self.schoolDataLoaded = ko.observable(false);
    self.cookieLoaded = ko.observable(false);
    self.allData = ko.observable({});
    self.metaData = ko.observable({});
    self.schoolCount = ko.computed(function() {
        return self.allData().length;
    });

    self.measureOptions = ko.observableArray(['PTAC5EM_PTQ', 'PTEBACC_PTQ', 'PTAC5EMFSM_PTQ',
                                              'PT24ENGPRG_PTQ', 'PT24MATHPRG_PTQ']);

    self.leaOptions = ko.computed(function() {
        var leaOptions = _.uniq(_.pluck(self.allData(), 'LEA'));
        leaOptions.sort();
        return leaOptions;
    });

    self.selectedMeasure = ko.observable();
    self.selectedLea = ko.observable();

    self.selectedMeasureDescription = ko.computed(function() {
        var measure = _.findWhere(self.metaData(), { 'Metafile heading': self.selectedMeasure() });
        return measure ? measure['Metafile description'] : '...';
    });

    self.showNationalAverage = ko.observable(false);
    self.showTop10Percent = ko.observable(false);
    self.showBottom10Percent = ko.observable(false);

    self.allDataSelectedMeasure = ko.computed(function() {
        var series = _.pluck(self.allData(), self.selectedMeasure());
        series.sort();
        return series;
    });

    self.selectedSchools = ko.computed(function() {
        var selectedSchools = _.where(self.allData(), { LEA: self.selectedLea() });
        return _.sortBy(selectedSchools, self.selectedMeasure());
    });

    self.selectedSchoolsNames = ko.computed(function() {
        return _.pluck(self.selectedSchools(), 'SCHNAME');
    });

    self.selectedSchoolsNamesAlphabetical = ko.computed(function() {
        var names = self.selectedSchoolsNames().slice(0);
        names.sort();
        return names;
    });

    self.selectedSchoolsSeries = ko.computed(function() {
        return _.pluck(self.selectedSchools(), self.selectedMeasure());
    });

    self.focusedSchool = ko.observable();

    self.focusedSchoolIndex = ko.computed(function() {
        return self.selectedSchoolsNames().indexOf(self.focusedSchool());
    });

    self.selectedSchoolsSeriesWithColour = ko.computed(function() {
        var data = self.selectedSchoolsSeries().slice(0);
        if (self.focusedSchoolIndex() >= 0 && data[self.focusedSchoolIndex()]) {
            data[self.focusedSchoolIndex()] = { y: data[self.focusedSchoolIndex()], color: 'orange' };
        }
        return data;
    });

    self.updateBar = ko.computed( function() {
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'myChart',
                type: 'bar',
                marginLeft: 300
            },
            title: {
                text: self.selectedMeasure() + ' for LEA ' + self.selectedLea()
            },
            xAxis: {
                categories: self.selectedSchoolsNames()
            },
            yAxis: {
                title: {
                    text: self.selectedMeasure()
                },
                max: 1
            },
            series: [{
                showInLegend: false,
                name: self.selectedMeasure(),
                data: self.selectedSchoolsSeriesWithColour(),
                animation: {
                    duration: 300
                }
            }]
        });
        self.columnChart(chart);
    });

    self.nationalAverageLine = ko.computed(function() {
        return self.showNationalAverage() && {
            id: 'nat',
            color: 'rgb(255, 204, 0)',
            width: 2,
            value: average(self.allDataSelectedMeasure()),
            zIndex: 5,
            label: {
                align: 'center',
                verticalAlign: 'middle',
                text: 'national'
            }
        };
    });

    self.top10Line = ko.computed(function() {
        return self.showTop10Percent() && {
            id: 'top',
            color: 'rgb(51, 204, 51)',
            width: 2,
            value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount()*0.9)],
            zIndex: 5,
            label: {
                text: 'top 10%',
                align: 'right',
                verticalAlign: 'bottom',
                y: -5
            }
        };
    });

    self.bottom10Line = ko.computed(function() {
        return self.showBottom10Percent() && {
            id: 'bot',
            color: 'rgb(255, 51, 0)',
            width: 2,
            value: self.allDataSelectedMeasure()[Math.floor(self.schoolCount()*0.1)],
            zIndex: 5,
            label: {
                text: 'bottom 10%',
                verticalAlign: 'top'
            }
        };
    });

    self.averagePlotLines = ko.computed(function() {
        var plotLines = [self.nationalAverageLine(), self.top10Line(), self.bottom10Line()];
        return _.without(plotLines, false);
    });

    self.updatePlotLines = ko.computed(function() {
        ['nat', 'top', 'bot'].forEach(function(lineId) {
            self.columnChart().yAxis[0].removePlotLine(lineId);
        });
        self.averagePlotLines().forEach(function(line) {
            self.columnChart().yAxis[0].addPlotLine(line);
        });
    });

    self.currentOptionsQueryStringURL = ko.computed(function() {
        var baseUrl = [location.protocol, '//', location.host, location.pathname, '?'].join('');
        var options = {
            measure: self.selectedMeasure(),
            lea: self.selectedLea(),
            focusedSchool: self.focusedSchool,
            showNatAvg: self.showNationalAverage(),
            showTop10: self.showTop10Percent(),
            showBottom10: self.showBottom10Percent()
        };
        options =_.pick(options, _.identity);
        var queryString = baseUrl + $.param(options);

        if (self.cookieLoaded()) {
            bakeCookie('graph', queryString);
        }
        return queryString;
    });

    self.shortenedUrl = ko.observable('');

    self.twitterUrl = ko.computed(function() {
        var baseUrl = "http://twitter.com/?";
        return baseUrl + $.param({status: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
    });

    self.facebookUrl = ko.computed(function() {
        var baseUrl = "http://www.facebook.com/sharer/sharer.php?";
        return baseUrl + $.param({u: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
    });

    self.linkedInUrl = ko.computed(function() {
        var baseUrl = "http://www.linkedin.com/shareArticle?";
        return baseUrl + $.param({mini: true, url: encodeURI(self.shortenedUrl()), title: encodeURI('Eduvis')});
    });

    self.emailUrl = ko.computed(function() {
        var baseUrl = "mailto:?";
        return baseUrl + $.param({subject: 'View my graph on Eduvis', body: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
    });

    self.updateShortenedUrl = function() {
        var longURL = self.currentOptionsQueryStringURL();
        $.ajax({
            url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD_Jgxo5l899PUeNiLjOxXBIb0u-LF3s4s',
            type: 'POST',
            contentType: 'application/json',
            data: '{ longUrl: "' + encodeURI(longURL) +'"}',
            dataType: 'json',
            success: function(response) {
                self.shortenedUrl(response.id);
            }
        });
    };

    self.setFromSelectionOptions = function(options)  {
        var cookieString = readCookie('graph');
        var cookieOptions = !cookieString ? {} : parseQueryString(cookieString.substring(cookieString.indexOf('?') + 1));

        options = $.isEmptyObject(options) ? cookieOptions : options;
        self.cookieLoaded(true);

        if ('measure' in options && _.contains(self.measureOptions(), options.measure)) {
            self.selectedMeasure(options.measure);
        }
        if ('lea' in options && _.contains(self.leaOptions(), options.lea)) {
            self.selectedLea(options.lea);
        }
        if ('focusedSchool' in options && _.contains(self.selectedSchoolsNames(), options.focusedSchool)) {
            self.focusedSchool(options.focusedSchool);
        }
        self.showNationalAverage('showNatAvg' in options && options.showNatAvg === 'true');
        self.showTop10Percent('showTop10' in options && options.showTop10 === 'true');
        self.showBottom10Percent('showBottom10' in options && options.showBottom10 === 'true');
    };
};

var myViewModel = new viewModel();

ko.applyBindings(myViewModel);

papaConfig = {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
};

var metaComplete = function(result) {
    myViewModel.metaData(result.data);
};

var dataComplete = function(result) {
    myViewModel.schoolDataLoaded(true);
    myViewModel.allData(result.data);
    myViewModel.setFromSelectionOptions(queryStringOptions);
    history.pushState({}, '', location.pathname);
};

var metaPapaConfig = _.extend({ complete: metaComplete }, papaConfig);

var dataPapaConfig = _.extend({ complete: dataComplete }, papaConfig);

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "School_data_trimmed.csv",
        dataType: "text",
        success: function(data) {
            Papa.parse(data, dataPapaConfig);
        }
    });

    $.ajax({
        type: "GET",
        url: "ks4_meta.csv",
        dataType: "text",
        success: function(data) {
            Papa.parse(data, metaPapaConfig);
        }
    });
});
