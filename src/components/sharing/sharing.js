define(['knockout', 'cookie-manager', 'text!./sharing.html'], function(ko, cm, templateMarkup) {

    function Sharing() {
        var self = this;

        this.currentOptionsQueryStringURL = function() {
            var baseUrl = [location.protocol, '//', location.host, location.pathname, '?'].join('');
            var options = cm.readCookie('graph');
            return baseUrl + $.param(options);
        };

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
                data: '{ longUrl: "' + longURL +'"}',
                dataType: 'json',
                success: function(response) {
                    self.shortenedUrl(response.id);
                }
            });
        };
    }

    return { viewModel: Sharing, template: templateMarkup };

});
