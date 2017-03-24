/**
 * Created by kilua on 2015-09-15.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo'),
    _ = require('underscore'),
    async = require('async');

var utils = require('../util/utils');

var dao = module.exports = {};

/*
 *   采样在线人数
 * */
dao.getOnlineTotal = function (dbClient, cb) {
    var sql = 'SELECT COUNT(*) AS count FROM User WHERE isOnline = 1';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getOnlineTotal err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0) {
                cb(null, res[0].count);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   保存在线人数
 * */
dao.saveOnlineTotal = function (dbClient, total, cb) {
    var sql = 'INSERT INTO OnlineUser(count, sampleTime) VALUES(?,?)',
        args = [total, Date.now()];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('saveOnlineTotal err = %s', err.stack);
            cb(err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
};

/*
 *   总用户数
 * */
dao.getTotalUser = function (cb) {
    var sql = 'SELECT COUNT(*) AS total FROM player';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTotalUser err = %s', err.stack);
            cb(err.message, 0);
        } else {
            cb(null, (!!res && res.length > 0 && res[0].total) || 0);
        }
    });
};

dao.getTodayCreatePlayerCnt = function (cb) {
    var sql = 'SELECT COUNT(*) AS total FROM player WHERE createTime > UNIX_TIMESTAMP(CURDATE()) * 1000;';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayCreatePlayerCnt err = %s', err.stack);
            cb(err.message, 0);
        } else {
            cb(null, (!!res && res.length > 0 && res[0].total) || 0);
        }
    });
};

dao.getTodayEverLogonBaseOnNumOfDaysBeforeCreated = function (daysBefore, cb) {
    var sql = 'CALL getTodayEverLogonBaseOnNumOfDaysBeforeCreated(?)',
        args = [daysBefore];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayEverLogonBaseOnNumOfDaysBeforeCreated err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            //logger.debug('getTodayEverLogonBaseOnNumOfDaysBeforeCreated res = %j', res);
            if (!!res && res[0] && res[0][0]) {
                cb(null, res[0][0].percent || 0);
            } else {
                logger.warn('getTodayEverLogonBaseOnNumOfDaysBeforeCreated failed!args = %j', args);
                cb(null, 0);
            }
        }
    });
};

dao.getTodayActiveUser = function (onlineMin, cb) {
    var sql = 'CALL getTodayActiveUser(?)',
        args = [onlineMin];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayActiveUser err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res[0] && res[0][0]) {
                cb(null, res[0][0].activeCnt);
            } else {
                logger.warn('getTodayActiveUser failed!');
                cb(null, 0);
            }
        }
    });
};

/*
 *   获取本日未上线用户数
 * */
dao.getTodayNeverLogonUser = function (cb) {
    var sql = 'SELECT COUNT(*) AS total FROM player WHERE isOnline = 0 AND logonTime < UNIX_TIMESTAMP(CURDATE()) * 1000';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayNeverLogonUser err = %s', err.stack);
            cb(err.message, 0);
        } else {
            cb(null, (!!res && !!res[0] && res[0].total) || 0);
        }
    });
};
/*
 *   当日注册并充值人数
 * */
