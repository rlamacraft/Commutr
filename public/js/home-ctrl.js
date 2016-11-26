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
            const region_postcodes = {
                "SW47SH"  : "SW",
                "SE167EE" : "SE",
                "E20ET"   : "E",
                "N79BA"   : "N",
                "NW36HY"  : "NW",
                "W24DU"   : "W"
            };

            let bestTravelTime = undefined;
            let bestTravelTimePostcode = "";
            let returnedRequests = 0;

            Object.keys(region_postcodes).forEach(eachPostcode => {
                const URL = "https://api.tfl.gov.uk/journey/journeyresults/";
                const travelTime = $http.get(URL + commute_location_postcode + "/to/" + eachPostcode).then(response => {
                    const journeys = response.data.journeys;

                    // find the best journey time out of the journey options returned by the request
                    let bestJourneyTime = undefined;
                    journeys.forEach(eachJourney => {
                        if(typeof(bestJourneyTime) === "undefined" || bestJourneyTime > eachJourney.duration)
                            bestJourneyTime = eachJourney.duration;
                    });

                    // if this is the best travel time for all the regions seen yet, then keep
                    if (typeof(bestTravelTime) === "undefined" || bestTravelTime > bestJourneyTime) {
                        bestTravelTime = bestJourneyTime;
                        bestTravelTimePostcode = eachPostcode;
                    }

                    // if all requests have come back, return the best
                    if(returnedRequests == Object.keys(region_postcodes).length - 1) {
                        console.log(region_postcodes[bestTravelTimePostcode]);
                    } else {
                        ++returnedRequests;
                    }
                });
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
                url: 'http://public.je-apis.com:80/restaurants/v3?q=' + $scope.restaurantPostcode + '&c=&name=',
                header: {
                    'Content-Type': 'application/json',
                    'Accept-Tenant': 'uk',
                    'Accept-Version': 'en-GB',
                    'Authorization': 'Basic VGVjaFRlc3RBUEk6dXNlcjI='
                }
            };

            $http(req).then(response => {
                concole.log(response.data);
            });
        };
    }]);
