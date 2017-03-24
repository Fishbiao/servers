/**
 * Created by kilua on 2016/7/4 0004.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.load = function (cb) {
    var sql = 'SELECT playerId,score FROM WeekScoreRankingList WHERE 1',
        args = [];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('load failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
            logger.debug(' res = %j', res);
        }
    });
};

/*
* 必须在下发奖励成功之后才会去清除
* **/
var clear = dao.clear = function (cb) {
    logger.debug("\n\n\n\n\n weekScoreRankingListDao   - clear \n\n\n\n\n");

   // scoreRankingList.clernWeekRankList();
    var sql = 'DELETE FROM WeekScoreRankingList WHERE 1';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('clear err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
};

dao.updateAndAdd = function( dbRank , cb)
{
    var sql = 'INSERT INTO WeekScoreRankingList(playerId,rank,score) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
            ' playerId = VALUES(playerId), rank = VALUES(rank), score = VALUES(score)',
        args = [ dbRank.id, dbRank.rank, dbRank.score];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err)
        {
            logger.error('insertRank err = %s', err.message);
            utils.invokeCallback(cb, err.message, false);
        } else
        {
            utils.invokeCallback(cb, null, true);
        }
    });
};

function batchAdd(dbRankingList, cb) {

    var sql = 'INSERT INTO WeekScoreRankingList(rank,playerId,score) VALUES ?',
        args = [];
    dbRankingList = dbRankingList || [];
    if (dbRankingList.length <= 0) {
        return utils.invokeCallback(cb, null, true);
    }
    dbRankingList.forEach(function (dbRankingRec) {
        args.push([dbRankingRec.rank, dbRankingRec.playerId, dbRankingRec.score]);
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

dao.save = function (dbRankingList, cb) {
    clear(function (err, success) {
        if (success) {
            batchAdd(dbRankingList, cb)
        } else {
            utils.invokeCallback(cb, err);
        }
    });
};