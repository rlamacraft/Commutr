'use strict';

var angular = require('angular');
var logger = require('./logger.js');

angular
    .module('comutr')
    .controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

        $scope.housemates = [{}];
        $scope.restaurantPostcode = "";
        $scope.restaurantCuisine = "";

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
        };

        $scope.addHousemate = function () {
            if ($scope.housemates.length < 8) {
                $scope.housemates.push({});
            } else {
                window.alert("How big do you think houses are in London?!");
            }
        };

        $scope.removeHousemate = function () {
            if ($scope.housemates.length > 1) {
                $scope.housemates.pop();
            } else {
                window.alert("You need at least one person to calculate for!");
            }
        };

        $scope.searchRestaurants = function () {
            const req = {
                method: 'GET',
                url: 'http://public.je-apis.com:80/restaurants/v3?q=SW170EG&c=indian&name=',
                header: {
                    'Content-Type': 'application/json',
                    'Accept-Tenant': 'uk',
                    'Accept-Language': 'en-GB',
                    'Authorization': 'Basic VGVjaFRlc3RBUEk6dXNlcjI='
                }
            };

            $http(req).then(response => {
                concole.log(response.data);
            });
        };
    }]);
