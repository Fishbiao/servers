/**
 * Created by tony on 2016/9/19.
 */
var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM Mission WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            res = res || [];
            utils.invokeCallback(cb, null, res);
        }
    });
};