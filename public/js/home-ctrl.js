'use strict';

var angular = require('angular');
var logger = require('./logger.js');

angular
    .module('comutr')
    .controller('homeController', ['$scope', '$http', '$location', function ($scope, $http, $location) {

        $scope.wrapperDisabled = false;
        $scope.housemates = [{}];
        $scope.restaurantPostcode = "";
        $scope.restaurantCuisine = "";
        const googleApiKey = "AIzaSyD_pLALGFBoKLdoYOH8pJxNsfTKHbyBqTs";
        let postcodeAreaHashTable = {"SE1": []};

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
                url: 'http://public.je-apis.com:80/restaurants/v3?q=' + $scope.restaurantPostcode + 'c=&name=',
                header: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Accept-Tenant': 'uk',
                    'Accept-Version': 'en-GB',
                    'Authorization': 'Basic VGVjaFRlc3RBUEk6dXNlcjI=',
                    'Connection': 'keep-alive',
                    'Host': 'public.je-apis.com'
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
                if (typeof(bestJourneyTime) === "undefined" || bestJourneyTime > eachJourney.duration)
                    bestJourneyTime = eachJourney.duration;
            });
            return (bestJourneyTime);
        }

        $scope.getAreaToLiveIn = function(commutePostcode) {
            // Lewis' CSS STUFF!!!
            $scope.wrapperDisabled = true;

            // Rob's stuff that actually does the work lel
            console.log("Getting recommended postcode area...");
            regionSelector(commutePostcode).then(function(region) {
                console.log(region);
                areaSelector(commutePostcode, region).then(function(area) {
                    console.log(area);
                    stationsInPostcodeArea(area).then(function(stations) {
                        console.log(stations);
                        getStationsTravelTime(stations, commutePostcode).then(function(stationsWithDuration) {
                            console.log(sortByDuration(stationsWithDuration));
                        }, function(err) {
                            console.error(err);
                        })
                    }, function(err) {
                        console.error(error);
                    })
                }, function(err) {
                    console.error(err)
                });
            }, function(err) {
                console.error(err);
            })

            function error(err){
                console.error(err);
            }
        }

        const sortByDuration = function(stations) {
            stations.forEach(station =>{
                console.log(stations["0"].duration);
            })
        }

        const getStationsTravelTime = function(stations, postcode) {
            return new Promise(function(resolve, reject) {
                stations.forEach(eachStation => {
                    $http.get(TFL_URL + postcode + "/to/" + eachStation.lat + "," + eachStation.lon).then(response => {
                        eachStation.duration = response.data.journeys[0].duration;
                    });
                });
                resolve(stations);
            });
        }

        const stationsInPostcodeArea = function(postcodeArea) {
            return new Promise(function(resolve, reject) {
                const GoogleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcodeArea},London`;
                const travelTime = $http.get(GoogleUrl).then(response => {
                    const lat = response.data.results[0].geometry.location.lat;
                    const long = response.data.results[0].geometry.location.lng;
                    const tubeStationRadius = 1000; // 1 kilometer
                    $http.get(`https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${long}&stopTypes=NaptanMetroStation&radius=${tubeStationRadius}&useStopPointHierarchy=True&returnLines=True`).then(response => {
                        const allTubeStations = response.data.stopPoints;
                        let allTubeStationDetails = [];

                        allTubeStations.forEach(eachStation => {
                            console.log(eachStation.commonName);
                            allTubeStationDetails.push({"name": eachStation.commonName, "lat": eachStation.lat, "lon": eachStation.lon});
                        })

                        resolve(allTubeStationDetails);
                    });
                });
            });
        }

        function getSortedJourneysByDuration(journeys) {
            return journeys.sort((journey1, journey2) => {
                if (journey1.duration < journey2.duration) {
                    return -1;
                }
                else if (journey1.duration > journey2.duration) {
                    return 1;
                } else
                    return 0;

            });
        }

        $scope.getOptimalArea = function (commutePostcode) {
            console.log("Getting recommended postcode area...");
            hashAllJourneysByDistrict(commutePostcode).then(() => {
                console.log("Average for commutes from all zones to " + commutePostcode + " is " + averageHashTableJourneyTimes());
            }, function (err) {
                console.error("ERROR: " + err);
            })
        };

        function averageHashTableJourneyTimes() {
            Object.keys(postcodeAreaHashTable).forEach(postCodeAreaName => {
                const arrSize = postcodeAreaHashTable[postCodeAreaName].length;
                let sum = postcodeAreaHashTable[postCodeAreaName].reduce((duration1, duration2) => {

                    return duration1 + duration2;
                });
                postcodeAreaHashTable[postCodeAreaName] = sum / arrSize;
                console.log("Average for " + postCodeAreaName + ": " + postcodeAreaHashTable[postCodeAreaName]);
            });
        }

        $scope.getAreaToLiveIn = function(commutePostcode) {
            // Lewis' CSS STUFF!!!
            $scope.wrapperDisabled = true;

            // Rob's stuff that actually does the work lel
            console.log("Getting recommended postcode area...");
            regionSelector(commutePostcode).then(function(region) {
                console.log(region);
                areaSelector(commutePostcode, region).then(function(area) {
                    console.log(area);
                    stationsInPostcodeArea(area).then(function(stations) {
                        console.log(stations);
                        getStationsTravelTime(stations, commutePostcode).then(function(stationsWithDuration) {
                            console.log(sortByDuration(stationsWithDuration));
                        }, function(err) {
                            console.error(err);
                        })
                    }, function(err) {
                        console.error(error);
                    })
                }, function(err) {
                    console.error(err)
                });
            }, function(err) {
                console.error(err);
            })

            function error(err){
                console.error(err);
            }
        };

        const stationsInPostcodeArea = function(postcodeArea) {
            return new Promise(function(resolve, reject) {
                const GoogleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcodeArea},London`;
                const travelTime = $http.get(GoogleUrl).then(response => {
                    const lat = response.data.results[0].geometry.location.lat;
                    const long = response.data.results[0].geometry.location.lng;
                    const tubeStationRadius = 1000; // 1 kilometer
                    $http.get(`https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${long}&stopTypes=NaptanMetroStation&radius=${tubeStationRadius}&useStopPointHierarchy=True&returnLines=True`).then(response => {
                        const allTubeStations = response.data.stopPoints;
                        let allTubeStationDetails = [];

                        allTubeStations.forEach(eachStation => {
                            console.log(eachStation.commonName);
                            allTubeStationDetails.push({"name": eachStation.commonName, "lat": eachStation.lat, "lon": eachStation.lon});
                        })

                        resolve(allTubeStationDetails);
                    });
                });
            });
        }

        let areaSelector = function areaSelector(commute_location_postcode, postcode_district) {
          return new Promise(function(resolve, reject) {
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
                    resolve(bestTravelTimePostcodeArea);
                  } else {
                    ++returnedRequests;
                  }
                }, error => {
                  ++returnedRequests;
                });
              });
            }
          });
        }

        function hashAllJourneysByDistrict(commute_location_postcode) {
            return new Promise(function (resolve, reject) {
                const district_sizes = {
                    "SW": 20,
                    "SE": 28,
                    "E": 20,
                    "N": 22,
                    "NW": 11,
                    "W": 14
                };
                let areasCovered = 0;

                Object.keys(district_sizes).forEach(district => {
                        for (let eachArea = 1; eachArea < district_sizes[district] + 1; ++eachArea) {
                            const postcodeAreaName = district + eachArea;

                            const GoogleUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=${postcodeAreaName},London&key=' + googleApiKey;
                            $http.get(GoogleUrl).then(response => {
                                const lat = response.data.results[0].geometry.location.lat;
                                const long = response.data.results[0].geometry.location.lng;

                                $http
                                    .get(TFL_URL + `${commute_location_postcode}/to/${lat},${long}`)
                                    .then(response => {
                                        let journeysSize = response.data.journeys.length;
                                        response.data.journeys.forEach(journey => {
                                            if (postcodeAreaHashTable[postcodeAreaName] === undefined)
                                                postcodeAreaHashTable[postcodeAreaName] = [];
                                            postcodeAreaHashTable[postcodeAreaName].push(journey.duration);

                                            if (eachArea === district_sizes[district] && response.data.journeys.indexOf(journey) === journeysSize - 1)
                                                areasCovered += eachArea;
                                            if (areasCovered === 115) {
                                                console.log("RESOLVING");
                                                resolve();
                                            }
                                            console.log("DISTRICT TOTAL NR: " + district_sizes[district] + "| DISTRICT CURRENT NR: " + eachArea + "| JOURNEY INDEX " + response.data.journeys.indexOf(journey) + "| AREAS COVERED " + areasCovered);
                                        });
                                    }, error => {
                                        logger.log(error);
                                    });
                            });
                        }
                    }
                );
            });

        }


        let regionSelector = function(commute_location_postcode) {
          return new Promise(function(resolve, reject) {
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
                  resolve(region_postcodes[bestTravelTimePostcode]);
                } else {
                  ++returnedRequests;
                }
              });
            });
          });
      };

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

    }]);
