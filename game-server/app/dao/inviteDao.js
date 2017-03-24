/**
 * Created by cxy on 2015/9/7.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    async = require('async'),
    _ = require('underscore');

var utils = require('../../mylib/utils/lib/utils');
    // passedBarrierDao = require('./passedBarrierDao'),
    // cardDao = require('./cardDao'),
    // historyCardDao = require('./historyCardDao'),
    // sessionInfoDao = require('./sessionInfoDao'),
    // guidePrizeDao = require('./guidePrizeDao'),
    // expItemBagDao = require('./expItemBagDao'),
    // materialBagDao = require('./materialBagDao'),
    // sweepBagDao = require('./sweepBagDao'),
    // cardFragDao = require('./cardFragDao'),
    // Consts = require('../consts'),
    // PVPTargetsDao = require('./PVPTargetsDao'),
    // notDrawStarAwardDao = require('./notDrawStarAwardDao'),
    // rankViewDao = require('./rankViewDao'),
    // cardConfigDao = require('./cardConfigDao'),
    // dailyMissionDao = require('./dailyMissionDao'),
    // equipBagDao = require('./equipBagDao'),
    // crazyMinerDao = require('./crazyMinerDao'),
    // runningLordDao = require('./runningLordDao'),
    // diamondHunterDao = require('./diamondHunterDao'),
    // magicianDao = require('./magicianDao'),
    // dataParser = require('../utils/dataParser'),
    // activityDao = require('./activityDao'),
    // athleticsDao = require('./athleticsDao'),
    // exploreEventDao = require('./exploreEventDao');

var inviteDao = module.exports;


/*
 *  获取邀请信息统计
 */
inviteDao.getPlayerInviteList = function(dbClient, inviteId, cb){
    var sql = 'SELECT id FROM Player WHERE inviteId=?;',
        args = [inviteId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('getPlayerInviteList err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, null);
        }else{
            if(!!res){
                utils.invokeCallback(cb, null, res);
            }else{
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

/*
 *  通过邀请码更新邀请人信息
 */
inviteDao.updatePlayerByInviteCode = function(dbClient, inviteCode, inviteMax, playerId, cb){
    var sql = 'CALL inviteIncrease(?, ?, ?);',
        args = [inviteCode, inviteMax, playerId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('getPlayerInviteList err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, null);
        }else{
            if(!!res){
                utils.invokeCallback(cb, null, res[0][0]);
            }else{
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

/*
 *  获取邀请玩家的对应等级的人数
 */
inviteDao.getInviteOtherLevel = function(dbClient, playerId, barrierId, cb){
    //原来的等级条件改成了通关关卡条件
    //'SELECT (COUNT(*))playerCount FROM Player WHERE inviteId=? AND level>=?;',
  //  var sql = 'SELECT COUNT(DISTINCT(id))playerCount FROM Player inner JOIN passedcampbarrier on Player.id=passedcampbarrier.playerId where Player.inviteId=? AND (passedcampbarrier.barrierId>? OR (passedcampbarrier.barrierId=? AND passedcampbarrier.star=1 ));',
  //      args = [playerId, level, level];
    //有时间请优化
    var sql = 'SELECT (COUNT(*))playerCount FROM passedBarrier WHERE playerId=? AND barrierId>=?;',
        args = [playerId, barrierId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            logger.error('getPlayerInviteList err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, null);
        }else{
            if(!!res && res.length>0){
                logger.debug('\n playerId = %s ,barrierId = %s , playerCount = %s \n ',playerId, barrierId,res[0].playerCount )
                utils.invokeCallback(cb, null, res[0].playerCount);
            }else{
                utils.invokeCallback(cb, null, 0);
            }
        }
    });
};

/*
 *  获取邀请玩家的对应钻石数的人数
 */
inviteDao.getInviteOtherCharge = function(dbClient, playerId, charge, cb){
    var sql = 'SELECT (COUNT(*))playerCount FROM Player WHERE inviteId=? AND buyGetDiamond>=?;',
        args = [playerId, charge];
    dbClient.query(sql, args, function(err, res){
        if(err){
            utils.invokeCallback(cb, err.message, null);
        }else{
            if(!!res && res.length>0){
                utils.invokeCallback(cb, null, res[0].playerCount);
            }else{
                utils.invokeCallback(cb, null, 0);
            }
        }
    });
};

/*
 *  获取邀请者的钻石数
 */
inviteDao.getInviteMeCharge = function(dbClient, inviteId, cb){
    var sql = 'SELECT vipDiamond FROM Player WHERE id=?;',
        args = [inviteId];
    dbClient.query(sql, args, function(err, res){
        if(err){
            utils.invokeCallback(cb, err.message, null);
        }else{
            if(!!res && res.length>0){
                utils.invokeCallback(cb, null, res[0].vipDiamond);
            }else{
                utils.invokeCallback(cb, null, 0);
            }
        }
    });
};
