var locationData = {
    "geo": {
		"center": { 
			"lat": 34.140034, 
			"lon": -118.150643, 
		},
		"area": {
           "points": [
              { "lat": 34.140034, "lon": -118.150643 },
              { "lat": 34.140034, "lon": -118.150643 },
              { "lat": 34.140034, "lon": -118.150643 },
              { "lat": 34.140034, "lon": -118.150643 }
           ], 
        },
	},
	"address": {
		"street": "123 Test Road",
        "city": "Los Angeles",
        "state": "CA",
        "postcode": "90069",
        "country": "US", 
     }
};

var geoData = {"center": {"lat": 23.345, "lon": 12.9876}};
var geoDataNullLat = {"center": {"latt": 23.345, "lon": 12.9876}};
var geoDataNullLon = {"center": {"lat": 23.345, "long": 12.9876}};
var geoDataBadLat = {"center": {"lat": "test1.0", "lon": 12.9876}};
var geoDataBadLon = {"center": {"lat": 23.345, "lon": "yourFace!"}};

var loc = new MapLocation(locationData);

var mapData = {
	"name": "My Map",
	"description": "This is my map, it's great!",
	"location": loc.toJSON()
};