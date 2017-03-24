/**
 * Created by kilua on 2015-06-11.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../mylib/utils/lib/utils');

var dao = module.exports = {};

dao.everUsed = function (dbClient, playerId, sn, cb) {
    var sql = 'SELECT * FROM SnHistory WHERE playerId = ? AND sn = ?',
        args = [playerId, sn];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('everUsed err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, true);
        } else {
            if(!!res && res.length > 0) {
                utils.invokeCallback(cb, null, true);
            }else{
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

dao.record = function(dbClient, playerId, sn, cb){
    var sql = 'INSERT INTO SnHistory(sn,playerId) VALUES(?,?)',
        args = [sn, playerId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('record err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows === 1){
                utils.invokeCallback(cb, null, true);
            }else{
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};