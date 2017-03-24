/**
 * Created by tony on 2017/2/25.
 */
var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.deleteRandBossByPlayerId = function(playerId,cb){
    var sql = 'DELETE FROM barrierRandBoss WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('deleteRandBossByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            utils.invokeCallback(cb, null, null);
        }
    });
}

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM barrierRandBoss WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            if (!!res && res.length === 1) {
                utils.invokeCallback(cb, null, res[0]);
            } else {
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};