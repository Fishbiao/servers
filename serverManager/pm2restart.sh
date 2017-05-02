#!/bin/sh

pm2 stop all;
pm2 delete all;
pm2 start pm2start.json