/**
 * Created by lishaoshen on 2015/10/12.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo'),
    async = require('async');

var room = require('../domain/entity/RoomData'),
    utils = require('../util/utils');

var roomDao = module.exports;

/*
 *   创角房间
 * */
roomDao.createRoom = function (playerId, cb) {
    var sql = 'insert into room (createPlayerId,createTime)' +
            ' values(?,?)',
        now = Date.now(),
        args = [playerId, now];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            logger.error('createRoom failed! ' + err.message);
            logger.error(err);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res.insertId);
        }
    });
};
