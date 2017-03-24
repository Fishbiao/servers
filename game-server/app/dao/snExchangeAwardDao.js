/**
 * Created by kilua on 2015-06-11.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../mylib/utils/lib/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (dbClient, playerId, awardId, cb) {
    var sql = 'SELECT * FROM SnExchangeAwardHistory WHERE playerId = ? AND awardId = ?',
        args = [playerId, awardId];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, null);
        } else {
            if(!!res && res.length === 1){
                utils.invokeCallback(cb, null, res[0]);
            }else {
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

dao.save = function(dbClient, playerId, awardId, cnt, cb){
    var sql = 'INSERT INTO SnExchangeAwardHistory(playerId,awardId,cnt) VALUES(?,?,?) ON DUPLICATE KEY UPDATE cnt=VALUES(cnt)',
        args = [playerId, awardId, cnt];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('save err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('save failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};