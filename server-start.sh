#!/bin/bash
# check if the port is already in use

MAX_LOGFILES=50
DATE=$(date -d "today" +"%d.%m.%Y_%H.%M.%S")

if ! nc -z 127.0.0.1 80
then
  mkdir -p ./logs
  sudo node ./server.js &> ./logs/$DATE.log &

  #if we have too many log files saved then delete the oldest
  NUM_LOGFILES=$(find ./logs -type f | wc -l)

  if [ "$NUM_LOGFILES" -gt "$MAX_LOGFILES" ]
  then
    echo "$NUM_LOGFILES logfiles detected (max $MAX_LOGFILES), deleting one"
    rm ./logs/"$(ls ./logs -t | tail -1)"
  fi
fi
