define(['knockout', 'highcharts', 'underscore', 'data-model', 'text!./ukmap.html', 'gb-map', 'highmaps', 'proj4'],
    function (ko, Highcharts, _, dataModel, templateMarkup) {

        var hc_keys = {"Reading (870)": "gb-2388", "Walsall (335)": "gb-7140", "Cumbria (909)": "gb-cu", "Luton (821)": "gb-lu", "Bournemouth (837)": "gb-2389", "Lincolnshire (925)": "gb-li", "Devon (878)": "gb-do", "Liverpool (341)": "gb-7119", "Wakefield (384)": "gb-7133", "Hounslow (313)": "gb-hu", "Havering (311)": "gb-hv", "Shropshire (893)": "gb-sp", "York (816)": "gb-yk", "Nottinghamshire (891)": "gb-nt", "Warwickshire (937)": "gb-wr", "Lambeth (208)": "gb-lt", "Torbay (880)": "gb-tb", "Stockton-on-Tees (808)": "gb-zt", "North East Lincolnshire (812)": "gb-ne", "Sandwell (333)": "gb-7137", "Trafford (358)": "gb-7129", "South Tyneside (393)": "gb-7114", "Swindon (866)": "gb-sn", "Enfield (308)": "gb-ef", "Hertfordshire (919)": "gb-ht", "Sutton (319)": "gb-su", "Brent (304)": "gb-be", "Bristol (801)": "gb-bs", "Hillingdon (312)": "gb-hd", "West Sussex (938)": "gb-ws", "Herefordshire (884)": "gb-he", "Salford (355)": "gb-3266", "Lancashire (888)": "gb-la", "North Somerset (802)": "gb-ns", "Telford and Wrekin (894)": "gb-tk", "Richmond upon Thames (318)": "gb-ru", "Blackpool (890)": "gb-7117", "Medway (887)": "gb-mw", "Cheshire East (895)": "gb-2366", "Lewisham (209)": "gb-lw", "Wandsworth (212)": "gb-ww", "Coventry (331)": "gb-7142", "Derby (831)": "gb-de", "Stockport (356)": "gb-7127", "Northamptonshire (928)": "gb-na", "Oxfordshire (931)": "gb-ox", "Gateshead (390)": "gb-7116", "Blackburn with Darwen (889)": "gb-bw", "Hartlepool (805)": "gb-hp", "Northumberland (929)": "gb-nb", "Cheshire West and Chester (896)": "gb-7150", "Redbridge (317)": "gb-rb", "Surrey (936)": "gb-sr", "Newham (316)": "gb-nh", "North Tyneside (392)": "gb-7113", "Somerset (933)": "gb-sm", "Essex (881)": "gb-ex", "East Riding of Yorkshire (811)": "gb-ey", "Kingston upon Hull (810)": "gb-kh", "West Berkshire (869)": "gb-7143", "Wolverhampton (336)": "gb-7139", "Derbyshire (830)": "gb-db", "Bradford (380)": "gb-7131", "Brighton and Hove (846)": "gb-bh", "Worcestershire (885)": "gb-wc", "Suffolk (935)": "gb-sf", "Barnsley (370)": "gb-7135", "Ealing (307)": "gb-eg", "Doncaster (371)": "gb-7136", "Merton (315)": "gb-me", "Southwark (210)": "gb-sq", "South Gloucestershire (803)": "gb-sj", "Wiltshire (865)": "gb-wl", "Leicester (856)": "gb-lc", "Isle of Wight (921)": "gb-iw", "Southend on Sea (882)": "gb-ss", "Newcastle upon Tyne (391)": "gb-2367", "Calderdale (381)": "gb-7130", "Croydon (306)": "gb-cy", "Harrow (310)": "gb-hr", "Camden (202)": "gb-cn", "Bolton (350)": "gb-7122", "Bracknell Forest (867)": "gb-7145", "Milton Keynes (826)": "gb-mk", "Waltham Forest (320)": "gb-wf", "Gloucestershire (916)": "gb-gc", "Buckinghamshire (825)": "gb-bu", "Norfolk (926)": "gb-nf", "Knowsley (340)": "gb-2364", "Oldham (353)": "gb-7125", "Central Bedfordshire (823)": "gb-2381", "Portsmouth (851)": "gb-ps", "Birmingham (330)": "gb-2377", "Warrington (877)": "gb-wt", "East Sussex (845)": "gb-es", "Bath and North East Somerset (800)": "gb-bn", "Nottingham (892)": "gb-ng", "Leeds (383)": "gb-7132", "Halton (876)": "gb-hl", "Isles of Scilly (420)": "gb-7398", "Sunderland (394)": "gb-7115", "Solihull (334)": "gb-7141", "Wokingham (872)": "gb-7144", "Durham (840)": "gb-dh", "Greenwich (203)": "gb-gr", "Redcar and Cleveland (807)": "gb-rc", "Bedford (822)": "gb-bd", "Kensington and Chelsea (207)": "gb-kc", "Hackney (204)": "gb-hk", "Staffordshire (860)": "gb-st", "Hampshire (850)": "gb-ha", "Stoke-on-Trent (861)": "gb-so", "Kent (886)": "gb-ke", "Sefton (343)": "gb-7118", "Slough (871)": "gb-7147", "Wigan (359)": "gb-7121", "Bury (351)": "gb-7123", "Rutland (857)": "gb-rl", "Barking and Dagenham (301)": "gb-ba", "Windsor and Maidenhead (868)": "gb-7146", "Barnet (302)": "gb-7149", "Darlington (841)": "gb-da", "Peterborough (874)": "gb-pb", "Cambridgeshire (873)": "gb-cm", "Rotherham (372)": "gb-3267", "Dudley (332)": "gb-7138", "Tower Hamlets (211)": "gb-th", "Bexley (303)": "gb-xb", "Manchester (352)": "gb-7128", "Cornwall (908)": "gb-co", "Islington (206)": "gb-it", "Leicestershire (855)": "gb-2393", "North Yorkshire (815)": "gb-ny", "North Lincolnshire (813)": "gb-nl", "Plymouth (879)": "gb-2420", "Kingston upon Thames (314)": "gb-kt", "Southampton (852)": "gb-zh", "Westminster (213)": "gb-we", "Dorset (835)": "gb-ds", "Thurrock (883)": "gb-tr", "Sheffield (373)": "gb-7134", "Rochdale (354)": "gb-7124", "Hammersmith and Fulham (205)": "gb-hf", "Tameside (357)": "gb-7126", "Middlesbrough (806)": "gb-mb", "Poole (836)": "gb-2391", "Kirklees (382)": "gb-3265", "Bromley (305)": "gb-bz", "Haringey (309)": "gb-hy"};

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

            this.updateMap = ko.computed(function () {
                console.log(Highcharts.maps['countries/gb/gb-all']);

                var included_hc_keys = _(self.entities())
                    .pluck('hc-key')
                    .object(Array(self.entities().length).join('').split(''))
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
                            borderWidth: 0,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            //floating: true,
                            align: 'left'
                        },

                        series: [{
                            nullColor: '#eeeeee',

                            data : self.entities(),
                            mapData: mapData,
                            joinBy: ['hc-key', 'hc-key'],
                            dataLabels: {
                                enabled: true,
                                color: 'white',
                                format: '{point.LEA}'
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
