var express = require('express');
var app = express();

var exec = require('child_process').exec,
    child;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/:direction', function (req, res) {
  var direction = req.params.direction,
      cmd = 'uvcdynctrl';
  
  switch(direction) {
    case 'up':
      cmd += " -s 'Tilt (relative)' -- 1000";
      break;
    case 'down':
      cmd += " -s 'Tilt (relative)' -- -1000";
      break;
    case 'left':
      cmd += " -s 'Pan (relative)' -- 1000";
      break;
    case 'right':
      cmd += " -s 'Pan (relative)' -- 1000";
      break;
    case 'reset':
      cmd += " -s 'Pan reset' && " + cmd + " -s 'Tilt reset'"; 
      break;
  }

  console.log(cmd);

  child = exec(cmd, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      res.json({
        'success': 'false',
        'error': 'exec error: ' + error
      }) 
    } else {
      res.json({
        'success': 'true'
      }) 
    } 
  }); 
});

var server = app.listen(8083, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

