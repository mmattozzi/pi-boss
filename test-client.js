var socket = require('socket.io-client')('http://localhost:8081');

socket.on('connect', function() {
    console.log("Got connect event");
});

socket.on('status', function(data) {
    console.log("Got status message: " + JSON.stringify(data));
    socket.emit('register', { function: 'temperature'});
});

socket.on('query', function(data, callback) {
    console.log("Got query message: " + JSON.stringify(data));
    callback('27');
});

socket.on('disconnect', function() {
    console.log("Got disconnect message");
});

socket.connect();
