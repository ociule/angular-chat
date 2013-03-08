var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socket = require('./socket.js');

server.listen(8000);

app.use("/", express.static(__dirname + '/app'));

io.sockets.on('connection', socket);
