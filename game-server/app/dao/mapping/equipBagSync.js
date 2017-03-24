/**
 * Created by kilua on 2016/6/30 0030.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

function upsert(client, equipData, cb) {
    var sql = 'INSERT INTO EquipBag(playerId,pos,equipId,lv,quality) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' equipId = VALUES(equipId), lv = VALUES(lv)',
        args = [equipData.playerId, equipData.pos, equipData.dataId, equipData.lv,equipData.quality];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('upsert err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
}

function remove(client, equipData, cb) {
    var sql = 'DELETE FROM EquipBag WHERE playerId = ? AND pos = ?',
        args = [equipData.playerId, equipData.pos];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

exp.save = function (dbClient, equipData, cb) {
    if (equipData.remove) {
        remove(dbClient, equipData, cb);
    } else {
        upsert(dbClient, equipData, cb);
    }
};