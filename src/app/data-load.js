define(["knockout", "jquery", "underscore", "papaparse", "knockout-postbox", "cookie-manager"],
    function(ko, $, _, Papa, postbox, cm) {

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

        function DataLoad() {
            cm.enableCookieWriting(false);
            this.schoolDataLoaded = ko.observable(false).publishOn("schoolDataLoaded");
            this.allData = ko.observable([]).publishOn("allData");
            this.metaData = ko.observable([]).publishOn("metaData");
            this.downloadSchoolData();
        }

        DataLoad.prototype.setFromSelectionOptions = function(options)  {
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

            postbox.publish("showNationalAverage",
                'showNatAvg' in options && (options.showNatAvg === true || options.showNatAvg === 'true'));
            postbox.publish("showTop10",
                'showTop10' in options && (options.showTop10 === true || options.showTop10 === 'true'));
            postbox.publish("showBottom10",
                'showBottom10' in options && (options.showBottom10 === true || options.showBottom10 === 'true'));

            cm.enableCookieWriting(true);
        };

        DataLoad.prototype.downloadSchoolData = function() {
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
                console.log(result.data)
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

        new DataLoad();
    });
