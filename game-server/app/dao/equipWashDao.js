/**
 * Created by tony on 2016/7/19.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var equipWashDao = module.exports;

equipWashDao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM EquipWash WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! err = %s, playerId = %s', err.stack, playerId);
            utils.invokeCallback(cb, err.message, []);
        } else {
            res = res || [];
            utils.invokeCallback(cb, null, res || []);
        }
    });
};