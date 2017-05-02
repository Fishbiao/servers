#!/bin/sh
if [ "$1" = "start" ]; then
	echo starting all servers...
    nohup node app > serverManager.log 2>&1 &
	echo start all servers ok
elif [ "$1" = "stop" ]; then
	echo stopping game servers...
	kill -9 $(netstat -alnp | grep '9999' | awk '{print $7}' | awk -F '/' '{print $1}')
	netstat -alnp | grep '9999'
	echo stop all servers ok!
else
	echo unknown cmd[$1]!
fi