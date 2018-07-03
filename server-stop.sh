#!/bin/bash

#kill the wifi
#ifconfig wlan1 down;

# Setup a CRON job at the specified time
echo "PATH="$PATH > temp.txt;
echo "" >> temp.txt;
echo "$1 bash -c \"cd $(pwd) && sudo ./server-start.sh > /dev/null 2>&1 &\"" >> temp.txt;
echo "" >> temp.txt;
crontab temp.txt
rm temp.txt;
