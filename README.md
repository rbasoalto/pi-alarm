# Raspberry Pi alarm system

An internet-connected alarm for the Raspberry Pi.

**pi-alarm** subscribes to a [MQTT](http://mqtt.org) topic on a remote (or local) server, and turns on an alarm when the message tells it to.

The Pi should have a relay (or LED, or anything) to GPIO17 (physical pin 11 of connector P1, or GPIO 0 according to wiringPi), which turns on an alarm.

See [pi-alarm-server](https://github.com/rbasoalto/pi-alarm-server) for an HTTP(S) endpoint for the alarm system.

# License

This was written by Rodrigo Basoalto.

The source is released under BSD (3-clause) license. See LICENSE for the text.
