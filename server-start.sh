#!/bin/bash

# check if the port is already in use
if ! nc -z 127.0.0.1 80
then
  #ensure wifi network is up
  #ifconfig wlan1 up;

  # force a network time update
  until ping -nq -c3 8.8.8.8; do
    echo "Waiting for network..."
  done

  sudo service ntp stop;
  sudo ntpd -gq;
  sudo service ntp start;

  # set the timezone to London
  TZ='Europe/London'; export TZ

  echo "Server not detected... starting new instance"
  sudo node serverWrapper.js
else
  echo "Server already running"
fi
