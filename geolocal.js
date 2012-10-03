/*	Geolocal(https://github.com/renancouto/Geolocal) - get user's location

	@info:		Get user's location and set an object (Geolocal) with that data, also stores that data to browser's locaStorage when available to get it faster on other page loads

	@author:	Renan Couto
	@version:	0.1
	@created:	Oct Mon 01 2011
	@updated:	Oct Wed 03 2012
	@license:	MIT & BSD
	@url:		https://github.com/renancouto/Geolocal

	@changelog:
	version: 0.1
	- Added to Github

	@todo:
	- add more services
	- add compability to non JSON browsers
*/

;window.Geolocal = (function(window, document, undefined) {

	var Geolocal = {},

		id = 'geolocal',

		// Added services
		services = {
			maxmind: {
				url: 'http://j.maxmind.com/app/geoip.js',
				converter: false
			},

			yahoo: {
				url: 'http://where.yahooapis.com/geocode?q={{latitude}},{{longitude}}&flags=J&gflags=R',
				converter: true
			}
		},

		// Lib configuration
		config = {
			conectionType: 'GET',

			services: {
				independent: 'maxmind',	// This service should return the data formated,
				dependent: 'yahoo'		// but this will convert the coordinates to known places
			},

			useBrowserAPI: true,		// Will use browser's geolocation to get the user's latitude / longitude
			keepData: true				// Will keep the data on user's browser using localStorage and will try to get that data whenever it's available
		},

		service = {},

		features = {
			geolocation: navigator.geolocation ? true : false,
			json: (typeof(JSON) !== undefined) ? true : false,
			localStorage: (typeof(localStorage) !== undefined) ? true : false,
			XMLHttpRequest: (typeof(XMLHttpRequest) !== undefined) ? true : false
		},

	Init = function() {
		service = config.useBrowserAPI ? config.services.dependent : config.services.independent;

		if (features.localStorage && localStorage.Geolocal && config.keepData) {
			Geolocal = Data.Convert.FromString(localStorage.Geolocal);
			Data.Set();
			return;
		}

		if (features.geolocation && config.useBrowserAPI) {
			Coords.Get();
		}
		else {
			Data.Load();
		}
	},

	Coords = {
		Get: function() {
			navigator.geolocation.getCurrentPosition(function(position) {
				Geolocal.latitude = position.coords.latitude;
				Geolocal.longitude = position.coords.longitude;
				Data.Load();
			}, Coords.Error);
		},

		Error: function(error) {
			console.error('Geolocal ERROR: ', error);
		}
	},

	Data = {
		Load: function() {
			var request = new XMLHttpRequest(),
				url = services[service].url
					.replace('{{latitude}}', Geolocal.latitude)
					.replace('{{longitude}}', Geolocal.longitude);

			request.open(config.conectionType, url, true);
			request.send(null);

			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						Services[service](request.responseText);
						Data.Set();
					}
					else {
						console.error('Geolocal ERROR: could not get any data ', request);
					}
				}
			};
		},

		Set: function() {
			if (features.localStorage && config.keepData && !localStorage.Geolocal) {
				localStorage.Geolocal = Data.Convert.ToString(Geolocal);
			}

			window.Geolocal = Geolocal;
		},

		Convert: {
			ToString: function(data) {
				if (features.json) {
					return JSON.stringify(data);
				}
			},

			FromString: function(data) {
				if (features.json) {
					return JSON.parse(data);
				}
			}
		}
	},

	Services = {
		yahoo: function(data) {
			Geolocal = Data.Convert.FromString(data);
			Geolocal = Geolocal.ResultSet.Results[0];
		},

		maxmind: function(data) {
			// Transform return to JSON string
			data = data
				.replace(/function geoip_/g, '"')
				.replace(/\(\)/g, '"')
				.replace(/\{ return/g, ':')
				.replace(/; \}/g, ',')
				.replace(/'/g, '"');

			data = '{' + data.slice(0, data.length - 2) + '}';

			Geolocal = Data.Convert.FromString(data);
			// Set country and state shortcuts
			Geolocal.country = Geolocal.country_name;
			Geolocal.state = Geolocal.region_name;

			Data.Set();
		}
	};

	Init();

	return Geolocal;

})(this, this.document);