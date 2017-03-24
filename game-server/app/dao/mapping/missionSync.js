/**
 * Created by tony on 2016/9/19.
 * 成就任务系统
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO Mission(playerId,conditionType,missionType,groupType,progress,drewList) VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' conditionType = VALUES(conditionType), missionType = VALUES(missionType), groupType = VALUES(groupType), progress = VALUES(progress), drewList = VALUES(drewList)',
        args = [saveData.playerId, saveData.conditionType, saveData.missionType, saveData.groupType,saveData.progress,JSON.stringify(saveData.drewList)];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, missionData = %j', err.stack, saveData);
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