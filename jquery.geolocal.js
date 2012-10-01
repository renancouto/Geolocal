/*
	Geolocal plugin para jQuery
	@author: Renan Couto
*/

;(function($) {
	var pluginName = 'geolocal',

		defaults = {
			error: function() {},
			success: function() {}
		},

		config = {
			geo: {
				prefix: 'geoip_',
				props: ['area_code', 'city', 'country_code', 'country_name', 'latitude', 'longitude', 'metro_code', 'postal_code', 'region', 'region_name'],

				locale: {
					Brazil: {
						city: 'cidade',
						region_name: 'estado'
					}
				}
			},

			obj: 'Geolocal',

			urls: {
				service: 'http://j.maxmind.com/app/geoip.js',
				// coords: 'http://maps.googleapis.com/maps/api/geocode/json?latlng={{latitude}},{{longitude}}&sensor=false'
				coords: 'http://where.yahooapis.com/geocode?q={{latitude}},{{longitude}}&flags=J&gflags=R&callback={{callback}}'
			},

			jsonpCallback: '_geolocalCallback'
		};

	$[pluginName] = function(options) {
		var plugin = this;
			plugin.settings = {};

		var geolocal = {},

		Init = function() {
			plugin.settings = $.extend({}, defaults, options);

			if (navigator.geolocation) {
				Location.FromBrowser();
			}
			else {
				Location.FromService();
			}
		},

		Location = {
			FromBrowser: function() {
				navigator.geolocation.getCurrentPosition(function(position) {
					geolocal.latitude = position.coords.latitude;
					geolocal.longitude = position.coords.longitude;
					Location.FromCoords();
				});
			},

			FromService: function() {
				$.ajax({
					dataType: 'script',
					url: config.urls.service,

					error: function(a, b, c) {
						console.log(a, b, c);
					},

					success: function() {
						Process();
						plugin.settings.success(geolocal);
					}
				});
			},

			FromCoords: function() {
				console.log(geolocal);
				$.ajax({
					dataType: 'jsonp',
					jsonpCallback: config.jsonpCallback,

					url: config.urls.coords
						.replace('{{latitude}}', geolocal.latitude)
						.replace('{{longitude}}', geolocal.longitude)
						.replace('{{callback}}', config.jsonpCallback),

					error: function(a, b, c) {
						console.log(a, b, c);
					},

					success: function(data) {
						console.log('ok', data);
						// Process();
						// plugin.settings.success(geolocal);
					}
				});
			}
		},

		Process = function () {
			var val,

			GetProperty = function(prop) {
				return eval(config.geo.prefix + prop)();
			};

			for (var props = 0; props < config.geo.props.length; props++) {
				val = config.geo.props[props];
				geolocal[val] = GetProperty(val);
			}

			for (var locales in config.geo.locale) {
				var locale = config.geo.locale[locales];

				for (var converted in locale) {
					val = locale[converted];
					geolocal[val] = geolocal[converted];
				}

				Locale[locales]();
			}

			window[config.obj] = geolocal;
		},

		D = function(data) {
			console.log('c', data);
		},

		Locale = {
			Brazil: function() {
				var raw = geolocal.estado.toLowerCase(),
					estado, uf;

				// Corrigir estado
				switch (raw) {
					case 'amapa' :		estado = 'Amapá';		break;
					case 'ceara' :		estado = 'Ceará';		break;
					case 'goias' :		estado = 'Goiás';		break;
					case 'maranhao' :	estado = 'Maranhão';	break;
					case 'para' :		estado = 'Pará';		break;
					case 'paraiba' :	estado = 'Paraíba';		break;
					case 'parana' :		estado = 'Paraná';		break;
					case 'piaui' :		estado = 'Piauí';		break;
					case 'rondonia' :	estado = 'Rondônia';	break;
					case 'sao paulo' :	estado = 'São Paulo';	break;
				}

				// Estado para UF
				switch (raw) {
					case "acre" :					uf = "AC";	break;
					case "alagoas" :				uf = "AL";	break;
					case "amazonas" :				uf = "AM";	break;
					case "amapa" :					uf = "AP";	break;
					case "bahia" :					uf = "BA";	break;
					case "ceara" :					uf = "CE";	break;
					case "distrito federal" :		uf = "DF";	break;
					case "espirito santo" :			uf = "ES";	break;
					case "goias" :					uf = "GO";	break;
					case "maranhão" :				uf = "MA";	break;
					case "minas gerais" :			uf = "MG";	break;
					case "mato grosso do sul" :		uf = "MS";	break;
					case "mato grosso" :			uf = "MT";	break;
					case "para" :					uf = "PA";	break;
					case "paraiba" :				uf = "PB";	break;
					case "pernambuco" :				uf = "PE";	break;
					case "piaui" :					uf = "PI";	break;
					case "parana" :					uf = "PR";	break;
					case "rio de janeiro" :			uf = "RJ";	break;
					case "rio grande do norte" :	uf = "RN";	break;
					case "rondonia" :				uf = "RO";	break;
					case "roraima" :				uf = "RR";	break;
					case "rio grande do sul" :		uf = "RS";	break;
					case "santa catarina" :			uf = "SC";	break;
					case "sergipe" :				uf = "SE";	break;
					case "sao paulo" :				uf = "SP";	break;
					case "tocantíns" :				uf = "TO";	break;
				}

				geolocal.estado = estado;
				geolocal.uf = uf;
			}
		};

		Init();

		// window[config.jsonpCallback] = function(data) {
		// 	console.log('js', data);
		// };
	};

	$.fn[pluginName] = function(options) {
		new $[pluginName](options);
	};
})(jQuery);