var https = require('https');
var gpio = require('pi-gpio');
var currentState = false;
var turnoffTask = null;

var actuator = function(outputValue) {
  console.log('Switching relay: '+outputValue);
  currentState = outputValue;
  gpio.open(11, "output", function(err) {
    gpio.write(11, outputValue, function(err) {
      gpio.close(11);
    });
  });
  if (outputValue) {
    // Turn off after 5sec
    if (turnoffTask != null) {
      clearTimeout(turnoffTask);
    }
    turnoffTask = setTimeout(actuator, process.env.DELAY || 10000, false);
  } else {
    // Now turning off, cancel the timeout if present
    if (turnoffTask != null) {
      clearTimeout(turnoffTask);
    }
    turnoffTask = null;
  }
};

var doPollingReq = function() {
  console.log('Starting request...');
  var pollingReqOpts = {
    host: process.env.SERVER_HOSTNAME || 'localhost',
    port: process.env.SERVER_PORT || 443,
    path: '/alarm',
    method: 'GET'
  };
  var pollingReq = https.request(pollingReqOpts, function(res) {
    console.log('Request being created...');
    res.on('data', function(data) {
      console.log('Got data: '+data);
      var objData = JSON.parse(data);
      if (objData && objData.value !== undefined) {
        actuator(objData.value);
      }
    });
    res.on('close', doPollingReq);
    res.on('end', doPollingReq);
    res.on('error', doPollingReq);
  });
  pollingReq.end();
};

setImmediate(doPollingReq);