dao.getTodayCreatedAndChargeUser = function (dbClient, cb) {
    var sql = 'CALL getTodayCreatedAndChargeUser()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayCreatedAndChargeUser err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].count);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日注册并充值金额
 * */
dao.getTodayCreatedUserChargeTotal = function (dbClient, cb) {
    var sql = 'CALL getTodayCreatedUserChargeTotal()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayCreatedUserChargeTotal err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].chargeTotal || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日充值人数，包括旧用户和当日注册的用户
 * */
dao.getTodayEverChargeTotal = function (dbClient, cb) {
    var sql = 'CALL getTodayEverChargeTotal()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayEverChargeTotal err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].count);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日充值总额
 * */
dao.getTodayChargeTotalMoney = function (dbClient, cb) {
    var sql = 'CALL getTodayChargeTotalMoney()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayChargeTotalMoney err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].chargeTotal || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   新增首充总额
 * */
dao.getTodayCreatedFirstChargeTotalAmount = function (dbClient, cb) {
    var sql = 'CALL getTodayCreatedFirstChargeTotalAmount()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayCreatedFirstChargeTotalAmount err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].firstChargeTotal || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日充值总次数
 * */
dao.getTodayChargeTotalCount = function (dbClient, cb) {
    var sql = 'CALL getTodayChargeTotalCount()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            logger.error('getTodayChargeTotalCount err = %s', err.stack);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0 && res[0].length > 0 && res[0][0]) {
                cb(null, res[0][0].chargeTotalCount || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日0点的tick
 * */
function getCurDate() {
    return new Date().setHours(0, 0, 0, 0);
}

/*
 *   当日最高在线
 * */
dao.getTodayHighOnline = function (dbClient, cb) {
    var sql = 'SELECT MAX(count) AS high FROM OnlineUser WHERE sampleTime > ?',
        args = [getCurDate()];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayHighOnline err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0) {
                cb(null, res[0].high || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日平均在线
 * */
dao.getTodayAvgOnline = function (dbClient, cb) {
    var sql = 'SELECT AVG(count) AS avgCnt FROM OnlineUser WHERE sampleTime > ?',
        args = [getCurDate()];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayAvgOnline err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0) {
                cb(null, res[0].avgCnt || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   当日活跃并充值金额
 * */
dao.getTodayActiveUserChargeTotalMoney = function (dbClient, onlineTimeMin, cb) {
    var sql = 'SELECT SUM(dailyChargeTotal) AS chargeTotal FROM User WHERE dailyOnlineTime > ? AND lastChargeTime > ?',
        args = [onlineTimeMin * 60 * 1000, getCurDate()];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayActiveUserChargeTotalMoney err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res.length > 0) {
                cb(null, res[0].chargeTotal || 0);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   在线时长人数统计
 *   @param {Number} minOnlineMin    最小在线时长，分钟
 *   @param {Number} maxOnlineMin    最大在线时长，分钟
 **/
dao.getOnlineTimeStatistics = function (dbClient, minOnlineMin, maxOnlineMin, cb) {
    var sql = 'SELECT COUNT(*) AS count FROM User WHERE dailyOnlineTime >= ? AND dailyOnlineTime <= ? AND logonTime > ?',
        args = [minOnlineMin * 60 * 1000, maxOnlineMin * 60 * 1000, new Date().setHours(0, 0, 0, 0)];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getOnlineTimeStatistics err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res.length === 1) {
                return cb(null, res[0].count);
            } else {
                return cb(null, 0);
            }
        }
    });
};

/*
 *   当日登录人数，忽略前一天登录且尚未下线的号，近似当日不重复登录数
 * */
dao.getTodayEverLogonUser = function (cb) {
    var sql = 'SELECT COUNT(*) AS total FROM player WHERE logonTime > UNIX_TIMESTAMP(CURDATE()) * 1000';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        logger.debug(' /n/n/n/ 数据采集 getTodayEverLogonUser %s ',res);
        if (err) {
            logger.error('getTodayEverLogonUser err = %s', err.stack);
            cb(err.message, 0);
        } else {
            cb(null, (!!res && res[0] && res[0].total) || 0);
        }
    });
};

/*
 *   查询基于前几日登录过的用户的今日未登录人数，用来做当日流失
 * */
dao.getTodayNeverLogonBaseOnNumOfDaysBeforeEverLogonUsers = function (dbClient, daysBefore, cb) {
    var sql = 'CALL getTodayNeverLogonBaseOnNumOfDaysBeforeEverLogonUsers(?)',
        args = [daysBefore];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayNeverLogonBaseOnNumOfDaysBeforeEverLogonUsers err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res[0] && res[0][0]) {
                cb(null, res[0][0]['count']);
            } else {
                cb(null, 0);
            }
        }
    });
};

/*
 *   查询基于前几日登录过的用户的今日未登录人数，用来做当日流失
 * */
dao.getTodayLossChargeUsers = function (dbClient, daysBefore, cb) {
    var sql = 'CALL getTodayLossChargeUsers(?)',
        args = [daysBefore];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            logger.error('getTodayLossChargeUsers err = %s, args = %j', err.stack, args);
            cb(err.message, 0);
        } else {
            if (!!res && res[0] && res[0][0]) {
                cb(null, res[0][0]['count']);
            } else {
                cb(null, 0);
            }
        }
    });
};
/*
 *   当日注册ARPU，【当日注册并充值金额】/【当日注册人数】
 * */
