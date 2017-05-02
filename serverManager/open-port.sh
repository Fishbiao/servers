#!/bin/sh

#exec this script under user root

port=3000

echo opening port $port start...

iptables -I INPUT -p tcp --dport $port -j ACCEPT
iptables -I OUTPUT -p tcp --sport $port -j ACCEPT
iptables-save
service iptables save

echo open port $port end.