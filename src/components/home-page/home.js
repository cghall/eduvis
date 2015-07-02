define(["knockout", "jquery", "underscore", "papaparse", "text!./home.html", "knockout-postbox", "cookie-manager"],
    function(ko, $, _, Papa, homeTemplate, postbox, cm) {

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
        cm.enableCookieWriting(false);
        this.schoolDataLoaded = ko.observable(false)
            .extend({ rateLimit: { timeout: 300 } });

        this.cookieLoaded = ko.observable(false);

        this.downloadSchoolData();
    }

    HomeViewModel.prototype.setFromSelectionOptions = function(options)  {
        var self = this;

        var cookieOptions = cm.readCookie('graph');

        options = $.isEmptyObject(options) ? cookieOptions : options;

        if ('measure' in options) {
            postbox.publish("selectedMeasure", options.measure);
        }
        if ('lea' in options) {
            postbox.publish("selectedLea", options.lea);
        }
        if ('focusedSchool' in options) {
            postbox.publish("focusedSchool", options.focusedSchool);
        }

        postbox.publish("showNationalAverage", 'showNatAvg' in options && options.showNatAvg === true);
        postbox.publish("showTop10", 'showTop10' in options && options.showTop10 === true);
        postbox.publish("showBottom10", 'showBottom10' in options && options.showBottom10 === true);

        self.cookieLoaded(true);
        cm.enableCookieWriting(true);
    };

    HomeViewModel.prototype.downloadSchoolData = function() {
        var self = this;

        var papaConfig = {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true
        };

        var metaComplete = function(result) {
            self.metaData = ko.observable([]).publishOn("metaData");
            self.metaData(result.data);
        };

        var dataComplete = function(result) {
            self.allData = ko.observable([]).publishOn("allData");
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
