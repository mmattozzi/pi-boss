var http = require('http');
var express = require('express');
var mysql = require('mysql');
var os = require("os");
var temperatureServer = require('./temperature-server');

var mysqlPool = mysql.createPool({
	connectionLimit: 10,
	user: 'pi_boss',
	host: 'localhost',
	database: 'pi_boss'
});

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

var socketHandlers = new Object();

io.on('connection', function(socket) {
    var host = "";
		console.log("Got connection from: " + socket.id);
    socket.emit('init', { server: os.hostname() } );
    socket.on('register', function(data) {
      host = data.host;
			func = data.function; 
      console.log("Registering socket " + socket.id + " to: " + data.function + " on host: " + host);
      socketHandlers[data.function] = function(callback) {
        socket.emit('query', {function: data.function}, function(ackData) {
            callback(ackData);
        });
      };
    });
    
    socket.on('log', function(logMessage) {
			if (! host) {
				console.log("Register message required before data can be logged.");
				return;
			}
      mysqlPool.getConnection(function(err, connection) {
		      if (err) {
			         console.log("Error getting DB connection");
		      }
					if (logMessage.type === 'numeric') {
		      	connection.query("insert into numeric_log (host, function, value) VALUES (?, ?, ?)", 
								[ host, logMessage.name, logMessage.value ], function(err, results, fields) {
            	if (err) {
              	console.log(err);
			      	}
          	});
					}
			
			    connection.release();
		});
	});
  
    socket.on('disconnect', function() {
      console.log("Socket disconnected: " + host);
    });
});

app.get('*', function(req, res, next) {
	var func = req.path.substring(1);
	if (func in socketHandlers) {
		socketHandlers[func](function(data) {
			res.type("text/plain").send(String(data));
		});
	} else {
		next();
	}
});

// Register temperature server URL handlers
temperatureServer(app, socketHandlers, mysqlPool);

server.listen(8081);
console.log('Server running on port 8081...');
