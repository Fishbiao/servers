/**
 * Created by kilua on 2015-06-26.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../mylib/utils/lib/utils'),

pomelo = require('pomelo');

var dao = module.exports = {};
/*
 *  通过玩家id获取玩家的充值信息
 *  */
dao.getByPlayerId = function ( playerId, cb) {
    var sql = 'SELECT * FROM orderList WHERE playerId = ?';
    pomelo.app.get('dbclient').query(sql, [playerId], function (err, res) {
        if (err) {
            logger.error('getByOrderId err = %s, playerId = %s', err.stack, playerId);
            utils.invokeCallback(cb, err.message, null);
        } else {
            if(!!res && res.length > 0) {
                utils.invokeCallback(cb, null, res);
            }else{
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

/*
*  通过玩家id获取玩家的充值信息
*  */
dao.getByOrderId = function ( orderId, cb) {
    var sql = 'SELECT * FROM orderList WHERE orderId = ?';
    pomelo.app.get('dbclient').query(sql, [orderId], function (err, res) {
        if (err) {
            logger.error('getByOrderId err = %s, orderId = %s', err.stack, orderId);
            utils.invokeCallback(cb, err.message, null);
        } else {
            if(!!res && res.length > 0) {
                utils.invokeCallback(cb, null, res[0]);
            }else{
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

dao.recordOrder = function( newOrder, cb){
    logger.info('orderId = %s, uid = %s, money = %s, getMoney = %s,getAwardMoney = %s, playerId = %s, playerName = %s, productId = %s,operationFlag = %s',
        newOrder.orderId,
        newOrder.uid,
        newOrder.money,
        newOrder.getMoney,
        newOrder.getAwardMoney,
        newOrder.playerId,
        newOrder.playerName,
        newOrder.productId,
        newOrder.operationFlag);
    var sql = 'INSERT INTO orderList(orderId,uid,money,getMoney,getAwardMoney,createTime,playerId,playerName,productId,operationFlag) VALUES(?,?,?,?,?,?,?,?,?,?)';
    pomelo.app.get('dbclient').query(sql, [newOrder.orderId, newOrder.uid, newOrder.money, newOrder.getMoney, newOrder.getAwardMoney,newOrder.createTime, newOrder.playerId, newOrder.playerName, newOrder.productId,newOrder.operationFlag], function(err, res){
        if(err){
            logger.error('recordOrder err = %s, orderId = %s', err.stack, newOrder.orderId);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.info('recordOrder failed!orderId = %s', orderId);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

dao.updateOrder = function( orderId, status, logId, chargeTotal, cb){
    var sql = 'UPDATE orderList SET status = ?, playerActionLogId = ?, chargeTotal = ? WHERE orderId = ?',
        args = [status, logId, chargeTotal, orderId];
    pomelo.app.get('dbclient').query(sql, args, function(err, res){
        if(err){
            logger.error('updateOrder err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows === 1){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.info('updateOrder failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

dao.getRechargeCntById = function ( playerId ,cb) {
    var sql = 'SELECT * FROM orderList WHERE playerId = ?';
    pomelo.app.get('dbclient').query(sql, [playerId], function (err, res) {
        if (err) {
            logger.error('getRechargeCntById err = %s, playerId = %s', err.stack, playerId);
            utils.invokeCallback(cb, err.message, null);
        } else {
            if(!!res && res.length > 0) {
                utils.invokeCallback(cb, true, res );
            }else{
                utils.invokeCallback(cb, false, null);
            }
        }
    });
}
