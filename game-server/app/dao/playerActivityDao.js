/**
 * Created by kilua on 2016/7/6 0006.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT id, pubTick, detail,viewTick FROM PlayerActivity WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            res = res || [];
            res.forEach(function (activity) {
                try {
                    activity.detail = JSON.parse(activity.detail);
                } catch (ex) {
                    logger.error('getByPlayerId activity = %j', activity);
                    activity.detail = {};
                }
            });
            utils.invokeCallback(cb, null, res);
        }
    });
};