/**
 * Created by Administrator on 2016/4/9 0009.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.add = function (client, heroRec, cb) {
    var sql = 'INSERT INTO hasBuyHero(playerId, configId) VALUES(?,?) ON DUPLICATE KEY UPDATE' +
            ' configId = VALUES(configId)',
        args = [heroRec.playerId, heroRec.configId];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('add err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('add failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};