/**
 * Created by employee11 on 2016/2/29.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var hasBuyHeroDao = module.exports;

hasBuyHeroDao.getByPlayerId = function (playerId, cb) {
    var sql = 'select * from hasBuyHero where playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            if (res) {
                utils.invokeCallback(cb, null, res.map(function (rec) {
                    return rec.configId;
                }));
            } else {
                logger.error('getByPlayerId list is null');
                utils.invokeCallback(cb, null, []);
            }
        }
    });
};
