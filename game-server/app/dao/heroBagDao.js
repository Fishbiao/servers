/**
 * Created by employee11 on 2016/2/25.
 */
var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var heroBagDao = module.exports;

/*
*   读取指定玩家的猎魔人列表
* */
heroBagDao.getHeroBagByPlayerId = function (playerId, cb) {
    var sql = 'select * from heroBag where playerId = ?';
    var args = [playerId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('get heroBag by playerId for heroBagDao failed! ' + err.stack);
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
                logger.info('heroBag not exist');
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};


