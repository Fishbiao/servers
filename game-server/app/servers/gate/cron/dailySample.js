/**
 * Created by kilua on 2015-09-15.
 */

var util = require('util');
var  utils =  require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename),
    async = require('async'),
    _ = require('underscore');

//var statisticsDao = require('../../../dao/statisticsDao'),
//    dataApi = require('../../../util/dataApi'),
//    dataUtils = require('../../../util/dataUtils');

var Cron = function (app) {
    this.app = app;
};

module.exports = function (app) {
    return new Cron(app);
};

var pro = Cron.prototype;

var playerInfoList = {};
function getPlayerInfo(cb)
{
    statisticsDao.getPlayerAll(function(err,dbList){
        if (err)
        {
            cb(null, false);
        }
        else
        {
            playerInfoList = {};
            _.each(dbList,function(db){
                var playerId = db.id;
                playerInfoList[playerId] = db;
            });
        }
    });
};

function getPlayerData(playerId)
{
    return playerInfoList[playerId];
}
function makePlayerRemain(cb) {
    async.parallel([
        function (callback) {
            // 每日总用户数量
            statisticsDao.getTotalUser(callback);
        },
        function (callback) {
            // 每日新创角用户数量
            statisticsDao.getTodayCreatePlayerCnt(callback);
        },
        function (callback) {
            // 每日不重复登录数
            statisticsDao.getTodayEverLogonUser(callback);
        },
        function (callback) {
            statisticsDao.getTodayActiveUser(30, callback);
        },
        function (callback) {
            statisticsDao.getTodayNeverLogonUser(callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(1, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(2, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(3, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(4, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(5, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(6, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(7, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(13, callback);
        },
        function (callback) {
            statisticsDao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated(29, callback);
        }
    ], function (err, results) {
        if (err) {
            logger.info('static end error!');
            cb();
        } else {
            var report = {
                totalUser: results[0],
                createPlayer: results[1],
                everLogonTotal: results[2],
                activeUser: results[3],
                todayNeverLogonUser: results[4],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_1: results[5],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_2: results[6],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_3: results[7],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_4: results[8],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_5: results[9],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_6: results[10],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_7: results[11],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_15: results[12],
                todayEverLogonBaseOnNumOfDaysBeforeCreated_30: results[13]
            };
            // 入库
            statisticsDao.persist(report, Date.now(), function (err, success) {
                logger.info('makePlayerRemain %s', (err || !success) ? 'fail' : 'ok');
                cb();
            });
        }
    });
}

function getDateStr(tick) {
    var curTime = new Date(tick);
    return util.format('%s-%s', curTime.getMonth() + 1, curTime.getDate());
}

function makeFightHeroStatistics(cb) {
    statisticsDao.makeFightHeroCountDict(30, function (err, success) {
        if (err) {
            logger.info('makeFightHeroStatistics makeFightHeroCountDict error!');
        } else {
            if (!success) {
                logger.info('makeFightHeroStatistics makeFightHeroCountDict failed!');
                return cb();
            }
            //statisticsDao.getTotalUser(function (err, total) {
            //    if (err) {
            //        cb();
            //    } else {
                    statisticsDao.getFightHeroCountDict(function (err, dict) {
                        if (err) {
                            logger.info('makeFightHeroStatistics getFightHeroCountDict error occurs!');
                            cb()
                        } else {
                            var allHeroes = dataApi.HeroAttribute.all() || {},
                                cols = [getDateStr(Date.now())],
                                total = _.reduce(dict, function(memo, count){ return memo + count; }, 0);
                            _.each(allHeroes, function (heroData) {
                                if (heroData.quality === 1) {
                                    cols.push((total ? (dict[heroData.heroId] || 0) / total : 0) * 100);
                                }
                            });
                            statisticsDao.saveFightHeroCountStatistics(cols, function (err, success) {
                                logger.info('saveFightHeroCountStatistics %s', (err || !success) ? 'fail' : 'ok');
                                cb();
                            });
                        }
                    });
                //}
            //});
        }
    });
}

function makePlayerDailyOnlineTimeSectionPercent(cb) {
    statisticsDao.getPlayerDailyOnlineTimeSectionPercent(function (err, dict) {
        if (err) {
            cb(null, false);
        } else {
            dict.date = getDateStr(Date.now());
            statisticsDao.savePlayerDailyOnlineTimeSectionPercent(dict, function (err, success) {
                if (err) {
                    cb(null, false);
                } else {
                    logger.info('makePlayerDailyOnlineTimeSectionPercent %s', (err || !success) ? 'fail' : 'ok');
                    cb(null, success);
                }
            });
        }
    });
}

function makeDailyLogonCountPercent(cb) {
    statisticsDao.getDailyLogonCountPercent(function (err, dict) {
        if (err) {
            cb(null, false);
        } else {
            dict.date = getDateStr(Date.now());
            statisticsDao.saveDailyLogonCountPercent(dict, function (err, success) {
                if (err) {
                    cb(null, false);
                } else {
                    logger.info('makeDailyLogonCountPercent %s', (err || !success) ? 'fail' : 'ok');
                    cb(null, success);
                }
            });
        }
    });
}

function makeGuideAchievementPercent(cb) {
    statisticsDao.getTotalUser(function (err, total) {
        if (err) {
            cb(null, false);
        } else {
            statisticsDao.getGuideAchievement(function (err, dict) {
                if (err) {
                    cb(null, false);
                } else {
                    var allGuides = dataApi.Guide.all() || {},
                        cols = [getDateStr(Date.now())];
                    _.each(allGuides, function (guideData) {
                        cols.push((total ? (dict[guideData.id] || 0) / total : 0) * 100);
                    });
                    statisticsDao.saveGuideAchievementPercent(cols, function (err, success) {
                        if (err) {
                            cb(null, false);
                        } else {
                            logger.info('makeGuideAchievementPercent %s', (err || !success) ? 'fail' : 'ok');
                            cb(null, success);
                        }
                    });
                }
            });
        }
    });
}

function makeLossLevelPercent(cb) {
    statisticsDao.makeLossLevelPercent(function (err, dict) {
        if (err) {
            cb(null, false);
        } else {
            //logger.debug('makeLossLevelPercent dict = %j', dict);
            var cols = [getDateStr(Date.now())];
            _.range(1, 201).forEach(function (level) {
                cols.push(dict[level] || 0);
            });
            statisticsDao.saveLossLevelPercent(cols, function (err, success) {
                if (err) {
                    cb(null, false);
                } else {
                    logger.info('makeLossLevelPercent %s', (err || !success) ? 'fail' : 'ok');
                    cb(null, success);
                }
            });
        }
    });
};
/*
* 无尽单人记录
 */
function  makeEndlessSingleReport(cb){
    statisticsDao.getEndlessSingleReport(function(err,dbList){
        if (err)
        {
            cb(null, false);
        }
        else
        {
            var currTime = Date.now();
            _.each( dbList , function(db){

                if( utils.getDataString(currTime) != db.date )
                {
                    return;
                }

                var saveTemp = {};
                saveTemp.playerId = db.playerId;
                var playerData = getPlayerData(db.playerId);
                if(!playerData)
                {
                    return;
                }

                saveTemp.registerTime = utils.getDataString(playerData.createTime);
                saveTemp.date = db.date;
                saveTemp.playerName = playerData.playername;
                var endlessInfo = JSON.parse(db.endlessInfo);
                _.each(endlessInfo,function(dbInfo,tempType){
                    saveTemp.type = Number(tempType);
                    saveTemp.cnt = dbInfo.cnt;
                    saveTemp.winCnt = dbInfo.winCnt;
                    statisticsDao.saveEndless(saveTemp,function(err,success){
                        if (err) {

                        } else {
                            logger.info('saveEndless %s', (err || !success) ? 'fail' : 'ok');
                        }
                    });
                });
            });
            cb(null, true);
        }
    });
}
/*无尽关卡记录
 */
function  makeEndlessReport(cb){
    statisticsDao.getEndlessAllReport(function(err,dict){
        if (err) {
            cb(null, false);
        } else {

            var listPlayerData = {};
            var currTime = Date.now();
            //计算数据
            _.each(dict,function(data){
                //是否为今天
               if( utils.isSameDay(currTime,data.recTime) )
               {
                   var playerId = data.playerId;
                   if( !listPlayerData[playerId] )
                   {
                       listPlayerData[playerId] = {};
                   }
                   if( !listPlayerData[playerId][data.occasionId] )
                   {
                       listPlayerData[playerId][data.occasionId] = {};
                       listPlayerData[playerId][data.occasionId].cnt = 0;
                       listPlayerData[playerId][data.occasionId].winCnt = 0;
                       listPlayerData[playerId][data.occasionId].playerId = playerId;
                   }

                   listPlayerData[playerId][data.occasionId].cnt+=1;
                   if(data.result==1)
                   {
                       listPlayerData[playerId][data.occasionId].winCnt+=1;
                   }
               }
            });

            //写数据到数据库
            _.each(listPlayerData,function(data,tempPlayerId){
                var playerId = Number(tempPlayerId);
                var playerData = getPlayerData(playerId);
                if(!playerData){
                    return;
                }
                _.each(data,function(values,tempType){
                    var saveTemp = {};
                    saveTemp.playerId = playerId;
                    saveTemp.type = Number(tempType);
                    saveTemp.cnt = values.cnt;
                    saveTemp.winCnt = values.winCnt;
                    saveTemp.registerTime = utils.getDataString(playerData.createTime);
                    saveTemp.playerName = playerData.playername;
                    saveTemp.date = utils.getDataString(currTime);

                    statisticsDao.saveEndless(saveTemp,function(err,success){
                        if (err) {

                        } else {
                            logger.info('saveEndless %s', (err || !success) ? 'fail' : 'ok');
                        }
                    });

                });
            })

            cb(null, true);
        }
    });
};

/*日常任务活跃值统计
 */
function makeDailyTaskActiveValue(cb)
{
    statisticsDao.getDailyOthersAll(function(err,dbList){
        if (err)
        {
            cb(null, false);
        }
        else
        {
            var currTime = Date.now();
            _.each(dbList,function(db){
                var playerData = getPlayerData(db.playerId);
                if( utils.getDataString(currTime) != db.date )
                {
                    return;
                }
                if( !!playerData )
                {
                    var temp = {};
                    temp.playerId = db.playerId;
                    temp.date = db.date;
                    temp.registerTime = utils.getDataString(playerData.createTime);
                    temp.playerName = playerData.playername;
                    if( db.taskActiveValue>0 )
                    {
                        temp.dailyTaskActiveValue = db.taskActiveValue;
                        statisticsDao.saveDailyTaskActiveValue(temp,function(err,success){
                            if (err) {

                            } else {
                                logger.info('saveDailyTaskActiveValue %s', (err || !success) ? 'fail' : 'ok');
                            }
                        });
                    }
                    temp.getComPoint = db.getComPoint;
                    temp.useComPoint = db.useComPoint;
                    statisticsDao.saveDailyComPoint(temp,function(err,success){});
                }
            })
            cb(null, true);
        }
    })
}

//关卡统计
function makeBarrier(cb)
{
    statisticsDao.getBarrierAll(function(err,dbList){
        if ( err )
        {
            cb(null, false);
        }
        else
        {
            var barrierData = {};
            var currTime = Date.now();
            _.each(dbList,function(db){
                //精英、普通
                var playerId = db.playerId;
                var playerData = getPlayerData(playerId);
                if(!playerData)
                {
                    return;
                }

                var barrierId =  db.barrierId;
                var type =dataUtils.getChapterDiffTypeByBarrierId(barrierId);

                if( !type )
                {
                    return;
                }
                var chapterNo = dataUtils.getChapterIdByBarrierId(barrierId);

                if( chapterNo<=0 )
                {
                    return;
                }

                var star = db.star;

                if( !barrierData[playerId])
                {
                    barrierData[playerId] = {};
                    barrierData[playerId]["typeNewBarrierId1"] = 0;
                    barrierData[playerId]["typeNewBarrierId2"] = 0;

                    var i = 1;
                    for(i;i<=8;i++)
                    {
                        var chapterNoIndex = 'chapterStarCnt'+i;
                        barrierData[playerId][chapterNoIndex] = 0;
                    }
                }
                var typeIndx = 'typeNewBarrierId' + type;
                if(barrierData[playerId][typeIndx] < barrierId )
                {
                    barrierData[playerId][typeIndx] = barrierId;
                }
                var chapterNoIndex = 'chapterStarCnt'+chapterNo;
                if( star > 0 )
                {
                    barrierData[playerId][chapterNoIndex] += star;
                }
            });

            var temp = {};
            temp.date =  utils.getDataString(currTime);

            _.each(barrierData,function( barrierInfo,playerIdTemp ){
                temp.playerId = Number(playerIdTemp);
                var playerData = getPlayerData(temp.playerId);
                temp.playerName = playerData.playername;
                temp.registerTime=  utils.getDataString(playerData.createTime);
                temp.type = 1;
                temp.newBarrierId = barrierInfo.typeNewBarrierId1;
                if(  temp.newBarrierId > 0 )
                {
                    statisticsDao.saveNewBarrierId(temp, function (err, success) {
                    });
                }
                temp.type = 2;
                temp.newBarrierId = barrierInfo.typeNewBarrierId2;
                if(  temp.newBarrierId > 0 )
                {
                    statisticsDao.saveNewBarrierId(temp,function(err,success){});
                }
                statisticsDao.saveDailyChapterStarCnt(temp,barrierInfo,function(err,success){});

            })
            cb(null, true);
        }
    });
};

function  makeArmEquipFull(cb)
{
    statisticsDao.getArmEquipFull(function(err,dbList){
        if ( err )
        {
            cb(null, false);
        }
        else
        {
            _.each(dbList,function(db){
                var playerData = getPlayerData(db.playerId);
                if( !playerData )
                {
                    return;
                }
                var temp = {};
                temp.playerId = db.playerId;
                temp.registerTime = utils.getDataString(playerData.createTime);
                temp.playerName = playerData.playername;
                var tempTime  = db.date - playerData.createTime;
                // 单位为分
                tempTime = tempTime * 0.001 / 60.0;
                var hour = Math.floor( tempTime / 60 );
                var min =  Math.floor( tempTime % 60 ) ;
                temp.finshTime = hour + ':'+min;
                statisticsDao.saveArmEquipFull(temp,function(err,success){});
            });
            cb(null, true);
        }
    });
}
/*
* 精炼次数统计
* 统计每个玩家每天（从0点~24点）进行了几次的精炼，在次数重置之前要统计到，否则会被重置掉。统计内容如下
 */
function  makeDailyEquip(cb)
{
    statisticsDao.getDailyEquip(function(err,dbList){
        if ( err )
        {
            cb(null, false);
        }
        else
        {
            var currTime = Date.now();
            _.each(dbList,function(db){
                var playerData = getPlayerData(db.playerId);
                if( !playerData )
                {
                    return;
                }
                if(db.date ==  utils.getDataString( currTime ))
                {
                    var temp = {};
                    temp.playerId = db.playerId;
                    temp.registerTime = utils.getDataString( playerData.createTime );
                    temp.date = db.date;
                    temp.playerName = playerData.playername;


                    temp.cnt = db.dailyRefineCnt;
                    statisticsDao.saveDailyRefineCnt(temp,function(err,success){});

                    //统计每个玩家每天各个装备位的精炼情况，24点的时候统计：
                    if(!!db.equipLvInfo)
                    {
                        var equipLvInfo = JSON.parse(db.equipLvInfo);
                        _.each(equipLvInfo,function(dblvTemp,posTemp){
                            var posIndex = 'pos'+ (Number(posTemp)+1)
                            temp[posIndex] = dblvTemp;
                        });

                        statisticsDao.saveDailyRefineLv(temp,function(err,success){});
                    }

                    //统计每个玩家每天各个装备位的觉醒情况：
                    if(!!db.awakeLvInfo)
                    {
                        var awakeLvInfo = JSON.parse(db.awakeLvInfo);

                        _.each(awakeLvInfo,function(dblvTemp,posTemp){
                            var posIndex = 'pos'+ (Number(posTemp)+1)
                            temp[posIndex] = dblvTemp;
                        });

                        statisticsDao.saveDailyAwakeLv(temp,function(err,success){});
                    }
                }
            });
            cb(null, true);
        }
    });
};

function  makeDailyUseDiamond(cb)
{
    statisticsDao.getDailyUseDiamond( function(err,dbList){
        if ( err )
        {
            cb(null, false);
        }
        else
        {
            var currTime = Date.now();
            _.each(dbList,function(db){
                var playerData = getPlayerData(db.playerId);
                if( !playerData )
                {
                    return;
                }
                if(db.date ==  utils.getDataString( currTime ))
                {
                    var temp = {};
                    temp.playerId = db.playerId;
                    temp.date = db.date;
                    temp.playerName = playerData.playername;
                    temp.useWay = db.useWay;
                    temp.useDiamond =  db.useDiamond;
                    temp.surplusDiamond =  db.surplusDiamond;
                    var d = new Date(db.time);
                    temp.time = d.toLocaleTimeString();
                    statisticsDao.saveDailyUseDiamond(temp,function(err,success){});
                }
            });

            cb(null, true);
        }
    });
};

pro.sample = function () {
    logger.debug('sample begin time = %s', new Date().toTimeString());
    async.parallel([function(callback){
        getPlayerInfo(callback);
    },function (callback) {
        makePlayerRemain(callback);
    }, function (callback) {
        makeFightHeroStatistics(callback);
    }, function (callback) {
        makePlayerDailyOnlineTimeSectionPercent(callback);
    }, function (callback) {
        makeDailyLogonCountPercent(callback);
    }, function (callback) {
        makeGuideAchievementPercent(callback);
    }, function (callback) {
        makeLossLevelPercent(callback);
    },function (callback) {
        makeEndlessSingleReport(callback);
    },function(callback){
        makeEndlessReport(callback);
    },function(callback){
        makeDailyTaskActiveValue(callback);
    },function(callback){
        makeArmEquipFull(callback);
    },function(callback){
        makeDailyEquip(callback);
    },function(callback){
        makeDailyUseDiamond(callback);
    },function(callback){
        makeBarrier(callback);
    }
    ], function () {
        logger.info('sample end!');
    });
};