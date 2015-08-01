// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "bootstrap":            "bower_modules/bootstrap/dist/js/bootstrap.min",
        "cookie-manager":       "app/cookie-manager",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "data-model":           "app/data-model",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "gb-map":               "other_vendor/gb-all",
        "highcharts":           "bower_modules/highstock-release/highstock",
        "highmaps":             "bower_modules/highmaps-release/modules/map.src",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "jquery-ui":            "bower_modules/jquery-ui/ui",
        "knockout":             "bower_modules/knockout/dist/knockout",
        'knockout-jqueryui':    "bower_modules/knockout-jqueryui/dist/amd",
        "knockout-popover":     "other_vendor/ko.bindings.popover",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "papaparse":            "bower_modules/papaparse/papaparse",
        "proj4":                "bower_modules/proj4/dist/proj4-src",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
        "underscore":           "bower_modules/lodash/lodash.min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
        "highcharts": {
            exports: "Highcharts",
            deps: ["jquery", "proj4"]
        },
        "highmaps": {
            deps: ["highcharts"]
        },
        "gb-map": {
            deps: ["highcharts", "highmaps", "proj4"]
        },
        "knockout-popover": {
            deps: ["jquery", "knockout"]
        }
    }
};
