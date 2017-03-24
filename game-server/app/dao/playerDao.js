/**
 * Created by lishaoshen on 2015/10/12.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo'),
    async = require('async');

var Player = require('../domain/entity/player'),
    utils = require('../util/utils'),



    bagDao = require('./bagDao'),
    heroBagDao = require('./heroBagDao'),
    petBagDao = require('./petBagDao'),
    passedBarrierDao = require('./passedBarrierDao'),
    unlockChapterDao = require('./unlockChapterDao'),
    hasBuyHeroDao = require('./hasBuyHeroDao'),
    dataUtils = require('../util/dataUtils'),
    Consts = require('../consts/consts'),
    guidePrizeDao = require('./guidePrizeDao'),
    clientSaveDao = require('./clientSaveDao'),
    playerShopDao = require('./playerShopDao'),
    playerActivityDao = require('./playerActivityDao'),
    equipBagDao = require('./equipBagDao'),
    equipConfDao = require('./equipConfDao'),
    endlessBuffDao = require('./endlessBuffDao'),
    endlessOccasionDao = require('./endlessOccasionDao'),
    wakeUpBagDao = require('./wakeUpBagDao'),
    equipWashDao = require('./equipWashDao'),
    equipAchievedDao = require('./equipAchievedDao'),
    orderListDao =  require('./orderListDao'),
    missionDao = require('./missionDao'),
    randBossDao = require('./randBossDao'),
    randomShopDao = require('./randomShopDao'),
    statisticsDao = require('./statisticsDao'),
    randBossRecordDao = require('./randBossRecordDao');

var playerDao = module.exports;

/**
 * Get player by MAC
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
playerDao.getPlayersByUid = function (uid, cb) {
    var sql = 'select * from player where MAC = ?';
    var args = [uid];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, err.message, null);
            return;
        }
        if (!res || res.length <= 0) {
            logger.info('getPlayersByUid no player found!uid = %s', uid);
            return utils.invokeCallback(cb, null, null);
        } else {
            utils.invokeCallback(cb, null, {id:res[0].id}/*new Player(res[0])*/);
        }
    });
};

/**
 * Get player by playerId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
playerDao.getPlayersById = function (playerId, cb) {
    var sql = 'select * from player where id = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, null, err.message, null);
            return;
        }
        if (!res || res.length <= 0) {
            utils.invokeCallback(cb, null, []);
        } else {
            utils.invokeCallback(cb, null, res[0]);
        }
    });
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
playerDao.getPlayerByName = function (name, cb) {
    var sql = 'select * from player where playername = ?';
    var args = [name];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            utils.invokeCallback(cb, null, null);
        } else {
            utils.invokeCallback(cb, null, new Player(res[0]));
        }
    });
};

/*
 *   创角角色
 * */
playerDao.createPlayer = function (uid, name, pwd, picId, cb) {
    var sql = 'insert into player (MAC,password,playername,headPicId,createTime,roleLevel,exp,VIPLevel,diamondCnt,goldCnt,totalRechargeNum,' +
            'energy,dispatchEnergyTime,canBuyHeroList,rechargeTotal,fristRechargeAwardTime,setNameCnt,buyGetDiamond,endlessSingleOldWave,endlessAddEffect,' +
            'bronzeCoin,silverCoin,goldCoin,randRefreshCoin,challengeTicket,snatchSingleCnt,weekCardEndTick,monthCardEndTick,foreverCardEndTick,weekCardWelfareTick,monthCardWelfareTick,foreverCardWelfareTick, '+
            'barrierPromoteDropIds,barrierPromoteEndTick)' +
            ' values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        initDiamond = dataUtils.getOptionValue(Consts.CONFIG.INIT_DIAMOND, 0),
        initGold = dataUtils.getOptionValue(Consts.CONFIG.INIT_GOLD, 0),
        initEnergy = dataUtils.getOptionValue(Consts.CONFIG.INIT_ENERGY, 0),
        now = Date.now(),
        args = [uid, pwd, name, picId, now, 1, 0, 0, initDiamond, initGold, 0, initEnergy, now,JSON.stringify([]),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,JSON.stringify([]),0];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            logger.error('create player failed! ' + err.message);
            logger.error(err);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res.insertId);
        }
    });
};

/*
 *   删除角色
 * */
playerDao.deletePlayer = function (playerId, cb) {
    var sql = 'delete from player where id = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.affectedRows > 0) {
                utils.invokeCallback(cb, null, true);
            } else {
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};

