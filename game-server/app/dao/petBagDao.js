/**
 * Created by employee11 on 2016/3/2.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var petBagDao = module.exports;

/*
 *   读取指定玩家的宠物列表
 * */
petBagDao.getPetBagByPlayerId = function (playerId, cb) {
    var sql = 'select * from petBag where playerId = ?';
    var args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('get petBag by playerId for petBagDao failed! ' + err.stack);
            utils.invokeCallback(cb, err, null);
        } else {
            if (res && res.length > 0) {
                var result = [];
                for (var i = 0; i < res.length; i++) {
                    res[i].posInfo = JSON.parse(res[i].posInfo);
                    result.push(res[i]);
                }
                cb(null, result);
            } else {
                logger.info('petBag not exist');
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};
