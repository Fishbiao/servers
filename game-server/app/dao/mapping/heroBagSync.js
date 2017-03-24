/**
 * Created by employee11 on 2016/2/26.
 */

var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

var heroBagSync = module.exports = {};

var remove = function (dbClient, heroData, cb) {
    var sql = 'DELETE FROM heroBag WHERE playerId = ? AND pos = ?',
        args = [heroData.playerId, heroData.pos];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows === 1) {
                utils.invokeCallback(cb, null, true);
            } else {
                logger.debug('remove failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

var updateAndAdd = function (dbClient, heroData, cb) {
    var sql = 'INSERT INTO heroBag(playerId,pos,posInfo) VALUES(?,?,?) ON DUPLICATE KEY UPDATE posInfo = VALUES(posInfo)';
    var posInfo = heroData;
    if (typeof posInfo !== 'string') {
        posInfo = JSON.stringify(posInfo);
    }
    var args = [heroData.playerId, heroData.pos, posInfo];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('updateAndAdd err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                utils.invokeCallback(cb, null, true);
            } else {
                logger.debug('updateAndAdd failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

heroBagSync.save = function (dbClient, heroData, cb) {
    if (heroData.remove) {
        remove(dbClient, heroData, cb);
    } else {
        updateAndAdd(dbClient, heroData, cb);
    }
};
