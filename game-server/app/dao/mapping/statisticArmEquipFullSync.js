/**
 * Created by tony on 2016/11/27.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO STTEArmEquipFull(playerId,date) VALUES(?,?) ON DUPLICATE KEY UPDATE' +
            ' date = VALUES(date)',

        args = [saveData.playerId,saveData.date];

    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, STTEArmEquipFull = %j', err.stack, saveData);
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