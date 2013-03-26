'use strict';

/* Controllers */


function RoomCtrl($scope, $routeParams, socket) {
  $scope.room = $routeParams.id;
  var enabled = true;
  console.log("Starting room "+ $scope.room +" ...")

  $scope.$on("$destroy", function () { console.log("bye bye " + $scope.room); enabled = false; });
  var old_socket_on = socket.on;

  socket.on = function(eventName, callback) { if (enabled) old_socket_on(eventName, callback); }

  socket.on('init', function (data) {
    console.log("init \""+ data.name +"\" "+data.room);
    $scope.name = data.name;

    // Tell the server we want to be in this room
    socket.emit('room:move', {
      newRoom: $scope.room
      });
    console.log("room:move "+ $scope.room);
  });

  function need_init() {
    if (!$scope.name) {
      console.log("need:init");
      socket.emit('need:init', {});
    }
  }
  // Wait a sec before sending need:init
  setTimeout(need_init, 1000);


  socket.on('room:move:ack', function (data) {
    console.log("room:move:ack "+ data.room +" with "+data.users.length+" users");
    $scope.room = data.room;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    if (message.room == $scope.room)
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users = data.users;
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    console.log("user:left " + data.user + " from room " + data.room);
    if ($scope.room != data.room) return;
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.user + ' has left.'
    });
    $scope.users = data.users;
  });

  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {

        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };  

}
//RoomCtrl.$inject = ['$routeParams', 'socket'];
