/**
 * Created by tony on 2017/2/28.
 */
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (dbClient, saveData, cb) {
    var sql = 'INSERT INTO randomShop(playerId, createTime,closeTime , goodsDataList , refreshCnt ,progress , historyCnt, shopId) VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE createTime = VALUES(createTime), closeTime = VALUES(closeTime),goodsDataList = VALUES(goodsDataList), refreshCnt = VALUES(refreshCnt) , progress = VALUES(progress) , historyCnt = VALUES(historyCnt) ,shopId = VALUES(shopId)',
        args = [saveData.playerId, saveData.createTime, saveData.closeTime, saveData.goodsDataList, saveData.refreshCnt,saveData.progress,saveData.historyCnt,saveData.shopId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('randomShop err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res ){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('randomShop failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};