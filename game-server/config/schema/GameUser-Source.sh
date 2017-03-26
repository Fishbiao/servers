#!/bin/sh
mysql -u root -p890205 -e "CREATE DATABASE IF NOT EXISTS GameUser;" && mysql -u root -p890205 --database=GameUser <./GameUser-Source.sql >GameUser-Source.log -f --batch --silent --show-warnings --line-numbers --table --column-names
