/**
 * Created by tony on 2016/11/19.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO DataStatistics(playerId,dailyRefineCnt,dailyDate,timeType) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' dailyRefineCnt = VALUES(dailyRefineCnt)',

        args = [saveData.playerId,saveData.dailyRefineCnt,saveData.dailyDate,saveData.timeType];

    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, DataStatistics = %j', err.stack, saveData);
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