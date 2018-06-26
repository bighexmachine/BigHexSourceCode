#!/bin/bash

# check if the port is already in use
if ! nc -z 127.0.0.1 80
then
  # force a network time update
  until ping -nq -c3 8.8.8.8; do
    echo "Waiting for network..."
  done

  sudo service ntp stop;
  sudo ntpd -gq;
  sudo service ntp start;

  echo "Server not detected... starting new instance"
  sudo forever -l ~/forever.log --append serverWrapper.js
fi