playerDao.getPlayerAllInfo = function (playerId, cb) {
    async.parallel([
            function (callback) {
                playerDao.getPlayersById(playerId, callback);
            }/*,
            function (callback) {
                heroBagDao.getHeroBagByPlayerId(playerId, callback);
            },
            function (callback) {
                petBagDao.getPetBagByPlayerId(playerId, callback);
            }, function (callback) {
                passedBarrierDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                bagDao.getItemByPlayerId(playerId, callback);
            }, function (callback) {
                unlockChapterDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                hasBuyHeroDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                guidePrizeDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                clientSaveDao.load(playerId, callback);
            }, function (callback) {
                playerShopDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                playerActivityDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                equipBagDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                equipConfDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                endlessBuffDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                endlessOccasionDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                wakeUpBagDao.getByPlayerId(playerId, callback);
            }, function (callback) {
                equipWashDao.getByPlayerId(playerId, callback);
            },function (callback) {
                equipAchievedDao.getByPlayerId(playerId, callback);
            },function (callback) {
                orderListDao.getByPlayerId(playerId, callback);
            },function(callback){
                missionDao.getByPlayerId(playerId,callback);
            },function(callback){
                statisticsDao.getByPlayerId(playerId,callback);
            },function(callback){
                randBossDao.getByPlayerId(playerId,callback);
            },function(callback){
                randomShopDao.getByPlayerId(playerId,callback);
            },function(callback){
                bagDao.getFragItemByPlayerId(playerId,callback);
            },function(callback){
                randBossRecordDao.getRecordByPlayerId(playerId,callback);
            }*/
        ],
        function (err, results) {
            var allInfo = {};
            allInfo.player = results[0];
            /*allInfo.heroBag = results[1];
            allInfo.petBag = results[2];
            allInfo.passedBarrier = results[3];
            allInfo.bagData = results[4];
            allInfo.unlockChapter = results[5];
            allInfo.hasBuyHeroIds = results[6];
            allInfo.guideIds = results[7];
            allInfo.clientSaveData = results[8];
            allInfo.shopInfo = results[9];
            allInfo.activityList = results[10];
            allInfo.equipBag = results[11];
            allInfo.equipConf = results[12];
            allInfo.buffs = results[13];
            allInfo.occasions = results[14];
            allInfo.wakeUpBag = results[15];
            allInfo.washData =  results[16];
            allInfo.equipAchievedList =  results[17];
            allInfo.orderList =  results[18];
            allInfo.missionList = results[19];
            allInfo.dataStatisticList = results[20];
            allInfo.barrierRandBoss = results[21];
            allInfo.randomShopInfo = results[22];
            allInfo.fragBag = results[23];
            allInfo.randBossRecord = results[24];*/
            if (!!err) {
                utils.invokeCallback(cb, err.message);
            } else {
                utils.invokeCallback(cb, null, allInfo);
            }
        });
};

playerDao.onUserLogon = function (playerId, cb) {
    var sql = 'CALL onUserLogon(?,?)';
    pomelo.app.get('dbclient').query(sql, [playerId, Date.now()], function (err, res) {
        if (!!err) {
            logger.error('onUserLogon err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
};

function clearOnline(cb) {
    var sql = 'UPDATE player SET isOnline = 0 ';
    pomelo.app.get('dbclient').query(sql, [], function (err) {
        if (!!err) {
            logger.error('clearOnline err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

playerDao.clearCache = function (cb) {
    async.parallel(
        [
            function (callback) {
                clearOnline(callback);
            }
        ],
        function (err, results) {
            if (err) {
                utils.invokeCallback(cb, null, false);
            } else {
                var result = _.every(results);
                utils.invokeCallback(cb, null, result);
            }
        }
    );
};

playerDao.playerLogoff = function (playerId, cb) {
    var sql = 'UPDATE player SET isOnline = ?,logoffTime = ? where id = ?';
    var args = [0, Date.now(), playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err) {
        if (!!err) {
            logger.error('playerLogoff err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
};


playerDao.playerExistByName = function ( name, cb ) {
    var sql = 'SELECT COUNT(*) AS count FROM player WHERE playername = ?',
        args = [name];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('playerExistByName err = %s, args = %s', err.stack, args);
            utils.invokeCallback(cb, err.message, true);
        } else {
            if (!!res && res.length === 1) {
                utils.invokeCallback(cb, null, (res[0].count > 0));
            } else {
                utils.invokeCallback(cb, null, true);
            }
        }
    });
};

/*
 *   创建角色名
 * */
playerDao.createPlayerName = function ( playerId, name, cb) {
    var sql = 'UPDATE player SET playername = ? WHERE id = ?',
        args = [name, playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            // 可能重名
            logger.debug('createPlayerName err = %s,args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows === 1) {
                utils.invokeCallback(cb, null, true);
            } else {
                logger.debug('createPlayerName failed!args = %j', args);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};
