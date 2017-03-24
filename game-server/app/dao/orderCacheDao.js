/**
 * Created by kilua on 2015-06-01.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../mylib/utils/lib/utils');

var dao = module.exports = {};

dao.getByUid = function (dbClient, uid, cb) {
    var sql = 'SELECT * FROM OrderCache WHERE uid = ?';
    dbClient.query(sql, [uid], function (err, res) {
        if (err) {
            logger.error('getByUid err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            var orderList = [];
            res = res || [];
            res.forEach(function (orderRec) {
                orderRec.orderInfo = JSON.parse(orderRec.orderInfo);
                orderList.push(orderRec);
            });
            utils.invokeCallback(cb, null, orderList);
        }
    });
};

dao.cache = function(dbClient, uid, orderInfo, cb){
    var sql = 'INSERT INTO OrderCache(uid,orderInfo,recvTime) VALUES(?,?,?)',
        args = [uid, JSON.stringify(orderInfo), Date.now()];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('cache err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            utils.invokeCallback(cb, null, res.affectedRows === 1);
        }
    });
};

dao.remove = function(dbClient, cacheId, cb){
    var sql = 'DELETE FROM OrderCache WHERE id = ?',
        args = [cacheId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            utils.invokeCallback(cb, null, true);
        }
    });
};