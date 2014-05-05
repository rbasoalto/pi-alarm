var http = require('http');
var gpio = require('pi-gpio');
var currentState = false;

var actuator = function(outputValue) {
  console.log('Switching relay: '+outputValue);
  currentState = outputValue;
  gpio.open(11, "output", function(err) {
    gpio.write(11, outputValue, function(err) {
      gpio.close(11);
    });
  });
};

var doPollingReq = function() {
  console.log('Starting request...');
  var pollingReqOpts = {
    host: 'localhost',
    port: 3000,
    path: '/alarm',
    method: 'GET'
  };
  var pollingReq = http.request(pollingReqOpts, function(res) {
    console.log('Request being created...');
    res.on('data', function(data) {
      console.log('Got data: '+data);
      var objData = JSON.parse(data);
      if (objData) {
        if (objData.value == true) {
          actuator(true);
        } else if (objData.value == false) {
          actuator(false);
        }
      }
    });
    res.on('close', doPollingReq);
    res.on('end', doPollingReq);
  });
  pollingReq.end();
};

setImmediate(doPollingReq);