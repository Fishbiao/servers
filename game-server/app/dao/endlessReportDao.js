/**
 * Created by employee11 on 2015/12/17.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var endlessReportDao = module.exports;

/*
 *   更新无尽赛果   fightBfRank          int(10),
 fightBfWeekRank      int(10),
 * */
endlessReportDao.upsertReport = function (endlessId, playerId, playerName, heroId, score, otherPlayerId, otherName, otherHeroId, otherScore, result, occasionId, maxRecs,fightBfRank,fightBfWeekRank, cb) {
    logger.debug("endlessReportDao.upsertReport : otherPlayerId = %j",otherPlayerId);
    var sql = 'CALL upsertEndlessReport(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        args = [endlessId, playerId, playerName, heroId, score, otherPlayerId, otherName, otherHeroId, otherScore, result, occasionId, Date.now(), maxRecs, fightBfRank, fightBfWeekRank];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('upsertReport failed!err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res);
        }
    });
};

///*
// *   读取指定标志的赛果
// * */
//endlessReportDao.getReports = function (playerId, drew, cb) {
//    var sql = 'SELECT id,result,occasionId,drew,playerId,recTime FROM EndlessReport WHERE playerId = ? AND drew = ?',
//        args = [playerId, drew];
//    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
//        if (err) {
//            logger.error('getReports err = %s, args = %j', err.stack, args);
//            utils.invokeCallback(cb, err.message, []);
//        } else {
//            utils.invokeCallback(cb, null, res || []);
//        }
//    });
//};

endlessReportDao.setDrew = function (reportId, cb) {
    var sql = 'UPDATE EndlessReport SET drew = 1 WHERE id = ? AND drew = 0 ',
        args = [reportId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('setDrew err = %s, reportId = %s', err.stack, reportId);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows === 1);
        }
    });
};

endlessReportDao.getReportsCnt = function (playerId, drew, cb) {
    var sql = 'SELECT COUNT(*) AS count FROM EndlessReport WHERE playerId = ? AND drew = ?',
        args = [playerId, drew];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getReportsCnt err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, 0);
        } else {
            if (!!res && res.length > 0) {
                utils.invokeCallback(cb, null, res[0].count);
            } else {
                utils.invokeCallback(cb, null, 0);
            }
        }
    });
};
/*
 *   读取赛果
 * */
endlessReportDao.getAllReports = function (playerId, cb) {
    var sql = 'SELECT * FROM EndlessReport WHERE playerId = ?',
        args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getReports err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};
