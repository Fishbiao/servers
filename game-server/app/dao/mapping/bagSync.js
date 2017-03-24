/**
 * Created by employee11 on 2016/01/13.
 */
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

var bagSync = module.exports = {};

/* 删除物品*/
function remove(dbClient, itemData, cb){
    var sql = 'DELETE FROM bag WHERE playerId = ? AND pos = ?',
        args = [itemData.playerId, itemData.pos];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows === 1){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('remove failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

/*添加物品*/
function updateAndAdd(dbClient, itemData, cb){
    var sql = 'INSERT INTO bag(playerId,pos,itemId,itemCount) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE itemCount = VALUES(itemCount)',
        args = [itemData.playerId, itemData.pos, itemData.itemId, itemData.itemCount];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('updateAndAdd err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('updateAndAdd failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

/*
 *   更新数据，数量为0时删除
 * */
bagSync.save = function(dbClient, itemData, cb){
    if(itemData.itemCount > 0){
        updateAndAdd(dbClient, itemData, cb);
    }else{
        remove(dbClient, itemData, cb);
    }
};


//====================================================================================================================
/* 删除物品*/
function removeFragItem(dbClient, itemData, cb){
    var sql = 'DELETE FROM fragBag WHERE playerId = ? AND pos = ?',
        args = [itemData.playerId, itemData.pos];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('remove err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows === 1){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('remove failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

/*添加物品*/
function updateAndAddFragItem(dbClient, itemData, cb){
    var sql = 'INSERT INTO fragBag(playerId,pos,itemId,itemCount) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE itemCount = VALUES(itemCount)',
        args = [itemData.playerId, itemData.pos, itemData.itemId, itemData.itemCount];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('updateAndAdd err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                utils.invokeCallback(cb, null, true);
            }else{
                logger.debug('updateAndAdd failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
}

/*
 *   更新数据，数量为0时删除
 * */
bagSync.saveFragItem = function(dbClient, itemData, cb){
    if(itemData.itemCount > 0){
        updateAndAddFragItem(dbClient, itemData, cb);
    }else{
        removeFragItem(dbClient, itemData, cb);
    }
};



