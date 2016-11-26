'use strict';

var angular = require('angular');

angular
    .module('comutr')
    .config(['$routeProvider', '$locationProvider',
        function ($routeProvider, $locationProvider) {

            // setting up angular routes to get the respective static html files from appropriate server routes (on the client side)
            $routeProvider
                .when('/', {
                    templateUrl: '/views/home.html',
                    controller: 'homeController'
                });

            $locationProvider.html5Mode({enabled: true, requireBase: false});
        }
    ]);

