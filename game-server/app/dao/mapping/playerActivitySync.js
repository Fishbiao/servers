/**
 * Created by kilua on 2016/7/6 0006.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

function upSert(dbClient, actData, cb) {
    var sql = 'INSERT INTO PlayerActivity(id,playerId,pubTick,detail,viewTick) VALUES(?,?,?,?,?)' +
            ' ON DUPLICATE KEY UPDATE detail=VALUES(detail),viewTick=VALUES(viewTick)',
        args = [actData.id, actData.playerId, actData.pubTick, JSON.stringify(actData.detail), actData.viewTick];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('upSert err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                utils.invokeCallback(cb, null, true);
            } else {
                logger.debug('upSert failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

function remove(dbClient, actData, cb) {
    var sql = 'DELETE FROM PlayerActivity WHERE playerId = ? AND id = ?',
        args = [actData.playerId, actData.id];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('remove err %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

exp.save = function (client, actData, cb) {
    if (actData.remove) {
        remove(client, actData, cb);
    } else {
        upSert(client, actData, cb);
    }
};