function getTodayCreatedARPU(todayCreatedUserChargeTotal, todayCreatedUser) {
    if (!todayCreatedUser) {
        return 0;
    }
    return (todayCreatedUserChargeTotal / todayCreatedUser);
}

/*
 *   当日活跃ARPU，【当日活跃并充值金额】/【当日活跃人数】
 * */
function getTodayActiveARPU(todayActiveUserChargeTotalMoney, todayActiveUser) {
    if (!todayActiveUser) {
        return 0;
    }
    return (todayActiveUserChargeTotalMoney / todayActiveUser);
}

/*
 *   当日付费ARPU，【当日有付费总额】/【当日付费人数】
 * */
function getTodayARPU(chargeTotal, chargeUser) {
    if (!chargeUser) {
        return 0;
    }
    return (chargeTotal / chargeUser);
}

/*
 *   当日付费率,【当日付费人数】/【服务器总人数】
 * */
function getTodayChargePercent(chargeUser, totalUser) {
    if (!totalUser) {
        return 0;
    }
    return (chargeUser / totalUser);
}

/*
 *   使用开始统计时的时间来记录以防止统计完后到第二天了
 * */
dao.persist = function (rp, sampleTick, cb) {
    var sql = 'INSERT INTO DailyReport(sampleTick,totalUser,createPlayer,everLogonTotal,activeUser,todayNeverLogonUser,' +
            'todayEverLogonBaseOnNumOfDaysBeforeCreated_1,todayEverLogonBaseOnNumOfDaysBeforeCreated_2,' +
            'todayEverLogonBaseOnNumOfDaysBeforeCreated_3,todayEverLogonBaseOnNumOfDaysBeforeCreated_4,' +
            'todayEverLogonBaseOnNumOfDaysBeforeCreated_5,todayEverLogonBaseOnNumOfDaysBeforeCreated_6,' +
            'todayEverLogonBaseOnNumOfDaysBeforeCreated_7,todayEverLogonBaseOnNumOfDaysBeforeCreated_15,' +
            'todayEverLogonBaseOnNumOfDaysBeforeCreated_30) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        args = [sampleTick, rp.totalUser, rp.createPlayer, rp.everLogonTotal, rp.activeUser, rp.todayNeverLogonUser,
            rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_1, rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_2,
            rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_3, rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_4,
            rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_5, rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_6,
            rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_7, rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_15,
            rp.todayEverLogonBaseOnNumOfDaysBeforeCreated_30];
    // 入库
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('persist err = %s, report = %j', err.stack, rp);
            cb(err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
};

dao.makeFightHeroCountDict = function (minHeroLV, cb) {
    var sql = 'CALL getFightHeroCountDict(?)',
        args = [minHeroLV];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('makeFightHeroCountDict err = %s', err.stack);
            cb(err.message, false);
        } else {
            cb(null, true);
        }
    });
};

/*
 *   读取出战英雄数量字典
 * */
dao.getFightHeroCountDict = function (cb) {
    var sql = 'SELECT * FROM FightHeroDict WHERE 1';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getFightHeroCountDict err = %s', err.stack);
            cb(err.message, {});
        } else {
            var dict = {};
            res = res || [];
            res.forEach(function (row) {
                dict[row.heroId] = row.count;
            });
            cb(null, dict);
        }
    });
};

