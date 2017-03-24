/**
 * Created by employee11 on 2016/3/2.
 */

var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

var petBagSync = module.exports = {};

var remove = function (dbClient, petData, cb) {
    var sql = 'DELETE FROM petBag WHERE playerId = ? AND pos = ?',
        args = [petData.playerId, petData.pos];
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

var updateAndAdd = function (dbClient, petData, cb) {
    var sql = 'INSERT INTO petBag(playerId,pos,posInfo) VALUES(?,?,?) ON DUPLICATE KEY UPDATE posInfo = VALUES(posInfo)';
    var posInfo = petData;
    if (typeof posInfo !== 'string') {
        posInfo = JSON.stringify(posInfo);
    }
    var args = [petData.playerId, petData.pos, posInfo];
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

petBagSync.save = function (dbClient, petData, cb) {
    if (petData.remove) {
        remove(dbClient, petData, cb);
    } else {
        updateAndAdd(dbClient, petData, cb);
    }
};
