/**
 * Created by kilua on 2016/7/17 0017.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT rank,drew FROM WeekScoreRankingAward WHERE playerId = ?',
        args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, {});
        } else {
            utils.invokeCallback(cb, null, (res && res[0]) || {});
        }
    });
};

function clear(cb) {
    var sql = 'DELETE FROM WeekScoreRankingAward WHERE 1';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('clear err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

function batchAdd(awardData, cb) {
    var sql = 'INSERT INTO WeekScoreRankingAward(rank,playerId) VALUES ?',
        args = [];
    awardData = awardData || [];
    if (awardData.length <= 0) {
        return utils.invokeCallback(cb, null, true);
    }
    awardData.forEach(function (rec) {
        args.push([rec.rank, rec.playerId]);
    });
    pomelo.app.get('dbclient').query(sql, [args], function (err, res) {
        if (err) {
            logger.error('batchAdd err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, res.affectedRows > 0);
        }
    });
}

/*
 *   发放奖励
 * */
dao.dispatch = function (awardData, cb) {
    logger.debug("下发周榜奖励");
    clear(function (err, success) {
        if (success) {
            batchAdd(awardData, cb);
        } else {
            logger.error("下发周榜奖励失败");
            utils.invokeCallback(cb, err, false);
        }
    });
};

/*
 *   设置已领取标志
 * */
dao.setDrew = function (playerId, cb) {
    // drew = 0条件，防止连续重复领取
    var sql = 'UPDATE WeekScoreRankingAward SET drew = 1 WHERE playerId = ? AND drew = 0',
        args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('setDrew err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, res && res.affectedRows > 0);
        }
    });
};