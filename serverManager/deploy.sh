#!/bin/sh

serverId=$1
user=$2
pwd=$3

echo enter directroy $(pwd)
echo deploying serverManager...
echo input serverId=$serverId,user=$user,pwd=$pwd

echo install third-party modules.
chmod +x npm-install.sh && ./npm-install.sh

echo modify configs if needed.
cd config && echo enter directroy $(pwd)

echo modify port...
yes | cp config.json.bak config.json
port=$[ 3000 + $serverId * 1000 ]
sed -i "s/3000/$port/" config.json

yes | cp mysql.json.bak mysql.json
sed -i "s/ServerManager/ServerManager$serverId/" mysql.json
sed -i "s/test/$user/" mysql.json
sed -i "s/123456/$pwd/" mysql.json

echo modify sql script...
cd schema && echo enter directroy $(pwd)
sed -i "s/ServerManager/ServerManager$serverId/" createTable.sql
sed -i "s/test/$user/" createTable.sh
sed -i "s/123456/$pwd/" createTable.sh

echo run db script...
chmod +x createTable.sh && ./createTable.sh

echo end!