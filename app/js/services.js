'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var services = angular.module('myChatApp.services', []);
services.value('version', '0.1');
services.factory('socket', function ($rootScope) {
  console.log("Initializing socket.io");
  var controllers = [];
  var socket = io.connect();
  socket.on('init', function (data) {
    console.log("init2 \""+ data.name +"\" "+data.room);
  });


  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    register: function (controller) {
      controllers.push(controller);
    }
  };
});
