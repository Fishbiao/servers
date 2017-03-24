/**
 * Created by kilua on 2016/7/1 0001.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, slotData, cb) {
    var sql = 'INSERT INTO EquipConf(playerId, part, pos, refineLV, refineExp, wakeUpLV,washCnt) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' pos = VALUES(pos),refineLV = VALUES(refineLV),refineExp = VALUES(refineExp),wakeUpLV = VALUES(wakeUpLV),washCnt = VALUES(washCnt)',
        args = [slotData.playerId, slotData.part, slotData.pos, slotData.refineLV, slotData.refineExp, slotData.wakeUpLV, slotData.washCnt];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, slotData = %j', err.stack, slotData);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('save failed!slotData = %j', slotData);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};