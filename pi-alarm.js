var mqtt = require('mqtt');
var gpio = require('pi-gpio');
var fs = require('fs');

var currentState = false;
var turnoffTask = null;

var config = {
  mqttClientOpts: {},
  mqttPort: 1883,
  mqttHost: 'localhost',
  mqttCommandsTopic: '/alarm/commands',
  mqttStateTopic: '/alarm/state',
  turnOffDelay: 10000
};

// Read configfile
if (process.argv.length > 2) {
  console.log('Parsing config file: '+process.argv[2]);
  var data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (var key in data) {
    config[key] = data[key];
  }
}

var mqttClient = mqtt.createClient(config['mqttPort'], config['mqttHost'], config['mqttClientOpts']);

var publishState = function() {
  mqttClient.publish(config['mqttStateTopic'], JSON.stringify({currentState: currentState}), {qos: 1, retain: true});
};

var updateState = function(newState) {
  currentState = newState?true:false;
  publishState();
};

var actuator = function(outputValue) {
  console.log('Switching relay: '+outputValue);
  gpio.open(11, "output", function(err) {
    gpio.write(11, outputValue, function(err) {
      updateState(outputValue);
      gpio.close(11);
    });
  });
  if (outputValue) {
    // Schedule turnoffTask, cancelling the previous task if exists
    if (turnoffTask != null) {
      clearTimeout(turnoffTask);
    }
    turnoffTask = setTimeout(actuator, config['turnOffDelay'], false);
  } else {
    // If turning off, cancel the outstanding turnoffTask
    if (turnoffTask != null) {
      clearTimeout(turnoffTask);
    }
    turnoffTask = null;
  }
};

publishState();

mqttClient
  .subscribe(config['mqttCommandsTopic'])
  .on('message', function(topic, message) {
    if (topic == config['mqttCommandsTopic']) {
      data = JSON.parse(message);
      actuator(data.value);
    }
  });