dao.saveFightHeroCountStatistics = function (cols, cb) {
    var sql = 'INSERT INTO FightHeroStatistics(date,heroId1,heroId2,heroId3,heroId4,heroId5,heroId6,heroId7,heroId8' +
        ',heroId9,heroId10,heroId11,heroId12,heroId13,heroId14,heroId15,heroId16,heroId17,heroId18,heroId19,heroId20,' +
        'heroId21,heroId22,heroId23,heroId24,heroId25,heroId26,heroId27,heroId28,heroId29,heroId30,heroId31,heroId32,' +
        'heroId33,heroId34,heroId35,heroId36,heroId37,heroId38,heroId39,heroId40,heroId41,heroId42,heroId43,heroId44,' +
        'heroId45,heroId46,heroId47,heroId48,heroId49,heroId50) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?' +
        ',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    // 自动补足列数
    if (cols.length < 51) {
        cols = cols.concat(_.times(51 - cols.length, function () {
            return 0;
        }));
    }
    // 自动删除多余的列数
    if (cols.length > 51) {
        cols = cols.slice(0, 51);
    }
    pomelo.app.get('statClient').query(sql, cols, function (err, res) {
        if (err) {
            logger.error('saveFightHeroCountStatistics err = %s, cols = %j', err.stack, cols);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

/*
 *   获取每日在线时长占比
 * */
dao.getPlayerDailyOnlineTimeSectionPercent = function (cb) {
    var sql = 'CALL getPlayerDailyOnlineTimeSectionPercent()';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getPlayerDailyOnlineTimeSectionPercent err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null, (!!res && !!res[0] && res[0][0]) || {});
        }
    });
};

/*
 *   保存每日在线时长占比
 * */
dao.savePlayerDailyOnlineTimeSectionPercent = function (dict, cb) {
    var sql = 'INSERT INTO DailyOnlineTimePercent(date,percent1,percent2,percent3,percent4,percent5,percent6) VALUES(?,' +
            '?,?,?,?,?,?)',
        args = [dict.date, dict.percent1 || 0, dict.percent2 || 0, dict.percent3 || 0, dict.percent4 || 0,
            dict.percent5 || 0, dict.percent6 || 0];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('savePlayerDailyOnlineTimeSectionPercent err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

/*
 *   抓取登录次数占比
 * */
dao.getDailyLogonCountPercent = function (cb) {
    var sql = 'CALL getPlayerDailyLogonCountPercent()';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getDailyLogonCountPercent err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null, (!!res && !!res[0] && res[0][0]) || {});
        }
    });
};

/*
 *   保存每日登录次数占比
 * */
