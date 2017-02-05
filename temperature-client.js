if (process.argv.length  < 3) {
  console.log("Usage: node temperature-client.js <server url>");
  process.exit(1);
}

var socket = require('socket.io-client')(process.argv[2]);
var glob = require('glob');
var fs = require('fs');
var child = require('child_process');
var os = require("os");
var gpio = require('rpi-gpio');

console.log("Running modprobes");
child.execSync("modprobe w1-gpio");
child.execSync("modprobe w1-therm");
console.log("Ran modprobes");

var baseDir = '/sys/bus/w1/devices/';
var deviceFolder = glob.sync(baseDir + '28*')[0];
var deviceFile = deviceFolder + '/w1_slave';
console.log("Using deviceFile: " + deviceFile);

gpio.setMode(gpio.MODE_BCM);

// Reads the temperature from the sys bus device file and converts 
// celsius to fahrenheit, sending answer to callback
var readTemp = function(callback) {
    gpio.write(23, true);
    fs.readFile(deviceFile, 'utf8', function(err, data) {
      gpio.write(23, false);
      if (err) {
        console.log(err);
        callback("Unable to read temperature from device");
      } else {
        var match = data.match(/t=(\d+)/);
        if (match) {
          callback(Math.round(Number(match[1] / 1000 * 9 / 5 + 32)));
        }
      }
    });
};

socket.on('connect', function() {
    console.log("Got connect event");
});

socket.on('status', function(data) {
    console.log("Got status message: " + JSON.stringify(data));
    socket.emit('register', { function: 'temperature', host: os.hostname() });
});

socket.on('query', function(data, callback) {
    console.log("Got query message: " + JSON.stringify(data));
    if (data.function === 'temperature') {
      readTemp(callback);
    } else {
      callback("Unknown function");
    }
});

socket.on('disconnect', function() {
    console.log("Got disconnect message");
});

// Send temperature log message every 10 minutes
setInterval(function() {
   readTemp(function(data) {
      var logMessage = { type: 'numeric', name: 'temperature', value: data };
      socket.emit('log', logMessage);
   });
}, 600000);

gpio.setup(23, gpio.DIR_OUT, function() {
  socket.connect();
});
