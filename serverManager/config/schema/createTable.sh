#!/bin/sh
mysql -u root -p890205 -e "CREATE DATABASE IF NOT EXISTS myServerMgr;" && mysql -u root -p890205 --database=myServerMgr <./createTable.sql >createTable.log -f --batch --silent --show-warnings --line-numbers --table --column-names