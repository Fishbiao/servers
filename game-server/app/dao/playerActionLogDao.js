/**
 * Created by kilua on 2016/6/24 0024.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils'),
    Consts = require('../consts/consts');

var dao = module.exports = {};

var write = dao.write = function (playerId, type, detail, cb) {
    var sql = 'INSERT INTO PlayerActionLog(playerId,type,logTime,detail) VALUES(?,?,?,?)',
        args = [playerId, type, Date.now(), JSON.stringify(detail)];

    pomelo.app.get('logclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('write failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, 0);
        } else {
            utils.invokeCallback(cb, null, res.insertId || 0);
        }
    });
};

/*
 *   领取活动奖励日志
 * */
dao.logDrawActivityAwards = function (player, activityId, dropId) {
    write(player.id, Consts.PLAYER_ACTION_LOG_TYPE.DRAW_ACTIVITY_AWARDS, {
        level: player.roleLevel,
        activityId: activityId,
        dropId: dropId
    }, null);
};

/*
 *   购买活动商店商品日志
 * */
dao.logDiscountShopPurchase = function (player, activityId, goodsId) {
    write(player.id, Consts.PLAYER_ACTION_LOG_TYPE.DISCOUNT_SHOP_PURCHASE, {
        level: player.roleLevel,
        activityId: activityId,
        goodsId: goodsId
    }, null);
};