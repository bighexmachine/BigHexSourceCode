#!/bin/bash

# check if the port is already in use
if ! nc -z 127.0.0.1 80
then

  # force a network time update
  until ping -nq -c3 8.8.8.8; do
    echo "Waiting for network..."
  done

  #sudo service ntp stop;
  #sudo ntpd -gq;
  #sudo service ntp start;

  MAX_LOGFILES=50
  DATE=$(date -d "today" +"%d.%m.%Y_%H.%M.%S")

  mkdir -p ./logs

  #if we have too many log files saved then delete the oldest
  NUM_LOGFILES=$(find ./logs -type f | wc -l)

  while [ "$NUM_LOGFILES" -gt "$MAX_LOGFILES" ]
  do
    echo "$NUM_LOGFILES logfiles detected (max $MAX_LOGFILES), deleting one"
    rm ./logs/"$(ls ./logs -t | tail -1)"
    NUM_LOGFILES=$(find ./logs -type f | wc -l)
  done

  sudo node ./server.js &> ./logs/$DATE.log
fi