dao.saveDailyLogonCountPercent = function (dict, cb) {
    var sql = 'INSERT INTO DailyLogonCountPercent(date,percent1,percent2,percent3,percent4,percent5) VALUES(?,' +
            '?,?,?,?,?)',
        args = [dict.date, dict.percent1 || 0, dict.percent2 || 0, dict.percent3 || 0, dict.percent4 || 0,
            dict.percent5 || 0];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('saveDailyLogonCountPercent err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

/*
 *   获取引导达成人数
 * */
dao.getGuideAchievement = function (cb) {
    var sql = 'SELECT guideId, total FROM GuideAchievement';

    pomelo.app.get('statClient').query(sql, [], function (err, res) {
        if (err) {
            console.error('getGuideAchievement failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            res = res || [];
            var dict = {};
            res.forEach(function (row) {
                dict[row.guideId] = row.total;
            });
            cb(null, dict || {});
        }
    });
};

/*
 *   保存引导达成占比
 * */
dao.saveGuideAchievementPercent = function (cols, cb) {
    var sql = 'INSERT INTO GuideAchievementPercent(date,guideId1,guideId2,guideId3,guideId4,guideId5,guideId6,guideId7,' +
        'guideId8,guideId9,guideId10,guideId11,guideId12,guideId13,guideId14,guideId15,guideId16,guideId17,guideId18,' +
        'guideId19,guideId20,guideId21,guideId22,guideId23,guideId24,guideId25,guideId26,guideId27,guideId28,guideId29,' +
        'guideId30,guideId31,guideId32,guideId33,guideId34,guideId35,guideId36,guideId37,guideId38,guideId39,guideId40,' +
        'guideId41,guideId42,guideId43,guideId44,guideId45,guideId46,guideId47,guideId48,guideId49,guideId50) VALUES(?,' +
        '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    // 自动补足列数
    if (cols.length < 51) {
        cols = cols.concat(_.times(51 - cols.length, function () {
            return 0;
        }));
    }
    // 自动删除多余的列数
    if (cols.length > 51) {
        cols = cols.slice(0, 51);
    }
    pomelo.app.get('statClient').query(sql, cols, function (err, res) {
        if (err) {
            logger.error('saveGuideAchievementPercent err = %s, cols = %j', err.stack, cols);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

/*
 *   抓取流失统计数据
 * */
dao.makeLossLevelPercent = function (cb) {
    var sql = 'CALL makeLossLevelPercent(1)';

    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            console.error('makeLossLevelPercent failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            var rows = (!!res && res[0]) || [],
                dict = {};
            //logger.debug('makeLossLevelPercent rows = %j', rows);
            _.each(rows, function (row) {
                dict[row.level] = row.percent;
            });
            cb(null, dict);
        }
    });
};

/*
 *   保存引导达成占比
 * */
dao.saveLossLevelPercent = function (cols, cb) {
    var sql = 'INSERT INTO PlayerLossLevelPercent(date,percent1,percent2,percent3,percent4,percent5,percent6,percent7,' +
        'percent8,percent9,percent10,percent11,percent12,percent13,percent14,percent15,percent16,percent17,percent18,' +
        'percent19,percent20,percent21,percent22,percent23,percent24,percent25,percent26,percent27,percent28,percent29,' +
        'percent30,percent31,percent32,percent33,percent34,percent35,percent36,percent37,percent38,percent39,percent40,' +
        'percent41,percent42,percent43,percent44,percent45,percent46,percent47,percent48,percent49,percent50,percent51,' +
        'percent52,percent53,percent54,percent55,percent56,percent57,percent58,percent59,percent60,percent61,percent62,' +
        'percent63,percent64,percent65,percent66,percent67,percent68,percent69,percent70,percent71,percent72,percent73,' +
        'percent74,percent75,percent76,percent77,percent78,percent79,percent80,percent81,percent82,percent83,percent84,' +
        'percent85,percent86,percent87,percent88,percent89,percent90,percent91,percent92,percent93,percent94,percent95,' +
        'percent96,percent97,percent98,percent99,percent100,percent101,percent102,percent103,percent104,percent105,' +
        'percent106,percent107,percent108,percent109,percent110,percent111,percent112,percent113,percent114,percent115,' +
        'percent116,percent117,percent118,percent119,percent120,percent121,percent122,percent123,percent124,percent125,' +
        'percent126,percent127,percent128,percent129,percent130,percent131,percent132,percent133,percent134,percent135,' +
        'percent136,percent137,percent138,percent139,percent140,percent141,percent142,percent143,percent144,percent145,' +
        'percent146,percent147,percent148,percent149,percent150,percent151,percent152,percent153,percent154,percent155,' +
        'percent156,percent157,percent158,percent159,percent160,percent161,percent162,percent163,percent164,percent165,' +
        'percent166,percent167,percent168,percent169,percent170,percent171,percent172,percent173,percent174,percent175,' +
        'percent176,percent177,percent178,percent179,percent180,percent181,percent182,percent183,percent184,percent185,' +
        'percent186,percent187,percent188,percent189,percent190,percent191,percent192,percent193,percent194,percent195,' +
        'percent196,percent197,percent198,percent199,percent200) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,' +
        '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?' +
        ',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,' +
        '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?' +
        ',?,?,?,?,?,?,?,?,?,?)';
    // 自动补足列数
    if (cols.length < 201) {
        cols = cols.concat(_.times(51 - cols.length, function () {
            return 0;
        }));
    }
    // 自动删除多余的列数
    if (cols.length > 201) {
        cols = cols.slice(0, 51);
    }
    pomelo.app.get('statClient').query(sql, cols, function (err, res) {
        if (err) {
            logger.error('saveLossLevelPercent err = %s, cols = %j', err.stack, cols);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

dao.getByPlayerId = function (playerId, cb) {
    var self = this;
    async.parallel([
            function (callback) {
                self.getEquipByPlayerId(playerId, callback);
            },
            function(callback){
                self.getEndlessByPlayerId(playerId, callback);
            },
            //function(callback){
            //    self.getUseDailyDiamondByPlayerId(playerId, callback);
            //},
            function(callback){
                self.getDailyOthersByPlayerId(playerId, callback);
            },
            function(callback){
                self.getNewBarrierByPlayerId(playerId, callback);
            },
            function(callback){
                self.getSTTEPlayerBehaivor(playerId, callback);
            }
        ],
        function (err, results) {
            var allInfo = {};
            allInfo.equip = results[0];
            allInfo.endless = results[1];
           // allInfo.useDiamondList = results[2];
            allInfo.dailyOthers = results[2];
            allInfo.newBarrier = results[3];
            allInfo.playerBehavior = results[4];

            if (!!err) {
                utils.invokeCallback(cb, err.message);
            } else {
                utils.invokeCallback(cb, null, allInfo);
            }
        });
};

dao.getEquipByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM STTEDailyEquip WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.getEndlessByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM STTEDailyEndless WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};


dao.getUseDailyDiamondByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM STTEDailyUseDiamond WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.getSTTEPlayerBehaivor = function (playerId, cb) {
    var sql = 'SELECT * FROM STTEPlayerBehaivor WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};


dao.getDailyOthersByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM STTEDailyOthers WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.getDailyOthersAll = function(cb)
{
    var sql = 'SELECT * FROM STTEDailyOthers';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s ', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
}

dao.getNewBarrierByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM STTENewBarrier WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId err = %s, args = %j! ', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.getBarrierAll = function ( cb) {
    var sql = 'SELECT * FROM passedBarrier';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getBarrierAll err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
 * 获取无尽所有报告数据
 * */
dao.getPlayerAll = function(cb)
{
    var sql = 'SELECT * FROM player';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getReports err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
* 获取无尽所有报告数据(这里其实只有对战的数据)
* */
dao.getEndlessAllReport = function(cb)
{
    var sql = 'SELECT * FROM EndlessReport';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
    if (err) {
        logger.error('getReports err = %s', err.stack);
        utils.invokeCallback(cb, err.message, []);
    } else {
        utils.invokeCallback(cb, null, res || []);
    }
});
};

/*
 * 获取无尽报告数据(这里其实只有单人的数据)
 * */
dao.getEndlessSingleReport = function(cb)
{
    var sql = 'SELECT * FROM STTEDailyEndless';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getReports err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
* 获取穿装备统计 统计每个玩家注册多久后把8个装备位都装上了装备：
* */
dao.getArmEquipFull = function(cb)
{
    var sql = 'SELECT * FROM STTEArmEquipFull';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('getArmEquipFull err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
 * 获取装备操作
 * */
dao.getDailyEquip = function(cb)
{
    var sql = 'SELECT * FROM STTEDailyEquip';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('STTEDailyEquip err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
 * 获取每日钻石使用的记录
 * */
dao.getDailyUseDiamond = function(cb)
{
    var sql = 'SELECT * FROM STTEDailyUseDiamond';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('STTEDailyEquip err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

/*
 * 获取每日竞技记录
 * */
dao.getDailyComPoint = function(cb)
{
    var sql = 'SELECT * FROM STTEDailyUseDiamond';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('STTEDailyEquip err = %s', err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.saveNewBarrierId = function(args,cb)
{
    var sql = 'INSERT INTO newBarrierIdSTTE(playerId,date,playerName,type,newBarrierId) VALUES(?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE newBarrierId=VALUES(newBarrierId)';
    var args = [args.playerId,args.date,args.playerName,args.type,args.newBarrierId];
    pomelo.app.get('statClient').query(sql,args, function (err, res) {
        if (err) {
            console.error('saveNewBarrierId failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyChapterStarCnt = function(args,starList,cb)
{
    var sql = 'INSERT INTO barrierStarSTTE(playerId,date,registerTime,playerName,chapter1,chapter2,chapter3,chapter4,chapter5,chapter6,chapter7,chapter8) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE chapter1=VALUES(chapter1),chapter2=VALUES(chapter2),chapter3=VALUES(chapter3),chapter4=VALUES(chapter4),chapter5=VALUES(chapter5),chapter6=VALUES(chapter6),chapter7=VALUES(chapter7),chapter8=VALUES(chapter8)';
    var args = [args.playerId,args.date,args.registerTime,args.playerName,starList.chapterStarCnt1,starList.chapterStarCnt2,starList.chapterStarCnt3,starList.chapterStarCnt4,starList.chapterStarCnt5,starList.chapterStarCnt6,starList.chapterStarCnt7,starList.chapterStarCnt8];
    pomelo.app.get('statClient').query(sql,args, function (err, res) {
        if (err) {
            console.error('saveDailyChapterStarCnt failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveEndless = function(args,cb)
{
    var sql = 'INSERT INTO DailyEndlessSTTE(playerId,registerTime,date,playerName,type,cnt,winCnt) VALUES(?,?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE cnt=VALUES(cnt),winCnt=VALUES(winCnt)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.type,args.cnt,args.winCnt];
    pomelo.app.get('statClient').query(sql,args, function (err, res) {
        if (err) {
            console.error('DailyEndlessSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};


dao.saveDailyTaskActiveValue = function(args,cb)
{
    var sql = 'INSERT INTO DailyTaskActiveValueSTTE(playerId,registerTime,date,playerName,dailyTaskActiveValue) VALUES(?,?,?,?,?)'+
    ' ON DUPLICATE KEY UPDATE dailyTaskActiveValue=VALUES(dailyTaskActiveValue)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.dailyTaskActiveValue];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyTaskActiveValueSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
             cb(null,true);
        }
    });
};


dao.saveArmEquipFull = function(args,cb)
{
    var sql = 'INSERT INTO ArmEquipFullSTTE(playerId,registerTime,playerName,finshTime) VALUES(?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE finshTime=VALUES(finshTime)';
    var args = [args.playerId,args.registerTime,args.playerName,args.finshTime];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO ArmEquipFullSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyRefineCnt = function(args,cb)
{
    var sql = 'INSERT INTO DailyRefineCntSTTE(playerId,registerTime,date,playerName,cnt) VALUES(?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE cnt=VALUES(cnt)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.cnt];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyRefineCntSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyRefineLv = function(args,cb)
{
    var sql = 'INSERT INTO DailyEquipRefineLvSTTE(playerId,registerTime,date,playerName,pos1,pos2,pos3,pos4,pos5,pos6,pos7,pos8) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE pos1=VALUES(pos1),pos2=VALUES(pos2),pos3=VALUES(pos3),pos4=VALUES(pos4),pos5=VALUES(pos5),pos6=VALUES(pos6),pos7=VALUES(pos7),pos8=VALUES(pos8)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.pos1,args.pos2,args.pos3,args.pos4,args.pos5,args.pos6,args.pos7,args.pos8];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyRefineCntSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyAwakeLv = function(args,cb)
{
    var sql = 'INSERT INTO DailyEquipAwakeLvSTTE(playerId,registerTime,date,playerName,pos1,pos2,pos3,pos4,pos5,pos6,pos7,pos8) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE pos1=VALUES(pos1),pos2=VALUES(pos2),pos3=VALUES(pos3),pos4=VALUES(pos4),pos5=VALUES(pos5),pos6=VALUES(pos6),pos7=VALUES(pos7),pos8=VALUES(pos8)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.pos1,args.pos2,args.pos3,args.pos4,args.pos5,args.pos6,args.pos7,args.pos8];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyEquipAwakeLvSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyUseDiamond = function(args,cb)
{
    var sql = 'INSERT INTO DailyUseDiamondSTTE(playerId,date,playerName,useWay,useDiamond,surplusDiamond,time) VALUES(?,?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE useWay=VALUES(useWay),useDiamond=VALUES(useDiamond),surplusDiamond=VALUES(surplusDiamond)';
    var args = [args.playerId,args.date,args.playerName,args.useWay,args.useDiamond,args.surplusDiamond,args.time];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyUseDiamondSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

dao.saveDailyComPoint = function(args,cb)
{
    var sql = 'INSERT INTO DailyCompointSTTE(playerId,registerTime,date,playerName,getComPoint,useComPoint) VALUES(?,?,?,?,?,?)'+
        ' ON DUPLICATE KEY UPDATE getComPoint=VALUES(getComPoint),useComPoint=VALUES(useComPoint)';
    var args = [args.playerId,args.registerTime,args.date,args.playerName,args.getComPoint,args.useComPoint];
    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            console.error('INSERT INTO DailyCompointSTTE failed!err = %s', err.stack);
            cb(err.message, {});
        } else {
            cb(null,true);
        }
    });
};

