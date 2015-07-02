define(['knockout', 'text!./sharing.html', 'knockout-postbox'], function(ko, templateMarkup) {

    function Sharing() {
        var self = this;

        this.selectedMeasure = ko.observable().subscribeTo("selectedMeasure", true);
        this.selectedLea = ko.observable().subscribeTo("selectedLea", true);
        this.focusedSchool = ko.observable().subscribeTo("focusedSchool", true);
        this.showNationalAverage = ko.observable().subscribeTo("showNationalAverage", true);
        this.showTop10Percent = ko.observable().subscribeTo("showTop10", true);
        this.showBottom10Percent = ko.observable().subscribeTo("showBottom10", true);
        
        this.currentOptionsQueryStringURL = ko.computed(function() {
            var baseUrl = [location.protocol, '//', location.host, location.pathname, '?'].join('');
            var options = {
                measure: self.selectedMeasure(),
                lea: self.selectedLea(),
                focusedSchool: self.focusedSchool(),
                showNatAvg: self.showNationalAverage(),
                showTop10: self.showTop10Percent(),
                showBottom10: self.showBottom10Percent()
            };
            options =_.pick(options, _.identity);
            var queryString = baseUrl + $.param(options);

            //if (self.cookieLoaded()) {
            //    bakeCookie('graph', queryString);
            //}
            return queryString;
        });

        this.shortenedUrl = ko.observable('');

        this.twitterUrl = ko.computed(function() {
            var baseUrl = "http://twitter.com/?";
            return baseUrl + $.param({status: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
        });

        this.facebookUrl = ko.computed(function() {
            var baseUrl = "http://www.facebook.com/sharer/sharer.php?";
            return baseUrl + $.param({u: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
        });

        this.linkedInUrl = ko.computed(function() {
            var baseUrl = "http://www.linkedin.com/shareArticle?";
            return baseUrl + $.param({mini: true, url: encodeURI(self.shortenedUrl()), title: encodeURI('Eduvis')});
        });

        this.emailUrl = ko.computed(function() {
            var baseUrl = "mailto:?";
            return baseUrl + $.param({subject: 'View my graph on Eduvis', body: 'Eduvis - ' + encodeURI(self.shortenedUrl())});
        });

        this.updateShortenedUrl = function() {
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
    }

    return { viewModel: Sharing, template: templateMarkup };

});
