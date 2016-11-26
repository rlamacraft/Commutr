'use strict';

var angular = require('angular');
var logger = require('./logger.js');

angular
    .module('comutr')
    .controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

        $scope.housemates = [{}];
        $scope.restaurantPostcode = "";
        $scope.restaurantCuisine = "";

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
                console.log(response.data);
            });
        };

        const TFL_URL = "https://api.tfl.gov.uk/journey/journeyresults/";

        // find the best journey time out of a list of journies
        function journeyWithShortestDuration(journeys) {
          let bestJourneyTime = undefined;
          journeys.forEach(eachJourney => {
            if(typeof(bestJourneyTime) === "undefined" || bestJourneyTime > eachJourney.duration)
              bestJourneyTime = eachJourney.duration;
          });
          return(bestJourneyTime);
        }

        $scope.areaSelector = function areaSelector(commute_location_postcode, postcode_district) {
          const district_sizes = {
            "SW" : 20,
            "SE" : 28,
            "E"  : 20,
            "N"  : 22,
            "NW" : 11,
            "W"  : 14
          };

          let bestTravelTime = undefined;
          let bestTravelTimePostcodeArea = "";
          let returnedRequests = 0;

          for(let eachArea = 1; eachArea < district_sizes[postcode_district] + 1; ++eachArea) {
            const postcodeAreaName = postcode_district + eachArea;
            const GoogleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcodeAreaName},London`;
            const travelTime = $http.get(GoogleUrl).then(response => {
              const lat = response.data.results[0].geometry.location.lat;
              const long = response.data.results[0].geometry.location.lng;
              const travelTime = $http.get(TFL_URL + `${commute_location_postcode}/to/${lat},${long}`).then(response => {
                const journeys = response.data.journeys
                const bestJourneyTime = journeyWithShortestDuration(journeys);

                // if this is the best travel time for all the regions seen yet, then keep
                if (typeof(bestTravelTime) === "undefined" || bestTravelTime > bestJourneyTime) {
                  bestTravelTime = bestJourneyTime;
                  bestTravelTimePostcodeArea = postcodeAreaName;
                }

                // if all requests have come back, return the best
                if(returnedRequests == district_sizes[postcode_district] - 1) {
                  console.log(bestTravelTimePostcodeArea);
                } else {
                  ++returnedRequests;
                }
              }, error => {
                ++returnedRequests;
              });
            });
          }
        }

        $scope.regionSelector = function(commute_location_postcode) {
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
            const travelTime = $http.get(TFL_URL + commute_location_postcode + "/to/" + eachPostcode).then(response => {
              const journeys = response.data.journeys;
              const bestJourneyTime = journeyWithShortestDuration(journeys);

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

    }]);
