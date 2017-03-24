/**
 * Created by tony on 2016/11/27.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO STTEDailyUseDiamond(playerId,date,time,useWay,useDiamond,surplusDiamond) VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' useWay = VALUES(useWay),useDiamond = VALUES(useDiamond),surplusDiamond = VALUES(surplusDiamond)',

        args = [saveData.playerId,saveData.date,saveData.time,saveData.useWay,saveData.useDiamond,saveData.surplusDiamond];

    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, STTEDailyUseDiamond = %j', err.stack, saveData);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res )
            {
                utils.invokeCallback(cb, null, true);
            }
            else {
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};