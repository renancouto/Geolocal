/* Geolocal
*/

;window.Geolocal = (function(window, document, undefined) {

	var Geolocal = {},

		// Added services
		services = {
			maxmind: {
				url: 'http://j.maxmind.com/app/geoip.js',
				converter: false
			},

			yahoo: {
				url: 'http://where.yahooapis.com/geocode?q={{latitude}},{{longitude}}&flags=J&gflags=R&callback={{callback}}',
				converter: true
			}
		},

		// Lib configuration
		config = {
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
		console.log(features, features.geolocation, features.json, features.localStorage, features.XMLHttpRequest);
		service = features.geolocation ? config.services.dependent : config.services.independent;

		if (features.localStorage && localStorage.Geolocal && config.keepData) {
			Geolocal = Data.Convert.FromString(localStorage.Geolocal);
			console.log(Geolocal);
			return;
		}

		if (features.geolocation && config.useBrowserAPI) {
			Coordinates.Get();
		}
		else {
			Data.Load();
		}
	},

	Coordinates = {
		Get: function() {
			navigator.geolocation.getCurrentPosition(function(position) {
				Geolocal.latitude = position.coords.latitude;
				Geolocal.longitude = position.coords.longitude;
				Data.Load(true);
			});
		}
	},

	Data = {
		Load: function(reverse) {


			Data.Set();
		},

		Set: function() {
			if (features.localStorage && config.keepData) {
				localStorage.Geolocal = Data.Convert.ToString(Geolocal);
			}
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
	};

	Init();

	return Geolocal;

})(this, this.document);