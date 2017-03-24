/**
 * Created by kilua on 2016/5/17 0017.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.load = function (playerId, cb) {
    var sql = 'SELECT saveData FROM ClientSave WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('load err = %s', err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            utils.invokeCallback(cb, null, (res && res.length > 0 && res[0].saveData) || '');
        }
    });
};