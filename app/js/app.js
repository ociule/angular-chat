'use strict';


// Declare app level module which depends on filters, and services
angular.module('myChatApp', ['myChatApp.filters', 'myChatApp.services', 'myChatApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/room/:id', {templateUrl: 'partials/room.html', controller: RoomCtrl});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/room/main'});
  }]);
