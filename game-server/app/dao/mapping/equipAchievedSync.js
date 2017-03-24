/**
 * Created by tony on 2016/8/5.
 * 装备成就
 */
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

//刷新洗练数据
function updateAndAdd(client, achievedData, cb) {
    var sql = 'INSERT INTO EquipAchieved (playerId,id,type,value) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' id = VALUES(id), type = VALUES(type), value = VALUES(value)',
        args = [achievedData.playerId,achievedData.id,achievedData.type,achievedData.value];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('updateAndAdd err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
}

exp.save = function (dbClient, achievedData, cb) {
    updateAndAdd(dbClient, achievedData, cb);
};