define(["knockout", "jquery", "underscore", "papaparse", "text!./home.html", 'knockout-postbox'], function(ko, $, _, Papa, homeTemplate, postbox) {

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

    function HomeViewModel() {
        this.schoolDataLoaded = ko.observable(false);
        this.cookieLoaded = ko.observable(false);

        this.allData = ko.observable([]).publishOn("allData");
        this.metaData = ko.observable([]).publishOn("metaData");

        this.downloadSchoolData();
    }

    function bakeCookie(name, value) {
        document.cookie = [name, '=', JSON.stringify(value) + ';'].join('');
    }

    function readCookie(name) {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        result && (result = JSON.parse(result[1]));
        return result;
    }

    HomeViewModel.prototype.setFromSelectionOptions = function(options)  {
        var self = this;

        var cookieString = readCookie('graph');
        var cookieOptions = !cookieString ? {} : parseQueryString(cookieString.substring(cookieString.indexOf('?') + 1));

        options = $.isEmptyObject(options) ? cookieOptions : options;
        self.cookieLoaded(true);

        if ('measure' in options) {
            postbox.publish("selectedMeasure", options.measure);
        }
        if ('lea' in options) {
            postbox.publish("selectedLea", options.lea);
        }
        if ('focusedSchool' in options) {
            postbox.publish("focusedSchool", options.focusedSchool);
        }
        postbox.publish("showNationalAverage", 'showNatAvg' in options && options.showNatAvg === 'true');
        postbox.publish("showTop10", 'showTop10' in options && options.showTop10 === 'true');
        postbox.publish("showBottom10", 'showBottom10' in options && options.showBottom10 === 'true');
    };

    HomeViewModel.prototype.downloadSchoolData = function() {
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
                url: "data-out/School_data_trimmed.csv",
                dataType: "text",
                success: function(data) {
                    Papa.parse(data, dataPapaConfig);
                }
            });

            $.ajax({
                type: "GET",
                url: "data-src/dfe/ks4_meta.csv",
                dataType: "text",
                success: function(data) {
                    Papa.parse(data, metaPapaConfig);
                }
            });
        });
    };

    return { viewModel: HomeViewModel, template: homeTemplate };

});
