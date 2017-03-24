/**
 * Created by kilua on 2016/6/30 0030.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, shopInfo, cb) {
    var sql = 'INSERT INTO PlayerShop(playerId, resetTick, buyRecordDict) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
            ' resetTick = VALUES(resetTick), buyRecordDict = VALUES(buyRecordDict)',
        args = [shopInfo.playerId, shopInfo.resetTick, JSON.stringify(shopInfo.buyRecordDict)];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, shopInfo = %j', err.stack, shopInfo);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('save failed!shopInfo = %j', shopInfo);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};