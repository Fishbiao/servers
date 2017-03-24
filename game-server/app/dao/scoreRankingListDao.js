/**
 * Created by kilua on 2016/7/4 0004.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils'),
    dataApi = require('../util/dataApi');

var dao = module.exports = {};

dao.load = function (cb) {
    var sql = 'SELECT playerId,score FROM ScoreRankingList WHERE 1',
        args = [];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('load failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, []);
        } else {
            utils.invokeCallback(cb, null, res || []);
        }
    });
};

dao.updateAndAdd = function( dbRank , cb)
{
    var sql = 'INSERT INTO ScoreRankingList(playerId,rank,score) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
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

function clear(cb) {
    var sql = 'DELETE FROM ScoreRankingList WHERE 1';
    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('clear err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
}

function batchAdd(dbRankingList, cb) {
    var sql = 'INSERT INTO ScoreRankingList(rank,playerId,score) VALUES ?',
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

/*
 *   查询总榜上玩家的其他信息
 * */
dao.getPlayerRankingInfo = function (playerIds, cb) {
    var sql = 'SELECT P.id, P.playername,P.headPicId,H.posInfo FROM player P INNER JOIN heroBag H ON P.id = H.playerId AND' +
        ' P.curHeroPos = H.pos WHERE P.id IN (?)';
    playerIds = playerIds || [];
    if (playerIds.length <= 0) {
        return utils.invokeCallback(cb, null, []);
    }
    pomelo.app.get('dbclient').query(sql, [playerIds], function (err, res) {
        if (err) {
            logger.error('getPlayerRankingInfo err = %s, playerIds = %j', err.stack, playerIds);
            utils.invokeCallback(cb, err.message, []);
        } else {
            res = res || [];
            res.forEach(function (rec) {
                try {
                    var heroInfo = JSON.parse(rec.posInfo),
                        heroData = dataApi.HeroAttribute.findByIndex({
                            heroId: heroInfo.roleId,
                            quality: heroInfo.quality
                        });
                    rec.heroId = heroData.id;
                } catch (ex) {
                    logger.warn('getPlayerRankingInfo parser posInfo = %s failed!', rec.posInfo);
                    rec.heroId = 0;
                }
                //delete rec.posInfo;
            });
            utils.invokeCallback(cb, null, res);
        }
    });
};