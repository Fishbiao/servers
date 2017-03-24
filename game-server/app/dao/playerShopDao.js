/**
 * Created by kilua on 2016/6/30 0030.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT resetTick, buyRecordDict FROM PlayerShop WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            if (!!res && !!res[0]) {
                var shopInfo = res[0];
                try {
                    shopInfo.buyRecordDict = JSON.parse(shopInfo.buyRecordDict);
                    return utils.invokeCallback(cb, null, shopInfo);
                } catch (ex) {
                    logger.error('getByPlayerId parse err = %s', ex.stack);
                    return utils.invokeCallback(cb, ex.message);
                }
            }
            utils.invokeCallback(cb, null, {resetTick: 0, buyRecordDict: {}});
        }
    });
};