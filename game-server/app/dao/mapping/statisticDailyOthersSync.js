/**
 * Created by tony on 2016/11/27.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO STTEDailyOthers(playerId,date,taskActiveValue,getComPoint,useComPoint) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' taskActiveValue = VALUES(taskActiveValue),getComPoint = VALUES(getComPoint),useComPoint = VALUES(useComPoint)',

        args = [saveData.playerId,saveData.date,saveData.taskActiveValue,saveData.getComPoint,saveData.useComPoint];

    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, STTEDailyOthers = %j', err.stack, saveData);
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