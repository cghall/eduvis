define(["knockout", "jquery", "underscore", "papaparse", "text!./home.html"], function(ko, $, _, Papa, homeTemplate) {

  function HomeViewModel(params) {
    this.schoolDataLoaded = ko.observable(false);
    this.cookieLoaded = ko.observable(false);
    this.allData = ko.observable([]);
    this.metaData = ko.observable({});

    this.selectedMeasure = ko.observable('');
    this.selectedLea = ko.observable('');
    this.schoolNames = ko.observable([]);
    this.schoolSeries = ko.observable([]);

    var self = this;
    this.schoolCount = ko.computed(function() {
      return self.allData().length;
    });

    this.downloadSchoolData();
  }

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
      //this.setFromSelectionOptions(queryStringOptions);
      //history.pushState({}, '', [location.protocol, '//', location.host, location.pathname].join(''));
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
