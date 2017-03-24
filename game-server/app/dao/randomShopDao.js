/**
 * Created by tony on 2017/2/28.
 */
var utils = require('../util/utils'),
    logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var dao = module.exports = {};

dao.getByPlayerId = function ( playerId , cb) {
    var sql = 'SELECT * FROM randomShop WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            utils.invokeCallback(cb, null, res[0]);
        }
    });
};