// Keep track of which names are used so that there are no duplicates
var userNamesByRoom = (function () {
  var names = {};

  var claim = function (name, room) {
    var found = false;
    for (room in names) {
      if (names[room][name]) {
        found = true;
        break;
      }
    }
    if (!name || found) {
      return false;
    } else {
      if (!names[room]) names[room] = {}
      names[room][name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function (room) {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name, room));

    return name;
  };

  // serialize claimed names as an array
  var get = function (room) {
    if (!room) { console.log("userNamesByRoom.get without room parameter"); return []; }
    var res = [];
    for (user in names[room]) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    for (room in names)
      if (names[room][name]) {
        delete names[room][name];
        return;
      }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

// export function for listening to the socket
module.exports = function (socket) {
  var room = 'main';
  var name = userNamesByRoom.getGuestName(room);

  // send the new user their name and a default room 
  socket.emit('init', {
    name: name,
    room: room,
    users: userNamesByRoom.get(room)
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name,
    room: room,
    users: userNamesByRoom.get(room)
  });

  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
        user: name,
        text: data.message,
        room: room
    });
  });

  socket.on('need:init', function () {
    socket.emit('init', {
      name: name,
      room: room,
    }); 
  });

  // broadcast a user's message to other users
  socket.on('room:move', function (data) {
    var oldRoom = room;
    room = data.newRoom;
    
    if (room != oldRoom) {
        userNamesByRoom.free(name);
        userNamesByRoom.claim(name, room);
    }
    socket.emit('room:move:ack', {
      room: room,
      users: userNamesByRoom.get(room)
    });

    if (room != oldRoom) {
      socket.broadcast.emit('user:left', {
        user: name,
        room: oldRoom,
        users: userNamesByRoom.get(oldRoom)
      });
    }
  });

  // broadcast a user's message to other users

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNamesByRoom.claim(data.name, room)) {
      var oldName = name;
      userNamesByRoom.free(oldName);

      name = data.name;
      
      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      user: name,
      room: room,
      users: userNamesByRoom.get(room)
    });
    userNamesByRoom.free(name);
  });
};
