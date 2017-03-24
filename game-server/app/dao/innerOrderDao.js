/**
 * Created by kilua on 2015-06-01.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    uuid = require('node-uuid');

var utils = require('../../mylib/utils/lib/utils');

var dao = module.exports = {};

dao.getByOrderId = function (dbClient, orderId, cb) {
    var sql = 'SELECT * FROM InnerOrder WHERE id = ?';
    dbClient.query(sql, [orderId], function (err, res) {
        if (err) {
            logger.error('getByOrderId err = %s', err.stack);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res[0]);
        }
    });
};

dao.createOrderId = function(dbClient, productId, cb){
    var sql = 'INSERT INTO InnerOrder(id, productId, timestamp) VALUES(?,?,?)',
        // 由于部分平台的透传参数长度限制不能超过32字节，这里将‘-’去掉
        orderId = uuid.v1().replace(/-/g, ''),
        timestamp = Date.now(),
        args = [orderId, productId, timestamp];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('createOrderId err = %s', err.stack);
            utils.invokeCallback(cb, err.message);
        }else{
            if(!!res && res.affectedRows === 1){
                utils.invokeCallback(cb, null, {id: orderId, productId: productId, timestamp: timestamp});
            }else{
                utils.invokeCallback(cb);
            }
        }
    });
};