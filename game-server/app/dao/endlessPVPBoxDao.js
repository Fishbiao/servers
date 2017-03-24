/**
 * Created by employee11 on 2015/12/17.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var endlessPVPBoxDao = module.exports;

/*
 *   读取无尽PVP宝箱数据
 * */
endlessPVPBoxDao.getByPlayerId = function (playerId, cb) {
    var sql = 'SELECT * FROM EndlessPVPBox WHERE playerId = ?',
        args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('getByPlayerId failed!err = %s', err.stack);
            utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                utils.invokeCallback(cb, null, res[0]);
            } else {
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

/*
 *   保存无尽宝箱数据
 * */
endlessPVPBoxDao.save = function (rec, cb) {
    var sql = 'INSERT INTO EndlessPVPBox(endlessId,playerId,occasionId,score,drew,reopenCnt,boxDouble,systemId) VALUES(?,?,?,?,?,?,?,?)' +
            ' ON DUPLICATE KEY UPDATE endlessId=VALUES(endlessId),occasionId=VALUES(occasionId),score=VALUES(score),' +
            'drew=VALUES(drew),reopenCnt=VALUES(reopenCnt),boxDouble=VALUES(boxDouble),systemId=VALUES(systemId)',
        args = [rec.endlessId, rec.playerId, rec.occasionId, rec.score, 0, 0, rec.boxDouble, rec.systemId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
};

endlessPVPBoxDao.setDrew = function (playerId, cb) {
    var sql = 'UPDATE EndlessPVPBox SET drew = 1 WHERE playerId = ? AND drew = 0',
        args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('setDrew err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
};

endlessPVPBoxDao.setReopenCnt = function (playerId, cb) {
    var sql = 'UPDATE EndlessPVPBox SET reopenCnt = ? WHERE playerId = ? AND reopenCnt = 0',
        args = [1, playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('setReopenCnt err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
};