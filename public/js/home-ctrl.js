'use strict';

var angular = require('angular');
var logger = require('./logger.js');

angular
    .module('comutr')
    .controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

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
        }
    }]);
