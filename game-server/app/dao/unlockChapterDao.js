/**
 * Created by kilua on 2015-06-01.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');;

var utils = require('../util/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM UnlockChapter WHERE playerId = ?';
    pomelo.app.get('dbclient').query(sql, [playerId], function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, playerId = %s', err.stack, playerId);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};