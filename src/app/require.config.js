// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "bootstrap":            "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "highcharts":           "bower_modules/highcharts-release/highcharts.src",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "papaparse":            "bower_modules/papaparse/papaparse",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
        "underscore":           "bower_modules/underscore/underscore-min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
        "highcharts": {
            exports: "Highcharts",
            deps: ["jquery"]
        }
    }
};
