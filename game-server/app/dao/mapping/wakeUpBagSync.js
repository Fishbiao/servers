/**
 * Created by kilua on 2016/7/22 0022.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

function remove(dbClient, itemData, cb) {
    var sql = 'DELETE FROM WakeUpBag WHERE playerId = ? AND pos = ?',
        args = [itemData.playerId, itemData.pos];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

function updateAndAdd(client, itemData, cb) {
    var sql = 'INSERT INTO WakeUpBag(playerId, pos, itemId, itemCount) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' itemId = VALUES(itemId), itemCount = VALUES(itemCount)',
        args = [itemData.playerId, itemData.pos, itemData.itemId, itemData.itemCount];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, chapterInfo = %j', err.stack, itemData);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('save failed!chapterInfo = %j', itemData);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

exp.save = function (dbClient, itemData, cb) {
    if (itemData.itemCount > 0) {
        updateAndAdd(dbClient, itemData, cb);
    } else {
        remove(dbClient, itemData, cb);
    }
};