/**
 * Created by tony on 2017/2/25.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (dbClient, saveData, cb) {
    var sql = 'INSERT INTO barrierRandBoss(playerId,barrierId,coolTime,createTime,currHp,randomBossId,atkCnt) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE barrierId = VALUES(barrierId), coolTime = VALUES(coolTime),createTime = VALUES(createTime), currHp = VALUES(currHp), randomBossId = VALUES(randomBossId), atkCnt = VALUES(atkCnt) ',
        args = [saveData.playerId, saveData.barrierId, saveData.coolTime, saveData.createTime, saveData.currHp, saveData.randomBossId, saveData.atkCnt];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('barrierRandBoss err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('barrierRandBoss failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};