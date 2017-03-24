/**
 * Created by tony on 2016/10/14.
 */
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO STTEPlayerBehaivor(playerId,behaviorInfo,playerName) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
            ' behaviorInfo = VALUES(behaviorInfo)',

        args = [saveData.playerId,saveData.behaviorInfo,saveData.playerName];

    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, STTEPlayerBehaivor = %j', err.stack, saveData);
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