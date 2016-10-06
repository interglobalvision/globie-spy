var express = require('express');
var app = express();

var exec = require('child_process').exec, child;

var step = 300;
var limit = {
  x: 2,
  y: 2,
};

var position = { 
  x: 0,
  y: 0,
};

var resetPosition = function(callback) {
  child = exec("uvcdynctrl -s 'Pan Reset' 1", function (error, stdout, stderr) {
    console.log('Pan Reset');
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);

    if (error !== null) { // Error
      console.log('exec error: ' + error);

    } else { // Success
      position.x = 0;

      setTimeout( function() {
        child = exec("uvcdynctrl -s 'Tilt Reset' 1", function (error, stdout, stderr) {
          console.log('Tilt Reset');
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);

          if (error !== null) { // ERROR
            console.log('exec error: ' + error);
          } else { // SUCCESS
            position.y = 0;
          }
        });

      }, 3500); 
    } 
  }); 
};

/* Set CORS */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/api/:direction', function (req, res) {

  var direction = req.params.direction;
  var cmd = 'uvcdynctrl';
  
  if(direction === "reset") {

    child = exec(cmd + " -s 'Pan Reset' 1", function (error, stdout, stderr) {
      console.log('Pan Reset');
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
        res.json({
          'success': false,
          'error': 'exec error: ' + error
        }) 
      } else {
        setTimeout( function() {
          child = exec(cmd + " -s 'Tilt Reset' 1", function (error, stdout, stderr) {
            console.log('Tilt Reset');
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
              res.json({
                'success': false,
                'error': 'exec error: ' + error
              }) 
            } else {
              res.json({
                'success': 'true'
              }) 
            } 
          });
        }, 3500); 
      } 
    }); 

  } else {
  
    switch(direction) {
      case 'up':
        if (position.y < limit.y) {
          position.y += 1;
          cmd += " -s 'Tilt (relative)' -- -" + step;
        }
        break;
      case 'down':
        if (position.y > limit.y * -1) {
          position.y -= 1;
          cmd += " -s 'Tilt (relative)' -- " + step;
        }
        break;
      case 'right':
        if (position.x < limit.x) {
          position.x += 1;
          cmd += " -s 'Pan (relative)' -- -" + step;
        }
        break;
      case 'left':
        if (position.x > limit.x * -1) {
          position.x -= 1;
          cmd += " -s 'Pan (relative)' -- " + step;
        }
        break;
    }
    console.log(position);

    console.log('CMD:' ,cmd);

    if(cmd !== 'uvcdynctrl') {
      child = exec(cmd, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
          res.json({
            'success': false,
            'error': 'exec error: ' + error
          }) 
        } else {
          res.json({
            'success': true
          }) 
        } 
      }); 
    } else {
      res.json({
        'success': false,
        'error': 'Limit reached',
      }) 
    }
  }
});

var server = app.listen(8083, function () {

  var host = server.address().address;
  var port = server.address().port;

  resetPosition(); 
  console.log('Example app listening at http://%s:%s', host, port);

});

