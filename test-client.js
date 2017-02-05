if (process.argv.length  < 3) {
  console.log("Usage: node temperature-client.js <server url>");
  process.exit(1);
}

var os = require("os");
var socket = require('socket.io-client')(process.argv[2]);

socket.on('connect', function() {
    console.log("Got connect event");
    setInterval(function() {
        var logMessage = { type: 'numeric', name: 'test', value: data };
        socket.emit('log', logMessage);
    }, 600000);
});

socket.on('init', function(data) {
    console.log("Got init message: " + JSON.stringify(data));
    socket.emit('register', { function: 'test', host: os.hostname() });
});

socket.on('query', function(data, callback) {
    console.log("Got query message: " + JSON.stringify(data));
    callback('27');
});

socket.on('disconnect', function() {
    console.log("Got disconnect message");
});

socket.connect();
