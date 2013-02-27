'use strict';


// Declare app level module which depends on filters, and services
angular.module('myChatApp', ['myChatApp.filters', 'myChatApp.services', 'myChatApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: MainCtrl});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/main'});
  }]);
