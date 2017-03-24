/**
 * Created by tony on 2016/7/19.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

//刷新洗练数据
function updateAndAdd(client, wash, cb) {
    var sql = 'INSERT INTO EquipWash(playerId,part,pos,id,lockState,cond,prob,effect) VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' id = VALUES(id),lockState = VALUES(lockState), cond = VALUES(cond), prob = VALUES(prob), effect = VALUES(effect)',
        args = [wash.playerId,wash.part,wash.pos,wash.id, wash.lockState, wash.cond, wash.prob, wash.effect];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('updateAndAdd err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
}

exp.save = function (dbClient, wash, cb) {
    updateAndAdd(dbClient, wash, cb);
};