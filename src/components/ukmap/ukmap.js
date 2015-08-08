define(['knockout', 'highcharts', 'underscore', 'data-model', 'text!./ukmap.html', 'gb-map', 'highmaps', 'proj4'],
    function (ko, Highcharts, _, dataModel, templateMarkup) {

        var hc_keys = {"Reading": "gb-2388", "Walsall": "gb-7140", "Cumbria": "gb-cu", "Luton": "gb-lu", "Bournemouth": "gb-2389", "Lincolnshire": "gb-li", "Devon": "gb-do", "Liverpool": "gb-7119", "Wakefield": "gb-7133", "Hounslow": "gb-hu", "Havering": "gb-hv", "Shropshire": "gb-sp", "York": "gb-yk", "Nottinghamshire": "gb-nt", "Warwickshire": "gb-wr", "Lambeth": "gb-lt", "Torbay": "gb-tb", "Stockton-on-Tees": "gb-zt", "North East Lincolnshire": "gb-ne", "Sandwell": "gb-7137", "Trafford": "gb-7129", "South Tyneside": "gb-7114", "Swindon": "gb-sn", "Enfield": "gb-ef", "Hertfordshire": "gb-ht", "Sutton": "gb-su", "Brent": "gb-be", "Bristol": "gb-bs", "Hillingdon": "gb-hd", "West Sussex": "gb-ws", "Herefordshire": "gb-he", "Salford": "gb-3266", "Lancashire": "gb-la", "North Somerset": "gb-ns", "Telford and Wrekin": "gb-tk", "Richmond upon Thames": "gb-ru", "Blackpool": "gb-7117", "Medway": "gb-mw", "Cheshire East": "gb-2366", "Lewisham": "gb-lw", "Wandsworth": "gb-ww", "Coventry": "gb-7142", "Derby": "gb-de", "Stockport": "gb-7127", "Northamptonshire": "gb-na", "Oxfordshire": "gb-ox", "Gateshead": "gb-7116", "Blackburn with Darwen": "gb-bw", "Hartlepool": "gb-hp", "Northumberland": "gb-nb", "Cheshire West and Chester": "gb-7150", "Redbridge": "gb-rb", "Surrey": "gb-sr", "Newham": "gb-nh", "North Tyneside": "gb-7113", "Somerset": "gb-sm", "Essex": "gb-ex", "East Riding of Yorkshire": "gb-ey", "Kingston upon Hull": "gb-kh", "West Berkshire": "gb-7143", "Wolverhampton": "gb-7139", "Derbyshire": "gb-db", "Bradford": "gb-7131", "Brighton and Hove": "gb-bh", "Worcestershire": "gb-wc", "Suffolk": "gb-sf", "Barnsley": "gb-7135", "Ealing": "gb-eg", "Doncaster": "gb-7136", "Merton": "gb-me", "Southwark": "gb-sq", "South Gloucestershire": "gb-sj", "Wiltshire": "gb-wl", "Leicester": "gb-lc", "Isle of Wight": "gb-iw", "Southend on Sea": "gb-ss", "Newcastle upon Tyne": "gb-2367", "Calderdale": "gb-7130", "Croydon": "gb-cy", "Harrow": "gb-hr", "Camden": "gb-cn", "Bolton": "gb-7122", "Bracknell Forest": "gb-7145", "Milton Keynes": "gb-mk", "Waltham Forest": "gb-wf", "Gloucestershire": "gb-gc", "Buckinghamshire": "gb-bu", "Norfolk": "gb-nf", "Knowsley": "gb-2364", "Oldham": "gb-7125", "Central Bedfordshire": "gb-2381", "Portsmouth": "gb-ps", "Birmingham": "gb-2377", "Warrington": "gb-wt", "East Sussex": "gb-es", "Bath and North East Somerset": "gb-bn", "Nottingham": "gb-ng", "Leeds": "gb-7132", "Halton": "gb-hl", "Isles of Scilly": "gb-7398", "Sunderland": "gb-7115", "Solihull": "gb-7141", "Wokingham": "gb-7144", "Durham": "gb-dh", "Greenwich": "gb-gr", "Redcar and Cleveland": "gb-rc", "Bedford": "gb-bd", "Kensington and Chelsea": "gb-kc", "Hackney": "gb-hk", "Staffordshire": "gb-st", "Hampshire": "gb-ha", "Stoke-on-Trent": "gb-so", "Kent": "gb-ke", "Sefton": "gb-7118", "Slough": "gb-7147", "Wigan": "gb-7121", "Bury": "gb-7123", "Rutland": "gb-rl", "Barking and Dagenham": "gb-ba", "Windsor and Maidenhead": "gb-7146", "Barnet": "gb-7149", "Darlington": "gb-da", "Peterborough": "gb-pb", "Cambridgeshire": "gb-cm", "Rotherham": "gb-3267", "Dudley": "gb-7138", "Tower Hamlets": "gb-th", "Bexley": "gb-xb", "Manchester": "gb-7128", "Cornwall": "gb-co", "Islington": "gb-it", "Leicestershire": "gb-2393", "North Yorkshire": "gb-ny", "North Lincolnshire": "gb-nl", "Plymouth": "gb-2420", "Kingston upon Thames": "gb-kt", "Southampton": "gb-zh", "Westminster": "gb-we", "Dorset": "gb-ds", "Thurrock": "gb-tr", "Sheffield": "gb-7134", "Rochdale": "gb-7124", "Hammersmith and Fulham": "gb-hf", "Tameside": "gb-7126", "Middlesbrough": "gb-mb", "Poole": "gb-2391", "Kirklees": "gb-3265", "Bromley": "gb-bz", "Haringey": "gb-hy"};

        function UKMap(params) {
            var self = this;

            this.highmap = ko.observable();

            this.entities = ko.pureComputed(function() {
                if (dataModel.dataLevel() === 'School' || dataModel.dataLevel() === 'Region') {
                    return [];
                }

                return _.each(dataModel.entities(), function (entity) {
                    entity['hc-key'] = hc_keys[entity.SCHNAME];
                    entity['value'] = entity[dataModel.selectedMetric()];
                })
            });

            this.dataLevel = dataModel.dataLevel;

            this.updateMap = ko.computed(function () {
                var filterSummary = dataModel.filterSummary();

                var included_hc_keys = _(dataModel.leas())
                    .map(function(lea) {
                        return hc_keys[lea];
                    })
                    .object(Array(dataModel.leas().length).join('').split(''))
                    .value();

                var mapData = _.clone(Highcharts.maps['countries/gb/gb-all']);

                mapData.features = _.filter(mapData.features, function(feature) {
                    return feature.properties['hc-key'] in included_hc_keys;
                });

                if (params.isSelected()) {
                    var map = new Highcharts.Map({

                        chart: {
                            renderTo: 'myMap'
                        },

                        title: {
                            text: dataModel.selectionSummary(),
                            style: {
                                fontSize: 15,
                                fontWeight: "bold"
                            }
                        },
                        subtitle: {
                            text: filterSummary
                        },

                        mapNavigation: {
                            enabled: true
                        },

                        colorAxis: {
                            stops: [
                                [0, '#EFEFFF'],
                                [0.67, '#058AFF'],
                                [1, '#002B40']
                            ],
                            reversed: false
                        },

                        legend: {
                            layout: 'vertical',
                            backgroundColor: 'rgba(255,255,255,0.85)',
                            floating: true,
                            align: 'left',
                            //borderWidth: 1,
                            valueSuffix: '%ss',
                            valueDecimals: 0,
                            enabled: true
                        },

                        series: [{
                            nullColor: '#eeeeee',

                            data : self.entities(),
                            mapData: mapData,
                            joinBy: ['hc-key', 'hc-key'],
                            dataLabels: {
                                enabled: true,
                                color: 'white',
                                padding: 10,
                                formatter: function() {
                                    return this.point.properties && this.point.properties['hc-a2']
                                }
                            },
                            name: dataModel.selectedMeasure(),
                            tooltip: {
                                valueSuffix: dataModel.selectedMeasureSuffix()
                            }

                        }]
                    });
                }

                self.highmap(map);
            }).extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 150}});

            this.message = ko.observable('Hello from the map component!');
        }

        return {viewModel: UKMap, template: templateMarkup};

    });
