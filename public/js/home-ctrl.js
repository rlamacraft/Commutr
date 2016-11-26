'use strict';

var angular = require('angular');
var logger = require('./logger.js');

angular
    .module('comutr')
    .controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

        $scope.regionSelector = function regionSelector(commute_location_postcode) {
            const region_postcodes = ["E152RD", "W69LG", "NW36BA"];
            let bestTravelTime;

            region_postcodes.forEach(eachPostcode => {
                const URL = "https://api.tfl.gov.uk/journey/journeyresults/";
                const travelTime = $http.get(URL + commute_location_postcode + "/to/" + eachPostcode).then(response => {
                    logger.log(JSON.parse(response.data.journeys[0].duration));
                });
                if (typeof(bestTravelTime) === "undefined" || bestTravelTime > travelTime)
                    bestTravelTime = travelTime;
            });
        }
    }]);
