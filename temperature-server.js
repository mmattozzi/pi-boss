module.exports = function(app, socketHandlers, mysqlPool) {
  
  app.get('/high-temperature', function(req, res) {
    mysqlPool.getConnection(function(err, connection) {
      if (err) {
        console.log("Error getting DB connection");
      }
      connection.query("select max(value) as result from numeric_log where "
          + "function = 'temperature' and date >= NOW() - INTERVAL 1 DAY", 
          function(err, results, fields) {
        if (err) {
          console.log(err);
          res.sendStatus(500).send("Error connecting to database");
        } else {
          if (results.length > 0) {
            res.type("text/plain").send("" + Math.round(results[0].result));
          }
        }
        connection.release();
      });
    });
  });

  app.get('/low-temperature', function(req, res) {
    mysqlPool.getConnection(function(err, connection) {
      if (err) {
        console.log("Error getting DB connection");
      }
      connection.query("select min(value) as result from numeric_log where "
          + "function = 'temperature' and date >= NOW() - INTERVAL 1 DAY", 
          function(err, results, fields) {
        if (err) {
          console.log(err);
          res.sendStatus(500).send("Error connecting to database");
        } else {
          if (results.length > 0) {
            res.type("text/plain").send("" + Math.round(results[0].result));
          }
        }
        connection.release();
      });
    });
  });
  
};