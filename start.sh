#!/bin/sh
if [ "$1" = "start" ]; then
	echo starting all servers...
	
	echo starting game-server...
	cd game-server &&  nohup node app > game-server.log 2>&1 &
	echo start game-server ok-1
	
	echo starting authServer...
	cd authServer && nohup node app > authServer.log 2>&1 &
	echo start authServer ok-2

	echo start all servers ok
elif [ "$1" = "stop" ]; then
	echo stopping game servers...
	cd game-server && chmod +x node_modules/pomelo/bin/pomelo && node_modules/pomelo/bin/pomelo stop -p admin -P  6005 
	echo stop game servers ok!
	
	kill -9 $(netstat -alnp | grep '6000\|6001\|6003\|6701\|6014\|6010\|6150\|6250\|6550\|6602\|6802\|6005' | awk '{print $7}' | awk -F '/' '{print $1}')
	netstat -alnp | grep '6000\|6001\|6003\|6701\|6014\|6010\|6150\|6250\|6550\|6602\|6802\|6005'
	echo stop all servers ok!
elif [ "$1" = "list" ]; then
	echo ------------------------------------------------------------------
	cd game-server && chmod +x node_modules/pomelo/bin/pomelo && node_modules/pomelo/bin/pomelo list -p admin -P  6005 
	echo ------------------------------------------------------------------
	netstat -alnp | grep '6000\|6001\|6003\|6701\|6014\|6010\|6150\|6250\|6550\|6602\|6802\|6005'
else
	echo unknown cmd[$1]!
fi